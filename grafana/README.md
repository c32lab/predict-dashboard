# Grafana Predict API Monitoring Dashboard (Placeholder)

## Import

1. Open Grafana at `http://localhost:3000`
2. Go to **Dashboards** → **New** → **Import**
3. Click **Upload dashboard JSON file** and select `api-monitoring.json`
4. Select your Prometheus datasource (must have uid `prometheus` or update the JSON)
5. Click **Import**

## Status

This dashboard contains **placeholder panels**. The Predict API (`localhost:18801`) does not yet expose a `/metrics` endpoint.

Once `/metrics` is implemented, update the placeholder metric names:
- `predict_requests_total` → actual request counter
- `predict_request_duration_seconds_bucket` → actual latency histogram
- `predict_errors_total` → actual error counter

## Panels

| Row | Panel | Metric | Status |
|-----|-------|--------|--------|
| Predict API Health | API Status | `up{job="predict"}` | Active |
| Predict API Health | Process Uptime | `process_uptime_seconds{job="predict"}` | Active |
| Predict Metrics | Prediction Requests | `predict_requests_total` | Placeholder |
| Predict Metrics | Prediction Latency | `predict_request_duration_seconds_bucket` | Placeholder |
| Predict Metrics | Prediction Errors | `predict_errors_total` | Placeholder |

## Dashboard Settings

- Auto-refresh: 30s
- Default time range: 6h
