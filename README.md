# Predict Dashboard

React + Vite + Tailwind frontend dashboard for the **amani-predict** crypto prediction engine.

## Tech Stack

| Category | Library | Version |
|----------|---------|---------|
| Framework | React | 19 |
| Language | TypeScript | 5.9 |
| Build tool | Vite | 7 |
| Styling | Tailwind CSS | v4 (via `@tailwindcss/vite`) |
| Charts | Recharts | 3 |
| Data fetching | SWR | 2 |
| Routing | React Router | v7 |
| Flow diagrams | @xyflow/react | 12 |
| Unit tests | Vitest + Testing Library | 4 / 16 |
| E2E tests | Playwright | 1.58 |

## Quick Start

```bash
npm install
npm run dev    # http://localhost:18828
```

The dev server proxies `/api/*` requests to `localhost:18801` (amani-predict backend).

## Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | PredictDashboard | Main dashboard -- macro indicators, predictions, events, derivatives, trends |
| `/predictions/:id` | PredictionDetailPage | Individual prediction detail with reasoning graph and review |
| `/accuracy` | AccuracyPage | Prediction accuracy tracking, history charts, confidence scatter |
| `/chain` | ChainPage | Industry chain visualization (xyflow graph) |
| `/backtest` | BacktestPage | Backtest results, confusion matrix, regime analysis, multi-symbol heatmap |
| `/quality` | QualityPage | Prediction quality report |
| `/decay` | DecayPage | Confidence decay monitoring -- active decays and model overview |
| `/review` | ReviewOverviewPage | Review overview listing |
| `/review/:id` | ReviewPage | Single prediction review |

All pages are **lazy-loaded** via `React.lazy()` with a shared `<Suspense>` fallback.

## API Endpoints

### Predict service (`:18801`, proxied via `/api`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Basic health check |
| `/api/health/deep` | GET | Deep health check (subsystem status) |
| `/api/prediction` | GET | Current prediction overview |
| `/api/predictions` | GET | List predictions (`?status=`, `?limit=`, `?offset=`) |
| `/api/predictions/{id}` | GET | Single prediction detail |
| `/api/predictions/{id}/explain` | GET | AI-generated explanation for a prediction |
| `/api/predictions/{id}/review` | GET | Human/AI review for a prediction |
| `/api/predictions/{id}/reasoning-graph` | GET | Reasoning graph (nodes + edges) |
| `/api/predictions/quality-report` | GET | Quality metrics report |
| `/api/predict-accuracy` | GET | Overall accuracy stats |
| `/api/accuracy-history` | GET | Rolling accuracy over time (`?window=`) |
| `/api/events` | GET | Event feed (`?limit=`, `?pattern=`) |
| `/api/trends` | GET | Trend aggregation (`?limit=`, `?min_events=`, `?window_hours=`) |
| `/api/industry-chain` | GET | Industry chain graph data |
| `/api/event-chain-links` | GET | Chain links for event (`?event_id=` or `?chain_node=`) |
| `/api/event-match` | GET | Semantic event search (`?text=`, `?top_k=`, `?threshold=`) |
| `/api/macro/history` | GET | Macro indicator history (`?limit=`) |
| `/api/decay/active` | GET | Active confidence decay entries |
| `/api/decay/models` | GET | Decay model definitions |

### Data-eng service (`:8081`, proxied via `/data-api`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/data-api/api/open-interest` | GET | Open interest data (`?symbol=`, `?limit=`) |
| `/data-api/api/long-short-ratio` | GET | Long/short ratio (`?symbol=`, `?limit=`) |
| `/data-api/api/taker-volume` | GET | Taker buy/sell volume (`?symbol=`, `?limit=`) |

## Project Structure

```
src/
├── api/
│   └── predict.ts              # API client (typed fetch wrappers)
├── components/
│   ├── layout/                  # NavBar
│   ├── predict/
│   │   ├── dashboard/           # Dashboard sub-components (MacroCard, EventTable, charts)
│   │   └── detail/              # Detail page sub-components (ReasoningFlowGraph, etc.)
│   ├── accuracy/                # AccuracyPage sub-components (charts, filters, breakdowns)
│   ├── backtest/                # BacktestPage sub-components (confusion matrix, heatmap, etc.)
│   └── chain/                   # ChainPage sub-components (legend, search, node detail)
│   ├── EmptyState.tsx           # Shared empty-state placeholder
│   ├── PageSkeleton.tsx         # Shared loading skeleton
│   └── SectionErrorBoundary.tsx # Error boundary for page sections
├── hooks/
│   ├── usePredictApi.ts         # SWR hooks for all API endpoints (30s auto-refresh)
│   └── useSymbols.tsx           # Symbol selector hook
├── pages/                       # Top-level route components (9 pages)
├── types/
│   ├── predict.ts               # Prediction/event/macro type definitions
│   └── backtest.ts              # Backtest-specific types
├── utils/
│   ├── format.ts                # Number/date formatting helpers
│   ├── errorTracker.ts          # Error tracking utility
│   └── performanceMonitor.ts    # Performance monitoring utility
└── __tests__/                   # Unit tests (~90 test files)
```

## Data Fetching

All data fetching uses **SWR** hooks in `src/hooks/usePredictApi.ts`:

- **Auto-refresh**: Most hooks poll every 30 seconds (`refreshInterval: 30_000`).
- **Error handling**: Global SWR config retries up to 3 times with 5-second intervals.
- **Conditional fetching**: Detail hooks (e.g., `usePredictionDetail(id)`) only fetch when `id` is non-null.

## Scripts

```bash
npm run dev            # Dev server on :18828
npm run build          # tsc -b && vite build
npm run preview        # Preview production build on :18828
npm run lint           # ESLint (flat config)
npm run test           # Vitest (unit tests)
npm run test:watch     # Vitest in watch mode
npm run test:coverage  # Vitest with v8 coverage
npm run test:e2e       # Playwright end-to-end tests
npm run test:e2e:ui    # Playwright with UI mode
```

## Docker

Multi-stage build: Node 20 (build) + nginx (serve).

```bash
docker compose up --build   # Builds and runs on :18828
```

The nginx config (`nginx.conf`) proxies `/api/*` to `host.docker.internal:18801` and serves the SPA with `try_files` fallback to `index.html`.

## Build Optimization

Vite is configured with manual chunk splitting for optimal caching:

| Chunk | Contents |
|-------|----------|
| `vendor-react` | react, react-dom, react-router-dom |
| `vendor-recharts` | recharts |
| `vendor-swr` | swr |
| `vendor-xyflow` | @xyflow/react |

## Environment Requirements

- **Node.js**: 20+ (Dockerfile uses `node:20-alpine`)
- **Backend**: amani-predict running on `:18801`
- **Data-eng** (optional): data-eng API on `:8081` for derivatives data
