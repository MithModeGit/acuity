import type { ResearchSections, SectionCitations } from '@/lib/types';
import { SECTION_META } from '@/lib/types';
import { SectionCard } from './SectionCard';
import { LoadingSection } from './LoadingSection';

interface ResearchBriefProps {
  sections: ResearchSections | null;
  citations: SectionCitations;
  /** How many sections (0-6) are currently revealed. */
  visibleSections: number;
  /** True while the API call is in flight (sections still null). */
  isLoading: boolean;
}

// Varied skeleton line counts so the loading state looks natural.
const SKELETON_LINES = [4, 5, 4, 3, 5, 4];

/**
 * Container for the six section cards. Shows skeletons while the API is
 * pending, then reveals real SectionCards as `visibleSections` increments.
 */
export function ResearchBrief({ sections, citations, visibleSections, isLoading }: ResearchBriefProps) {
  if (isLoading && !sections) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {SECTION_META.map((meta, i) => (
          <LoadingSection key={meta.key} title={meta.title} lines={SKELETON_LINES[i]} />
        ))}
      </div>
    );
  }

  if (!sections) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {SECTION_META.map((meta, i) => (
        <SectionCard
          key={meta.key}
          index={i}
          title={meta.title}
          content={sections[meta.key]}
          citations={citations[meta.key] ?? []}
          isVisible={i < visibleSections}
          animationDelay={0}
        />
      ))}
    </div>
  );
}
