# MoneyTree Backend (Kite Modulith)

This module is a Java 21 Spring Boot application that exposes the MoneyTree API as a modulith. It uses:

- TimescaleDB (PostgreSQL) at `postres.tailce422e.ts.net:5432/MoneyTree`
- Zerodha Kite API for market data

## Environment configuration

The backend relies on the following environment variables (or equivalent configuration) at runtime:

- `DB_USERNAME` – database username for TimescaleDB
- `DB_PASSWORD` – database password for TimescaleDB
- `KITE_API_KEY` – Zerodha Kite API key
- `KITE_API_SECRET` – Zerodha Kite API secret
- `KITE_ACCESS_TOKEN` – Zerodha Kite access token for REST calls
- `KITE_BASE_URL` – base URL for Kite API (default `https://api.kite.trade`)

These are wired through `application.yaml`, `KiteConfig`, and `EnvironmentConfig`.

## Database schema

The application expects `kite_*` tables (for example `kite_candles`) to be present in the `MoneyTree` database.

`backend/src/main/resources/db/V1__kite_schema_placeholder.sql` documents this expectation. Actual DDL for these tables should be managed by the central database/migrations project for MoneyTree.


