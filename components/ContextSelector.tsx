'use client';

import type { ResearchContext } from '@/lib/types';
import { CONTEXT_LABELS } from '@/lib/types';

interface ContextSelectorProps {
  value: ResearchContext;
  onChange: (context: ResearchContext) => void;
  disabled?: boolean;
}

const CONTEXTS: ResearchContext[] = [
  'investment_banking',
  'private_equity',
  'hedge_fund',
  'management_consulting',
];

/**
 * Four-option segmented control for the research framing. The active option
 * uses the navy accent. Drives the systemPrompt/instructions sent to Exa.
 */
export function ContextSelector({ value, onChange, disabled }: ContextSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Research context"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 4,
        padding: 4,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      {CONTEXTS.map((context) => {
        const active = context === value;
        return (
          <button
            key={context}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(context)}
            style={{
              height: 34,
              padding: '0 8px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: active ? 'var(--accent)' : 'transparent',
              color: active ? 'var(--accent-fg)' : 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: active ? 500 : 400,
              fontFamily: 'var(--font-sans)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s ease, color 0.15s ease',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {CONTEXT_LABELS[context]}
          </button>
        );
      })}
    </div>
  );
}
