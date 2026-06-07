interface LoadingSectionProps {
  /** Title shown above the skeleton so the user knows which section is loading. */
  title: string;
  /** Number of skeleton body lines — vary this so cards look natural. */
  lines?: number;
}

/**
 * Skeleton placeholder for a research section while the Exa call is pending.
 * Uses the pulse-subtle animation from the design system.
 */
export function LoadingSection({ title, lines = 4 }: LoadingSectionProps) {
  return (
    <div className="card" style={{ padding: '20px 22px' }}>
      <div
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--text-muted)',
          marginBottom: 16,
          letterSpacing: '0.02em',
        }}
      >
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
