# Predict Dashboard

React + Vite + Tailwind frontend dashboard for the **amani-predict** crypto prediction engine.

## Tech Stack

- React 19 + TypeScript 5.9 + Vite 7
- Tailwind CSS v4
- Recharts 3 (charts)
- SWR 2 (data fetching)
- React Router v7

## Quick Start

```bash
npm install
npm run dev    # http://localhost:18828
```

API proxy: requests to `/api/*` forward to `localhost:18801` (amani-predict).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Main dashboard — macro indicators, predictions, events |
| `/predictions/:id` | Individual prediction detail |
| `/accuracy` | Prediction accuracy tracking |
| `/chain` | Industry chain visualization |
| `/backtest` | Backtest results & analysis |

## Component Structure

```
src/
├── api/                   # API client
├── components/
│   ├── accuracy/          # AccuracyPage sub-components
│   ├── backtest/          # BacktestPage sub-components
│   └── predict/
│       ├── dashboard/     # PredictDashboard sub-components
│       └── detail/        # PredictionDetailPage sub-components
├── hooks/                 # SWR data-fetching hooks
├── pages/                 # Top-level page components
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── __tests__/             # Test files (415 tests / 50 files)
```

## Scripts

```bash
npm run dev    # Dev server on :18828
npm run build  # tsc -b + vite build
npm run lint   # ESLint
npx vitest run # Run all tests (415 tests / 50 files)
```
