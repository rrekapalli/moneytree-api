# Requirements Document

## Introduction

This feature implements a Spring Modulith module named `socketengine` that serves as a real-time market data streaming engine. The module connects to Zerodha Kite WebSocket endpoints to ingest live market ticks, distributes them to multiple Angular frontend clients via WebSocket/SSE, caches intraday data in Redis for fast access, and persists historical data to TimescaleDB for analytics. The module is designed as a self-contained, event-driven component within a larger Spring Boot 3 modulith application.

## Glossary

- **SocketEngine Module**: The Spring Modulith module responsible for real-time market data streaming and persistence
- **Kite WebSocket**: Zerodha Kite's WebSocket API for streaming live market data
- **Tick**: A single market data update containing price, volume, and OHLC information for an instrument
- **Instrument Token**: A unique numeric identifier for a tradable instrument in the Kite system
- **Index Instrument**: Market indices like NIFTY 50, BANKNIFTY that represent market segments
- **Stock Instrument**: Individual equity securities traded on exchanges
- **Trading Day**: The current day's trading session for which intraday data is cached
- **TimescaleDB**: PostgreSQL-based time-series database for storing historical tick data
- **Hypertable**: TimescaleDB's optimized table structure for time-series data
- **Redis**: In-memory data store used for caching current trading day's tick data
- **WebSocket Endpoint**: Server endpoint that maintains persistent bidirectional connections with clients
- **SSE (Server-Sent Events)**: HTTP-based server push technology for streaming data to clients
- **Session**: A client connection identified by a unique session ID
- **Subscription**: A client's request to receive ticks for specific instruments
- **Domain Event**: Internal application event published when significant actions occur
- **Spring Modulith**: Spring framework extension for building modular monolithic applications
- **Batch Persistence**: Periodic bulk insertion of accumulated ticks into the database
- **Reconnection Strategy**: Logic for re-establishing dropped WebSocket connections with backoff

## Requirements

### Requirement 1

**User Story:** As a system operator, I want the socketengine module to establish and maintain a single WebSocket connection to Kite, so that the system can reliably ingest live market data for all subscribed instruments.

#### Acceptance Criteria

1. WHEN the socketengine module starts THEN the system SHALL establish a WebSocket connection to the Kite market data endpoint using configured api_key and access_token
2. WHEN the WebSocket connection is established THEN the system SHALL subscribe to all configured index instruments and stock instruments
3. WHEN the WebSocket connection drops THEN the system SHALL attempt reconnection with exponential backoff starting at 1 second up to a maximum of 60 seconds
4. WHEN binary tick data arrives from Kite THEN the system SHALL parse it into strongly-typed Tick domain objects
5. WHEN authentication fails THEN the system SHALL log the error with details and stop reconnection attempts until configuration is corrected

### Requirement 2

**User Story:** As a frontend developer, I want separate WebSocket endpoints for indices and stocks, so that my Angular application can subscribe to different instrument types independently.

#### Acceptance Criteria

1. WHEN the socketengine module starts THEN the system SHALL expose a WebSocket endpoint at /ws/indices for selective index instrument streaming
2. WHEN the socketengine module starts THEN the system SHALL expose a WebSocket endpoint at /ws/stocks for selective stock instrument streaming
3. WHEN the socketengine module starts THEN the system SHALL expose a WebSocket endpoint at /ws/indices/all for streaming all NSE INDICES segment instruments without requiring explicit subscriptions
4. WHEN the socketengine module starts THEN the system SHALL expose a WebSocket endpoint at /ws/stocks/nse/all for streaming all NSE equity stocks without requiring explicit subscriptions
5. WHEN a client connects to /ws/indices or /ws/stocks THEN the system SHALL create a unique session identifier for that connection and require explicit subscriptions
6. WHEN a client connects to /ws/indices/all or /ws/stocks/nse/all THEN the system SHALL automatically stream all matching ticks without requiring subscription messages
7. WHEN a client disconnects THEN the system SHALL remove the session and clean up all associated subscriptions
8. WHEN multiple clients connect THEN the system SHALL maintain independent subscription lists for each session

### Requirement 3

**User Story:** As a system operator, I want the socketengine module to automatically load all NSE indices and NSE equity stock instrument tokens from the database, so that the /ws/indices/all and /ws/stocks/nse/all endpoints can stream complete market data without manual configuration.

#### Acceptance Criteria

1. WHEN the socketengine module starts THEN the system SHALL execute query "SELECT instrument_token, exchange_token, tradingsymbol FROM kite_instrument_master WHERE exchange = 'NSE' AND segment = 'INDICES'" to load all indices
2. WHEN the socketengine module starts THEN the system SHALL execute query "SELECT instrument_token, exchange_token, tradingsymbol FROM kite_instrument_master WHERE exchange = 'NSE' AND segment = 'NSE' AND instrument_type = 'EQ' AND expiry IS NULL AND lot_size = 1 AND name IS NOT NULL AND name NOT LIKE '%LOAN%' ORDER BY tradingsymbol" to load all NSE equity stocks
3. WHEN the queries execute successfully THEN the system SHALL store the instrument tokens in separate in-memory collections for indices and stocks
4. WHEN the Kite WebSocket connection is established THEN the system SHALL subscribe to all loaded index and stock instrument tokens automatically
5. WHEN a client connects to /ws/indices/all THEN the system SHALL stream ticks for all subscribed index instruments without requiring client subscription messages
6. WHEN a client connects to /ws/stocks/nse/all THEN the system SHALL stream ticks for all subscribed NSE equity stock instruments without requiring client subscription messages
7. WHEN the instrument lists need updating THEN the system SHALL provide a mechanism to reload the lists without restarting the application

### Requirement 4

**User Story:** As a trader using the frontend, I want to dynamically subscribe and unsubscribe to specific instruments, so that I receive only the market data relevant to my current trading focus.

#### Acceptance Criteria

1. WHEN a client sends a SUBSCRIBE message with instrument symbols THEN the system SHALL add those symbols to the session's subscription set
2. WHEN a client sends an UNSUBSCRIBE message with instrument symbols THEN the system SHALL remove those symbols from the session's subscription set
3. WHEN a tick arrives from Kite THEN the system SHALL broadcast it only to sessions that have subscribed to that instrument
4. WHEN a subscription message has invalid format THEN the system SHALL send an error response to the client and maintain existing subscriptions
5. WHEN a session has no active subscriptions THEN the system SHALL not send any tick data to that session

### Requirement 4

**User Story:** As a trader using the frontend, I want to dynamically subscribe and unsubscribe to specific instruments on /ws/indices and /ws/stocks endpoints, so that I receive only the market data relevant to my current trading focus.

#### Acceptance Criteria

1. WHEN a client sends a SUBSCRIBE message with instrument symbols THEN the system SHALL add those symbols to the session's subscription set
2. WHEN a client sends an UNSUBSCRIBE message with instrument symbols THEN the system SHALL remove those symbols from the session's subscription set
3. WHEN a tick arrives from Kite THEN the system SHALL broadcast it to sessions based on the following rules: sessions with explicit subscriptions for that instrument, OR /ws/indices/all sessions if it is an index tick, OR /ws/stocks/nse/all sessions if it is an NSE equity stock tick
4. WHEN a subscription message has invalid format THEN the system SHALL send an error response to the client and maintain existing subscriptions
5. WHEN a session on /ws/indices or /ws/stocks has no active subscriptions THEN the system SHALL not send any tick data to that session

### Requirement 5

**User Story:** As a system architect, I want the module to publish internal domain events when ticks arrive, so that different components can react independently following event-driven architecture principles.

#### Acceptance Criteria

1. WHEN a tick is successfully parsed from Kite WebSocket THEN the system SHALL publish a TickReceivedEvent containing the tick data
2. WHEN a TickReceivedEvent is published THEN the WebSocket broadcaster component SHALL receive it and forward to subscribed clients
3. WHEN a TickReceivedEvent is published THEN the Redis caching component SHALL receive it and cache the tick for the current trading day
4. WHEN a TickReceivedEvent is published THEN the persistence buffer component SHALL receive it and add to the batch for TimescaleDB insertion
5. WHEN event processing fails in one component THEN the system SHALL log the error without affecting other event listeners

### Requirement 6

**User Story:** As a trader, I want today's tick data cached in Redis, so that I can quickly retrieve recent price history without querying the database.

#### Acceptance Criteria

1. WHEN a tick arrives for the current trading day THEN the system SHALL store it in Redis using key format "ticks:{tradingDate}:{symbol}"
2. WHEN storing ticks in Redis THEN the system SHALL append to a Redis List structure containing JSON-serialized tick snapshots
3. WHEN a Redis key is created for a trading day THEN the system SHALL set a TTL of 2 days to automatically expire old data
4. WHEN the system receives a request for today's ticks for a symbol THEN the system SHALL retrieve all entries from the corresponding Redis List
5. WHEN the system receives a request for a time-window slice THEN the system SHALL filter the Redis List entries by timestamp and return matching ticks

### Requirement 7

**User Story:** As a data analyst, I want all tick data persisted to TimescaleDB in compressed binary format, so that I can perform historical analysis and backtesting on complete market data with minimal storage overhead.

#### Acceptance Criteria

1. WHEN the socketengine module starts THEN the system SHALL create or verify existence of a hypertable named kite_ticks_data with columns: instrument_token (BIGINT), tradingsymbol (VARCHAR), exchange (VARCHAR), tick_timestamp (TIMESTAMPTZ), and raw_tick_data (BYTEA for binary storage)
2. WHEN storing a tick THEN the system SHALL store the instrument_token, tradingsymbol, exchange, tick_timestamp, and the complete binary response received from the Kite WebSocket API in the raw_tick_data column without parsing or transformation
3. WHEN 15 minutes elapse THEN the system SHALL execute a scheduled job that batch inserts all buffered ticks into the kite_ticks_data hypertable
4. WHEN batch inserting ticks THEN the system SHALL use JDBC batch operations to insert multiple rows efficiently in a single transaction
5. WHEN a batch insert fails THEN the system SHALL log the error, retain the failed batch in memory, and retry on the next scheduled execution
6. WHEN the trading day ends THEN the system SHALL execute an end-of-day job that flushes any remaining buffered ticks and verifies Redis data is persisted
7. WHEN querying historical ticks THEN the system SHALL be able to filter by instrument_token, tradingsymbol, exchange, and tick_timestamp for efficient retrieval and subsequent parsing of raw_tick_data

### Requirement 8

**User Story:** As a system architect, I want the socketengine module to follow Spring Modulith conventions, so that it maintains clear boundaries and can be independently tested and evolved.

#### Acceptance Criteria

1. WHEN the module is defined THEN the system SHALL use package structure com.moneytree.socketengine with subpackages: config, kite, domain, api, persistence, redis
2. WHEN the module is defined THEN the system SHALL annotate the main package with @ApplicationModule to declare module boundaries
3. WHEN components need to communicate across module boundaries THEN the system SHALL use domain events rather than direct method calls
4. WHEN the module exposes public APIs THEN the system SHALL place them in the api subpackage and mark internal components as package-private
5. WHEN the module is tested THEN the system SHALL support Spring Modulith's module testing capabilities for isolated integration tests

### Requirement 9

**User Story:** As a system administrator, I want all sensitive configuration externalized, so that the application can be deployed securely across different environments.

#### Acceptance Criteria

1. WHEN the application starts THEN the system SHALL read kite.api-key, kite.api-secret, and kite.access-token from environment variables or application.yml
2. WHEN the application starts THEN the system SHALL read kite.websocket-url from configuration with a sensible default value
3. WHEN the application starts THEN the system SHALL read Redis connection properties (host, port, password) from configuration
4. WHEN the application starts THEN the system SHALL read TimescaleDB connection properties (url, username, password) from configuration
5. WHEN any required configuration is missing THEN the system SHALL fail to start with a clear error message indicating which configuration is missing

### Requirement 10

**User Story:** As a frontend developer, I want REST endpoints to query tick data, so that I can retrieve historical data and current subscriptions without using WebSocket connections.

#### Acceptance Criteria

1. WHEN the module starts THEN the system SHALL expose GET /api/ticks/today/{symbol} endpoint that returns today's cached ticks from Redis
2. WHEN the module starts THEN the system SHALL expose GET /api/ticks/historical endpoint that accepts symbol, startTime, and endTime parameters and queries TimescaleDB
3. WHEN the module starts THEN the system SHALL expose GET /api/subscriptions endpoint that returns current active sessions and their subscribed instruments
4. WHEN a REST endpoint receives an invalid symbol THEN the system SHALL return HTTP 400 with a validation error message
5. WHEN a REST endpoint query fails THEN the system SHALL return HTTP 500 with an error message and log the exception details

### Requirement 11

**User Story:** As a frontend developer, I want standardized message formats for WebSocket communication, so that I can reliably parse subscription requests and tick data.

#### Acceptance Criteria

1. WHEN a client subscribes THEN the system SHALL accept JSON messages with fields: action="SUBSCRIBE", type="INDEX"|"STOCK", symbols=["SYMBOL1", "SYMBOL2"]
2. WHEN a client unsubscribes THEN the system SHALL accept JSON messages with fields: action="UNSUBSCRIBE", type="INDEX"|"STOCK", symbols=["SYMBOL1", "SYMBOL2"]
3. WHEN the system sends a tick to clients THEN the system SHALL format it as JSON with fields: symbol, instrumentToken, type, timestamp, lastTradedPrice, volume, ohlc={open, high, low, close}
4. WHEN the system sends an error to a client THEN the system SHALL format it as JSON with fields: error=true, message="error description"
5. WHEN timestamp values are serialized THEN the system SHALL use ISO 8601 format with timezone (e.g., "2025-12-08T10:15:03.123+05:30")

### Requirement 12

**User Story:** As a developer, I want comprehensive logging throughout the module, so that I can troubleshoot issues and monitor system health in production.

#### Acceptance Criteria

1. WHEN the Kite WebSocket connection is established THEN the system SHALL log an INFO message with connection details
2. WHEN the Kite WebSocket connection drops THEN the system SHALL log a WARN message with disconnection reason and reconnection attempt number
3. WHEN a client subscribes or unsubscribes THEN the system SHALL log an INFO message with session ID, action, and affected symbols
4. WHEN a batch persistence job runs THEN the system SHALL log an INFO message with number of ticks persisted and execution time
5. WHEN any error occurs THEN the system SHALL log an ERROR message with full exception stack trace and contextual information

### Requirement 13

**User Story:** As a quality engineer, I want comprehensive unit and integration tests, so that I can verify the module's correctness and prevent regressions.

#### Acceptance Criteria

1. WHEN tick parsing logic is tested THEN the system SHALL include unit tests that verify binary data is correctly converted to Tick objects
2. WHEN subscription management is tested THEN the system SHALL include unit tests that verify session-to-symbols mapping is correctly maintained
3. WHEN Redis caching is tested THEN the system SHALL include integration tests using Testcontainers or embedded Redis
4. WHEN TimescaleDB persistence is tested THEN the system SHALL include integration tests using Testcontainers with TimescaleDB image
5. WHEN the full flow is tested THEN the system SHALL include an integration test demonstrating: tick arrives -> event published -> broadcast to client -> cached in Redis -> persisted to TimescaleDB

### Requirement 14

**User Story:** As a system architect, I want thread-safe handling of concurrent operations, so that the module can reliably handle high-frequency tick data and multiple client connections.

#### Acceptance Criteria

1. WHEN multiple ticks arrive simultaneously THEN the system SHALL use thread-safe collections for buffering without data loss or corruption
2. WHEN multiple clients subscribe concurrently THEN the system SHALL use synchronized or concurrent data structures for session management
3. WHEN the batch persistence job runs THEN the system SHALL not block incoming tick processing or client broadcasts
4. WHEN Redis operations execute THEN the system SHALL use connection pooling to handle concurrent requests efficiently
5. WHEN TimescaleDB operations execute THEN the system SHALL use connection pooling and avoid holding locks during batch inserts

### Requirement 15

**User Story:** As a new developer joining the project, I want clear documentation and integrated build scripts, so that I can understand the module's architecture and easily build and run it alongside other modules.

#### Acceptance Criteria

1. WHEN the module repository includes README.md THEN the system SHALL document how to configure Kite API credentials
2. WHEN the module repository includes README.md THEN the system SHALL document how to configure Redis and TimescaleDB connections
3. WHEN the module repository includes README.md THEN the system SHALL document the WebSocket message formats for subscription and tick data
4. WHEN the module repository includes README.md THEN the system SHALL document how the periodic persistence mechanism works
5. WHEN the socketengine module is integrated THEN the system SHALL update ./build-all.sh script to include building the socketengine module alongside other services
6. WHEN the socketengine module is integrated THEN the system SHALL update ./start-all.sh script to include starting the socketengine module alongside other services
