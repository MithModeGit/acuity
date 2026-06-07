'use client';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * Large company-name input. Submission is handled by the surrounding <form>
 * (native Enter-to-submit), so this component only owns value + onChange.
 */
export function SearchInput({ value, onChange, disabled }: SearchInputProps) {
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
    />
  );
}
