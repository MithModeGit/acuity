# Acuity — Claude Code Master Instructions

## What This Project Is

Acuity is a standalone investment research demo application powered by Exa's Deep Research API. It is **not** an internal tool — it is the prospect-facing demonstration that Samith shows to companies like Grasp and DiligenceSquared to illustrate how Exa's API can transform investment research workflows.

Acuity is also what gets recorded in the Loom video submitted to Jeff at Exa. It must be visually impressive, immediately understandable, and demonstrate Exa's clear quality advantage over Tavily.

**This repository is separate from Vantage.** Vantage is the AE's internal sales platform. Acuity is the demo. Do not conflate them.

---

## What Acuity Does

A user enters a company name (e.g., "Stripe") and selects a research context (Investment Banking, Private Equity, Hedge Fund, or Management Consulting). Acuity then uses Exa's Deep Research API to generate a structured, six-section investment intelligence brief with citations. Sections appear one by one as results load.

The user can then click "Compare with Tavily" to see what Tavily returns for the same company — raw search results without synthesis — alongside Exa's structured output. The quality difference is the product argument.

---

## The Core Argument Acuity Makes

Acuity demonstrates that Exa's purpose-built AI search index + Deep Research API produces investment-grade research output in under 90 seconds that would take an analyst 3-4 hours manually, and that this output quality dramatically exceeds what Tavily (the most common developer alternative) returns.

See `docs/COMPETITIVE_POSITIONING.md` for the full argument and how to make it visible in the UI.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 App Router |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + CSS custom properties (see DESIGN_SYSTEM.md) |
| Exa | `exa-js` SDK for Deep Research calls |
| Tavily | REST API via fetch |
| State | React state only (no localStorage needed) |
| Deployment | Vercel |

---

## Environment Variables

```
EXA_API_KEY=
TAVILY_API_KEY=
```

Add to `.env.local` (never committed). Set in Vercel dashboard for production.

---

## Pre-Seeded Data Strategy

Acuity uses **pre-seeded results for Stripe** to guarantee a flawless demo experience. When someone enters "Stripe" (case-insensitive), the app loads results from `data/stripe_seed.json` instead of calling the live API. Sections still appear one by one via staggered animation — it looks live.

For any other company, the app makes a real Exa Deep Research API call.

**To populate stripe_seed.json before the first demo:**
1. Temporarily modify the research route to print the raw API response to console
2. Search for "Stripe" via the live app
3. Copy the returned JSON into `data/stripe_seed.json`
4. Verify each section has substantive content
5. Commit the file

See `docs/EXA_IMPLEMENTATION_GUIDE.md` for the exact Exa call that generates this data.

---

## Critical Rules for Claude Code

**Rule 1 — Exa API.** Before writing any Exa API code, read `docs/EXA_IMPLEMENTATION_GUIDE.md` in full. The outputSchema has specific constraints that must be respected.

**Rule 2 — Design.** Read `docs/DESIGN_SYSTEM.md` before writing any UI. Acuity's aesthetic is product-facing and elegant — different from Vantage's data-dense tool aesthetic. It should look like a real SaaS product, not a demo.

**Rule 3 — API keys stay server-side.** The Exa and Tavily API calls must go through Next.js API routes (`/app/api/research/route.ts` and `/app/api/compare/route.ts`). Never expose keys in client components.

**Rule 4 — TypeScript strict compliance.** Same as Vantage — `"strict": true`, no `any` types, explicit interfaces.

**Rule 5 — Documentation stays current.** If the spec, sections, or API call structure change, update the relevant markdown file in the same commit.

**Rule 6 — Git discipline.** Same workflow as Vantage: feature branches → Gemini Code Assist review → develop → main → Vercel deployment.

---

## Repository File Map

```
/acuity
├── CLAUDE.md                              ← This file
├── README.md                              ← Engineering practices, setup
├── .env.example                           ← Required keys (no values)
├── docs/
│   ├── ACUITY_SPEC.md                     ← Full app specification
│   ├── COMPETITIVE_POSITIONING.md         ← Exa vs. Tavily vs. Claude/OpenAI
│   ├── DESIGN_SYSTEM.md                   ← Design tokens and component rules
│   └── EXA_IMPLEMENTATION_GUIDE.md        ← SDK usage, call patterns, gotchas
├── data/
│   └── stripe_seed.json                   ← Pre-seeded Stripe research output
├── app/
│   ├── layout.tsx
│   ├── page.tsx                           ← Main Acuity interface
│   └── api/
│       ├── research/route.ts              ← Exa Deep Research server route
│       └── compare/route.ts              ← Tavily comparison server route
├── components/
│   ├── SearchInput.tsx
│   ├── ContextSelector.tsx
│   ├── ResearchBrief.tsx
│   ├── SectionCard.tsx
│   ├── CitationChip.tsx
│   ├── ComparePanel.tsx
│   └── LoadingSection.tsx
└── lib/
    ├── exa.ts                             ← Exa SDK client
    ├── tavily.ts                          ← Tavily fetch client
    └── types.ts                           ← TypeScript interfaces
```
