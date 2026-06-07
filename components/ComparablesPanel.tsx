import type { ComparisonData } from '@/lib/types';

interface ComparablesPanelProps {
  comparables: ComparisonData['comparables'];
}

function Card({
  company,
  kind,
  valuation,
  founder,
  description,
  url,
}: {
  company: string;
  kind: string;
  valuation: string;
  founder: string;
  description: string;
  url?: string;
}) {
  const inner = (
    <div className="section-card" style={{ padding: '14px 16px', height: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{company}</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{kind}</span>
      </div>
      <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 500 }}>{valuation}</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{founder}</div>
      <div style={{ fontSize: 12, lineHeight: 1.45, color: 'var(--text-muted)' }}>{description}</div>
    </div>
  );
  return url ? (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', height: '100%' }}>
      {inner}
    </a>
  ) : (
    inner
  );
}

/**
 * Act 3 — the capability gap. Exa's company index returns a verified, structured
 * comp set (founder + latest valuation per entity) in seconds; Tavily, asked the
 * same, runs a multi-minute research synthesis and drifts to smaller peers. The
 * win is retrieval, speed, and relevance — not "Tavily can't."
 */
export function ComparablesPanel({ comparables }: ComparablesPanelProps) {
  const speedup = Math.round(comparables.tavily_seconds / Math.max(comparables.exa_seconds, 1));

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <h3 style={{ margin: '0 0 3px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
          Beyond synthesis: structured discovery
        </h3>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: 'var(--text-secondary)' }}>
          On the brief, the two engines are close. This is where they aren&apos;t. Asked for Stripe&apos;s
          closest comparables with founders and valuations, Exa&apos;s company index returned a verified,
          structured set in <strong style={{ color: 'var(--text-primary)' }}>~{comparables.exa_seconds}s</strong> —
          a different capability class from text synthesis.
        </p>
      </div>

      {/* Exa comp set */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 10px' }}>
        <span aria-hidden style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--exa-green)' }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Exa company index</span>
        <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          {comparables.exa.length} comparables · {comparables.exa_seconds}s
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {comparables.exa.map((c) => (
          <Card key={c.company} {...c} />
        ))}
      </div>

      {/* Tavily contrast */}
      <div
        className="section-card"
        style={{ marginTop: 20, padding: '16px 18px', background: 'var(--compare-tavily-bg)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span aria-hidden style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--text-muted)' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Tavily Research</span>
          <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            {comparables.tavily_returned} of 8 · {comparables.tavily_seconds}s
          </span>
        </div>
        <p style={{ margin: '0 0 10px', fontSize: 12.5, lineHeight: 1.5, color: 'var(--text-secondary)' }}>
          Tavily produced a real structured set too (via Research + schema) — but it took{' '}
          <strong style={{ color: 'var(--text-primary)' }}>~{speedup}× longer</strong>, returned only{' '}
          {comparables.tavily_returned}, and drifted to much smaller peers (Marqeta ~$1.6B, Payoneer ~$1.7B)
          rather than Stripe-scale processors.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {comparables.tavily.map((c) => (
            <span
              key={c.company}
              style={{
                display: 'inline-flex',
                alignItems: 'baseline',
                gap: 5,
                padding: '3px 9px',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-section)',
                fontSize: 12,
                color: 'var(--text-primary)',
              }}
            >
              {c.company}
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{c.valuation}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
