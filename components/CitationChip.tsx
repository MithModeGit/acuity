import type { Citation } from '@/lib/types';

interface CitationChipProps {
  citation: Citation;
}

/** Format an ISO-ish date string to "May 15, 2026". Returns null if unparseable. */
function formatDate(raw?: string): string | null {
  if (!raw) return null;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Inline citation chip: source name · date · external-link icon.
 * Clickable — opens the source in a new tab. The publication name + recent
 * date is the "index quality" argument made visual (see COMPETITIVE_POSITIONING.md).
 */
export function CitationChip({ citation }: CitationChipProps) {
  const date = formatDate(citation.published_date);

  return (
    <a
      href={citation.url}
      target="_blank"
      rel="noopener noreferrer"
      className="citation-chip"
      title={citation.url}
    >
      <span style={{ fontWeight: 500 }}>{citation.source_name}</span>
      {date && (
        <>
          <span aria-hidden style={{ opacity: 0.5 }}>
            ·
          </span>
          <span>{date}</span>
        </>
      )}
      <svg
        aria-hidden
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0, opacity: 0.7 }}
      >
        <path d="M7 17 17 7" />
        <path d="M7 7h10v10" />
      </svg>
    </a>
  );
}
