# Design System — Acuity

## Philosophy

Acuity is a product-facing demo. Its aesthetic should feel like a polished B2B SaaS product that a professional would pay for — not a developer tool, not a dashboard, not a hackathon project. The reference aesthetic is premium financial data products: clean, precise, typography-forward, with a high-quality feel that matches the investment professional context.

The visual language is distinct from Vantage (which is a dense internal tool). Acuity is centered, open, and readable.

---

## Typography

### Font: Geist Sans + Geist Mono

Same font stack as Vantage. Install identically:
```bash
npm install @fontsource-variable/geist @fontsource/geist-mono
```

Import in `app/layout.tsx`:
```typescript
import '@fontsource-variable/geist';
import '@fontsource/geist-mono/400.css';
```

### Type Scale for Acuity

| Use | Size | Weight |
|-----|------|--------|
| Product name "Acuity" | 20px | 600 |
| Company name in brief header | 28px | 700 |
| Section titles | 15px | 600 |
| Section content | 14px | 400 |
| Citation chips | 11px | 400 |
| Stats line | 12px | 400 |
| Input labels | 13px | 500 |
| Button text | 13px | 500 |

---

## Color System

Same CSS custom property approach as Vantage. Add to `app/globals.css`:

```css
:root {
  /* ── Backgrounds ─────────────────────────────────── */
  --bg-page: #FFFFFF;
  --bg-surface: #FAFAFA;
  --bg-input: #FFFFFF;
  --bg-section: #FFFFFF;
  --bg-skeleton: #F1F1F3;

  /* ── Borders ─────────────────────────────────────── */
  --border-subtle: #E4E4E7;
  --border-default: #D4D4D8;
  --border-focus: #1C3461;

  /* ── Text ────────────────────────────────────────── */
  --text-primary: #18181B;
  --text-secondary: #52525B;
  --text-muted: #A1A1AA;
  --text-caption: #71717A;

  /* ── Accent ──────────────────────────────────────── */
  --accent: #1C3461;
  --accent-hover: #162A52;
  --accent-fg: #FFFFFF;
  --accent-subtle: #F0F4FF;

  /* ── Exa brand (for attribution and Compare header) */
  --exa-green: #00C48C;
  --exa-green-subtle: #F0FDF9;

  /* ── Comparison panel ─────────────────────────────── */
  --compare-exa-bg: #FAFFFE;
  --compare-exa-border: #D1FAE5;
  --compare-tavily-bg: #FAFAFA;
  --compare-tavily-border: #E4E4E7;

  /* ── Shadows ─────────────────────────────────────── */
  --shadow-input: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-section: 0 1px 3px rgba(0, 0, 0, 0.05);
  --shadow-button: 0 1px 2px rgba(28, 52, 97, 0.2);

  /* ── Radius ──────────────────────────────────────── */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
}
```

Acuity uses slightly larger radius values than Vantage (8px vs 6px for cards) because it's product-facing rather than tool-facing. Still restrained — not pill-shaped or overly rounded.

---

## Layout

### Page Structure
- Max content width: `680px` centered with auto horizontal margins
- Page background: `var(--bg-page)` — white
- The brief output can expand to `760px` when sections are loaded

### Header
Top of page:
```
[Acuity wordmark — left]     [Powered by Exa — right, small]
```

### Main Content
Centered column. Flow:
1. Company name input + context selector (visible on load)
2. Research button
3. Loading skeletons (during API call)
4. Six section cards (after load, staggered reveal)
5. Compare with Tavily button (after all sections loaded)
6. Split-screen comparison (when Compare is clicked)

---

## Component Rules

### Search Input
```css
border: 1px solid var(--border-default);
border-radius: var(--radius-md);
background: var(--bg-input);
font-size: 16px;
height: 48px;
padding: 0 16px;
box-shadow: var(--shadow-input);
width: 100%;

/* Focus */
border-color: var(--border-focus);
box-shadow: 0 0 0 3px var(--accent-subtle);
```

Large and prominent — it's the primary interaction.

### Context Selector
Four horizontally arranged buttons. Behavior like a segmented control:
```css
/* Container */
display: flex;
gap: 4px;
border: 1px solid var(--border-subtle);
border-radius: var(--radius-md);
padding: 3px;
background: var(--bg-surface);

/* Individual button */
border-radius: 6px;
padding: 6px 14px;
font-size: 12px;
font-weight: 500;
color: var(--text-secondary);
background: transparent;
transition: all 0.15s;

/* Active button */
background: var(--accent);
color: var(--accent-fg);
```

### Research Button
Primary action — visually prominent:
```css
background: var(--accent);
color: var(--accent-fg);
height: 48px;
padding: 0 24px;
border-radius: var(--radius-md);
font-size: 14px;
font-weight: 600;
box-shadow: var(--shadow-button);
transition: background 0.15s, transform 0.1s;

/* Hover */
background: var(--accent-hover);
transform: translateY(-1px);

/* Active/loading */
opacity: 0.75;
cursor: not-allowed;
```

### Section Cards
```css
background: var(--bg-section);
border: 1px solid var(--border-subtle);
border-radius: var(--radius-lg);
padding: 20px 24px;
box-shadow: var(--shadow-section);
margin-bottom: 12px;

/* Section title */
font-size: 13px;
font-weight: 600;
letter-spacing: 0.04em;
text-transform: uppercase;
color: var(--text-muted);
margin-bottom: 10px;

/* Section content */
font-size: 14px;
line-height: 1.7;
color: var(--text-primary);
```

### Section Reveal Animation
```css
@keyframes section-reveal {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-card {
  animation: section-reveal 0.35s ease forwards;
}
```

Apply with staggered delays: 0ms, 400ms, 800ms, 1200ms, 1600ms, 2000ms.

### Citation Chips
```css
display: inline-flex;
align-items: center;
gap: 4px;
padding: 2px 8px;
border-radius: var(--radius-sm);
background: var(--bg-surface);
border: 1px solid var(--border-subtle);
font-size: 11px;
color: var(--text-caption);
text-decoration: none;

/* Hover */
border-color: var(--accent);
color: var(--accent);
```

### Loading Skeletons
```css
background: var(--bg-skeleton);
border-radius: var(--radius-md);
animation: pulse-subtle 1.5s ease-in-out infinite;

@keyframes pulse-subtle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

Show 6 skeleton cards with varying heights to simulate the expected section sizes.

### Compare Panel
Split-screen, full-width below the main brief:
```css
/* Exa panel */
background: var(--compare-exa-bg);
border: 1px solid var(--compare-exa-border);
border-radius: var(--radius-lg);

/* Tavily panel */
background: var(--compare-tavily-bg);
border: 1px solid var(--compare-tavily-border);
border-radius: var(--radius-lg);
```

Panel headers use a subtle label: "Exa Deep Research" with a green dot vs "Tavily Search" with a gray dot.

---

## What to Avoid

The same prohibitions as Vantage plus:

- Animated hero backgrounds, gradient orbs, or particle effects
- The Exa or Acuity logo rendered as a large splash element
- Any design pattern that says "startup demo" instead of "real product"
- Cluttered layouts — generous white space is correct here
- Multiple typefaces — Geist only

---

## Stats Line

After the brief loads, show a subtle single line below the company name header:
```
6 sections  ·  [N] sources  ·  Completed in [X] seconds
```

Style:
```css
font-size: 12px;
color: var(--text-muted);
letter-spacing: 0.03em;
```

This makes the speed and comprehensiveness concrete without requiring explanation.
