# Predict Dashboard

Real-time monitoring dashboard for the Amani prediction system. Displays macro analysis, event-driven predictions, accuracy tracking, industry chain visualization, decay analysis, and backtest results.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript 5.9 |
| Build | Vite 7 |
| Styling | Tailwind CSS v4 |
| Charts | Recharts 3 |
| Flow Graphs | @xyflow/react 12 |
| Data Fetching | SWR 2 (30s auto-refresh) |
| Routing | React Router v7 (lazy-loaded) |
| Unit Tests | Vitest 4 + Testing Library |
| E2E Tests | Playwright (Chromium) |

## Architecture

```
src/
├── api/predict.ts             # API client — all fetch calls
├── hooks/
│   ├── usePredictApi.ts       # 20+ SWR hooks for every endpoint
│   └── useSymbols.tsx         # SymbolsProvider context
├── pages/                     # Route-level components (lazy-loaded)
│   ├── PredictDashboard.tsx   # Main dashboard
│   ├── PredictionDetailPage.tsx
│   ├── AccuracyPage.tsx
│   ├── ChainPage.tsx
│   ├── BacktestPage.tsx
│   ├── QualityPage.tsx
│   ├── DecayPage.tsx
│   ├── ReviewOverviewPage.tsx
│   └── ReviewPage.tsx
├── components/
│   ├── SectionErrorBoundary.tsx  # Per-section error isolation
│   ├── EmptyState.tsx            # "No data" placeholder
│   ├── PageSkeleton.tsx          # Loading skeleton
│   ├── layout/NavBar.tsx         # Responsive navigation
│   ├── predict/                  # Prediction components
│   │   ├── dashboard/            # Main dashboard sections
│   │   ├── detail/               # Prediction detail sections
│   │   ├── DecayDashboard.tsx    # Decay analysis
│   │   ├── DeepHealthPanel.tsx   # Deep health diagnostics
│   │   ├── ChainGraph.tsx        # Industry chain visualization
│   │   └── ...                   # 25+ components
│   ├── accuracy/                 # Accuracy analysis components
│   ├── backtest/                 # Backtest visualization components
│   └── chain/                    # Chain graph components
├── types/
│   ├── predict.ts             # 30+ prediction domain types
│   └── backtest.ts            # Backtest result types
├── utils/
│   ├── format.ts              # UTC+8 time formatting, price formatting
│   ├── errorTracker.ts        # Global window error tracker
│   └── performanceMonitor.ts  # API response time monitor
├── __tests__/                 # Unit tests (mirrors src/)
├── App.tsx                    # Root: SWRConfig + Routes
└── main.tsx                   # Entry point
e2e/                           # Playwright E2E tests
```

## Pages & Routes

| Path | Page | Description |
|---|---|---|
| `/` | PredictDashboard | Main overview — macro snapshot, active predictions, event library, history, trends, derivatives, decay, deep health |
| `/predictions/:id` | PredictionDetailPage | Detail view — matched events, reasoning chain, confidence factors, reasoning graph, AI explanation, postmortem review |
| `/accuracy` | AccuracyPage | Full accuracy analysis — horizon comparison, trend charts, symbol breakdown, confidence scatter, direction radar, rolling accuracy, quality report |
| `/chain` | ChainPage | Industry chain graph visualization (interactive flow graph) |
| `/backtest` | BacktestPage | Backtest results from static JSON — confusion matrix, symbol heatmap, cycle comparison, A/B testing |
| `/quality` | QualityPage | Prediction quality report — confidence distribution, category breakdown |
| `/decay` | DecayPage | Event decay analysis — active decay effects, decay models |
| `/review` | ReviewOverviewPage | Review overview — validated predictions list, reasoning chain, performance attribution |
| `/review/:id` | ReviewPage | Deep-dive prediction postmortem (explain + review APIs) |

NavBar links: `/`, `/accuracy`, `/quality`, `/decay`, `/chain`, `/backtest`, `/review`. Detail pages (`/predictions/:id`, `/review/:id`) are navigated to from table rows.

## API Endpoints

The dashboard proxies requests to two backend services:

### Predict API (`/api` → `localhost:18801`)

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Service health status |
| `/api/prediction` | GET | Macro + event KB + active predictions overview |
| `/api/predictions` | GET | Prediction list with status/limit/offset filtering |
| `/api/predictions/:id` | GET | Single prediction detail with matched events and reasoning |
| `/api/predictions/:id/reasoning-graph` | GET | Reasoning DAG (nodes + edges for flow graph) |
| `/api/predictions/:id/explain` | GET | AI-generated explanation of prediction reasoning |
| `/api/predictions/:id/review` | GET | Postmortem review with validation results |
| `/api/predictions/quality-report` | GET | Confidence distribution and category breakdown |
| `/api/predict-accuracy` | GET | Accuracy by horizon with recent validations |
| `/api/accuracy-history` | GET | Historical accuracy trend (configurable window) |
| `/api/events` | GET | Event list with limit/pattern filtering |
| `/api/event-match` | GET | Semantic event matching (text, top_k, threshold) |
| `/api/event-chain-links` | GET | Chain node linked events |
| `/api/macro/history` | GET | Historical macro snapshots |
| `/api/trends` | GET | Pattern trends (limit, min_events, window_hours) |
| `/api/industry-chain` | GET | Industry chain graph (nodes + edges) |
| `/api/decay/active` | GET | Active decay effects |
| `/api/decay/models` | GET | Decay model definitions |
| `/api/health/deep` | GET | Deep health — DB tables, memory, predictions count |

### Data-Eng API (`/data-api` → `localhost:8081`)

| Endpoint | Method | Description |
|---|---|---|
| `/data-api/api/open-interest` | GET | Open interest history (symbol, limit params) |
| `/data-api/api/long-short-ratio` | GET | Long/short ratio history (symbol, limit params) |
| `/data-api/api/taker-volume` | GET | Taker buy/sell volume history (symbol, limit params) |

### Static Files

| File | Used In |
|---|---|
| `/backtest-full-results.json` | BacktestPage |
| `/backtest-ab-results.json` | BacktestPage |

## Development

```bash
# Install dependencies
npm install

# Start dev server (port 18828)
npm run dev

# Build for production
npm run build
```

### Vite Proxy Config

| Path Prefix | Target | Rewrite |
|---|---|---|
| `/api` | `http://localhost:18801` | None |

Note: `/data-api` proxy for derivatives endpoints may need separate configuration in development or is handled externally in production nginx.

## Testing

```bash
# Unit tests
npx vitest run

# Unit tests with coverage
npx vitest run --coverage

# E2E tests (requires dev server running)
npx playwright test

# E2E tests with UI
npx playwright test --ui
```

E2E specs: `dashboard`, `accuracy`, `backtest`, `chain`, `decay`, `quality`, `navigation`, `responsive`.

## Docker

```bash
# Build and run
docker compose build && docker compose up -d
```

- Two-stage build: `node:20-alpine` → `nginx:alpine`
- Serves on port **18828**
- Nginx proxies `/api/` → `host.docker.internal:18801`
- SPA fallback via `try_files $uri /index.html`
- Health check: `wget -qO- http://127.0.0.1:18828/`

## Key Components

### SectionErrorBoundary
Per-section error isolation wrapping every dashboard section. A failed section shows an inline error card with retry — other sections continue working.

### usePredictApi Hooks
20+ SWR-based data hooks with 30-second auto-refresh. Detail/graph/review hooks disable `revalidateOnFocus` to avoid unnecessary refetches. See [docs/api-integration.md](docs/api-integration.md) for the complete hook-to-endpoint mapping.

### ReasoningFlowGraph / ChainGraph
Interactive DAG visualizations built with @xyflow/react. The reasoning graph shows how a prediction flows from trigger event through pattern matching to the final decision. The chain graph shows industry relationships.

### Field Format Conventions
- `confidence`, `strength`: decimal 0–1, multiply by 100 for display
- `price_change`, `avg_impact`, `expected_impact`: already percentage, display as-is
- `AccuracyEntry.accuracy`: already percentage, never multiply
- All timestamps displayed in **UTC+8** (Asia/Shanghai)

## Development Guidelines

See [CLAUDE.md](./CLAUDE.md) for detailed conventions on commit format, percentage field handling, and architecture decisions.
