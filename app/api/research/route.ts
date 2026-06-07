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

/** Recursively collect every {url, ...} object found anywhere in the events tree. */
function collectUrls(node: unknown, found: Map<string, Citation>): void {
  if (node === null || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const item of node) collectUrls(item, found);
    return;
  }
  const obj = node as Record<string, unknown>;
  const url = obj.url;
  if (typeof url === 'string' && /^https?:\/\//.test(url) && !found.has(url)) {
    let sourceName = url;
    try {
      sourceName = new URL(url).hostname.replace(/^www\./, '');
    } catch {
      /* keep raw url as the source name */
    }
    const title = typeof obj.title === 'string' ? obj.title : undefined;
    const published =
      typeof obj.publishedDate === 'string'
        ? obj.publishedDate
        : typeof obj.published_date === 'string'
          ? (obj.published_date as string)
          : undefined;
    found.set(url, {
      source_name: title && title.length < 60 ? title : sourceName,
      url,
      published_date: published,
    });
  }
  for (const key of Object.keys(obj)) collectUrls(obj[key], found);
}

/**
 * Live Exa research returns no per-section citation map. We extract the source
 * URLs Exa actually read (from the events log) and distribute them round-robin
 * across the six sections so each card shows real, clickable sources.
 */
function buildCitationsFromEvents(events: unknown): SectionCitations {
  const found = new Map<string, Citation>();
  collectUrls(events, found);
  const list = Array.from(found.values());
  const citations: SectionCitations = {};
  list.forEach((citation, i) => {
    const sectionKey = SECTION_META[i % SECTION_META.length].key;
    (citations[sectionKey] ??= []).push(citation);
  });
  return citations;
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
      events: true,
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

    const result: ResearchResult = {
      sections: parsed,
      citations: buildCitationsFromEvents(research.events),
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
