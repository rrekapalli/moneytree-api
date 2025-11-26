<!--
Sync Impact Report
- Version change: 0.0.0 (template) → 1.0.0
- Modified principles:
  - [template] → HFT Safety & Regulatory Compliance
  - [template] → Deterministic Low-Latency Execution
  - [template] → Modulith Architecture & Bounded Contexts
  - [template] → Market Connectivity & Resilience
  - [template] → Time-Series Persistence & Observability
- Added sections:
  - Technical Stack & Architecture Constraints
  - Development Workflow & Quality Gates
- Removed sections:
  - None (template placeholders concretized)
- Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (Constitution Check aligns with this constitution)
  - .specify/templates/spec-template.md ✅ (No constitution-specific constraints needed)
  - .specify/templates/tasks-template.md ✅ (Phase/structure compatible with principles)
  - .specify/templates/checklist-template.md ✅ (Generic, no constitution coupling)
  - .specify/templates/agent-file-template.md ✅ (Remains generic, no changes required)
- Follow-up TODOs:
  - TODO(RATIFICATION_DATE): set to the date this constitution is formally approved in the repo history
-->

# MoneyTree API Constitution

## Core Principles

### HFT Safety & Regulatory Compliance

- The system MUST never place, modify, or cancel orders that violate broker, exchange,
  or regulatory constraints (e.g., price bands, quantity limits, circuit breakers,
  trading session rules).
- All order flows MUST enforce explicit, configurable risk limits per strategy and
  per account (e.g., max exposure, max loss per day, max order rate).
- Every order decision MUST be traceable with immutable audit logs that capture the
  input signal, strategy state, risk checks performed, and final broker payload.
- The system MUST fail safe: on unexpected errors, connectivity loss, or inconsistent
  state, it MUST stop trading for affected strategies and surface clear alerts rather
  than continuing in a degraded or unknown state.

**Rationale**: In high-frequency trading, a single uncontrolled strategy can cause
outsized financial and compliance risk. Safety, risk limits, and auditability
take precedence over short-term performance or convenience.

### Deterministic Low-Latency Execution

- Critical trading paths (signal ingestion → decision → order placement) MUST have
  defined latency SLOs and be measurable end-to-end.
- Java 21 runtime settings (GC, threading, heap, JIT) for production MUST be
  explicitly specified, committed, and load-tested to minimize jitter and long pauses.
- Latency-sensitive modules MUST avoid blocking I/O and unbounded allocations in the
  hot path; any unavoidable blocking MUST be isolated into well-defined adapter
  modules.
- Performance regressions beyond agreed SLOs MUST block release until investigated
  and either fixed or explicitly accepted with documented rationale.

**Rationale**: Predictable latency is a primary correctness property in HFT; tuning
and measuring the runtime is as important as functional correctness.

### Modulith Architecture & Bounded Contexts

- The application MUST be structured as a modulith: a single deployable unit with
  clearly defined internal modules (e.g., market data, strategies, risk, execution,
  persistence, reporting) and no hidden cross-module coupling.
- Modules MAY interact only via well-defined interfaces or events; direct access to
  another module’s internal state or database tables is prohibited.
- Each module MUST be independently testable with clear contracts and fixtures; tests
  MUST not depend on unrelated modules.
- Cross-cutting concerns (logging, metrics, configuration, security) MUST be
  implemented as shared infrastructure modules rather than ad-hoc duplication.

**Rationale**: A modulith keeps deployment simple while preserving strong modular
boundaries, which is essential for evolving a complex trading system safely.

### Market Connectivity & Resilience (Zerodha Kite API)

- All interaction with Zerodha’s Kite API MUST go through a dedicated connectivity
  module that encapsulates authentication, rate limiting, retries with backoff, and
  error mapping.
- The system MUST distinguish between transient and permanent Kite/API failures and
  react accordingly (e.g., retry vs. halt trading and alert).
- Sandbox, replay, or simulation modes MUST exist so that strategies can be tested
  without live market impact, using the same code paths where feasible.
- Any change to Kite API usage (new endpoints, payload shapes, throttling behavior)
  MUST be covered by contract/integration tests before enabling in production.

**Rationale**: The broker API is a critical dependency and single point of failure;
encapsulating and hardening this integration protects strategies from subtle
downstream changes and outages.

### Time-Series Persistence & Observability (TimescaleDB)

- TimescaleDB (PostgreSQL) at `postres.tailce422e.ts.net:5432/MoneyTree` is the
  authoritative store for market and trading time-series data; schema changes MUST be
  applied via versioned migrations and reviewed.
- All persisted data relevant to trading decisions (orders, fills, signals, risk
  states) MUST be durably recorded with timestamps, identifiers, and references to
  source modules/strategies.
- The system MUST expose structured metrics, logs, and traces that allow correlation
  between trading events, database operations, and external API calls.
- Data retention, compression, and indexing policies in TimescaleDB MUST be defined
  per dataset to balance performance, storage cost, and regulatory retention needs.

**Rationale**: Accurate time-series storage and observability are essential for
post-trade analysis, debugging, and regulatory support in a high-frequency context.

## Technical Stack & Architecture Constraints

- **Language/Runtime**: Java 21 is the primary implementation language for all
  production services in this repository.
- **Application Style**: The system is a modulith: a single deployable unit with
  internal modules rather than many microservices by default. New deployables MUST
  be justified via documented architectural decisions.
- **Broker Integration**: Zerodha’s Kite API is the primary external trading API in
  scope for this repository. Any additional broker integration MUST follow the same
  connectivity and risk patterns defined for Kite.
- **Database**: TimescaleDB (PostgreSQL) at
  `postres.tailce422e.ts.net:5432/MoneyTree` is the primary time-series and trading
  data backend. All access MUST go through application modules, not ad-hoc tools,
  for production data.
- **Configuration & Secrets**: Environment-specific configuration and secrets MUST
  be supplied via secure configuration mechanisms (e.g., environment variables,
  secret managers) and never hard-coded in source.
- **Performance & Load Testing**: For any change that materially affects hot paths
  (market data, strategy evaluation, order routing), performance tests or load tests
  MUST be run and results recorded alongside the change description.

## Development Workflow & Quality Gates

- Every feature MUST originate from a written specification (`spec.md`) and an
  implementation plan (`plan.md`) that includes a “Constitution Check” section
  confirming how these principles are satisfied or explicitly documenting any
  temporary violations.
- For each feature, critical trading paths and risk checks MUST have automated tests
  (unit and, where applicable, integration or contract tests). High-risk changes
  without tests are not allowed.
- Code review is mandatory for all changes that touch trading logic, risk limits,
  broker connectivity, or persistence schema. Reviews MUST explicitly confirm:
  alignment with this constitution, test coverage, and performance impact.
- Any known deviation from these principles MUST be documented in the plan’s
  Complexity/Violation tracking and MUST include an expiry or follow-up task.
- Production incidents related to trading correctness, risk, or outages MUST result
  in a retro and, where needed, an amendment or clarification to this constitution.

## Governance

- This constitution governs how the MoneyTree API high-frequency trading system is
  designed, implemented, and evolved. Where it conflicts with prior conventions,
  this document takes precedence.
- Amendments to this constitution MUST be made via pull request that:
  - Explains the motivation and impact.
  - Updates the semantic **Version** field and **Last Amended** date.
  - Updates any referenced templates or guidance documents to remain consistent.
- Versioning follows semantic rules:
  - **MAJOR**: Backward-incompatible governance changes or removal/redefinition of
    principles.
  - **MINOR**: New principles or sections, or materially expanded guidance.
  - **PATCH**: Clarifications, wording, or non-semantic refinements.
- All implementation plans (`plan.md`), specifications (`spec.md`), and task lists
  (`tasks.md`) MUST include an explicit check that changes comply with this
  constitution or record and justify any exceptions.
- At least once per quarter (or after any major production incident), the team
  SHOULD review this constitution for relevance and propose amendments where needed.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE) | **Last Amended**: 2025-11-26
