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


