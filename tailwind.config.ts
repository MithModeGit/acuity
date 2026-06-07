import type { Config } from 'tailwindcss';

/**
 * Acuity Tailwind configuration.
 *
 * The default Tailwind color palette is intentionally DISABLED. Every color in
 * this project is defined as a CSS custom property in app/globals.css and is
 * referenced either via the semantic names mapped below or directly with
 * `var(--token)`. Raw Tailwind color utilities (e.g. `bg-blue-500`) must never
 * appear in Acuity — see docs/DESIGN_SYSTEM.md.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    // Replace (not extend) the palette so the default colors are unavailable.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      inherit: 'inherit',

      page: 'var(--bg-page)',
      surface: 'var(--bg-surface)',
      'surface-hover': 'var(--bg-surface-hover)',

      'text-primary': 'var(--text-primary)',
      'text-secondary': 'var(--text-secondary)',
      'text-muted': 'var(--text-muted)',
      'text-disabled': 'var(--text-disabled)',

      accent: 'var(--accent)',
      'accent-hover': 'var(--accent-hover)',
      'accent-fg': 'var(--accent-fg)',
      'accent-subtle': 'var(--accent-subtle)',

      'border-subtle': 'var(--border-subtle)',
      'border-default': 'var(--border-default)',
      'border-strong': 'var(--border-strong)',
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        dropdown: 'var(--shadow-dropdown)',
        drawer: 'var(--shadow-drawer)',
      },
      maxWidth: {
        brief: '760px',
        search: '680px',
      },
    },
  },
  plugins: [],
};

export default config;
