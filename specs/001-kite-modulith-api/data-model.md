# Data Model: Kite-based modulith trading API

## Overview

This document captures the logical data model for the Kite-backed market data functionality in the MoneyTree modulith. It focuses on conceptual entities, fields, and relationships rather than concrete schema DDL, while aligning with existing `kite_*` tables in TimescaleDB.

## Entities

### Instrument

- **Description**: A tradable instrument available via the Zerodha Kite API (e.g., equity, index, derivative).
- **Key Fields** (conceptual):
  - `id`: Internal identifier (UUID or numeric) used within the modulith.
  - `kiteInstrumentToken`: Identifier used by Kite for data queries.
  - `symbol`: Human-readable symbol (e.g., `INFY`, `NIFTY50`).
  - `exchange`: Exchange code (e.g., `NSE`, `BSE`).
  - `instrumentType`: Type/category (equity, index, futures, options, etc.).
  - `tickSize`: Minimum price increment.
  - `lotSize`: Minimum tradable quantity (if applicable).
  - `isActive`: Flag indicating whether the instrument is currently tradable/queriable.
- **Relationships**:
  - Referenced by `PriceData` and `Quote` via `instrumentId` or `kiteInstrumentToken`.

### PriceData / Candle

- **Description**: Time-series price data for a specific instrument and interval, derived from `kite_*` tables.
- **Key Fields**:
  - `id`: Internal identifier if required (or composite key).
  - `instrumentId`: Reference to `Instrument`.
  - `timestamp`: Start time of the candle.
  - `interval`: Granularity (e.g., 1m, 5m, 1d).
  - `open`: Opening price.
  - `high`: Highest price.
  - `low`: Lowest price.
  - `close`: Closing price.
  - `volume`: Traded volume for the interval.
- **Relationships**:
  - Many `PriceData` records per `Instrument`.
  - Stored in time-series partitions in TimescaleDB `kite_*` tables.

### Quote

- **Description**: Latest or near-real-time snapshot for one or more instruments, as exposed to clients.
- **Key Fields**:
  - `instrumentId`: Reference to `Instrument`.
  - `lastTradedPrice`: Last traded price.
  - `lastTradedQuantity`: Last traded quantity.
  - `bidPrice`: Current best bid price (if available).
  - `bidQuantity`: Quantity at best bid.
  - `askPrice`: Current best ask price (if available).
  - `askQuantity`: Quantity at best ask.
  - `timestamp`: Time when the quote snapshot was taken.
- **Relationships**:
  - Transient entity aggregated from Kite and/or cached market data, optionally persisted for audit or analytics.

### Configuration / ProviderSettings

- **Description**: Encapsulates environment-specific configuration for the Kite connectivity module.
- **Key Fields**:
  - `kiteApiKey`: Credential for Kite API (from environment/secrets).
  - `kiteApiSecret`: Secret for Kite API (from environment/secrets).
  - `kiteAccessToken`: Short-lived token used for calls (managed by connectivity module).
  - `baseUrl`: Kite API base URL (e.g., live vs. sandbox).
  - `rateLimitConfig`: Structured limits (requests per second/minute) for safe usage.
  - `retryPolicy`: Backoff and retry configuration for transient failures.
- **Relationships**:
  - Used by the Kite connectivity module; not directly exposed to external clients.

## DTOs and API Contracts (Logical)

### Instrument DTO

- Fields:
  - `symbol`
  - `exchange`
  - `instrumentType`
  - Additional metadata needed by clients for discovery.

### PriceData / Candle DTO

- Fields:
  - `symbol`
  - `exchange`
  - `interval`
  - `timestamp`
  - `open`
  - `high`
  - `low`
  - `close`
  - `volume`

### Quote DTO

- Fields:
  - `symbol`
  - `exchange`
  - `lastTradedPrice`
  - `lastTradedQuantity`
  - `bidPrice`
  - `bidQuantity`
  - `askPrice`
  - `askQuantity`
  - `timestamp`

## Mapping from Legacy NSE Entities

- Existing NSE-based entities/DTOs for stock data should be reused where field semantics align, with the backing data source switched from `nse_*` to `kite_*`.
- Any fields that cannot be populated from Kite data should be:
  - Clearly documented in API contracts.
  - Marked as deprecated or optional where appropriate.


