# Kite Market Data Peak Window Load Test

## Objective

Capture latency and error-rate metrics for peak trading windows (e.g., market open) under short-term bursts up to 2,000 req/s per node.

## Test Design

- **Traffic pattern**: burst traffic up to 2,000 req/s per node for 1–2 minutes.
- **Endpoints**:
  - `GET /api/marketdata/kite/{instrumentToken}/history`
  - `GET /api/marketdata/kite/quotes?symbols=...`

## Metrics to Record

- p95 and p99 latency during the burst.
- Error rate (5xx and Kite-related errors) with a target < 1% (excluding 4xx).
- Any signs of resource saturation (CPU, memory, DB connections).

## Notes

This file is intended to store test runs and observations from real load tests executed in staging or production-like environments.


