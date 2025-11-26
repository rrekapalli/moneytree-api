# Kite Market Data Load Test Scenario

## Objective

Validate that Kite-backed market data endpoints can sustain at least 1,000 requests per second per node with:

- p95 latency < 150ms
- p99 latency < 300ms

## Scope

Endpoints under test:

- `GET /api/marketdata/kite/{instrumentToken}/history`
- `GET /api/marketdata/kite/quotes?symbols=...`

## Test Design

- **Traffic pattern**: steady load ramping up to 1,000 req/s per node, with mixed history and quote calls.
- **Duration**: 10–15 minutes at peak load to capture steady-state metrics.
- **Data set**:
  - 10–20 active instruments.
  - Realistic time ranges for history calls.

## Metrics to Capture

- Request rate and latency distribution (p50, p95, p99).
- Error rate (HTTP 5xx, timeouts).
- Backend CPU and memory utilization.


