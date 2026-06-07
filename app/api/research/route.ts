import { NextRequest, NextResponse } from 'next/server';
import { getExa, RESEARCH_OUTPUT_SCHEMA, buildInstructions } from '@/lib/exa';
import type {
  ResearchContext,
  ResearchResult,
  ResearchSections,
  SectionCitations,
  Citation,
  SeedFile,
} from '@/lib/types';
import { SECTION_META } from '@/lib/types';
import stripeSeed from '@/data/stripe_seed.json';

// The live Exa research call is long-running; allow up to 5 minutes.
export const runtime = 'nodejs';
export const maxDuration = 300;

// Companies served from pre-seeded data instead of a live API call.
const SEEDED = ['stripe'];

function isSeeded(name: string): boolean {
  return SEEDED.includes(name.toLowerCase().trim());
}

const seed = stripeSeed as unknown as SeedFile;

/** Validate that an unknown value has all six required section strings. */
function isResearchSections(value: unknown): value is ResearchSections {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return SECTION_META.every((s) => typeof v[s.key] === 'string' && (v[s.key] as string).length > 0);
}

// Matches inline markdown citations Exa embeds in the prose, e.g.
// "[Rippling product pages](https://www.rippling.com/products)".
const MARKDOWN_LINK = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * Live Exa research embeds its citations as inline markdown links inside each
 * section's text. We pull those out as that section's citations (far more
 * relevant than scraping every URL from the events log) and strip the markdown
 * so the prose renders cleanly. Returns the cleaned text plus its citations.
 */
function extractSectionCitations(text: string): { clean: string; citations: Citation[] } {
  const citations: Citation[] = [];
  const seen = new Set<string>();

  for (const match of text.matchAll(MARKDOWN_LINK)) {
    const label = match[1].trim();
    const url = match[2];
    if (seen.has(url)) continue;
    seen.add(url);
    const host = hostnameOf(url);
    citations.push({
      // Prefer a concise descriptive label; fall back to the hostname.
      source_name: label.length > 0 && label.length <= 48 ? label : host,
      url,
    });
  }

  // Remove the markdown link tokens and tidy the leftover whitespace so the
  // displayed prose is clean. The citations live in the chips instead.
  const clean = text
    .replace(MARKDOWN_LINK, '')
    .replace(/\p{Zs}/gu, ' ') // normalize non-breaking / thin spaces
    .replace(/\(\s*\)/g, '') // drop now-empty parens, e.g. "( )"
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[ \t]+([.,;:!?)])/g, '$1') // no space before punctuation
    .replace(/([(])[ \t]+/g, '$1') // no space after opening paren
    .replace(/[ \t]+\n/g, '\n')
    .trim();

  return { clean, citations };
}

/**
 * Build cleaned sections + per-section citations from the raw Exa output by
 * extracting the inline markdown citations Exa placed in each section.
 */
function processLiveSections(raw: ResearchSections): {
  sections: ResearchSections;
  citations: SectionCitations;
} {
  const sections = { ...raw };
  const citations: SectionCitations = {};
  for (const meta of SECTION_META) {
    const { clean, citations: found } = extractSectionCitations(raw[meta.key]);
    sections[meta.key] = clean;
    if (found.length > 0) citations[meta.key] = found;
  }
  return { sections, citations };
}

export async function POST(request: NextRequest) {
  let body: { companyName?: string; context?: ResearchContext };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { companyName, context } = body;

  if (!companyName?.trim()) {
    return NextResponse.json({ error: 'Company name is required.' }, { status: 400 });
  }

  // ── Seeded demo path: instant, deterministic, no API call ──────────────
  if (isSeeded(companyName)) {
    const result: ResearchResult = {
      sections: seed.sections,
      citations: seed.citations ?? {},
      research_seconds: seed.research_seconds,
    };
    return NextResponse.json(result);
  }

  // ── Live Exa Deep Research path ────────────────────────────────────────
  try {
    const exa = getExa();
    const instructions = buildInstructions(companyName.trim(), context ?? 'investment_banking');
    const startedAt = Date.now();

    const created = await exa.research.create({
      instructions,
      model: 'exa-research',
      outputSchema: RESEARCH_OUTPUT_SCHEMA as unknown as Record<string, unknown>,
    });

    const research = await exa.research.pollUntilFinished(created.researchId, {
      pollInterval: 2000,
      timeoutMs: 280000,
    });

    if (research.status !== 'completed') {
      console.error('Exa research did not complete:', research.status);
      return NextResponse.json(
        { error: 'Research could not be completed. Please try again.' },
        { status: 500 },
      );
    }

    const parsed = research.output?.parsed;
    if (!isResearchSections(parsed)) {
      console.error('Exa research output did not match the expected schema.');
      return NextResponse.json(
        { error: 'Research returned an unexpected format. Please try again.' },
        { status: 500 },
      );
    }

    const { sections, citations } = processLiveSections(parsed);
    const result: ResearchResult = {
      sections,
      citations,
      research_seconds: Math.round((Date.now() - startedAt) / 1000),
    };
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Exa research error:', error.message);
    }
    return NextResponse.json(
      { error: 'Research could not be completed. Please try again.' },
      { status: 500 },
    );
  }
}
