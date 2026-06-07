import type { ResearchSections, TavilyResult } from '@/lib/types';
import { SECTION_META } from '@/lib/types';

interface ComparePanelProps {
  sections: ResearchSections;
  tavilyResults: TavilyResult[];
  tavilyAnswer?: string;
  /** True while the Tavily call is in flight. */
  isLoading: boolean;
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

const PANEL_HEIGHT = 620;

/**
 * Side-by-side comparison. Left (60%): Exa's structured, synthesized brief.
 * Right (40%): Tavily's raw search results. The visual contrast — clean
 * sections vs. a list of snippets — is the product argument made visible.
 */
export function ComparePanel({ sections, tavilyResults, tavilyAnswer, isLoading }: ComparePanelProps) {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '60fr 40fr' }}>
        {/* ── Exa side ─────────────────────────────────────────────── */}
        <section
          style={{
            borderRight: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <header
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-hover)',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              Exa Deep Research
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Structured synthesis · Cited sources
            </div>
          </header>

          <div className="scroll-column" style={{ height: PANEL_HEIGHT, padding: '4px 20px 20px' }}>
            {SECTION_META.map((meta) => (
              <div key={meta.key} style={{ paddingTop: 18 }}>
                <h3
                  style={{
                    margin: '0 0 6px',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}
                >
                  {meta.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    lineHeight: 1.55,
                    color: 'var(--text-secondary)',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {sections[meta.key]}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Tavily side ──────────────────────────────────────────── */}
        <section style={{ display: 'flex', flexDirection: 'column' }}>
          <header
            style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-hover)',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              Tavily Search
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Raw results — no synthesis, no structured output
            </div>
          </header>

          <div className="scroll-column" style={{ height: PANEL_HEIGHT, padding: '4px 20px 20px' }}>
            {isLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 18 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div className="loading-skeleton" style={{ height: 12, width: '70%' }} />
                    <div className="loading-skeleton" style={{ height: 9, width: '40%' }} />
                    <div className="loading-skeleton" style={{ height: 9, width: '100%' }} />
                    <div className="loading-skeleton" style={{ height: 9, width: '85%' }} />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {tavilyAnswer && (
                  <div
                    style={{
                      marginTop: 16,
                      padding: '10px 12px',
                      background: 'var(--bg-surface-hover)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 12,
                      lineHeight: 1.5,
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>Quick answer · </span>
                    {tavilyAnswer}
                  </div>
                )}

                {tavilyResults.length === 0 && !tavilyAnswer && (
                  <p style={{ paddingTop: 18, fontSize: 13, color: 'var(--text-muted)' }}>
                    No results returned.
                  </p>
                )}

                {tavilyResults.map((result, i) => (
                  <a
                    key={`${result.url}-${i}`}
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      paddingTop: 16,
                      marginTop: 16,
                      borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {result.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--accent)',
                        margin: '3px 0 6px',
                      }}
                    >
                      {hostname(result.url)}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        lineHeight: 1.5,
                        color: 'var(--text-secondary)',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {result.content}
                    </div>
                  </a>
                ))}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
