# Research: Kite-based modulith trading API

## Overview

This document resolves open questions and clarifications for the Kite-based modulith trading API feature, focusing on high-frequency performance targets and Kite-backed market data behavior. Findings here inform both the implementation plan and updates to the specification requirements and success criteria.

## Decisions & Clarifications

### R1: High-frequency request rate and latency thresholds

- **Decision**: Target at least 1,000 stock data requests per second per node with:
  - p95 latency under 150ms
  - p99 latency under 300ms
- **Rationale**: These thresholds are aggressive enough for many high-frequency data retrieval workloads while still being realistic for a Java-based modulith using TimescaleDB and an external Kite API. They align with the constitution’s requirement for explicit latency SLOs without overcommitting to ultra-low single-digit millisecond latencies that would require a different architecture.
- **Alternatives considered**:
  - **Higher SLO (e.g., 5,000+ req/s per node, p95 < 50ms)**: Rejected as likely requiring significantly more specialized infrastructure (in-memory stores, kernel bypass, colocated deployments) beyond the current architecture.
  - **Looser SLO (e.g., 500 req/s, p95 < 300ms)**: Rejected as insufficient for stated “high-frequency” usage and might not meaningfully differentiate from a standard web API.

### R2: Peak request rate and acceptable error rate

- **Decision**: For documented “peak trading windows” (e.g., market open, major events), the system should:
  - Sustain short-term bursts up to 2,000 requests per second per node.
  - Maintain an overall error rate (5xx and Kite-related failures visible to clients) below 1% during peaks, excluding clearly client-side 4xx errors.
- **Rationale**: Bursty traffic is common around market open and news; doubling the steady-state target provides safety margin and clear expectations. A 1% upper bound on server-side errors strikes a balance between realism (occasional upstream Kite or network issues) and reliability expectations for trading systems.
- **Alternatives considered**:
  - **Error rate <0.1%**: Stronger reliability but may be unrealistic given dependency on an external broker API without full control.
  - **Error rate <5%**: Too permissive for a trading context and could mask systemic issues.

### R3: Mapping NSE endpoints to Kite equivalents

- **Decision**: For each existing NSE-based stock data endpoint, maintain:
  - The same HTTP method and general URL shape (e.g., `/api/stock/{symbol}/history`).
  - The same response structure where fields are semantically available from Kite data.
  - A clear contract note where a field cannot be derived from Kite data or where Kite semantics differ (e.g., instrument codes, trading sessions).
- **Rationale**: This minimizes migration friction for existing clients while acknowledging that not all NSE concepts map 1:1 to Kite. Contract documentation will highlight any differences.
- **Alternatives considered**:
  - **Designing an entirely new contract**: Would offer more freedom but significantly increase migration cost.
  - **Forcing clients to adopt Kite-native field names**: Rejected for this phase to keep change surface small; can be revisited later via versioned APIs.

### R4: Environment variable names for backend configuration

- **Decision**: Use environment variables with clear, descriptive names:
  - `DB_USERNAME`, `DB_PASSWORD` for TimescaleDB credentials.
  - `KITE_API_KEY`, `KITE_API_SECRET`, `KITE_ACCESS_TOKEN`, `KITE_BASE_URL` for Zerodha Kite configuration.
- **Rationale**: These names are explicit, easy to understand, and align with standard practices for secret and configuration management. They also match the configuration properties used in `application.yaml`, `KiteConfig`, and `EnvironmentConfig`.
- **Alternatives considered**:
  - Embedding credentials directly in `application.yaml` or using less descriptive names: rejected for security and maintainability reasons.

## Impact on Specification

The following spec items are updated based on these decisions:

- **FR-009**: Now uses the explicit request rate and latency thresholds from R1.
- **SC-002**: Tied to the R1 latency SLOs to describe “instant” responses concretely.
- **SC-003**: Uses the R2 peak request rate and 1% maximum acceptable error rate.


