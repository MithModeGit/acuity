interface LoadingSectionProps {
  /** Title shown above the skeleton so the user knows which section is loading. */
  title: string;
  /** Index for the eyebrow number. */
  index: number;
  /** Number of skeleton body lines — vary this so cards look natural. */
  lines?: number;
}

/**
 * Skeleton placeholder for a research section while the Exa call is pending.
 * Mirrors the SectionCard layout (eyebrow label + body) so the transition to
 * real content is seamless.
 */
export function LoadingSection({ title, index, lines = 4 }: LoadingSectionProps) {
  return (
    <div className="section-card" style={{ padding: '20px 24px' }}>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: 14,
        }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', marginRight: 8 }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="loading-skeleton"
            style={{
              height: 11,
              width: i === lines - 1 ? '62%' : '100%',
            }}
          />
        ))}
      </div>
    </div>
  );
}
