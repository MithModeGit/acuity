import type { Citation } from '@/lib/types';
import { CitationChip } from './CitationChip';

interface SectionCardProps {
  index: number;
  title: string;
  content: string;
  citations: Citation[];
  isVisible: boolean;
  animationDelay: number;
}

/**
 * A single research section. Renders nothing until `isVisible` becomes true,
 * at which point it animates in via the section-reveal keyframe. This is what
 * produces the "assembled in real time" staggered reveal.
 *
 * Visual hierarchy (per DESIGN_SYSTEM.md): an uppercase muted eyebrow label,
 * then the analysis in primary text at a generous 1.7 line-height.
 */
export function SectionCard({
  index,
  title,
  content,
  citations,
  isVisible,
  animationDelay,
}: SectionCardProps) {
  if (!isVisible) return null;

  return (
    <article
      className="section-card section-reveal"
      style={{ padding: '20px 24px', animationDelay: `${animationDelay}ms` }}
    >
      <h2
        style={{
          margin: '0 0 10px',
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', marginRight: 8 }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        {title}
      </h2>

      <p
        style={{
          margin: 0,
          fontSize: 14,
          lineHeight: 1.7,
          color: 'var(--text-primary)',
          whiteSpace: 'pre-line',
        }}
      >
        {content}
      </p>

      {citations.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 16 }}>
          {citations.map((citation, i) => (
            <CitationChip key={`${citation.url}-${i}`} citation={citation} />
          ))}
        </div>
      )}
    </article>
  );
}
