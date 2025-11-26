# MoneyTree Backend (Kite Modulith)

This module is a Java 21 Spring Boot application that exposes the MoneyTree API as a modulith. It uses:

- TimescaleDB (PostgreSQL) at `postres.tailce422e.ts.net:5432/MoneyTree`
- Zerodha Kite API for market data

## Environment configuration

For local development, create a `.env` file in the `backend/` directory (note that `.env` is already git-ignored at repo root) with entries like:

- `DB_USERNAME=moneytree`
- `DB_PASSWORD=changeme`
- `KITE_API_KEY=your_kite_api_key`
- `KITE_API_SECRET=your_kite_api_secret`
- `KITE_ACCESS_TOKEN=your_kite_access_token`
- `KITE_BASE_URL=https://api.kite.trade`

These values are wired through `application.yaml`, `KiteConfig`, and `EnvironmentConfig` via the corresponding environment variables. In production or CI, you can set the same keys directly in the process environment instead of using `.env`.

## Database schema

The application expects `kite_*` tables (for example `kite_candles`) to be present in the `MoneyTree` database.

`backend/src/main/resources/db/V1__kite_schema_placeholder.sql` documents this expectation. Actual DDL for these tables should be managed by the central database/migrations project for MoneyTree.


