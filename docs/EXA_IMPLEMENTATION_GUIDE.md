# Exa SDK Implementation Guide — Acuity

> **⚠️ API CORRECTION (2026-06-06, exa-js 1.10.3).** The "Core Call" example
> further down this document (`exa.search(query, { type: "deep", outputSchema,
> systemPrompt })`) reflects an **older Exa API shape and is no longer
> accurate**. The installed SDK uses an asynchronous **research-task** model.
> The implementation in `app/api/research/route.ts` and `lib/exa.ts` follows the
> corrected pattern below; the older sections are retained for historical
> context only. Verify against `node_modules/exa-js/dist/index.d.ts` if in doubt.
>
> **Corrected call pattern (what the code actually does):**
> ```typescript
> import Exa from 'exa-js';
> const exa = new Exa(process.env.EXA_API_KEY);
>
> // 1. Create a research task. There is NO `systemPrompt` param — the analyst
> //    persona is folded into `instructions`. Models: 'exa-research-fast' |
> //    'exa-research' | 'exa-research-pro'.
> const created = await exa.research.create({
>   instructions,                  // company + context persona + section guidance
>   model: 'exa-research',
>   outputSchema: RESEARCH_OUTPUT_SCHEMA,  // still ≤10 props / ≤2 nesting levels
> });
>
> // 2. Poll until finished (research runs server-side; 30-90s typical).
> const research = await exa.research.pollUntilFinished(created.researchId, {
>   events: true, pollInterval: 2000, timeoutMs: 280000,
> });
>
> // 3. Structured output lives in research.output.parsed (the validated JSON).
> //    research.output.content is the same data as a raw string.
> if (research.status === 'completed') {
>   const sections = research.output.parsed; // matches outputSchema
> }
> ```
>
> **Citations.** The research API returns no per-section citation array; source
> URLs are embedded in `research.events`. Acuity extracts those URLs server-side
> and distributes them across sections for live calls. The Stripe seed authors
> per-section citations directly. See `lib/types.ts` (`SectionCitations`) and
> `app/api/research/route.ts` (`buildCitationsFromEvents`).
>
> The `outputSchema` itself (6 section strings) is unchanged and correct — see
> `RESEARCH_OUTPUT_SCHEMA` in `lib/exa.ts`.

---

## Setup

```bash
npm install exa-js
```

Create singleton client in `lib/exa.ts`:

```typescript
import Exa from 'exa-js';

if (!process.env.EXA_API_KEY) {
  throw new Error('EXA_API_KEY is not set');
}

export const exa = new Exa(process.env.EXA_API_KEY);
```

Only import `exa` in server-side code (API routes). Never in client components.

---

## CRITICAL: API Constraints

Before writing any Exa code, note these confirmed constraints:

### ❌ Never Use

| Parameter | Reason |
|-----------|--------|
| `useAutoprompt` | Deprecated. Does nothing. |
| `livecrawl: "always"` | Deprecated. Use `contents: { maxAgeHours: 0 }` for freshness. |
| `text`, `summary`, `highlights` at top level | Must be inside `contents` object. |
| `category` with `type: "deep"` | Invalid combination. |
| More than 10 properties in outputSchema at any nesting level | Schema limit. |
| More than 2 levels of nesting in outputSchema | Schema limit. |

### Verify SDK Method Names

After `npm install`, run:
```bash
cat node_modules/exa-js/dist/index.d.ts | head -100
```
The TypeScript definitions are the authoritative source for exact method signatures. This document shows the API call structure; verify method names from the installed package.

---

## Core Call: Deep Research with Output Schema

This is the primary Exa call in Acuity — the one that generates the six-section research brief.

### The outputSchema

All six section properties must fit within 10 total properties and 2 levels of nesting:

```typescript
const RESEARCH_OUTPUT_SCHEMA = {
  type: "object",
  required: [
    "company_overview",
    "competitive_landscape",
    "industry_macro",
    "moat_defensibility",
    "investment_landscape",
    "key_questions"
  ],
  properties: {
    company_overview: {
      type: "string",
      description: "Core business model, revenue drivers, key customers, and notable recent milestones from public sources"
    },
    competitive_landscape: {
      type: "string",
      description: "Key direct competitors, relative market positioning, recent competitive moves, and differentiation"
    },
    industry_macro: {
      type: "string",
      description: "Market size and growth trajectory, structural tailwinds and headwinds, macro factors affecting the business"
    },
    moat_defensibility: {
      type: "string",
      description: "Sources of durable competitive advantage: network effects, switching costs, proprietary data, brand, distribution"
    },
    investment_landscape: {
      type: "string",
      description: "Company funding history, comparable M&A transactions, peer valuations, and investment activity in the sector"
    },
    key_questions: {
      type: "string",
      description: "Non-obvious risks, contradictions or tensions in the research, and the most important questions a smart analyst should investigate"
    }
  }
};
```

### System Prompts by Context

```typescript
const SYSTEM_PROMPTS: Record<ResearchContext, string> = {
  investment_banking: "You are a senior investment banking analyst preparing pre-deal research. Focus on transaction comparables, deal structure signals, potential acquirers or strategic buyers, and material developments that would affect deal valuation. Use authoritative sources. Prioritize content from the last 90 days.",
  
  private_equity: "You are a private equity associate preparing pre-diligence public intelligence on a potential portfolio company. Focus on financial performance signals available publicly, management team indicators, operational improvement opportunities, and any red flags visible in public sources. Use authoritative sources from the last 90 days.",
  
  hedge_fund: "You are a hedge fund analyst building an investment thesis. Focus on long and short catalysts, recent developments that change the competitive or financial picture, and signals of inflection points. Prioritize recent, high-quality sources. Be analytically specific, not descriptive.",
  
  management_consulting: "You are a management consultant preparing for a new client engagement. Focus on strategic positioning, market dynamics, operational benchmarks versus peers, and the most pressing strategic questions the client is likely facing. Use authoritative sources from the last 90 days."
};
```

### The API Route

```typescript
// app/api/research/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { exa } from '@/lib/exa';
import stripeData from '@/data/stripe_seed.json';

// Seeded companies — results loaded from file instead of calling API
const SEEDED = ['stripe'];

function isSeeded(name: string): boolean {
  return SEEDED.includes(name.toLowerCase().trim());
}

export async function POST(request: NextRequest) {
  const { companyName, context } = await request.json();

  if (!companyName?.trim()) {
    return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
  }

  // Use seeded data for demo companies
  if (isSeeded(companyName)) {
    return NextResponse.json({ sections: stripeData.sections });
  }

  try {
    const query = `Provide comprehensive investment research on ${companyName}. Cover the business model and recent developments, the competitive landscape, industry context and macro trends, sources of competitive moat, the M&A and investment transaction landscape, and the key questions and open issues an analyst should investigate.`;

    const systemPrompt = SYSTEM_PROMPTS[context as ResearchContext] ?? SYSTEM_PROMPTS.investment_banking;

    // Use the exa-js SDK deep research method
    // Verify exact method name from TypeScript types in node_modules/exa-js
    // The call below reflects the Exa API spec — match to actual SDK method signature
    const result = await exa.search(query, {
      type: "deep",
      // @ts-ignore if outputSchema is not yet typed in the SDK — it is a valid API parameter
      outputSchema: RESEARCH_OUTPUT_SCHEMA,
      systemPrompt
    });

    // Parse the structured response
    // The deep search response with outputSchema returns in result.output or similar field
    // Verify the exact response shape from the SDK after installation
    const sections = result as ResearchSections; // adjust based on actual SDK response shape

    return NextResponse.json({ sections });
  } catch (error) {
    console.error('Exa research error:', error);
    return NextResponse.json({ error: 'Research failed. Please try again.' }, { status: 500 });
  }
}
```

**Important note on SDK response shape:** After installing `exa-js` and making the first deep research call, log the full response to understand exactly where the structured output lives in the response object. The `outputSchema` response may be in `result.output`, `result.data`, or directly as the result object. Adjust the route accordingly.

---

## Tavily Comparison Call

```typescript
// lib/tavily.ts

export async function tavilySearch(companyName: string) {
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.TAVILY_API_KEY}`
    },
    body: JSON.stringify({
      query: `${companyName} company investment research competitive analysis recent news`,
      search_depth: 'advanced',
      max_results: 10,
      include_answer: true,
      include_raw_content: false
    })
  });

  if (!response.ok) {
    throw new Error(`Tavily search failed: ${response.status}`);
  }

  return response.json();
}
```

```typescript
// app/api/compare/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { tavilySearch } from '@/lib/tavily';

export async function POST(request: NextRequest) {
  const { companyName } = await request.json();

  try {
    const data = await tavilySearch(companyName);
    return NextResponse.json({
      results: data.results || [],
      answer: data.answer || null
    });
  } catch (error) {
    console.error('Tavily error:', error);
    return NextResponse.json({ error: 'Comparison failed' }, { status: 500 });
  }
}
```

---

## stripe_seed.json Structure

When you populate the Stripe seed data, the file must follow this structure exactly
(matches the `SeedFile` interface in `lib/types.ts`):

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

- `research_seconds` drives the "completed in Xs" stats line (representative of
  the original Exa run that produced the seed).
- `citations` is a per-section map (`SectionCitations`). Each section may have
  zero or more `{ source_name, url, published_date }` entries.

> **Note on the current seed:** `data/stripe_seed.json` is currently populated
> with hand-authored, fact-checked representative content (accurate to public
> knowledge of Stripe as of mid-2026), because it was created without a live Exa
> key. Before the Loom recording, regenerate it from a real Exa Deep Research
> call per "Generating the Stripe Seed" below so the citation URLs and figures
> are genuine Exa output.

Each section string should be 3–6 substantive sentences with specific facts, names, and figures where available. Avoid generic statements. The Stripe data should feel like a real analyst wrote it, not a generic AI summary.

---

## Generating the Stripe Seed

Run this one-time before the first demo:

1. Temporarily add this log to `app/api/research/route.ts` in the success path:
   ```typescript
   console.log('SEED DATA:', JSON.stringify({ company: 'Stripe', generated_at: new Date().toISOString(), sections }, null, 2));
   ```
2. Remove the seeded check for 'stripe' temporarily
3. Start the app: `npm run dev`
4. Search for "Stripe" with "Investment Banking" context
5. Copy the console output into `data/stripe_seed.json`
6. Re-add the seeded check and remove the console.log
7. Verify all six sections have substantive, specific content
8. Commit

---

## Error Handling

Wrap all API calls in try/catch. Return user-friendly error messages:

```typescript
try {
  // API call
} catch (error) {
  if (error instanceof Error) {
    console.error('Exa error:', error.message);
  }
  return NextResponse.json(
    { error: 'Research could not be completed. Please try again.' },
    { status: 500 }
  );
}
```

On the client side, show an error state that includes a "Try again" button rather than a generic error message. Investment professionals will not try the demo a second time if the error experience is bad.
