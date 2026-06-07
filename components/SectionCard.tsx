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
      className="card section-reveal"
      style={{ padding: '20px 22px', animationDelay: `${animationDelay}ms` }}
    >
      <header style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--text-muted)',
            minWidth: 18,
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
          {title}
        </h2>
      </header>

      <p
        style={{
          margin: 0,
          fontSize: 14,
          lineHeight: 1.6,
          color: 'var(--text-secondary)',
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
