import type { ResearchSections, SectionCitations, Citation } from '@/lib/types';
import { SECTION_META } from '@/lib/types';

interface BriefComparisonProps {
  exaSections: ResearchSections;
  exaCitations: SectionCitations;
  exaSeconds: number;
  exaSources: number;
  tavilySections: ResearchSections;
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
  footer,
}: {
  label: string;
  sublabel: string;
  dotColor: string;
  bg: string;
  border: string;
  sections: ResearchSections;
  footer: React.ReactNode;
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
        {footer}
      </div>
    </section>
  );
}

/**
 * The two structured briefs side by side — Exa vs Tavily, both six-section JSON
 * from the same prompt and schema. This is the honest core: not "structured vs
 * raw," but two real briefs whose quality differs in the ways the scorecard
 * spells out.
 */
export function BriefComparison({
  exaSections,
  exaCitations,
  exaSeconds,
  exaSources,
  tavilySections,
  tavilySources,
  tavilySeconds,
}: BriefComparisonProps) {
  const exaCitationCount = Object.values(exaCitations).reduce((n, l) => n + (l?.length ?? 0), 0);

  return (
    <div className="compare-grid">
      <BriefColumn
        label="Exa Deep Research"
        sublabel={`Structured six-section brief · ${exaSources} sources · ${exaSeconds}s`}
        dotColor="var(--exa-green)"
        bg="var(--compare-exa-bg)"
        border="var(--compare-exa-border)"
        sections={exaSections}
        footer={
          exaCitationCount > 0 ? (
            <div style={{ paddingTop: 16, fontSize: 11, color: 'var(--text-muted)' }}>
              {exaCitationCount} inline citations across sections — dated and excerpted at the API level.
            </div>
          ) : null
        }
      />
      <BriefColumn
        label="Tavily Research"
        sublabel={`Structured six-section brief · ${tavilySources.length} sources · ${tavilySeconds}s`}
        dotColor="var(--text-muted)"
        bg="var(--compare-tavily-bg)"
        border="var(--compare-tavily-border)"
        sections={tavilySections}
        footer={
          <div style={{ paddingTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: 8 }}>
              Sources
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {tavilySources.map((s, i) => (
                <a
                  key={`${s.url}-${i}`}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="citation-chip"
                  title={s.url}
                >
                  {s.source_name}
                </a>
              ))}
            </div>
          </div>
        }
      />
    </div>
  );
}
