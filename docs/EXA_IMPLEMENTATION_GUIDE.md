# Exa SDK Implementation Guide — Acuity

> **Updated 2026-06-06 for `exa-js` 1.10.x.** This guide documents the
> **asynchronous Research-task API** that Acuity actually uses. An earlier draft
> of this file described an `exa.search(query, { type: "deep", systemPrompt })`
> call — that shape does **not** exist in the current SDK and has been removed.
> The authoritative source for method signatures is always
> `node_modules/exa-js/dist/index.d.ts`.

The Exa Research API is a **create → poll → read** task model, not a single
blocking call:

1. `exa.research.create({ instructions, model, outputSchema })` → returns a task with a `researchId`.
2. `exa.research.pollUntilFinished(researchId, …)` → resolves once the task reaches a terminal status.
3. Read the structured result from `research.output.parsed`.

There is **no `systemPrompt` parameter** — the analyst persona is folded into
`instructions`. There is **no per-section citation array** — source URLs live in
`research.events`.

---

## Setup

```bash
npm install exa-js
```

Singleton client in `lib/exa.ts` — note it is **lazy** so the Stripe seed path
works even without a key configured (the key is only required for live calls):

```typescript
import Exa from 'exa-js';

let client: Exa | null = null;

export function getExa(): Exa {
  if (!process.env.EXA_API_KEY) {
    throw new Error('EXA_API_KEY is not set — live research is unavailable.');
  }
  if (!client) client = new Exa(process.env.EXA_API_KEY);
  return client;
}
```

Only import this from server-side code (API routes). Never from a client component.

---

## API Constraints

### outputSchema limits (still apply)

| Limit | Value |
|-------|-------|
| Max properties at any nesting level | **10** |
| Max nesting depth | **2 levels** |

Acuity's schema is exactly six string properties — comfortably within limits.

### Research models

`model` accepts one of three values (from the SDK type union):

| Model | Profile |
|-------|---------|
| `exa-research-fast` | Fastest, lightest reasoning |
| `exa-research` | **Default — balanced.** What Acuity uses. |
| `exa-research-pro` | Most thorough, slowest |

Acuity uses `exa-research` for a good speed/quality balance that keeps the live
demo within a reasonable wait. Switch to `exa-research-pro` if you want maximum
depth and can tolerate longer latency.

### Verify SDK method names

```bash
grep -nE "create|pollUntilFinished|output|parsed" node_modules/exa-js/dist/index.d.ts
```

---

## Core Call: Research with Output Schema

This is the primary Exa call in Acuity — it generates the six-section brief.
Implemented in `lib/exa.ts` (schema + instruction builder) and
`app/api/research/route.ts` (the create/poll/read flow).

### The outputSchema (`lib/exa.ts`)

Six string properties, one per section. Keys match the `ResearchSections`
interface in `lib/types.ts`.

```typescript
export const RESEARCH_OUTPUT_SCHEMA = {
  type: 'object',
  required: [
    'company_overview', 'competitive_landscape', 'industry_macro',
    'moat_defensibility', 'investment_landscape', 'key_questions',
  ],
  properties: {
    company_overview:     { type: 'string', description: 'Core business model, revenue drivers, key customers, recent milestones…' },
    competitive_landscape:{ type: 'string', description: 'Key competitors, positioning, recent moves, differentiation…' },
    industry_macro:       { type: 'string', description: 'Market size and growth, tailwinds/headwinds, macro factors…' },
    moat_defensibility:   { type: 'string', description: 'Network effects, switching costs, proprietary data, brand, distribution…' },
    investment_landscape: { type: 'string', description: 'Funding history, comparable M&A, peer valuations, sector activity…' },
    key_questions:        { type: 'string', description: 'Non-obvious risks, tensions, the most important open questions…' },
  },
} as const;
```

### Instructions by context (no `systemPrompt`)

The Research API takes a single `instructions` string. Acuity composes it from a
context-specific persona plus shared section guidance (`buildInstructions` in
`lib/exa.ts`):

```typescript
const CONTEXT_INSTRUCTIONS: Record<ResearchContext, string> = {
  investment_banking:    'Adopt the perspective of a senior investment banking analyst preparing pre-deal research. Emphasize transaction comparables, deal-structure signals, potential acquirers, and material developments affecting valuation.',
  private_equity:        'Adopt the perspective of a private equity associate preparing pre-diligence public intelligence. Emphasize public financial-performance signals, management indicators, operational improvement opportunities, and red flags.',
  hedge_fund:            'Adopt the perspective of a hedge fund analyst building an investment thesis. Emphasize long/short catalysts, recent developments, and inflection points. Be analytically specific, not descriptive.',
  management_consulting: 'Adopt the perspective of a management consultant preparing for a client engagement. Emphasize strategic positioning, market dynamics, operational benchmarks, and pressing strategic questions.',
};

export function buildInstructions(companyName: string, context: ResearchContext): string {
  const persona = CONTEXT_INSTRUCTIONS[context] ?? CONTEXT_INSTRUCTIONS.investment_banking;
  return [
    `Produce a comprehensive, investment-grade research brief on ${companyName}.`,
    persona,
    'Cover, as separate fields: (1) company overview and business model, (2) competitive landscape, (3) industry and macro context, (4) moat and defensibility, (5) investment and M&A landscape, and (6) key open questions.',
    'Use authoritative, recent sources. Prioritize the last 90 days. Be specific: name competitors, cite figures, reference concrete transactions. Avoid generic statements.',
  ].join(' ');
}
```

### The API route (`app/api/research/route.ts`)

```typescript
export const runtime = 'nodejs';
export const maxDuration = 300; // live research can take a couple of minutes

// 1. Seeded demo path — instant, no API call.
if (isSeeded(companyName)) {
  return NextResponse.json({
    sections: seed.sections,
    citations: seed.citations ?? {},
    research_seconds: seed.research_seconds,
  });
}

// 2. Live path — create, poll, read.
const exa = getExa();
const startedAt = Date.now();

const created = await exa.research.create({
  instructions: buildInstructions(companyName, context),
  model: 'exa-research',
  outputSchema: RESEARCH_OUTPUT_SCHEMA as unknown as Record<string, unknown>,
});

const research = await exa.research.pollUntilFinished(created.researchId, {
  events: true,        // include the events log so we can extract source URLs
  pollInterval: 2000,
  timeoutMs: 280000,
});

if (research.status !== 'completed') {
  return NextResponse.json({ error: 'Research could not be completed. Please try again.' }, { status: 500 });
}

// 3. Structured output lives in research.output.parsed (validated against the schema).
//    research.output.content is the same data as a raw JSON string.
const sections = research.output.parsed; // validate at runtime before trusting it

return NextResponse.json({
  sections,
  citations: buildCitationsFromEvents(research.events),
  research_seconds: Math.round((Date.now() - startedAt) / 1000),
});
```

### Response shape (terminal states)

`pollUntilFinished` resolves to a `Research` object whose `status` is one of
`completed | failed | canceled`. Only `completed` carries output:

```typescript
{
  researchId: string;
  status: 'completed';
  output: {
    content: string;                 // full output as text (JSON string when outputSchema given)
    parsed?: { [key: string]: unknown }; // structured object matching outputSchema
  };
  events?: ResearchEvent[];          // operation log; contains the source URLs Exa read
}
```

Always runtime-validate `output.parsed` before treating it as `ResearchSections`
(Acuity's `isResearchSections` guard checks all six keys are non-empty strings).

### Citations

The Research API does **not** return a tidy per-section citation list. The URLs
Exa read are embedded throughout `research.events`. Acuity:

- **Live calls:** walks the events tree (`buildCitationsFromEvents` →
  `collectUrls`), dedupes by URL, derives `source_name` from the hostname, and
  distributes the sources round-robin across the six sections so each card shows
  real, clickable citations.
- **Stripe seed:** authors per-section citations directly for the highest-quality
  demo (see `SectionCitations` in `lib/types.ts`).

If you want strictly per-section citations on live calls, the alternative is to
add a top-level `citations` array to the outputSchema (still ≤10 props / ≤2
nesting) — but that trades some analytical depth for citation formatting, so
Acuity keeps the schema lean and extracts from events instead.

---

## Tavily Comparison Call

Unchanged and accurate. `lib/tavily.ts`:

```typescript
export async function tavilySearch(companyName: string) {
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
    },
    body: JSON.stringify({
      query: `${companyName} company investment research competitive analysis recent news`,
      search_depth: 'advanced',
      max_results: 10,
      include_answer: true,
      include_raw_content: false,
    }),
  });
  if (!response.ok) throw new Error(`Tavily search failed: ${response.status}`);
  return response.json();
}
```

`app/api/compare/route.ts` returns `{ results: TavilyResult[], answer?: string }`.

---

## stripe_seed.json Structure

The file must match the `SeedFile` interface in `lib/types.ts`:

```json
{
  "company": "Stripe",
  "context": "investment_banking",
  "generated_at": "2026-06-06T00:00:00Z",
  "research_seconds": 58,
  "sections": {
    "company_overview": "...",
    "competitive_landscape": "...",
    "industry_macro": "...",
    "moat_defensibility": "...",
    "investment_landscape": "...",
    "key_questions": "..."
  },
  "citations": {
    "company_overview": [
      { "source_name": "Reuters", "url": "https://...", "published_date": "2025-02-04" }
    ]
  }
}
```

- `research_seconds` drives the "completed in X seconds" stats line (representative
  of the original Exa run that produced the seed).
- `citations` is a per-section map (`SectionCitations`). Each section may have zero
  or more `{ source_name, url, published_date }` entries.

Each section string should be 4–6 substantive sentences with specific facts,
names, and figures. Avoid generic statements — it should read like a real analyst
wrote it.

> **Note on the current seed:** `data/stripe_seed.json` was initially hand-authored
> (fact-checked, accurate to public knowledge of Stripe as of mid-2026) before a
> live Exa key was available. Regenerate it from a real Exa Research call (below)
> before the Loom recording so the citation URLs and figures are genuine output.

---

## Generating / Regenerating the Stripe Seed

One-time, before the demo recording:

1. In `app/api/research/route.ts`, temporarily bypass the seeded check for
   `'stripe'` (e.g. comment out the `isSeeded` early return).
2. In the success path, log the payload:
   ```typescript
   console.log('SEED DATA:', JSON.stringify({
     company: companyName, context, generated_at: new Date().toISOString(),
     research_seconds: result.research_seconds, sections: result.sections,
     citations: result.citations,
   }, null, 2));
   ```
3. `npm run dev`, then search "Stripe" with the "Investment Banking" context.
4. Copy the logged JSON into `data/stripe_seed.json` (strip any extra fields not
   in `SeedFile`).
5. Restore the seeded check and remove the `console.log`.
6. Verify all six sections are substantive and the citations resolve.
7. Confirm searching "Stripe" now loads instantly with no API call in the
   Network tab, then commit.

---

## Error Handling

Wrap live calls in try/catch and return user-friendly messages:

```typescript
try {
  // create / poll / read
} catch (error) {
  if (error instanceof Error) console.error('Exa research error:', error.message);
  return NextResponse.json(
    { error: 'Research could not be completed. Please try again.' },
    { status: 500 },
  );
}
```

The client renders an error card with a **Try again** button rather than a raw
message — investment professionals won't retry a demo with a poor error
experience.
