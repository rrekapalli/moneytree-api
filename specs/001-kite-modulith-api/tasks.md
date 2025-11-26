# Tasks: Kite-based modulith trading API

**Input**: Design documents from `/specs/001-kite-modulith-api/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`

**Tests**: This feature affects high-frequency trading market data; include targeted contract/integration tests for Kite connectivity and core endpoints.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions (paths are relative to repository root)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ensure repository and backend modulith are ready for Kite-based development.

- [X] T001 Verify existing `backend` Java modulith build tooling and project structure in `backend/`
- [X] T002 [P] Confirm connectivity to TimescaleDB `MoneyTree` instance and presence of `kite_*` tables in `backend/src/main/resources/db/` migration configuration
- [X] T003 [P] Decide and document environment variable names for Kite credentials and config in `specs/001-kite-modulith-api/research.md` and `backend/README.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Create Kite connectivity module package `backend/src/main/java/com/moneytree/connectivity/kite/` with initial class skeletons
- [X] T005 [P] Implement configuration binding for Kite credentials and settings in `backend/src/main/java/com/moneytree/connectivity/kite/KiteConfig.java`
- [X] T006 [P] Implement Kite API HTTP client wrapper with basic request/response handling in `backend/src/main/java/com/moneytree/connectivity/kite/KiteHttpClient.java`
- [X] T007 Setup TimescaleDB access layer for `kite_*` tables in `backend/src/main/java/com/moneytree/marketdata/kite/KiteMarketDataRepository.java`
- [X] T008 Configure logging and metrics for Kite connectivity and market data in `backend/src/main/java/com/moneytree/connectivity/kite/` and `backend/src/main/java/com/moneytree/marketdata/kite/`
- [X] T009 Implement environment configuration loading (including `.env` support if used) in `backend/src/main/java/com/moneytree/config/EnvironmentConfig.java`

**Checkpoint**: Foundational connectivity, configuration, and data access for Kite are ready; user story implementation can now begin.

---

## Phase 3: User Story 1 - Retrieve live stock data via Kite-backed endpoints (Priority: P1) 🎯 MVP

**Goal**: Provide Kite-backed endpoints for live and historical stock data that mirror existing NSE-based behaviors.

**Independent Test**: Call Kite-backed history and quote endpoints and verify they return correct data from `kite_*` tables with expected contracts and latency.

### Tests for User Story 1

- [ ] T010 [P] [US1] Add contract tests for Kite history endpoint in `backend/src/test/java/com/moneytree/marketdata/kite/KiteHistoryContractTest.java`
- [ ] T011 [P] [US1] Add contract tests for Kite quotes endpoint in `backend/src/test/java/com/moneytree/marketdata/kite/KiteQuotesContractTest.java`

### Implementation for User Story 1

- [ ] T012 [P] [US1] Define `Instrument`, `PriceData`, and `Quote` entities aligned with `kite_*` tables in `backend/src/main/java/com/moneytree/marketdata/kite/model/`
- [ ] T013 [P] [US1] Implement `KiteMarketDataService` for history and quotes retrieval in `backend/src/main/java/com/moneytree/marketdata/kite/KiteMarketDataService.java`
- [ ] T014 [US1] Expose Kite-backed history endpoint in `backend/src/main/java/com/moneytree/api/MarketDataController.java`
- [ ] T015 [US1] Expose Kite-backed quotes endpoint in `backend/src/main/java/com/moneytree/api/MarketDataController.java`
- [ ] T016 [US1] Add validation and error handling for invalid instruments and time ranges in `backend/src/main/java/com/moneytree/api/MarketDataController.java`
- [ ] T017 [US1] Add logging and metrics for Kite-backed history and quotes endpoints in `backend/src/main/java/com/moneytree/api/MarketDataController.java`

**Checkpoint**: User Story 1 is fully functional and testable independently via contract tests and API calls.

---

## Phase 4: User Story 2 - Migrate from NSE endpoints to Kite-based equivalents (Priority: P2)

**Goal**: Enable migration from existing `nse_*` endpoints to Kite-based equivalents with minimal client changes.

**Independent Test**: Switch a client configuration from NSE to Kite endpoints and verify workflows continue to function with consistent contracts.

### Tests for User Story 2

- [ ] T018 [P] [US2] Add regression tests comparing responses between legacy NSE and new Kite endpoints in `backend/src/test/java/com/moneytree/marketdata/kite/NseToKiteRegressionTest.java`

### Implementation for User Story 2

- [ ] T019 [P] [US2] Document mapping from each NSE endpoint to its Kite equivalent in `specs/001-kite-modulith-api/contracts/market-data-openapi.md`
- [ ] T020 [US2] Ensure existing API routes in `backend/src/main/java/com/moneytree/api/MarketDataController.java` are wired to Kite-backed services instead of NSE implementations
- [ ] T021 [US2] Handle any NSE-specific fields not available from Kite (e.g., mark deprecated or optional) in `backend/src/main/java/com/moneytree/api/MarketDataController.java`
- [ ] T022 [US2] Update API documentation to highlight Kite-based behavior and any contract differences in `specs/001-kite-modulith-api/quickstart.md`

**Checkpoint**: User Story 2 allows clients to migrate from NSE to Kite endpoints with minimal code changes.

---

## Phase 5: User Story 3 - Operate as a high-performance modulith API (Priority: P3)

**Goal**: Ensure the modulith structure and runtime behavior meet high-frequency performance and modularity goals.

**Independent Test**: Run load tests and review module boundaries to confirm performance SLOs and clean separation of responsibilities.

### Tests for User Story 3

- [ ] T023 [P] [US3] Implement load test scenario for Kite-backed endpoints targeting 1,000 req/s per node in `backend/load-tests/kite_marketdata_load_test.md`
- [ ] T024 [P] [US3] Capture latency and error-rate metrics for peak window scenarios in `backend/load-tests/kite_peak_window_results.md`

### Implementation for User Story 3

- [ ] T025 [P] [US3] Refine Java 21 runtime and threading configuration for market data hot paths in `backend/src/main/resources/application.yml`
- [ ] T026 [US3] Verify and, if needed, refactor modulith boundaries so Kite modules only interact via defined interfaces in `backend/src/main/java/com/moneytree/marketdata/kite/` and `backend/src/main/java/com/moneytree/connectivity/kite/`
- [ ] T027 [US3] Add observability (metrics, logs, traces) for Kite request latency and error tracking in `backend/src/main/java/com/moneytree/connectivity/kite/` and related config files
- [ ] T028 [US3] Design and implement caching or other performance optimizations for frequently requested Kite-backed stock data in `backend/src/main/java/com/moneytree/marketdata/kite/KiteMarketDataService.java`

**Checkpoint**: User Story 3 ensures the API operates as a performant modulith with measurable SLOs and clean modular boundaries.

---

## Phase 6: User Story 4 - Preserve CRUD APIs for non-NSE domain entities (Priority: P2)

**Goal**: Ensure CRUD endpoints for non-`nse_*` domain entities (`portfolio*`, `screeners*`, `backtest`, `signals`) remain available and behave like the existing implementation.

**Independent Test**: Run CRUD flows for portfolio, screener, backtest, and signal resources via the new modulith API and confirm behavior and contracts match the legacy Java app.

### Implementation for User Story 4

- [ ] T029 [P] [US4] Review existing portfolio/screener/backtest/signal controllers and services in `/home/raja/code/MoneyPlant/backend` for current contracts and behavior
- [ ] T030 [P] [US4] Introduce or update portfolio CRUD controller and service in `backend/src/main/java/com/moneytree/api/PortfolioController.java` and `backend/src/main/java/com/moneytree/portfolio/PortfolioService.java`
- [ ] T031 [P] [US4] Introduce or update screener CRUD controller and service in `backend/src/main/java/com/moneytree/api/ScreenerController.java` and `backend/src/main/java/com/moneytree/screener/ScreenerService.java`
- [ ] T032 [P] [US4] Introduce or update backtest CRUD controller and service in `backend/src/main/java/com/moneytree/api/BacktestController.java` and `backend/src/main/java/com/moneytree/backtest/BacktestService.java`
- [ ] T033 [P] [US4] Introduce or update signal CRUD controller and service in `backend/src/main/java/com/moneytree/api/SignalController.java` and `backend/src/main/java/com/moneytree/signal/SignalService.java`
- [ ] T034 [US4] Add regression tests to verify CRUD parity with existing implementation in `backend/src/test/java/com/moneytree/portfolio/`, `backend/src/test/java/com/moneytree/screener/`, `backend/src/test/java/com/moneytree/backtest/`, and `backend/src/test/java/com/moneytree/signal/`

**Checkpoint**: User Story 4 confirms that non-NSE domain CRUD APIs are present and compatible with existing clients.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and overall quality.

- [ ] T035 [P] Add developer documentation for Kite and non-NSE domain modules and endpoints in `backend/README.md` and `specs/001-kite-modulith-api/quickstart.md`
- [ ] T036 Refine error messages and response payloads for consistency across Kite-backed and non-NSE CRUD endpoints in `backend/src/main/java/com/moneytree/api/`
- [ ] T037 [P] Add additional unit tests for edge cases (e.g., missing data, spikes) in `backend/src/test/java/com/moneytree/marketdata/kite/` and domain-specific test packages
- [ ] T038 [P] Run end-to-end validation using quickstart flows and record results in `specs/001-kite-modulith-api/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Stories (Phase 3–6)**: All depend on Foundational phase completion.
  - User stories can then proceed in parallel (if staffed).
  - Or sequentially in priority order (P1 → P2 → P3 → P2 for US4, as agreed with stakeholders).
- **Polish (Phase 7)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories.
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) and after core US1 contracts are stable; should remain independently testable.
- **User Story 3 (P3)**: Can start after Foundational (Phase 2); performance tuning may depend on US1 endpoints but tests should target their own scenarios.
- **User Story 4 (P2)**: Can start after Foundational (Phase 2); may depend on shared infrastructure but should preserve independent CRUD behavior for domain entities.

### Within Each User Story

- Tests SHOULD be written and exercised alongside implementation.
- Models/entities before services.
- Services before endpoints.
- Core implementation before integration and tuning.
- Each story should be independently verifiable before moving to the next priority.

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel.
- All Foundational tasks marked [P] can run in parallel (within Phase 2).
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows).
- Tests or models within a story marked [P] can run in parallel when they touch different files.
- Different user stories can be worked on in parallel by different team members.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories).
3. Complete Phase 3: User Story 1.
4. Validate Kite-backed history and quotes endpoints under expected load.
5. Deploy or demo MVP if ready.

### Incremental Delivery

1. Complete Setup + Foundational → foundation ready.
2. Add User Story 1 → test independently → deploy/demo (MVP).
3. Add User Story 2 → test independently with migration scenarios → deploy/demo.
4. Add User Story 3 → validate performance and observability → deploy/demo.
5. Add User Story 4 → validate CRUD parity for non-NSE domain entities → deploy/demo.



