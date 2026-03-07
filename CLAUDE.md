# CLAUDE.md - Predict Dashboard

## Project Overview
React + Vite + Tailwind + Recharts + SWR frontend dashboard for the crypto prediction engine (amani-predict).

## Tech Stack
- React 19 + TypeScript 5.9 + Vite 7
- Tailwind CSS v4 (via @tailwindcss/vite plugin)
- Recharts 3 (charts)
- SWR 2 (data fetching + caching)
- React Router v7 (routing)
- Vitest + Testing Library (tests)

## Ports
- Dev server: **18828** (vite.config.ts)
- Predict API: **18801** (proxied via `/api` prefix in vite.config.ts)

## Development
```bash
npm run dev    # Vite dev server on :18828
npm run build  # tsc -b + vite build
npm run lint   # ESLint
npx vitest run # Run all tests (179 tests)
```

## Configuration
Single config layer: `vite.config.ts` (proxy + port).

### Proxy Mapping
| Prefix | Target | Backend |
|--------|--------|---------|
| `/api` | `localhost:18801` | amani-predict (prediction engine) |

No path rewrite — `/api/*` forwards directly to `:18801/api/*`.

## Page Structure
| Route | Page | Description |
|-------|------|-------------|
| `/` | PredictDashboard | Main dashboard (macro, predictions, events) |
| `/predictions/:id` | PredictionDetailPage | Individual prediction detail |
| `/accuracy` | AccuracyPage | Prediction accuracy tracking |
| `/chain` | ChainPage | Industry chain visualization |
| `/backtest` | BacktestPage | Backtest results & analysis |

## File Structure
```
src/
├── api/          # API client (predict.ts)
├── components/   # Shared components (predict/ subdirectory)
├── hooks/        # SWR hooks (usePredictApi.ts)
├── pages/        # Page components
├── types/        # TypeScript type definitions
├── utils/        # Utility functions
├── __tests__/    # Test files (mirrors src/ structure)
├── App.tsx       # Router + navigation layout
├── index.css     # Global styles (Tailwind entry)
└── main.tsx      # Entry point
```

## Theme
Dark theme: `bg-gray-950` (page background), `bg-gray-900` (cards), `border-gray-800`.

## Percentage Field Formatting
- `confidence` / `strength` → 0-1 decimal, frontend ×100
- `price_change` / `avg_impact` / `expected_impact` → already percentage, **never ×100**
- `funding_rate` → tiny decimal, frontend ×100

## Testing
- Framework: Vitest + @testing-library/react
- SWR hook mocks must include all required `SWRResponse` properties: `data`, `error`, `isLoading`, `mutate`, `isValidating`
- Run `npx vitest run` — all tests must pass
- Run `npx tsc --noEmit` before committing — must have 0 errors

## Commit Conventions
- Prefixes: feat / fix / docs / config / chore / refactor / test
- `git add` with specific file names, never `git add -A`
- Pre-commit: run `npx tsc --noEmit` to ensure no TS errors
- Docker build uses `tsc -b` (stricter), ensure both pass with 0 errors

## Prohibited
- Do not change ports in vite.config.ts (dev: 18828, API proxy: 18801)
- Do not introduce new CSS frameworks (already using Tailwind)
- Do not use `sudo npm`
- Do not run multiple CC sessions on this repo simultaneously
