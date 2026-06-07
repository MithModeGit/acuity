# Acuity

Investment research demo application powered by Exa's Deep Research API. Built for Samith Venkatesh's application for Founding Account Executive at Exa.

---

## Prerequisites

- Node.js 20+
- npm or pnpm
- Exa API key (paid tier) — [dashboard.exa.ai](https://dashboard.exa.ai)
- Tavily API key (free tier sufficient) — [tavily.com](https://tavily.com)

---

## Setup

```bash
# Clone the repo
git clone https://github.com/MithModeGit/acuity.git
cd acuity

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your API keys to .env.local

# Populate the Stripe seed data (required before first demo)
# See docs/EXA_IMPLEMENTATION_GUIDE.md for instructions

# Start the development server
npm run dev
```

---

## Key Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Next.js dev server on localhost:3000 |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run type-check` | TypeScript check (`tsc --noEmit`) |

---

## Git Workflow

Identical to the Vantage repo. Follow these steps exactly:

### Branch Structure

```
main          ← Production; auto-deploys to Vercel
develop       ← Integration branch
feature/*     ← Feature branches, cut from develop
fix/*         ← Bug fixes
docs/*        ← Documentation updates
```

### Step-by-Step

1. **Branch from develop**
   ```bash
   git checkout develop && git pull origin develop
   git checkout -b feature/section-loading-animation
   ```

2. **Develop and commit** using Conventional Commits format

3. **Push and open PR to develop**

4. **Gemini Code Assist reviews the PR** — address all flagged issues before merging

5. **Merge to develop**, then PR from develop → main for production deployment

### Conventional Commits

Format: `<type>(<scope>): <description>`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `chore`

Examples:
```
feat(sections): add staggered section reveal animation
fix(seed): handle Stripe case-insensitive matching
docs(spec): update section titles
chore(deps): bump exa-js to latest
```

---

## TypeScript Standards

- `"strict": true` in `tsconfig.json`
- No `any` types
- All component props explicitly typed
- API response shapes typed in `lib/types.ts`
- Run `npm run type-check` before every PR

---

## Component Structure

One component per file. Types defined at top of file if component-specific, or in `lib/types.ts` if shared.

```typescript
// components/SectionCard.tsx

interface SectionCardProps {
  title: string;
  content: string;
  citations: Citation[];
  isLoading: boolean;
  animationDelay: number;
}

export function SectionCard({ title, content, citations, isLoading, animationDelay }: SectionCardProps) {
  // ...
}
```

---

## Environment Variables

```
EXA_API_KEY=       ← Server-side only; never in client code
TAVILY_API_KEY=    ← Server-side only; never in client code
```

The API routes in `/app/api/` access these server-side. They must never be imported or referenced in client components or passed as props.

---

## Deployment

Auto-deploys to Vercel on push to `main`. Add environment variables in the Vercel project dashboard before first deployment.

---

## Documentation Rule

Whenever a spec, API call structure, section title, or design decision changes, update the relevant `docs/` file in the same commit. Documentation must stay current with the code.

---

## Populating Stripe Seed Data

Before the first live demo, populate `data/stripe_seed.json`:

1. Start the dev server: `npm run dev`
2. In `app/api/research/route.ts`, temporarily add `console.log(JSON.stringify(result, null, 2))` after the Exa API call returns
3. Search for "Stripe" in the app
4. Copy the logged JSON output into `data/stripe_seed.json`
5. Remove the console.log
6. Verify all six sections have substantive content (each should be 3–5 sentences minimum)
7. Commit the seed file

This guarantees the Stripe demo always looks perfect without API latency variance.
