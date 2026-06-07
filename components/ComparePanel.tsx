import type { ResearchSections, TavilyResult } from '@/lib/types';
import { SECTION_META } from '@/lib/types';
import { hostname } from '@/lib/utils';

interface ComparePanelProps {
  sections: ResearchSections;
  tavilyResults: TavilyResult[];
  tavilyAnswer?: string;
  /** True while the Tavily call is in flight. */
  isLoading: boolean;
  /** Error message from the Tavily call, if it failed. */
  error?: string;
}

const PANEL_HEIGHT = 620;

function StatusDot({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }}
    />
  );
}

/**
 * Side-by-side comparison. Left (60%): Exa's structured, synthesized brief in a
 * subtly green-tinted panel. Right (40%): Tavily's raw search results in a
 * neutral panel. The visual contrast — clean cited sections vs. a list of
 * snippets — is the product argument made visible.
 */
export function ComparePanel({ sections, tavilyResults, tavilyAnswer, isLoading, error }: ComparePanelProps) {
  return (
    <div className="compare-grid">
      {/* ── Exa panel ──────────────────────────────────────────────── */}
      <section
        style={{
          background: 'var(--compare-exa-bg)',
          border: '1px solid var(--compare-exa-border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}
      >
        <header
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--compare-exa-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <StatusDot color="var(--exa-green)" />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              Exa Deep Research
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-caption)', marginTop: 3, paddingLeft: 15 }}>
            Structured synthesis · Cited sources
          </div>
        </header>

        <div className="scroll-column" style={{ height: PANEL_HEIGHT, padding: '4px 20px 20px' }}>
          {SECTION_META.map((meta) => (
            <div key={meta.key} style={{ paddingTop: 18 }}>
              <h3
                style={{
                  margin: '0 0 6px',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                }}
              >
                {meta.title}
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: 'var(--text-primary)',
                  whiteSpace: 'pre-line',
                }}
              >
                {sections[meta.key]}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tavily panel ───────────────────────────────────────────── */}
      <section
        style={{
          background: 'var(--compare-tavily-bg)',
          border: '1px solid var(--compare-tavily-border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}
      >
        <header
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--compare-tavily-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <StatusDot color="var(--text-muted)" />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              Tavily Search
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-caption)', marginTop: 3, paddingLeft: 15 }}>
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
          ) : error ? (
            <div
              style={{
                marginTop: 18,
                padding: '12px 14px',
                borderLeft: '3px solid var(--danger)',
                background: 'var(--bg-section)',
                border: '1px solid var(--border-subtle)',
                borderLeftWidth: 3,
                borderLeftColor: 'var(--danger)',
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
                lineHeight: 1.5,
                color: 'var(--text-secondary)',
              }}
            >
              <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>
                Comparison unavailable
              </div>
              {error}
            </div>
          ) : (
            <>
              {tavilyAnswer && (
                <div
                  style={{
                    marginTop: 16,
                    padding: '10px 12px',
                    background: 'var(--bg-section)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
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
  );
}
