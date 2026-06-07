'use client';

import { useState } from 'react';
import type { ScorecardRow } from '@/lib/types';

interface ScorecardPanelProps {
  scorecard: ScorecardRow[];
  exaSeconds: number;
  exaSources: number;
  tavilySeconds: number;
  tavilySources: number;
}

function RatingDots({ value, color }: { value: number; color: string }) {
  return (
    <span style={{ display: 'inline-flex', gap: 3 }} aria-label={`${value} of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          aria-hidden
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: i < value ? color : 'var(--border-default)',
          }}
        />
      ))}
    </span>
  );
}

function verdictStyle(verdict: string): { bg: string; fg: string } {
  if (verdict.toLowerCase().includes('exa')) return { bg: 'var(--exa-green-subtle)', fg: 'var(--exa-green)' };
  if (verdict.toLowerCase().includes('parity')) return { bg: 'var(--bg-surface)', fg: 'var(--text-secondary)' };
  return { bg: 'var(--accent-subtle)', fg: 'var(--accent)' };
}

/**
 * The evidence-anchored Exa-vs-Tavily scorecard. Each row's rating is derived
 * from the real Stripe runs; clicking a row reveals the specific evidence behind
 * it (see docs/COMPARISON_ANALYSIS.md). Honest by design — two of five rows are
 * ties.
 */
export function ScorecardPanel({
  scorecard,
  exaSeconds,
  exaSources,
  tavilySeconds,
  tavilySources,
}: ScorecardPanelProps) {
  const [open, setOpen] = useState<string | null>(scorecard[0]?.key ?? null);

  return (
    <div className="section-card" style={{ overflow: 'hidden' }}>
      <header style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-subtle)' }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
          How the engines compare
        </h3>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
          The same six-section brief on Stripe, same schema, each engine&apos;s standard tier. Ratings
          come from the actual outputs — click any row for the evidence.
        </p>
        <div
          style={{
            display: 'flex',
            gap: 18,
            marginTop: 12,
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
          }}
        >
          <span>
            <span style={{ color: 'var(--exa-green)', fontWeight: 600 }}>Exa</span> · {exaSources} sources · {exaSeconds}s
          </span>
          <span>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Tavily</span> · {tavilySources} sources · {tavilySeconds}s
          </span>
        </div>
      </header>

      <div>
        {scorecard.map((row) => {
          const isOpen = open === row.key;
          const v = verdictStyle(row.verdict);
          return (
            <div key={row.key} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <h4 style={{ margin: 0 }}>
              <button
                id={`scorecard-h-${row.key}`}
                type="button"
                onClick={() => setOpen(isOpen ? null : row.key)}
                aria-expanded={isOpen}
                aria-controls={`scorecard-p-${row.key}`}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 22px',
                  background: isOpen ? 'var(--bg-surface)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {row.label}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 96 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 34 }}>Exa</span>
                  <RatingDots value={row.exa_rating} color="var(--exa-green)" />
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 110 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 42 }}>Tavily</span>
                  <RatingDots value={row.tavily_rating} color="var(--text-muted)" />
                </span>
                <span
                  style={{
                    minWidth: 74,
                    textAlign: 'center',
                    fontSize: 11,
                    fontWeight: 500,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: v.bg,
                    color: v.fg,
                  }}
                >
                  {row.verdict}
                </span>
                <span aria-hidden style={{ color: 'var(--text-muted)', fontSize: 12, width: 12 }}>
                  {isOpen ? '−' : '+'}
                </span>
              </button>
              </h4>

              {isOpen && (
                <div
                  id={`scorecard-p-${row.key}`}
                  role="region"
                  aria-labelledby={`scorecard-h-${row.key}`}
                  style={{ padding: '0 22px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}
                >
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: 'var(--text-secondary)' }}>
                    {row.summary}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
                    <div
                      style={{
                        padding: '12px 14px',
                        background: 'var(--compare-exa-bg)',
                        border: '1px solid var(--compare-exa-border)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--exa-green)', marginBottom: 6 }}>
                        Exa
                      </div>
                      <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: 'var(--text-primary)' }}>
                        {row.exa_evidence}
                      </p>
                    </div>
                    <div
                      style={{
                        padding: '12px 14px',
                        background: 'var(--compare-tavily-bg)',
                        border: '1px solid var(--compare-tavily-border)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: 6 }}>
                        Tavily
                      </div>
                      <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: 'var(--text-primary)' }}>
                        {row.tavily_evidence}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
