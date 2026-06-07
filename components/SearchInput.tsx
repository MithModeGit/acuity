'use client';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

/**
 * Large company-name input. Submits on Enter (when not disabled / non-empty).
 */
export function SearchInput({ value, onChange, onSubmit, disabled }: SearchInputProps) {
  return (
    <input
      className="input"
      type="text"
      value={value}
      placeholder="Enter a company name — e.g. Stripe"
      disabled={disabled}
      autoComplete="off"
      spellCheck={false}
      aria-label="Company name"
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !disabled && value.trim()) {
          onSubmit();
        }
      }}
    />
  );
}
