/**
 * Shared TypeScript interfaces for Acuity.
 *
 * These types are the contract between the API routes, the seed data, and the
 * UI components. See docs/ACUITY_SPEC.md for the source-of-truth definitions.
 */

/** The four research framings the user can select. Drives the Exa instructions. */
export type ResearchContext =
  | 'investment_banking'
  | 'private_equity'
  | 'hedge_fund'
  | 'management_consulting';

/**
 * The six-section structured research brief. Each field is a substantive,
 * multi-sentence analysis string. These six keys map 1:1 to the Exa Deep
 * Research `outputSchema` properties (see lib/exa.ts).
 */
export interface ResearchSections {
  company_overview: string;
  competitive_landscape: string;
  industry_macro: string;
  moat_defensibility: string;
  investment_landscape: string;
  key_questions: string;
}

/** A single cited source shown as a chip beneath a section. */
export interface Citation {
  source_name: string;
  url: string;
  published_date?: string;
}

/**
 * Citations grouped by the section they support. Keys match ResearchSections.
 * Optional per key — a section may have zero citations.
 *
 * The Exa Research API does not return a per-section citation array, so:
 *  - the Stripe seed authors these directly for the highest-quality demo, and
 *  - live calls best-effort extract source URLs from the research events and
 *    distribute them across sections (see app/api/research/route.ts).
 */
export type SectionCitations = Partial<Record<keyof ResearchSections, Citation[]>>;

/** The full payload returned by POST /api/research. */
export interface ResearchResult {
  sections: ResearchSections;
  citations: SectionCitations;
  /**
   * Seconds the research took. For live calls this is the measured Exa poll
   * duration; for the Stripe seed it is the duration of the original Exa run
   * that produced the seed. Drives the "Completed in X seconds" stats line.
   */
  research_seconds: number;
}

/** The shape of data/stripe_seed.json. */
export interface SeedFile {
  company: string;
  context: ResearchContext;
  generated_at: string;
  research_seconds: number;
  sections: ResearchSections;
  citations: SectionCitations;
}

/** A single raw Tavily search result (no synthesis — the comparison point). */
export interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
}

/** Response shape from POST /api/compare. */
export interface CompareResult {
  results: TavilyResult[];
  answer?: string;
}

/** Metadata that drives section rendering order and labels across the app. */
export interface SectionMeta {
  key: keyof ResearchSections;
  title: string;
  description: string;
}

/**
 * The canonical ordering and titles for the six sections. This array is the
 * single source of truth for how the brief is rendered. Titles must match
 * docs/ACUITY_SPEC.md exactly.
 */
export const SECTION_META: SectionMeta[] = [
  {
    key: 'company_overview',
    title: 'Company Overview & Business Model',
    description: 'Core product, revenue model, key customers, recent milestones, and growth metrics from public sources.',
  },
  {
    key: 'competitive_landscape',
    title: 'Competitive Landscape',
    description: 'Key direct competitors, market positioning, recent competitive moves, and market-share signals.',
  },
  {
    key: 'industry_macro',
    title: 'Industry & Macro Context',
    description: 'Market size estimates, growth trends, tailwinds and headwinds, and macro factors affecting the business.',
  },
  {
    key: 'moat_defensibility',
    title: 'Moat & Defensibility',
    description: 'Sources of competitive advantage: network effects, switching costs, IP, brand, and distribution.',
  },
  {
    key: 'investment_landscape',
    title: 'Investment Landscape',
    description: 'Comparable transactions, funding history of the company and peers, valuation benchmarks, and M&A activity.',
  },
  {
    key: 'key_questions',
    title: 'Key Questions & Open Issues',
    description: 'Non-obvious risks, contradictions in the research, and what a smart analyst should investigate further.',
  },
];

/** Human-readable labels for each research context (UI display). */
export const CONTEXT_LABELS: Record<ResearchContext, string> = {
  investment_banking: 'Investment Banking',
  private_equity: 'Private Equity',
  hedge_fund: 'Hedge Fund',
  management_consulting: 'Management Consulting',
};

/** Short framing line shown under the active context. */
export const CONTEXT_FRAMING: Record<ResearchContext, string> = {
  investment_banking: 'Pre-deal research for M&A advisory',
  private_equity: 'Pre-diligence public intelligence',
  hedge_fund: 'Investment thesis research',
  management_consulting: 'Client engagement preparation',
};
