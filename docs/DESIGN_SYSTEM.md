# Design System

> **⚠️ ACUITY ADAPTATION (2026-06-06).** This file was originally written for
> **Vantage** (a data-dense internal tool with a fixed dark sidebar, kanban
> boards, and a company-detail drawer). Acuity is a **product-facing, centered,
> single-column demo** — not a dashboard. The reconciliation, per CLAUDE.md and
> ACUITY_SPEC.md, is:
>
> - **Tokens — used exactly as specified.** The full `:root` block below, Geist
>   Sans/Mono, the radius/shadow scale, and the navy `--accent: #1C3461` are all
>   reproduced verbatim in `app/globals.css`. Colors are always referenced via
>   `var(--token)`; the default Tailwind palette is disabled in
>   `tailwind.config.ts`. No raw color utilities (`bg-blue-500`) anywhere.
> - **Layout — Vantage-specific rules do NOT apply to Acuity.** Ignore the
>   Sidebar, Deal Cards (Kanban), Tables, Badges, and Drawer sections below.
>   Acuity uses a centered column (max-width 680px → 760px when the brief shows),
>   a top header bar, and a footer. There is no sidebar.
> - **Added token:** `--font-sans` / `--font-mono` CSS variables map the
>   `@fontsource` Geist imports for use throughout.
> - **Added animation:** a `section-reveal` keyframe (fade + 8px rise) powers the
>   staggered six-section reveal. It is defined in `app/globals.css` alongside
>   the existing `pulse-subtle` skeleton animation, and respects
>   `prefers-reduced-motion`. See the Animations section at the end.
>
> Everything below is the original Vantage document, retained for its token set.

---

## Philosophy

Vantage is a professional internal sales tool. The visual language should be:
- **Precise and data-dense** — like a Bloomberg terminal or Linear's interface, not a consumer app
- **Calm and trustworthy** — dark sidebar, white content area, subtle shadows
- **Invisible chrome** — the UI should disappear; the data is the star

The app must not look AI-generated, vibe-coded, or like a design template. Every spacing, color, and typography decision is intentional.

---

## Typography

### Font: Geist Sans + Geist Mono

Install via fontsource:
```bash
npm install @fontsource-variable/geist @fontsource/geist-mono
```

Import in `app/layout.tsx`:
```typescript
import '@fontsource-variable/geist';
import '@fontsource/geist-mono/400.css';
```

Use in CSS:
```css
font-family: 'Geist Variable', system-ui, sans-serif;      /* all UI text */
font-family: 'Geist Mono', 'JetBrains Mono', monospace;   /* emails, scores, code */
```

### Type Scale

| Use | Size | Weight | Line Height |
|-----|------|--------|-------------|
| Page title | 24px | 600 | 1.2 |
| Section heading | 16px | 600 | 1.3 |
| Card heading | 14px | 500 | 1.4 |
| Body / labels | 14px | 400 | 1.5 |
| Table data | 13px | 400 | 1.4 |
| Metadata / timestamps | 12px | 400 | 1.4 |
| Email addresses (mono) | 13px | 400 | 1.4 |
| ICP scores (mono) | 14px | 500 | 1.2 |

---

## Color System

**All colors must be defined as CSS custom properties in `:root` and referenced via `var(--token)`. Never use raw Tailwind color utilities like `bg-blue-500` or `text-purple-600` in this project. The Tailwind default palette is overridden entirely.**

Configure `tailwind.config.ts` to disable the default color palette and reference CSS variables for all color needs.

### Full Token Set

Add this to `app/globals.css`:

```css
:root {
  /* ── Backgrounds ─────────────────────────────────── */
  --bg-page: #F7F7F8;
  --bg-surface: #FFFFFF;
  --bg-surface-hover: #FAFAFA;
  --bg-sidebar: #111111;
  --bg-sidebar-hover: #1A1A1A;
  --bg-sidebar-active: #242424;

  /* ── Borders ─────────────────────────────────────── */
  --border-subtle: #E4E4E7;
  --border-default: #D4D4D8;
  --border-strong: #A1A1AA;

  /* ── Text ────────────────────────────────────────── */
  --text-primary: #18181B;
  --text-secondary: #52525B;
  --text-muted: #A1A1AA;
  --text-disabled: #D4D4D8;
  --text-on-dark: #F4F4F5;
  --text-on-dark-muted: #A1A1AA;

  /* ── Accent (deep navy — not Tailwind blue) ──────── */
  --accent: #1C3461;
  --accent-hover: #162A52;
  --accent-fg: #FFFFFF;
  --accent-subtle: #EEF2FF;

  /* ── Pipeline stage colors ───────────────────────── */
  --stage-target: #6B7280;
  --stage-contacted: #2563EB;
  --stage-call: #7C3AED;
  --stage-demo: #DB2777;
  --stage-proposal: #D97706;
  --stage-won: #16A34A;
  --stage-lost: #EF4444;

  /* ── Archetype badge colors ──────────────────────── */
  --archetype-finance: #0369A1;
  --archetype-sales: #7C3AED;
  --archetype-research: #D97706;
  --archetype-compliance: #0F766E;
  --archetype-content: #BE185D;

  /* ── Signal type colors ──────────────────────────── */
  --signal-competitive: #DC2626;
  --signal-funding: #16A34A;
  --signal-hiring: #2563EB;
  --signal-product: #7C3AED;
  --signal-technology: #6B7280;

  /* ── Shadows and radius ──────────────────────────── */
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-dropdown: 0 4px 12px rgba(0, 0, 0, 0.10);
  --shadow-drawer: -4px 0 24px rgba(0, 0, 0, 0.08);
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-full: 9999px;
}
```

---

## Layout

### Root Layout
- Sidebar: fixed left, 220px wide, full height, `background: var(--bg-sidebar)`
- Main area: `margin-left: 220px`, `background: var(--bg-page)`, full viewport height minus any top bar

### Spacing
Use a 4px base unit. Common values: 4, 8, 12, 16, 20, 24, 32, 48px.

### Content Max Width
Main content areas: `max-width: 1200px` with auto horizontal margins. Tables and boards can extend to full width.

---

## Component Rules

### Cards
```css
background: var(--bg-surface);
border: 1px solid var(--border-subtle);
border-radius: var(--radius-md);
box-shadow: var(--shadow-card);
padding: 16px;
```
Never: colored card backgrounds, large border radius, deep shadows.

### Deal Cards (Kanban)
Same as Cards, plus:
```css
cursor: grab;
transition: box-shadow 0.15s ease;
```
On hover: `box-shadow: var(--shadow-dropdown)` — subtle lift only, no color change.

Stale indicator:
```css
border-left: 2px solid var(--stage-lost);
```

### Tables
```css
/* Header row */
font-size: 11px;
font-weight: 500;
letter-spacing: 0.06em;
text-transform: uppercase;
color: var(--text-muted);

/* Data rows */
font-size: 13px;
color: var(--text-primary);

/* Alternating rows */
background: var(--bg-surface);       /* odd */
background: var(--bg-surface-hover); /* even */

/* Row hover */
background: var(--accent-subtle);
```

### Badges (Archetype, Stage, Signal)
```css
display: inline-flex;
align-items: center;
padding: 2px 8px;
border-radius: var(--radius-sm);
font-size: 11px;
font-weight: 500;
letter-spacing: 0.03em;

/* Archetype badge */
background: color-mix(in srgb, var(--archetype-finance) 12%, transparent);
color: var(--archetype-finance);
```

### Buttons
```css
/* Primary */
background: var(--accent);
color: var(--accent-fg);
border-radius: var(--radius-sm);
height: 34px;
padding: 0 14px;
font-size: 13px;
font-weight: 500;
transition: background 0.15s;

/* Primary hover */
background: var(--accent-hover);

/* Secondary */
background: transparent;
border: 1px solid var(--border-default);
color: var(--text-primary);
```

Never: pill-shaped buttons (no `border-radius: 9999px` on buttons), gradient buttons, large buttons over 40px height.

### Inputs and Textareas
```css
border: 1px solid var(--border-default);
border-radius: var(--radius-sm);
background: var(--bg-surface);
color: var(--text-primary);
font-size: 14px;
padding: 8px 12px;
height: 36px; /* for single-line inputs */
transition: border-color 0.15s;

/* Focus */
border-color: var(--accent);
outline: none;
```

### Sidebar Navigation Items
```css
display: flex;
align-items: center;
gap: 10px;
padding: 8px 16px;
border-radius: var(--radius-sm);
color: var(--text-on-dark-muted);
font-size: 13px;
font-weight: 400;
transition: background 0.1s;

/* Hover */
background: var(--bg-sidebar-hover);
color: var(--text-on-dark);

/* Active */
background: var(--bg-sidebar-active);
color: var(--text-on-dark);
font-weight: 500;
```

### Drawer (Company Detail)
```css
position: fixed;
right: 0;
top: 0;
width: 480px;
height: 100vh;
background: var(--bg-surface);
border-left: 1px solid var(--border-subtle);
box-shadow: var(--shadow-drawer);
overflow-y: auto;
z-index: 50;

/* Animation */
transform: translateX(100%);
transition: transform 0.2s ease;

/* Open state */
transform: translateX(0);
```

---

## What to Avoid

These patterns signal "AI-generated" and must not appear anywhere in Vantage:

- Any gradient backgrounds on cards, headers, or page backgrounds
- `bg-blue-500`, `text-purple-600`, `border-green-400` — raw Tailwind color utilities
- `rounded-xl` or `rounded-2xl` on cards (max `rounded-md` = 6px)
- `shadow-lg` or `shadow-xl` on cards
- Emoji in any UI text or labels
- Bold, centered hero-style headings in a data tool
- Animated gradient borders or glow effects
- Any font other than Geist Sans and Geist Mono
- Color schemes that look like a marketing landing page

---

## Animations

Subtle only. Two acceptable uses:

1. **Drawer slide-in**: `transform + transition` as specified above — 200ms ease
2. **Loading states**: a subtle pulse opacity animation for skeleton loading placeholders

```css
@keyframes pulse-subtle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.loading-skeleton {
  animation: pulse-subtle 1.5s ease-in-out infinite;
  background: var(--border-subtle);
  border-radius: var(--radius-sm);
}
```

3. **Section reveal (Acuity)**: each research section fades and rises 8px into
   place as it is revealed during the staggered 400ms-interval reveal. Subtle,
   single-shot, no bounce.

```css
@keyframes section-reveal {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.section-reveal {
  animation: section-reveal 0.4s ease forwards;
}

@media (prefers-reduced-motion: reduce) {
  .section-reveal, .loading-skeleton { animation: none; }
}
```

No page transitions, no bouncing, no spring physics. This is a professional data tool.
