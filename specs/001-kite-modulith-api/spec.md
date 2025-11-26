# Feature Specification: Kite-based modulith trading API

**Feature Branch**: `001-kite-modulith-api`  
**Created**: [DATE]  
**Status**: Draft  
**Input**: User description: "prepare an API application based on an existing java app from \"/home/raja/code/MoneyPlant/backend\". This should be a modulith application. Use kite_* tables for stock data end points (and their related entities, dtos etc) instead of nse_* table from the database. Rest all can be taken as it is. all nse end points, should have kite based end points (instead of nse* endpoints). Make sure this solution is performant as its going to be a high frequency trading applciation. No need of security as of now  Kite credentials and any other credentails can be saved in .env file"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Retrieve live stock data via Kite-backed endpoints (Priority: P1)

A trading client application developer wants to retrieve live and historical stock data through the new API so that their high-frequency trading strategies can operate using the `kite_*` data instead of the legacy `nse_*` data, without changing the overall functional behavior of the existing endpoints.

**Why this priority**: This is the core value of the feature and is required before any client can migrate away from the legacy NSE-backed APIs.

**Independent Test**: Can be fully tested by calling the new Kite-backed stock data endpoints and verifying that all required data fields, ranges, and response patterns are available and correctly mapped from `kite_*` tables.

**Acceptance Scenarios**:

1. **Given** the client provides a valid instrument identifier and time range, **When** they call the Kite-backed price history endpoint, **Then** the API returns a complete, correctly ordered time series based on `kite_*` tables with no reference to `nse_*` data.
2. **Given** the client requests current quotes for a list of instruments, **When** they call the Kite-backed quotes endpoint, **Then** the API returns a response within an acceptable latency bound for high-frequency trading, with fields equivalent to the legacy NSE endpoint.

---

### User Story 2 - Migrate from NSE endpoints to Kite-based equivalents (Priority: P2)

A trading client application developer wants to migrate from existing `nse_*` endpoints to Kite-based equivalents with minimal code changes so that they can benefit from improved data quality and provider alignment without a risky rewrite.

**Why this priority**: Smooth migration reduces downtime and friction for existing consumers of the MoneyPlant backend.

**Independent Test**: Can be fully tested by switching a client configuration from NSE to Kite endpoints and validating that all required workflows (e.g., data retrieval, strategy backtests) still function as expected with consistent response structures.

**Acceptance Scenarios**:

1. **Given** a client currently calling an `nse_*` stock data endpoint, **When** they switch to the corresponding Kite-backed endpoint, **Then** their integration continues to function with the same request and response contract (field names, structures, and error codes) except for documented differences.
2. **Given** a client uses multiple NSE endpoints for different asset types, **When** they migrate to the Kite-backed endpoints, **Then** all required replacements exist and are discoverable in the API documentation.

---

### User Story 3 - Operate as a high-performance modulith API (Priority: P3)

An operations engineer responsible for the trading platform wants the new API to behave as a well-structured modulith so that stock data, trading orchestration, and supporting modules are clearly separated but still deployed as a single application, enabling high performance and maintainability.

**Why this priority**: A clear internal module boundary structure reduces coupling, supports future scaling, and helps ensure the API can sustain high request rates typical of high-frequency trading.

**Independent Test**: Can be fully tested by reviewing module boundaries and exercising module-specific endpoints under load to confirm that responsibilities are clearly separated and performance remains within defined thresholds.

**Acceptance Scenarios**:

1. **Given** the API is under sustained high request load to the Kite stock data module, **When** performance is measured, **Then** the response times and error rates stay within agreed thresholds without impacting unrelated modules.
2. **Given** a developer needs to reason about stock data functionality, **When** they examine the logical module structure, **Then** all Kite-related entities, DTOs, and endpoints are grouped into a clearly defined module with minimal cross-module leakage.

### User Story 4 - Preserve CRUD APIs for non-NSE domain entities (Priority: P2)

An application developer building on the MoneyTree API wants to continue using CRUD endpoints for non-`nse_*` domain entities such as `portfolio*`, `screeners*`, `backtest`, and `signals` so that existing tools and workflows built on top of these features keep working unchanged while the stock data layer moves to Kite.

**Why this priority**: These domain entities represent core user workflows beyond raw market data; keeping their APIs stable avoids breaking changes for downstream consumers during the migration.

**Independent Test**: Can be fully tested by exercising create/read/update/delete flows for portfolio, screener, backtest, and signal resources via the new modulith API and verifying behavior and contracts match the existing Java application.

**Acceptance Scenarios**:

1. **Given** an existing client that creates and updates portfolio records, **When** it points to the new modulith API, **Then** all portfolio CRUD operations behave as before without contract-breaking changes.
2. **Given** a client that manages screeners, backtests, or signals via the current API, **When** it uses the corresponding endpoints in the new modulith, **Then** all expected operations are available and persist data correctly in the underlying tables.

### Edge Cases

- What happens when the requested instrument symbol or identifier does not exist in the `kite_*` tables?
- How does the system handle delayed or missing data from the upstream Kite provider (e.g., partial candles, gaps, provider timeouts)?
- How does the system behave when the request volume briefly exceeds expected peaks (e.g., opening auction spikes)?
- What is returned when the requested historical time range partially predates the available `kite_*` data?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The API MUST expose stock data endpoints whose functional behavior mirrors the existing NSE-based endpoints but backed by `kite_*` tables instead of `nse_*` tables.
- **FR-002**: The system MUST define and use entities, DTOs, and mappings that are aligned with `kite_*` schemas while preserving the external response contracts used by existing clients wherever feasible.
- **FR-003**: The system MUST provide a complete set of Kite-based equivalents for all existing NSE stock data endpoints used by client applications.
- **FR-004**: The system MUST organize the API as a modulith, with a clearly defined module (or set of modules) responsible for Kite stock data, separated from other business capabilities within the same deployable unit.
- **FR-005**: The system MUST read Kite credentials and any other external provider configuration from environment variables (e.g., via `.env`-style configuration) rather than hardcoded values.
- **FR-006**: The system MUST continue to support all non-stock-data functionality “as is” from the existing Java application, without requiring clients to change those non-stock-related integrations.
- **FR-007**: For each legacy NSE endpoint, the system MUST provide a documented mapping to the corresponding Kite-based endpoint, including any differences in supported instruments, time ranges, or fields.
- **FR-008**: The API MUST handle upstream Kite provider errors gracefully, returning meaningful error responses without exposing internal implementation details.
- **FR-009**: The system MUST support high-frequency trading traffic patterns by ensuring that Kite-backed endpoints can handle bursts of at least 1,000 stock data requests per second per node under normal conditions, with p95 latency under 150ms and p99 latency under 300ms for these endpoints.
- **FR-010**: The system MUST allow configuration of caching or other performance optimizations for frequently requested stock data without changing the public API contracts.
- **FR-011**: The system MUST expose CRUD endpoints for non-`nse_*` domain entities (including `portfolio*`, `screeners*`, `backtest`, and `signals`) that preserve the functional behavior and external contracts of the existing Java application.

### Key Entities *(include if feature involves data)*

- **Instrument**: Represents a tradable instrument available through Kite (e.g., stock, index, derivative), including identifiers needed by clients and internal references to `kite_*` tables.
- **PriceData / Candle**: Represents time-series price data (open, high, low, close, volume, timestamp) retrieved from `kite_*` tables for a given instrument and time interval.
- **Quote**: Represents the latest or near-real-time snapshot for one or more instruments, including bid/ask, last traded price, and other fields exposed by the external contract.
- **Configuration / ProviderSettings**: Represents configuration for connecting to Kite and related providers, including API keys, rate limits, and environment-specific endpoints, sourced from environment variables.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 90% of existing NSE stock data use cases in client applications can be served by the new Kite-backed endpoints without code changes beyond endpoint URL or configuration updates.
- **SC-002**: Under representative high-frequency trading load, at least 95% of stock data requests to Kite-backed endpoints complete within 150ms end-to-end, and at least 99% complete within 300ms.
- **SC-003**: During defined peak trading windows, the Kite-backed stock data endpoints sustain short-term bursts up to 2,000 requests per second per node while keeping server-side and Kite-related error rates (5xx and mapped upstream failures) below 1%, excluding client-side 4xx errors.
- **SC-004**: No regressions are reported by existing clients for non-stock-data features after the migration to the modulith-based API structure.


