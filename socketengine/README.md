# SocketEngine Module

Real-time market data streaming engine for the MoneyTree application. This standalone Spring Boot 3 service connects to Zerodha Kite's WebSocket API to ingest live tick data for NSE indices and equity stocks, distributes it to multiple Angular frontend clients, caches intraday data in Redis, and persists historical data to TimescaleDB.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
- [Building](#building)
- [Running](#running)
- [WebSocket Endpoints](#websocket-endpoints)
- [REST API Endpoints](#rest-api-endpoints)
- [Data Persistence](#data-persistence)
- [Troubleshooting](#troubleshooting)

## Architecture Overview

The socketengine module implements an event-driven architecture with three independent data paths:

1. **Hot Path (Synchronous)**: Immediate WebSocket broadcast to connected clients
2. **Cold Path A (Async)**: Redis caching for fast intraday queries
3. **Cold Path B (Async)**: Batch persistence to TimescaleDB every 15 minutes

```
Kite WebSocket → Parse Tick → Publish Event
                                    ↓
                    ┌───────────────┼───────────────┐
                    ↓               ↓               ↓
              Broadcast         Redis Cache    TimescaleDB
              (Hot Path)        (Async)        (Async Batch)
                    ↓
            WebSocket Clients
```

### Key Design Principles

- **Single Kite Connection**: One WebSocket connection for all market data
- **Event-Driven**: Components react to domain events independently
- **Non-Blocking**: Async consumers don't block the hot path
- **Space Efficient**: Binary storage of raw Kite responses in TimescaleDB
- **Selective Streaming**: Clients can subscribe to specific instruments or receive all data

## Features

- ✅ Real-time tick streaming from Zerodha Kite WebSocket API
- ✅ Four WebSocket endpoints for flexible client subscriptions
- ✅ Automatic reconnection with exponential backoff
- ✅ Redis caching for intraday tick data (2-day TTL)
- ✅ Batch persistence to TimescaleDB (15-minute intervals + EOD flush)
- ✅ Binary storage of raw tick data for space efficiency
- ✅ Thread-safe session management for concurrent clients
- ✅ REST API for querying historical and cached tick data
- ✅ Health checks and metrics for monitoring

## Prerequisites

### Required Infrastructure

The socketengine module shares infrastructure with the main backend:

- **PostgreSQL/TimescaleDB**: Running on `localhost:5432` (from `./backend`)
- **Redis**: Running on `localhost:6379` (from `./backend`)
- **Java 21**: Required for Spring Boot 3
- **Maven 3.8+**: For building the project

### Kite API Credentials

You need valid Zerodha Kite API credentials:

- `api_key`: Your Kite Connect API key
- `api_secret`: Your Kite Connect API secret
- `access_token`: Valid access token (must be refreshed daily)

**Note**: Kite access tokens expire daily and must be regenerated through the Kite login flow.

## Configuration

### Environment Variables

Create a `.env` file in the `./socketengine/` directory:

```bash
# Kite API Credentials
KITE_API_KEY=your_api_key_here
KITE_API_SECRET=your_api_secret_here
KITE_ACCESS_TOKEN=your_access_token_here

# Redis Configuration (shared with backend)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# TimescaleDB Configuration (shared with backend)
DB_URL=jdbc:postgresql://localhost:5432/moneytree
DB_USERNAME=postgres
DB_PASSWORD=postgres
```

### Application Configuration

The `application.yml` file contains default configuration:

```yaml
socketengine:
  kite:
    api-key: ${KITE_API_KEY}
    api-secret: ${KITE_API_SECRET}
    access-token: ${KITE_ACCESS_TOKEN}
    websocket-url: wss://ws.kite.trade
  
  redis:
    host: ${REDIS_HOST:localhost}
    port: ${REDIS_PORT:6379}
    password: ${REDIS_PASSWORD:}
    database: 0
  
  persistence:
    batch-size: 1000
    batch-cron: "0 */15 * * * *"      # Every 15 minutes
    eod-cron: "0 0 16 * * MON-FRI"    # 4 PM IST on weekdays

server:
  port: 8081  # Runs on port 8081 (backend uses 8080)

spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/moneytree}
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD:postgres}
```

## Building

Build the socketengine module using Maven:

```bash
cd socketengine
mvn clean package
```

This creates an executable JAR in `target/socketengine-*.jar`.

### Building with the Entire Project

The socketengine module is integrated into the project-wide build script:

```bash
# From project root
./build-all.sh
```

## Running

### Option 1: Using the Startup Script (Recommended)

```bash
cd socketengine
./start-app.sh
```

The script:
- Loads environment variables from `.env` if present
- Starts the Spring Boot application
- Runs on port 8081

### Option 2: Using Maven

```bash
cd socketengine
mvn spring-boot:run
```

### Option 3: Running the JAR Directly

```bash
cd socketengine
java -jar target/socketengine-*.jar
```

### Running with the Entire Project

The socketengine module is integrated into the project-wide startup script:

```bash
# From project root
./start-all.sh
```

This starts:
1. Backend (port 8080)
2. SocketEngine (port 8081)
3. Frontend (port 4200)

### Verifying Startup

Check the logs for successful startup:

```
INFO  c.m.s.SocketEngineApplication - Starting SocketEngineApplication
INFO  c.m.s.k.InstrumentLoader - Loaded 50 NSE indices from database
INFO  c.m.s.k.InstrumentLoader - Loaded 1800 NSE equity stocks from database
INFO  c.m.s.k.KiteWebSocketClient - Connected to Kite WebSocket
INFO  c.m.s.k.KiteWebSocketClient - Subscribed to 1850 instruments
INFO  c.m.s.SocketEngineApplication - Started SocketEngineApplication in 5.234 seconds
```

## WebSocket Endpoints

The socketengine exposes four WebSocket endpoints for different use cases:

### 1. `/ws/indices` - Selective Index Streaming

Subscribe to specific NSE indices.

**Connection**: `ws://localhost:8081/ws/indices`

**Usage**:
```javascript
const ws = new WebSocket('ws://localhost:8081/ws/indices');

ws.onopen = () => {
  // Subscribe to specific indices
  ws.send(JSON.stringify({
    action: 'SUBSCRIBE',
    type: 'INDEX',
    symbols: ['NIFTY 50', 'NIFTY BANK', 'NIFTY IT']
  }));
};

ws.onmessage = (event) => {
  const tick = JSON.parse(event.data);
  console.log('Received tick:', tick);
};
```

### 2. `/ws/stocks` - Selective Stock Streaming

Subscribe to specific NSE equity stocks.

**Connection**: `ws://localhost:8081/ws/stocks`

**Usage**:
```javascript
const ws = new WebSocket('ws://localhost:8081/ws/stocks');

ws.onopen = () => {
  // Subscribe to specific stocks
  ws.send(JSON.stringify({
    action: 'SUBSCRIBE',
    type: 'STOCK',
    symbols: ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK']
  }));
};
```

### 3. `/ws/indices/all` - All Indices Streaming

Automatically receive ticks for all NSE indices without explicit subscriptions.

**Connection**: `ws://localhost:8081/ws/indices/all`

**Usage**:
```javascript
const ws = new WebSocket('ws://localhost:8081/ws/indices/all');

ws.onmessage = (event) => {
  const tick = JSON.parse(event.data);
  // Receives ticks for all ~50 NSE indices
  console.log('Index tick:', tick);
};
```

### 4. `/ws/stocks/nse/all` - All Stocks Streaming

Automatically receive ticks for all NSE equity stocks without explicit subscriptions.

**Connection**: `ws://localhost:8081/ws/stocks/nse/all`

**Usage**:
```javascript
const ws = new WebSocket('ws://localhost:8081/ws/stocks/nse/all');

ws.onmessage = (event) => {
  const tick = JSON.parse(event.data);
  // Receives ticks for all ~1800 NSE equity stocks
  console.log('Stock tick:', tick);
};
```

### Subscription Message Format

**Subscribe**:
```json
{
  "action": "SUBSCRIBE",
  "type": "INDEX",
  "symbols": ["NIFTY 50", "NIFTY BANK"]
}
```

**Unsubscribe**:
```json
{
  "action": "UNSUBSCRIBE",
  "type": "INDEX",
  "symbols": ["NIFTY 50"]
}
```

### Tick Response Format

```json
{
  "symbol": "NIFTY 50",
  "instrumentToken": 256265,
  "type": "INDEX",
  "timestamp": "2025-12-08T10:15:03.123+05:30",
  "lastTradedPrice": 23754.25,
  "volume": 12500000,
  "ohlc": {
    "open": 23700.50,
    "high": 23780.00,
    "low": 23650.75,
    "close": 23754.25
  }
}
```

### Error Response Format

```json
{
  "error": true,
  "message": "Invalid subscription message: action must be SUBSCRIBE or UNSUBSCRIBE"
}
```

## REST API Endpoints

### 1. Get Today's Ticks (Cached)

Retrieve today's tick data from Redis cache.

**Endpoint**: `GET /api/ticks/today/{symbol}`

**Query Parameters**:
- `lastMinutes` (optional): Filter ticks from last N minutes

**Examples**:
```bash
# Get all ticks for NIFTY 50 today
curl http://localhost:8081/api/ticks/today/NIFTY%2050

# Get ticks from last 5 minutes
curl http://localhost:8081/api/ticks/today/NIFTY%2050?lastMinutes=5
```

**Response**:
```json
[
  {
    "symbol": "NIFTY 50",
    "instrumentToken": 256265,
    "type": "INDEX",
    "timestamp": "2025-12-08T10:15:03.123+05:30",
    "lastTradedPrice": 23754.25,
    "volume": 12500000,
    "ohlc": {
      "open": 23700.50,
      "high": 23780.00,
      "low": 23650.75,
      "close": 23754.25
    }
  }
]
```

### 2. Get Historical Ticks

Query historical tick data from TimescaleDB.

**Endpoint**: `GET /api/ticks/historical`

**Query Parameters**:
- `symbol` (required): Trading symbol
- `startTime` (required): ISO 8601 timestamp
- `endTime` (required): ISO 8601 timestamp

**Example**:
```bash
curl "http://localhost:8081/api/ticks/historical?symbol=NIFTY%2050&startTime=2025-12-07T09:15:00Z&endTime=2025-12-07T15:30:00Z"
```

### 3. Get Active Subscriptions

View all active WebSocket sessions and their subscriptions.

**Endpoint**: `GET /api/ticks/subscriptions`

**Example**:
```bash
curl http://localhost:8081/api/ticks/subscriptions
```

**Response**:
```json
{
  "session-123": {
    "sessionId": "session-123",
    "endpoint": "/ws/indices",
    "subscribedSymbols": ["NIFTY 50", "NIFTY BANK"],
    "connectedAt": "2025-12-08T09:00:00Z"
  },
  "session-456": {
    "sessionId": "session-456",
    "endpoint": "/ws/stocks/nse/all",
    "subscribedSymbols": [],
    "connectedAt": "2025-12-08T09:05:00Z"
  }
}
```

### 4. Refresh Instrument Cache (Admin)

Manually refresh the instrument cache from the database.

**Endpoint**: `POST /api/ticks/admin/refresh-instruments`

**Example**:
```bash
curl -X POST http://localhost:8081/api/ticks/admin/refresh-instruments
```

**Response**:
```
Instrument cache refreshed successfully
```

## Data Persistence

### Periodic Batch Persistence

The socketengine persists tick data to TimescaleDB in batches to optimize write performance:

- **Frequency**: Every 15 minutes (configurable via `socketengine.persistence.batch-cron`)
- **Batch Size**: 1000 ticks per batch (configurable via `socketengine.persistence.batch-size`)
- **Storage Format**: Raw binary data from Kite API (space-efficient)

### End-of-Day Flush

An additional scheduled job runs at the end of the trading day:

- **Schedule**: 4:00 PM IST on weekdays (configurable via `socketengine.persistence.eod-cron`)
- **Purpose**: Ensures all remaining buffered ticks are persisted before market close

### Database Schema

The `kite_ticks_data` table is a TimescaleDB hypertable optimized for time-series data:

```sql
CREATE TABLE kite_ticks_data (
    instrument_token BIGINT NOT NULL,
    tradingsymbol VARCHAR(50) NOT NULL,
    exchange VARCHAR(10) NOT NULL,
    tick_timestamp TIMESTAMPTZ NOT NULL,
    raw_tick_data BYTEA NOT NULL,
    PRIMARY KEY (instrument_token, tick_timestamp)
);

-- Hypertable with 1-day chunks
SELECT create_hypertable('kite_ticks_data', 'tick_timestamp', 
    chunk_time_interval => INTERVAL '1 day');
```

### Redis Cache Structure

Intraday tick data is cached in Redis for fast queries:

**Key Pattern**: `ticks:{tradingDate}:{symbol}`  
**Type**: List  
**TTL**: 2 days  

**Example**:
```
Key: ticks:2025-12-08:NIFTY 50
Value: [JSON tick 1, JSON tick 2, ...]
```

### Instrument Cache

Instrument lists are cached in Redis to speed up module startup:

**Keys**:
- `instruments:nse:indices` - List of NSE indices
- `instruments:nse:stocks` - List of NSE equity stocks

**TTL**: 1 day

## Troubleshooting

### Issue: Module fails to start with "Kite authentication failed"

**Cause**: Invalid or expired Kite access token.

**Solution**:
1. Kite access tokens expire daily
2. Generate a new access token through the Kite login flow
3. Update the `KITE_ACCESS_TOKEN` environment variable
4. Restart the socketengine module

### Issue: "Failed to connect to Redis"

**Cause**: Redis is not running or connection details are incorrect.

**Solution**:
1. Verify Redis is running: `redis-cli ping` (should return `PONG`)
2. Check Redis connection details in `.env` file
3. Ensure Redis is accessible on the configured host and port
4. If using password authentication, verify `REDIS_PASSWORD` is correct

### Issue: "Failed to connect to database"

**Cause**: TimescaleDB/PostgreSQL is not running or connection details are incorrect.

**Solution**:
1. Verify PostgreSQL is running: `psql -U postgres -d moneytree -c "SELECT 1"`
2. Check database connection details in `.env` file
3. Ensure the `kite_instrument_master` table exists (required for loading instruments)
4. Verify TimescaleDB extension is installed: `SELECT * FROM pg_extension WHERE extname = 'timescaledb'`

### Issue: "No instruments loaded"

**Cause**: The `kite_instrument_master` table is empty or doesn't exist.

**Solution**:
1. Ensure the main backend has populated the `kite_instrument_master` table
2. Run the instrument import process from the backend module
3. Check database logs for any errors during instrument loading

### Issue: WebSocket clients not receiving ticks

**Cause**: Multiple possible causes.

**Troubleshooting Steps**:
1. Check if Kite WebSocket is connected: Look for "Connected to Kite WebSocket" in logs
2. Verify instruments are loaded: Look for "Loaded X instruments" in logs
3. Check if client is properly subscribed: Use `/api/ticks/subscriptions` endpoint
4. Verify the symbol name matches exactly (case-sensitive)
5. Check browser console for WebSocket connection errors

### Issue: High memory usage

**Cause**: Tick buffer growing too large due to database persistence failures.

**Solution**:
1. Check database connectivity and performance
2. Monitor buffer size in logs (logged every 10,000 ticks)
3. If buffer exceeds 100,000 ticks, an alert is logged
4. Investigate and resolve database issues
5. Consider increasing batch persistence frequency if needed

### Issue: Ticks not being persisted to database

**Cause**: Batch persistence job failing or database issues.

**Troubleshooting Steps**:
1. Check logs for "Failed to persist batch" errors
2. Verify database connectivity
3. Check TimescaleDB hypertable is created correctly
4. Verify disk space is available
5. Check database user has INSERT permissions on `kite_ticks_data` table

### Issue: Reconnection loop with Kite WebSocket

**Cause**: Network issues or Kite API problems.

**Solution**:
1. Check network connectivity to `wss://ws.kite.trade`
2. Verify Kite API status (check Zerodha status page)
3. Check if API key/secret are correct
4. Monitor reconnection delay in logs (should use exponential backoff)
5. If authentication errors persist, regenerate access token

### Monitoring and Health Checks

The socketengine exposes Spring Boot Actuator endpoints for monitoring:

**Health Check**: `GET http://localhost:8081/actuator/health`

**Metrics**: `GET http://localhost:8081/actuator/metrics`

Key metrics to monitor:
- `socketengine.ticks.received` - Total ticks received from Kite
- `socketengine.ticks.broadcast` - Total ticks broadcast to clients
- `socketengine.ticks.cached` - Total ticks cached to Redis
- `socketengine.ticks.persisted` - Total ticks persisted to database
- `socketengine.sessions.active` - Number of active WebSocket sessions
- `socketengine.buffer.size` - Current tick buffer size

### Logs

Logs are written to stdout and can be redirected to a file:

```bash
./start-app.sh > socketengine.log 2>&1
```

Log levels can be configured in `application.yml`:

```yaml
logging:
  level:
    com.moneytree.socketengine: DEBUG
    org.springframework.web.socket: DEBUG
```

## Project Structure

```
socketengine/
├── pom.xml                          # Maven configuration
├── .env                             # Environment variables (not committed)
├── start-app.sh                     # Startup script
├── README.md                        # This file
└── src/
    ├── main/
    │   ├── java/com/moneytree/socketengine/
    │   │   ├── SocketEngineApplication.java
    │   │   ├── api/                 # Public WebSocket & REST APIs
    │   │   ├── domain/              # Domain model and events
    │   │   ├── kite/                # Kite WebSocket integration
    │   │   ├── broadcast/           # WebSocket broadcasting
    │   │   ├── redis/               # Redis caching
    │   │   ├── persistence/         # TimescaleDB persistence
    │   │   └── config/              # Configuration classes
    │   └── resources/
    │       └── application.yml      # Application configuration
    └── test/                        # Unit and integration tests
```

## Contributing

When making changes to the socketengine module:

1. Ensure all tests pass: `mvn test`
2. Verify no compilation errors: `mvn clean compile`
3. Test with real Kite WebSocket connection
4. Update this README if adding new features or changing configuration

## License

Proprietary - MoneyTree Application
