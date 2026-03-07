export interface HorizonStats {
  correct: number
  total: number
  accuracy_pct: number
}

export interface HorizonStatsWithCoverage extends HorizonStats {
  coverage_pct: number
  total_events?: number
  predicted?: number
}

export interface HorizonStatsWithSkip extends HorizonStats {
  neutral_skipped?: number
}

export interface BaselineResults {
  generated_at: string
  prediction_backtest: {
    total_predictions: number
    total_validations: number
    overall_accuracy_pct: number
    overall_correct: number
    overall_total: number
    by_horizon: Record<string, HorizonStats>
    by_trigger_pattern: Record<string, HorizonStats>
    by_direction: Record<string, HorizonStats>
    by_confidence_bucket: Record<string, HorizonStats>
    by_day: Record<string, HorizonStats>
  }
  decay_model_backtest: {
    total_events: number
    matched_events: number
    skipped_no_model: number
    skipped_no_price: number
    decay_models_used: string[]
    overall_accuracy: Record<string, HorizonStats & {
      mae: number
      confusion_matrix: {
        TP: number; FP: number; TN: number; FN: number
        NEUTRAL_pred: number; NEUTRAL_actual: number
        total: number; accuracy_pct: number
        precision_pct: number; recall_pct: number; f1: number
      }
    }>
    by_model: Record<string, { count: number; horizons: Record<string, HorizonStats> }>
    by_year: Record<string, { count: number; horizons: Record<string, HorizonStats> }>
    by_regime: Record<string, { count: number; horizons: Record<string, HorizonStats> }>
    by_severity: Record<string, { count: number; horizons: Record<string, HorizonStats> }>
  }
  parameter_sweep: {
    sweep_grid: string
    confidence_thresholds: number[]
    direction_thresholds_pct: number[]
    results: Array<{
      confidence_threshold: number
      direction_threshold_pct: number
      horizons: Record<string, HorizonStatsWithCoverage>
      avg_accuracy_pct: number
      avg_coverage_pct: number
      composite_score: number
    }>
    best_params: {
      confidence_threshold: number
      direction_threshold_pct: number
      horizons: Record<string, HorizonStatsWithCoverage>
      avg_accuracy_pct: number
      avg_coverage_pct: number
      composite_score: number
    }
  }
  findings: string[]
  suggestions: string[]
}

export interface AccuracyBucket {
  correct: number
  total: number
  accuracy_pct: number
}

export interface FullResults extends BaselineResults {
  prediction_backtest: BaselineResults['prediction_backtest'] & {
    by_confidence_bucket: Record<string, AccuracyBucket>
    by_day: Record<string, AccuracyBucket>
    by_week?: Record<string, AccuracyBucket>
    by_regime: Record<string, AccuracyBucket>
    confusion_matrix: {
      TP: number; FP: number; TN: number; FN: number
      NEUTRAL_pred: number; NEUTRAL_actual: number
      total: number; accuracy_pct: number; precision_pct: number; recall_pct: number; f1: number
    }
  }
  multi_symbol_conduction: {
    by_symbol: Record<string, {
      horizons: Record<string, AccuracyBucket>
      overall_accuracy_pct: number
      overall_correct: number
      overall_total: number
    }>
  }
  before_after_comparison: {
    before: {
      overall_accuracy_pct: number; overall_correct: number; overall_total: number
      total_predictions: number
      by_horizon: Record<string, AccuracyBucket>
      by_direction: Record<string, AccuracyBucket>
      by_pattern: Record<string, AccuracyBucket>
    }
    after: {
      overall_accuracy_pct: number; overall_correct: number; overall_total: number
      total_predictions: number
      by_horizon: Record<string, AccuracyBucket>
      by_direction: Record<string, AccuracyBucket>
      by_pattern: Record<string, AccuracyBucket>
    }
    delta: { accuracy_change_pp: number; predictions_removed: number; validations_removed: number }
  }
}

export interface ABResults {
  generated_at: string
  total_events: number
  skipped_no_model: number
  skipped_no_price: number
  strategy_descriptions: Record<string, string>
  summary: Record<string, {
    horizons: Record<string, HorizonStatsWithSkip>
    patterns?: Record<string, Record<string, HorizonStats>>
  }>
}
