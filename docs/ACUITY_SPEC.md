# Acuity — Application Specification

## Product Overview

Acuity is a single-page web application that generates a structured investment intelligence brief for any company using Exa's Deep Research API. It is designed to demonstrate Exa's value to investment research automation companies (Grasp, DiligenceSquared, Trata, WithAI) and shows how Exa enables faster, more accurate research than alternatives.

**The demo argument in one sentence:** Acuity produces investment-grade, cited, structured research in under 90 seconds — research that would take an analyst 3-4 hours manually — and shows the quality gap versus Tavily in a direct side-by-side comparison.

---

## User Persona

**Primary viewer:** CTO or Head of Engineering at a company like Grasp or DiligenceSquared. They are evaluating whether to use Exa's API to power the research layer in their product.

**What they care about:** Does Exa actually find better, more relevant, more recent content than what they're currently using? Does the structured output format fit into their workflow?

---

## User Journey

1. User lands on Acuity. Clean input form: company name field + context selector.
2. User types "Stripe" and selects "Investment Banking" context.
3. User clicks "Research".
4. Six sections appear one by one with a staggered reveal animation. Each section is substantive and cited.
5. After all sections load, a "Compare with Tavily" button appears.
6. User clicks Compare. A split-screen view opens: Exa on the left, Tavily results on the right. The quality difference is visually obvious.

---

## Six Research Sections

These are the exact section titles and their intended content focus. Do not change the titles without updating this spec.

| # | Title | Content Focus |
|---|-------|---------------|
| 1 | Company Overview & Business Model | Core product, revenue model, key customers, recent milestones, growth metrics available from public sources |
| 2 | Competitive Landscape | Key direct competitors, market positioning, recent competitive moves, market share signals |
| 3 | Industry & Macro Context | Market size estimates, growth trends, tailwinds and headwinds, macro factors affecting the business |
| 4 | Moat & Defensibility | Sources of competitive advantage: network effects, switching costs, IP, brand, distribution |
| 5 | Investment Landscape | Comparable transactions, funding history of the company and peers, valuation benchmarks, M&A activity in the sector |
| 6 | Key Questions & Open Issues | Non-obvious risks, contradictions in the research, things a smart analyst should investigate further |

---

## Context Selector

Four context options. The context changes the framing language in the UI and the `systemPrompt` sent to Exa, but the underlying section structure stays the same.

| Context | Framing | System Prompt Emphasis |
|---------|---------|----------------------|
| Investment Banking | "Pre-deal research for M&A advisory" | Focus on transaction comparables, acquirer/target dynamics, deal structure signals |
| Private Equity | "Pre-diligence public intelligence" | Focus on financial performance signals, management team, operational improvement opportunities |
| Hedge Fund | "Investment thesis research" | Focus on long/short catalysts, recent developments, competitive position changes |
| Management Consulting | "Client engagement preparation" | Focus on strategic positioning, market dynamics, operational benchmarks |

---

## Loading Behavior

Sections appear one by one with a 400ms delay between each reveal. This creates the visual effect of the research being assembled in real time.

**Implementation approach:**
1. The Exa API route (`/app/api/research/route.ts`) returns all six sections at once as structured JSON
2. The client stores the complete result in state
3. A `useEffect` with `setTimeout` reveals each section at 400ms intervals regardless of when the API call returns
4. While sections are loading (waiting for the API response), show skeleton loading placeholders for all six section cards
5. Once API returns, begin the staggered reveal

**Why this approach:** It guarantees consistent visual behavior and prevents sections appearing at random intervals depending on API latency. The 90-second outer loading state gives the API time to complete before revealing begins.

---

## Pre-Seeded Stripe Detection

```typescript
// lib/types.ts or inline in the route

const SEEDED_COMPANIES = ['stripe'];

function isSeeded(companyName: string): boolean {
  return SEEDED_COMPANIES.includes(companyName.toLowerCase().trim());
}
```

If `isSeeded(companyName)` returns true, load `data/stripe_seed.json` instead of calling the Exa API. The staggered section reveal animation still runs. The result looks identical to a live search.

---

## Tavily Comparison

After all six Exa sections have loaded, the "Compare with Tavily" button appears (not before — the Exa output should be seen fully first).

**What Tavily shows:**
- The raw Tavily search results for the same company
- Standard format: list of web results with title, URL, and snippet
- An `include_answer` field if Tavily returns one

**Split-screen layout:**
- Left (60% width): Exa's full six-section brief, scrollable
- Right (40% width): Tavily's raw results list, scrollable
- Header bar: "Exa Deep Research" | "Tavily Search" — shows which side is which
- A subtle note in the Tavily header: "Raw search results — no synthesis, no structured output"

**What this demonstrates without saying it:**
The visual contrast between Exa's structured, cited, analytical output and Tavily's list of search result snippets is the product argument. No explanation needed.

---

## Component Architecture

### `app/page.tsx`
Main page. Holds all state. No client/server split needed — all interactive.

State:
```typescript
const [companyName, setCompanyName] = useState('');
const [context, setContext] = useState<ResearchContext>('investment_banking');
const [status, setStatus] = useState<'idle' | 'loading' | 'complete' | 'error'>('idle');
const [sections, setSections] = useState<ResearchSections | null>(null);
const [tavilyResults, setTavilyResults] = useState<TavilyResult[] | null>(null);
const [visibleSections, setVisibleSections] = useState(0);  // 0-6, for staggered reveal
const [compareOpen, setCompareOpen] = useState(false);
const [tavilyLoading, setTavilyLoading] = useState(false);
```

### `components/SearchInput.tsx`
Text input for company name. Calls `onSubmit` when Enter is pressed or Research button is clicked. Disabled during loading state.

### `components/ContextSelector.tsx`
Four-button toggle: Investment Banking | Private Equity | Hedge Fund | Management Consulting. Active context highlighted with accent color. Updates parent state.

### `components/ResearchBrief.tsx`
Container for the six section cards. Receives `sections`, `visibleSections`, and `isLoading` props. Renders either loading skeletons or SectionCards based on state.

### `components/SectionCard.tsx`
Individual section card. Receives: title, content, citations array, visibility boolean, animation delay.

Animation: when `isVisible` transitions from false to true, apply:
```css
opacity: 0 → 1;
transform: translateY(8px) → translateY(0);
transition: opacity 0.3s ease, transform 0.3s ease;
```

Below the content text: citation chips (source name + date + link).

### `components/CitationChip.tsx`
Small inline element showing source name and publication date. Clickable — opens source URL in new tab.

```
[WSJ — May 15, 2026] ↗
```

### `components/ComparePanel.tsx`
The Exa vs. Tavily split screen. Receives Exa sections and Tavily results as props. Fixed-position overlay or scrollable two-column layout.

### `components/LoadingSection.tsx`
Skeleton placeholder card shown while API is pending. Uses pulsing animation from design system.

---

## API Routes

### `app/api/research/route.ts`

POST handler. Receives `{ companyName, context }`. Returns `{ sections: ResearchSections }`.

Steps:
1. Check if `isSeeded(companyName)` — if yes, import and return `stripe_seed.json`
2. Construct the context-specific system prompt (see ACUITY_SPEC context table)
3. Call Exa Deep Research via `exa-js` SDK with 6-section outputSchema
4. Parse and validate the response
5. Return structured sections

Error handling: if Exa call fails, return `{ error: 'Research failed' }` with status 500.

### `app/api/compare/route.ts`

POST handler. Receives `{ companyName }`. Returns `{ results: TavilyResult[], answer?: string }`.

```typescript
const response = await fetch('https://api.tavily.com/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.TAVILY_API_KEY}`
  },
  body: JSON.stringify({
    query: `${companyName} company overview competitive analysis investment research recent news`,
    search_depth: 'advanced',
    max_results: 10,
    include_answer: true
  })
});
```

---

## TypeScript Interfaces (lib/types.ts)

```typescript
type ResearchContext = 'investment_banking' | 'private_equity' | 'hedge_fund' | 'management_consulting';

interface ResearchSections {
  company_overview: string;
  competitive_landscape: string;
  industry_macro: string;
  moat_defensibility: string;
  investment_landscape: string;
  key_questions: string;
}

interface Citation {
  source_name: string;
  url: string;
  published_date?: string;
}

interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
}

interface SectionMeta {
  key: keyof ResearchSections;
  title: string;
  description: string;
}

const SECTION_META: SectionMeta[] = [
  { key: 'company_overview', title: 'Company Overview & Business Model', description: '...' },
  { key: 'competitive_landscape', title: 'Competitive Landscape', description: '...' },
  { key: 'industry_macro', title: 'Industry & Macro Context', description: '...' },
  { key: 'moat_defensibility', title: 'Moat & Defensibility', description: '...' },
  { key: 'investment_landscape', title: 'Investment Landscape', description: '...' },
  { key: 'key_questions', title: 'Key Questions & Open Issues', description: '...' }
];
```
