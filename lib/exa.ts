import Exa from 'exa-js';
import type { ResearchContext } from './types';

/**
 * Exa SDK singleton. Server-side only — never import this from a client
 * component. The API key is read from the server environment.
 *
 * Note: we intentionally do NOT throw at module load if the key is missing.
 * The Stripe demo path is served entirely from seed data and must work even
 * without an Exa key configured. The key is validated inside the route only
 * when a live (non-seeded) research call is actually attempted.
 */
let client: Exa | null = null;

export function getExa(): Exa {
  if (!process.env.EXA_API_KEY) {
    throw new Error('EXA_API_KEY is not set — live research is unavailable.');
  }
  if (!client) {
    client = new Exa(process.env.EXA_API_KEY);
  }
  return client;
}

/**
 * The Deep Research output schema. Exactly six string properties — one per
 * brief section. This sits comfortably inside Exa's limits of ≤10 properties
 * and ≤2 levels of nesting. Keys must match the ResearchSections interface.
 */
export const RESEARCH_OUTPUT_SCHEMA = {
  type: 'object',
  required: [
    'company_overview',
    'competitive_landscape',
    'industry_macro',
    'moat_defensibility',
    'investment_landscape',
    'key_questions',
  ],
  properties: {
    company_overview: {
      type: 'string',
      description:
        'Core business model, revenue drivers, key customers, and notable recent milestones from public sources. 4-6 substantive sentences with specific figures where available.',
    },
    competitive_landscape: {
      type: 'string',
      description:
        'Key direct competitors, relative market positioning, recent competitive moves, and differentiation. 4-6 substantive sentences naming specific competitors.',
    },
    industry_macro: {
      type: 'string',
      description:
        'Market size and growth trajectory, structural tailwinds and headwinds, and macro factors affecting the business. 4-6 substantive sentences with market figures.',
    },
    moat_defensibility: {
      type: 'string',
      description:
        'Sources of durable competitive advantage: network effects, switching costs, proprietary data, brand, and distribution. 4-6 substantive sentences.',
    },
    investment_landscape: {
      type: 'string',
      description:
        'Company funding history, comparable M&A transactions, peer valuations, and investment activity in the sector. 4-6 substantive sentences with specific transactions and figures.',
    },
    key_questions: {
      type: 'string',
      description:
        'Non-obvious risks, contradictions or tensions in the research, and the most important questions a smart analyst should investigate. 4-6 substantive sentences.',
    },
  },
} as const;

/**
 * Context-specific framing prepended to the research instructions. The Exa
 * Research API takes a single `instructions` string (there is no separate
 * systemPrompt parameter), so the analyst persona is folded into the prompt.
 */
const CONTEXT_INSTRUCTIONS: Record<ResearchContext, string> = {
  investment_banking:
    'Adopt the perspective of a senior investment banking analyst preparing pre-deal research. Emphasize transaction comparables, deal-structure signals, potential acquirers or strategic buyers, and material developments that would affect deal valuation.',
  private_equity:
    'Adopt the perspective of a private equity associate preparing pre-diligence public intelligence on a potential portfolio company. Emphasize publicly visible financial-performance signals, management-team indicators, operational improvement opportunities, and any red flags.',
  hedge_fund:
    'Adopt the perspective of a hedge fund analyst building an investment thesis. Emphasize long and short catalysts, recent developments that change the competitive or financial picture, and signals of inflection points. Be analytically specific, not descriptive.',
  management_consulting:
    'Adopt the perspective of a management consultant preparing for a new client engagement. Emphasize strategic positioning, market dynamics, operational benchmarks versus peers, and the most pressing strategic questions the client is likely facing.',
};

/** Build the full instructions string for a live research call. */
export function buildInstructions(companyName: string, context: ResearchContext): string {
  const persona = CONTEXT_INSTRUCTIONS[context] ?? CONTEXT_INSTRUCTIONS.investment_banking;
  return [
    `Produce a comprehensive, investment-grade research brief on ${companyName}.`,
    persona,
    'Cover, as separate fields: (1) the company overview and business model, (2) the competitive landscape, (3) industry and macro context, (4) moat and defensibility, (5) the investment and M&A landscape, and (6) the key open questions an analyst should investigate.',
    'Use authoritative, recent sources (financial press, filings, quality trade press). Prioritize developments from the last 90 days. Be specific: name competitors, cite figures, reference concrete transactions. Avoid generic statements.',
  ].join(' ');
}
