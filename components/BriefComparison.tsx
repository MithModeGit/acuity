import type { ResearchSections, Citation } from '@/lib/types';
import { SECTION_META } from '@/lib/types';

interface BriefComparisonProps {
  exaSections: ResearchSections;
  exaSeconds: number;
  exaSources: number;
  tavilySections: ResearchSections;
  /** Used only for the source count in the column header. */
  tavilySources: Citation[];
  tavilySeconds: number;
}

const PANEL_HEIGHT = 560;

function StatusDot({ color }: { color: string }) {
  return <span aria-hidden style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />;
}

function BriefColumn({
  label,
  sublabel,
  dotColor,
  bg,
  border,
  sections,
}: {
  label: string;
  sublabel: string;
  dotColor: string;
  bg: string;
  border: string;
  sections: ResearchSections;
}) {
  return (
    <section style={{ background: bg, border: `1px solid ${border}`, borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <header style={{ padding: '14px 20px', borderBottom: `1px solid ${border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StatusDot color={dotColor} />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-caption)', marginTop: 3, paddingLeft: 15 }}>{sublabel}</div>
      </header>
      <div className="scroll-column" style={{ height: PANEL_HEIGHT, padding: '4px 20px 16px' }}>
        {SECTION_META.map((meta) => (
          <div key={meta.key} style={{ paddingTop: 16 }}>
            <h4
              style={{
                margin: '0 0 5px',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
              }}
            >
              {meta.title}
            </h4>
            <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.55, color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
              {sections[meta.key]}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * The two structured briefs side by side — Exa vs Tavily, both six-section JSON
 * from the same prompt and schema. This is the honest core: not "structured vs
 * raw," but two real briefs whose quality differs in the ways the scorecard
 * spells out. Source counts live in each column header; the full Exa source list
 * is shown with the brief above, so neither column repeats a source list here.
 */
export function BriefComparison({
  exaSections,
  exaSeconds,
  exaSources,
  tavilySections,
  tavilySources,
  tavilySeconds,
}: BriefComparisonProps) {
  return (
    <div className="compare-grid">
      <BriefColumn
        label="Exa Deep Research"
        sublabel={`Structured six-section brief · ${exaSources} sources · ${exaSeconds}s`}
        dotColor="var(--exa-green)"
        bg="var(--compare-exa-bg)"
        border="var(--compare-exa-border)"
        sections={exaSections}
      />
      <BriefColumn
        label="Tavily Research"
        sublabel={`Structured six-section brief · ${tavilySources.length} sources · ${tavilySeconds}s`}
        dotColor="var(--text-muted)"
        bg="var(--compare-tavily-bg)"
        border="var(--compare-tavily-border)"
        sections={tavilySections}
      />
    </div>
  );
}
