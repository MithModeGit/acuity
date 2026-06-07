'use client';

import { useEffect, useState } from 'react';
import type {
  ResearchContext,
  ResearchSections,
  SectionCitations,
  TavilyResult,
  ResearchResult,
  CompareResult,
} from '@/lib/types';
import { CONTEXT_FRAMING } from '@/lib/types';
import { SearchInput } from '@/components/SearchInput';
import { ContextSelector } from '@/components/ContextSelector';
import { ResearchBrief } from '@/components/ResearchBrief';
import { ComparePanel } from '@/components/ComparePanel';

type Status = 'idle' | 'loading' | 'complete' | 'error';

const TOTAL_SECTIONS = 6;
const REVEAL_INTERVAL_MS = 400;

export default function Home() {
  const [companyName, setCompanyName] = useState('');
  const [context, setContext] = useState<ResearchContext>('investment_banking');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [sections, setSections] = useState<ResearchSections | null>(null);
  const [citations, setCitations] = useState<SectionCitations>({});
  const [researchSeconds, setResearchSeconds] = useState(0);
  const [visibleSections, setVisibleSections] = useState(0);

  const [submittedName, setSubmittedName] = useState('');

  const [compareOpen, setCompareOpen] = useState(false);
  const [tavilyLoading, setTavilyLoading] = useState(false);
  const [tavilyResults, setTavilyResults] = useState<TavilyResult[] | null>(null);
  const [tavilyAnswer, setTavilyAnswer] = useState<string | undefined>(undefined);
  const [tavilyError, setTavilyError] = useState('');

  // ── Staggered section reveal ─────────────────────────────────────────────
  useEffect(() => {
    if (status === 'complete' && sections) {
      let count = 0;
      const interval = setInterval(() => {
        count += 1;
        setVisibleSections(count);
        if (count >= TOTAL_SECTIONS) clearInterval(interval);
      }, REVEAL_INTERVAL_MS);
      return () => clearInterval(interval);
    }
  }, [status, sections]);

  async function handleResearch() {
    const trimmed = companyName.trim();
    if (!trimmed || status === 'loading') return;

    // Reset everything for a fresh run.
    setStatus('loading');
    setErrorMessage('');
    setSections(null);
    setCitations({});
    setVisibleSections(0);
    setCompareOpen(false);
    setTavilyResults(null);
    setTavilyAnswer(undefined);
    setSubmittedName(trimmed);

    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: trimmed, context }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? 'Research could not be completed.');
      }

      const data = (await res.json()) as ResearchResult;
      setSections(data.sections);
      setCitations(data.citations ?? {});
      setResearchSeconds(data.research_seconds ?? 0);
      setStatus('complete');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Research could not be completed.');
      setStatus('error');
    }
  }

  async function handleCompare() {
    if (!submittedName) return;
    setCompareOpen(true);
    setTavilyLoading(true);
    setTavilyResults(null);
    setTavilyAnswer(undefined);
    setTavilyError('');

    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: submittedName }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? 'Comparison failed.');
      }

      const data = (await res.json()) as CompareResult;
      setTavilyResults(data.results);
      setTavilyAnswer(data.answer);
    } catch (error) {
      setTavilyError(error instanceof Error ? error.message : 'Comparison failed.');
      setTavilyResults([]);
      setTavilyAnswer(undefined);
    } finally {
      setTavilyLoading(false);
    }
  }

  const isLoading = status === 'loading';
  const showBrief = isLoading || status === 'complete';
  const allRevealed = status === 'complete' && visibleSections >= TOTAL_SECTIONS;
  const sourceCount = Object.values(citations).reduce((sum, list) => sum + (list?.length ?? 0), 0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 28px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
            Acuity
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Investment Research Intelligence</span>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-secondary)' }}>
          <span aria-hidden style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--exa-green)' }} />
          Powered by{' '}
          <a
            href="https://exa.ai"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent)', fontWeight: 600 }}
          >
            Exa
          </a>
        </span>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '48px 24px 80px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: showBrief ? 760 : 680,
            transition: 'max-width 0.3s ease',
          }}
        >
          {/* Intro — only before a search runs */}
          {status === 'idle' && (
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h1
                style={{
                  margin: '0 0 10px',
                  fontSize: 28,
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                }}
              >
                Investment-grade research in under 90 seconds
              </h1>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                Enter a company and a research lens. Acuity returns a structured, cited,
                six-section intelligence brief — synthesized by Exa Deep Research.
              </p>
            </div>
          )}

          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SearchInput
              value={companyName}
              onChange={setCompanyName}
              onSubmit={handleResearch}
              disabled={isLoading}
            />
            <ContextSelector value={context} onChange={setContext} disabled={isLoading} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{CONTEXT_FRAMING[context]}</span>
              <button
                type="button"
                className="btn-primary"
                onClick={handleResearch}
                disabled={isLoading || !companyName.trim()}
              >
                {isLoading ? 'Researching…' : 'Research'}
              </button>
            </div>
          </div>

          {/* Error state */}
          {status === 'error' && (
            <div
              className="section-card"
              style={{
                marginTop: 28,
                padding: 20,
                borderLeft: '3px solid var(--danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                  Research could not be completed
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {errorMessage}
                </div>
              </div>
              <button type="button" className="btn-secondary" onClick={handleResearch}>
                Try again
              </button>
            </div>
          )}

          {/* Company header + stats line */}
          {status === 'complete' && sections && (
            <div style={{ marginTop: 28, marginBottom: 18 }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: 28,
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)',
                }}
              >
                {submittedName}
              </h2>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.03em', marginTop: 6 }}>
                {TOTAL_SECTIONS} sections
                {sourceCount > 0 && ` · ${sourceCount} sources`}
                {researchSeconds > 0 && ` · completed in ${researchSeconds} seconds`}
              </div>
            </div>
          )}

          {/* Brief */}
          {showBrief && (
            <div style={{ marginTop: status === 'complete' ? 0 : 28 }}>
              <ResearchBrief
                sections={sections}
                citations={citations}
                visibleSections={visibleSections}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* Compare CTA — only after all six sections are revealed */}
          {allRevealed && !compareOpen && (
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
              <button type="button" className="btn-secondary" onClick={handleCompare}>
                Compare with Tavily
              </button>
            </div>
          )}

          {/* Compare panel */}
          {compareOpen && sections && (
            <div style={{ marginTop: 24 }}>
              <div style={{ marginBottom: 12 }}>
                <h3 style={{ margin: '0 0 2px', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                  The same query, two engines
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
                  Exa returns a structured, cited brief. Tavily returns raw search results — the
                  developer would still have to synthesize them.
                </p>
              </div>
              <ComparePanel
                sections={sections}
                tavilyResults={tavilyResults ?? []}
                tavilyAnswer={tavilyAnswer}
                isLoading={tavilyLoading}
                error={tavilyError}
              />
            </div>
          )}
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer
        style={{
          padding: '18px 28px',
          borderTop: '1px solid var(--border-subtle)',
          textAlign: 'center',
          fontSize: 12,
          color: 'var(--text-muted)',
        }}
      >
        Research powered by Exa&apos;s Neural Search API ·{' '}
        <a href="https://exa.ai" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)' }}>
          exa.ai
        </a>
      </footer>
    </div>
  );
}
