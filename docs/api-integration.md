# API Integration Guide

Complete mapping of every API endpoint the Predict Dashboard calls, including the SWR hook, TypeScript response type, and which page/component consumes the data.

## Predict API (`/api` → `localhost:18801`)

| Endpoint | Method | Response Type | SWR Hook | Refresh | Page / Component |
|---|---|---|---|---|---|
| `/api/health` | GET | `{ status: string }` | `usePredictHealth()` | 30s | PredictDashboard (PredictHealthHeader) |
| `/api/prediction` | GET | `PredictionOverview` | `usePrediction()` | 30s | PredictDashboard (MacroOverviewSection, ActivePredictionsSection, EventLibrarySection, PatternsAndChartSection, AccuracyAndValidationsSection) |
| `/api/predictions` | GET | `{ predictions: Prediction[], total: number }` | `usePredictions(status, limit)` | 30s | PredictDashboard (PredictionHistorySection), ReviewOverviewPage |
| `/api/predictions/:id` | GET | `PredictionDetail` | `usePredictionDetail(id)` | 30s | PredictionDetailPage (DetailHeaderCard, MatchedEventsSection, ReasoningChainSection, ConfidenceFactorsSection) |
| `/api/predictions/:id/reasoning-graph` | GET | `ReasoningGraph` | `useReasoningGraph(id)` | 30s | PredictionDetailPage (ReasoningGraphSection → ReasoningFlowGraph) |
| `/api/predictions/:id/explain` | GET | `PredictionExplainResponse` | `usePredictionExplain(id)` | 30s | PredictionDetailPage (ExplainPanel), ReviewPage, ReviewOverviewPage |
| `/api/predictions/:id/review` | GET | `PredictionReviewResponse` | `usePredictionReview(id)` | 30s | PredictionDetailPage (ReviewPanel), ReviewPage |
| `/api/predictions/quality-report` | GET | `QualityReport` | `useQualityReport()` | 30s | AccuracyPage (QualityReportPanel), QualityPage |
| `/api/predict-accuracy` | GET | `PredictAccuracyResponse` | `usePredictAccuracy()` | 30s | PredictDashboard, AccuracyPage (via useAccuracyDetail) |
| `/api/accuracy-history` | GET | `AccuracyHistoryResponse` | `useAccuracyHistory(window)` | 30s | AccuracyPage (AccuracyHistoryChart) |
| `/api/events` | GET | `Event[]` | `usePredictEvents(limit, pattern)` | 30s | — (available but not directly surfaced) |
| `/api/event-match` | GET | `Event[]` | — (direct api call) | — | Event matching UI (text, top_k=3, threshold=0.2) |
| `/api/event-chain-links` | GET | `EventChainLinksResponse` | `useEventChainLinks(chainNode)` | 30s | EventChainPanel |
| `/api/macro/history` | GET | `MacroSnapshot[]` | `useMacroHistory(limit)` | 30s | MacroHistoryChart |
| `/api/trends` | GET | `Trend[]` | `useTrends(limit, min_events, window_hours)` | 30s | PredictDashboard (TrendDiscoverySection) |
| `/api/industry-chain` | GET | `IndustryChain` | `useIndustryChain()` | 30s | ChainPage (ChainGraph) |
| `/api/decay/active` | GET | `DecayActiveResponse` | `useDecayActive()` | 30s | PredictDashboard (DecayDashboard), DecayPage |
| `/api/decay/models` | GET | `DecayModelsResponse` | `useDecayModels()` | 30s | PredictDashboard (DecayDashboard), DecayPage |
| `/api/health/deep` | GET | `DeepHealthResponse` | `useHealthDeep()` | 30s | PredictDashboard (DeepHealthPanel) |

## Data-Eng API (`/data-api` → `localhost:8081`)

| Endpoint | Method | Response Type | SWR Hook | Refresh | Page / Component |
|---|---|---|---|---|---|
| `/data-api/api/open-interest?symbol=&limit=` | GET | `OpenInterestPoint[]` | `useOpenInterest(symbol, limit)` | 30s | PredictDashboard (DerivativesOverviewSection → OIChart) |
| `/data-api/api/long-short-ratio?symbol=&limit=` | GET | `LongShortRatioPoint[]` | `useLongShortRatio(symbol, limit)` | 30s | PredictDashboard (DerivativesOverviewSection → LSRChart) |
| `/data-api/api/taker-volume?symbol=&limit=` | GET | `TakerVolumePoint[]` | `useTakerVolume(symbol, limit)` | 30s | PredictDashboard (DerivativesOverviewSection → TakerVolumeChart) |

## Static File Fetches (No Proxy)

| File | Loaded By | Types |
|---|---|---|
| `/backtest-full-results.json` | BacktestPage (`fetch`) | `FullResults` |
| `/backtest-ab-results.json` | BacktestPage (`fetch`) | `ABResults` |

## SWR Configuration

Global SWR config (set in `App.tsx`):

```
errorRetryCount:    3
errorRetryInterval: 5000ms
shouldRetryOnError: true
```

Hooks with `revalidateOnFocus: false` (stable data that doesn't change on tab switch):
- `usePredictionDetail(id)`
- `useReasoningGraph(id)`
- `usePredictionExplain(id)`
- `usePredictionReview(id)`
- `useEventChainLinks(chainNode)`

## TypeScript Types Reference

### Prediction Types (`src/types/predict.ts`)

| Type | Key Fields |
|---|---|
| `Prediction` | `id`, `timestamp`, `symbol`, `direction`, `confidence` (0–1), `expected_impact`, `status`, `reasoning` |
| `PredictionDetail` | extends Prediction + `trigger_event_text`, `matched_events[]`, `reasoning_chain[]`, `confidence_factors` |
| `PredictionOverview` | `macro`, `event_kb`, `predictions`, `accuracy`, `recent_validations`, `macro_history` |
| `PredictAccuracyResponse` | `accuracy: Record<string, AccuracyEntry>`, `recent_validations: Validation[]` |
| `AccuracyEntry` | `total`, `correct`, `accuracy` (already %) |
| `Validation` | `id`, `prediction_id`, `horizon`, `actual_change` (already %), `is_correct` (0/1), `confidence` (0–1) |
| `Event` | `id`, `date`, `symbol`, `price_change`, `category`, `event`, `tags`, `lesson`, `pattern_name`, `sources` |
| `Pattern` | `id`, `name`, `direction`, `avg_impact`, `base_level`, `keywords`, `boost_keywords` |
| `Macro` | `score`, `fear_greed`, `etf_flow_1d/5d`, `volume_ratio`, `funding_rate`, `reasons[]` |
| `MacroSnapshot` | `id`, `timestamp`, `fear_greed`, `etf_flow_1d/5d`, `macro_score`, `reasons[]`, `btc_price` |
| `Trend` | `pattern_name`, `event_count`, `avg_impact`, `symbols[]`, `latest_date`, `window_hours` |
| `IndustryChain` | `nodes: ChainNode[]`, `edges: ChainEdge[]` |
| `ChainNode` | `id`, `name`, `type`, `labels[]` |
| `ChainEdge` | `from_node`, `to_node`, `relation`, `strength` |
| `ReasoningGraph` | `prediction_id`, `nodes: ReasoningGraphNode[]`, `edges: ReasoningGraphEdge[]` |
| `QualityReport` | `total_predictions`, `confidence_distribution`, `category_distribution`, `overall_accuracy` |
| `AccuracyHistoryResponse` | `accuracy_history[]`, `by_direction`, `by_pattern`, `overall`, `window` |
| `DecayActiveResponse` | `net_impact_pct`, `net_strength`, `direction`, `active_count`, `details: DecayDetail[]` |
| `DecayModelsResponse` | `models[]`, `event_type_mapping` |
| `DeepHealthResponse` | `status`, `service`, `version`, `db`, `db_file`, `db_tables`, `predictions_24h`, `memory`, `uptime_seconds` |
| `PredictionExplainResponse` | `prediction_id`, `summary`, `reasoning_chain`, `factors[]` |
| `PredictionReviewResponse` | `prediction_id`, `status`, `prediction`, `validation`, `review` |
| `OpenInterestPoint` | `timestamp`, `sum_open_interest_value` |
| `LongShortRatioPoint` | `timestamp`, `long_account`, `short_account`, `long_short_ratio` |
| `TakerVolumePoint` | `timestamp`, `buy_vol`, `sell_vol`, `buy_sell_ratio` |

### Backtest Types (`src/types/backtest.ts`)

| Type | Key Fields |
|---|---|
| `BaselineResults` | `generated_at`, `prediction_backtest`, `decay_model_backtest`, `parameter_sweep`, `findings[]`, `suggestions[]` |
| `FullResults` | extends BaselineResults + `confusion_matrix`, `multi_symbol_conduction`, `before_after_comparison` |
| `ABResults` | `generated_at`, `total_events`, `strategy_descriptions`, `summary` |
| `HorizonStats` | `correct`, `total`, `accuracy_pct` |
| `HorizonStatsWithCoverage` | extends HorizonStats + `coverage_pct`, `total_events`, `predicted` |
