# Quickstart: Kite-based modulith trading API

## Purpose

This quickstart explains how to work with the Kite-backed market data module in the MoneyTree Java modulith, focusing on running the application locally and exercising the new Kite endpoints.

## Prerequisites

- Java 21 installed.
- Access to the MoneyTree repository with the `001-kite-modulith-api` branch checked out.
- Valid Zerodha Kite API credentials (API key, secret, access token) for a non-production environment.
- Network access to the TimescaleDB instance used by MoneyTree.

## Configuration

1. Create a `.env` or environment-based configuration for local development, including:
   - `KITE_API_KEY`
   - `KITE_API_SECRET`
   - `KITE_ACCESS_TOKEN` (or mechanism to obtain one)
   - `KITE_BASE_URL`
   - Database connection settings for TimescaleDB (host, port, database, user, password).

2. Ensure the backend application is configured to read these environment variables and map them into the Kite connectivity and data modules.

## Running the Backend

1. Build the backend modulith using the existing build tooling (e.g., Maven or Gradle as already defined in the MoneyPlant backend).
2. Start the backend application on your local machine or development environment.
3. Verify that database migrations for `kite_*` tables are applied and that the modulith starts without errors.

## Calling Kite-backed Endpoints

Once the application is running:

- Fetch instruments:
  - `GET /api/marketdata/kite/instruments?exchange=NSE`
- Fetch historical candles:
  - `GET /api/marketdata/kite/{symbol}/history?interval=1m&from=...&to=...`
- Fetch quotes:
  - `GET /api/marketdata/kite/quotes?symbols=INFY,NIFTY50`

Use these calls to confirm:

- Responses are backed by `kite_*` tables.
- Response structures align with the former NSE-based endpoints where expected.
- Latency is within the defined performance targets under normal dev/test loads.

## Migrating from NSE endpoints

If you currently use NSE-based endpoints, the recommended migration is:

- Replace calls to `/api/marketdata/nse/{symbol}/history` with `/api/marketdata/kite/{instrumentToken}/history`.
- Replace calls to `/api/marketdata/nse/quotes` with `/api/marketdata/kite/quotes`.

The request/response shapes are intended to remain as close as possible to the existing NSE contracts, with any unavoidable differences documented in the API contract file and handled in response DTOs.

## End-to-end validation checklist

After wiring configuration and starting the backend:

- Call `GET /api/marketdata/kite/{instrumentToken}/history` with a valid date range and confirm 200 OK and a JSON array body.
- Call the same endpoint with `from > to` and confirm a 400 response with a JSON `{"error": ...}` payload.
- Call `GET /api/marketdata/kite/quotes?symbols=INFY,NIFTY50` and confirm 200 OK and a JSON array body.
- Exercise `/api/portfolio`, `/api/screeners`, `/api/backtests`, and `/api/signals` and confirm they respond successfully (and, once wired, match legacy MoneyPlant behavior).

Record any deviations from expected contracts and performance SLOs in the load-test and parity test artifacts.



