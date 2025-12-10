# Design Document

## Overview

The socketengine module is a **standalone Spring Boot 3 application** that serves as a real-time market data streaming engine for the MoneyTree application. It runs as a separate service (on port 8081) alongside the main backend (port 8080) and frontend, sharing the same Redis and TimescaleDB infrastructure. It establishes a single WebSocket connection to Zerodha Kite's market data API, ingests live tick data for NSE indices and equity stocks, and distributes this data to multiple Angular frontend clients through dedicated WebSocket endpoints. The module implements an event-driven architecture where incoming ticks trigger domain events that are consumed by independent components for broadcasting, caching in Redis, and batch persistence to TimescaleDB.

The design emphasizes:
- **Single source of truth**: One Kite WebSocket connection for all market data
- **Selective streaming**: Clients can subscribe to specific instruments or receive all data
- **Event-driven decoupling**: Components react to domain events independently
- **Performance optimization**: Redis caching for intraday data, batch persistence for historical data
- **Space efficiency**: Binary storage of raw Kite responses in TimescaleDB
- **Modulith boundaries**: Clear package structure with Spring Modulith annotations

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Angular Frontend Clients                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Dashboard 1  │  │ Dashboard 2  │  │ Dashboard 3  │  │ Dashboard N  │   │
│  │ WS Client    │  │ WS Client    │  │ WS Client    │  │ WS Client    │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
         │                  │                  │                  │
         │ WebSocket        │ WebSocket        │ WebSocket        │ WebSocket
         ▼                  ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SocketEngine Module (Spring Modulith)                     │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    API Layer (Public Interface)                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │   │
│  │  │ /ws/indices  │  │ /ws/stocks   │  │ REST APIs    │             │   │
│  │  │ (selective)  │  │ (selective)  │  │ /api/ticks/* │             │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘             │   │
│  │  ┌──────────────┐  ┌──────────────┐                                │   │
│  │  │/ws/indices/  │  │/ws/stocks/   │                                │   │
│  │  │    all       │  │  nse/all     │                                │   │
│  │  └──────────────┘  └──────────────┘                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                  │                                           │
│                                  ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │              Domain Event Bus (Spring ApplicationEventPublisher)     │   │
│  │                      TickReceivedEvent                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│         │                        │                        │                  │
│         ▼                        ▼                        ▼                  │
│  ┌─────────────┐        ┌─────────────┐        ┌─────────────┐            │
│  │  WebSocket  │        │   Redis     │        │ TimescaleDB │            │
│  │ Broadcaster │        │   Cache     │        │  Batcher    │            │
│  └─────────────┘        └─────────────┘        └─────────────┘            │
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Kite Integration Layer                            │   │
│  │  ┌──────────────────────────────────────────────────────────────┐  │   │
│  │  │  KiteWebSocketClient                                          │  │   │
│  │  │  - Connects to Kite WebSocket API                            │  │   │
│  │  │  - Subscribes to instrument tokens                           │  │   │
│  │  │  - Parses binary tick data                                   │  │   │
│  │  │  - Publishes TickReceivedEvent                               │  │   │
│  │  │  - Handles reconnection with exponential backoff             │  │   │
│  │  └──────────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
         │                                                      │
         │ WebSocket                                            │ JDBC Query
         ▼                                                      ▼
┌──────────────────────┐                          ┌──────────────────────────┐
│  Zerodha Kite API    │                          │  PostgreSQL/TimescaleDB  │
│  WebSocket Endpoint  │                          │  ┌────────────────────┐  │
│  wss://ws.kite.trade │                          │  │kite_instrument_    │  │
└──────────────────────┘                          │  │     master         │  │
                                                   │  └────────────────────┘  │
                                                   │  ┌────────────────────┐  │
                                                   │  │kite_instrument_    │  │
                                                   │  │     ticks          │  │
                                                   │  │ (hypertable)       │  │
                                                   │  └────────────────────┘  │
                                                   └──────────────────────────┘
         ┌──────────────────────┐
         │   Redis Cache        │
         │  ┌────────────────┐  │
         │  │ ticks:         │  │
         │  │ {date}:{symbol}│  │
         │  │ (List)         │  │
         │  └────────────────┘  │
         └──────────────────────┘
```

### Module Structure (Standalone Spring Boot Application)

```
./socketengine/                   # Standalone Spring Boot application
├── pom.xml                       # Maven configuration
├── .env                          # Environment variables (not committed)
├── start-app.sh                  # Startup script
├── README.md                     # Module documentation
└── src/
    ├── main/
    │   ├── java/
    │   │   └── com/moneytree/socketengine/
    │   │       ├── SocketEngineApplication.java  # Main Spring Boot class
    │   │       ├── package-info.java             # @ApplicationModule
    │   │       ├── api/                          # Public API
    │   │       │   ├── TickWebSocketHandler.java
    │   │       │   ├── TickRestController.java
    │   │       │   └── dto/
    │   │       │       ├── TickDto.java
    │   │       │       ├── SubscriptionRequestDto.java
    │   │       │       └── SubscriptionResponseDto.java
    │   │       ├── domain/                       # Domain model
    │   │       │   ├── Tick.java
    │   │       │   ├── InstrumentInfo.java
    │   │       │   └── events/
    │   │       │       └── TickReceivedEvent.java
    │   │       ├── kite/                         # Kite integration
    │   │       │   ├── KiteWebSocketClient.java
    │   │       │   ├── KiteTickParser.java
    │   │       │   ├── InstrumentLoader.java
    │   │       │   └── ReconnectionStrategy.java
    │   │       ├── broadcast/                    # WebSocket broadcasting
    │   │       │   ├── TickBroadcaster.java
    │   │       │   └── SessionManager.java
    │   │       ├── redis/                        # Redis caching
    │   │       │   ├── TickCacheService.java
    │   │       │   └── RedisConfig.java
    │   │       ├── persistence/                  # TimescaleDB persistence
    │   │       │   ├── TickPersistenceService.java
    │   │       │   ├── TickBatchBuffer.java
    │   │       │   ├── TickEntity.java
    │   │       │   └── TickRepository.java
    │   │       └── config/                       # Configuration
    │   │           ├── SocketEngineProperties.java
    │   │           ├── WebSocketConfig.java
    │   │           ├── AsyncConfig.java
    │   │           └── SchedulingConfig.java
    │   └── resources/
    │       ├── application.yml                   # Application configuration
    │       └── db/migration/                     # Flyway migrations (optional)
    └── test/
        └── java/
            └── com/moneytree/socketengine/       # Test classes
│   ├── TickWebSocketHandler.java
│   ├── TickRestController.java
│   └── dto/
│       ├── TickDto.java
│       ├── SubscriptionRequestDto.java
│       └── SubscriptionResponseDto.java
├── domain/                       # Domain model and events
│   ├── Tick.java
│   ├── InstrumentInfo.java
│   └── events/
│       └── TickReceivedEvent.java
├── kite/                         # Kite integration (internal)
│   ├── KiteWebSocketClient.java
│   ├── KiteTickParser.java
│   ├── InstrumentLoader.java
│   └── ReconnectionStrategy.java
├── broadcast/                    # WebSocket broadcasting (internal)
│   ├── TickBroadcaster.java
│   └── SessionManager.java
├── redis/                        # Redis caching (internal)
│   ├── TickCacheService.java
│   └── RedisConfig.java
├── persistence/                  # TimescaleDB persistence (internal)
│   ├── TickPersistenceService.java
│   ├── TickBatchBuffer.java
│   ├── TickEntity.java
│   └── TickRepository.java
└── config/                       # Configuration
    ├── SocketEngineProperties.java
    ├── WebSocketConfig.java
    └── SchedulingConfig.java
```


### Data Flow Sequences

#### Sequence 1: Module Startup and Kite Connection

```
Application Start
    │
    ├─> InstrumentLoader.loadInstruments()
    │   ├─> Query kite_instrument_master for NSE INDICES
    │   ├─> Query kite_instrument_master for NSE EQ stocks
    │   └─> Store in memory: indicesTokens, stockTokens
    │
    ├─> KiteWebSocketClient.connect()
    │   ├─> Establish WebSocket connection to Kite
    │   ├─> Authenticate with api_key and access_token
    │   ├─> Subscribe to all loaded instrument tokens
    │   └─> Start listening for binary tick data
    │
    └─> WebSocket Endpoints Ready
        ├─> /ws/indices (selective)
        ├─> /ws/stocks (selective)
        ├─> /ws/indices/all (auto-stream)
        └─> /ws/stocks/nse/all (auto-stream)
```

#### Sequence 2: Tick Ingestion and Distribution (Optimized for Performance)

```
Kite WebSocket receives binary tick
    │
    ├─> KiteTickParser.parse(binaryData)
    │   └─> Convert to Tick domain object
    │
    ├─> Publish to Internal Queue/Event Bus (non-blocking)
    │   └─> ApplicationEventPublisher.publish(TickReceivedEvent)
    │
    ├─> HOT PATH (Immediate, synchronous):
    │   │
    │   └─> TickBroadcaster.onTickReceived(event)
    │       ├─> Identify sessions subscribed to this instrument
    │       ├─> Identify /ws/indices/all sessions (if index tick)
    │       ├─> Identify /ws/stocks/nse/all sessions (if stock tick)
    │       └─> Send TickDto JSON to each matching session
    │           (Non-blocking WebSocket send)
    │
    └─> COLD PATH (Asynchronous, separate thread pools):
        │
        ├─> @Async Consumer A: TickCacheService.onTickReceived(event)
        │   ├─> Get current trading date
        │   ├─> Redis key: "ticks:{date}:{symbol}"
        │   ├─> RPUSH tick JSON to Redis List (async)
        │   └─> Set TTL to 2 days (if new key)
        │
        └─> @Async Consumer B: TickBatchBuffer.onTickReceived(event)
            ├─> Add tick to thread-safe in-memory buffer
            └─> Store raw binary data for persistence
                (Batched write every 15 minutes)
```

#### Sequence 3: Client Subscription (Selective Endpoints)

```
Client connects to /ws/indices
    │
    ├─> SessionManager.createSession(sessionId)
    │   └─> Initialize empty subscription set
    │
    ├─> Client sends: {"action":"SUBSCRIBE","type":"INDEX","symbols":["NIFTY 50","BANKNIFTY"]}
    │
    ├─> TickWebSocketHandler.handleSubscription(message)
    │   ├─> Validate message format
    │   ├─> SessionManager.addSubscriptions(sessionId, symbols)
    │   └─> Send confirmation to client
    │
    └─> Future ticks for NIFTY 50 or BANKNIFTY
        └─> Broadcast to this session
```

#### Sequence 4: Batch Persistence (Every 15 minutes)

```
@Scheduled(cron = "0 */15 * * * *")
    │
    ├─> TickPersistenceService.persistBatch()
    │   ├─> TickBatchBuffer.drainBuffer()
    │   │   └─> Returns List<TickEntity> with raw binary data
    │   │
    │   ├─> Batch insert to kite_instrument_ticks
    │   │   INSERT INTO kite_instrument_ticks 
    │   │   (symbol, tick_timestamp, raw_tick_data)
    │   │   VALUES (?, ?, ?)
    │   │   [Use JDBC batch operations]
    │   │
    │   ├─> Log: "Persisted {count} ticks in {duration}ms"
    │   │
    │   └─> On failure:
    │       ├─> Log error with stack trace
    │       ├─> Keep failed batch in buffer
    │       └─> Retry on next scheduled run
```


## Components and Interfaces

### 1. API Layer (Public Interface)

#### TickWebSocketHandler

Handles WebSocket connections and subscription management for all four endpoints.

```java
@Component
public class TickWebSocketHandler extends TextWebSocketHandler {
    
    private final SessionManager sessionManager;
    private final ObjectMapper objectMapper;
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String endpoint = extractEndpoint(session);
        sessionManager.registerSession(session.getId(), endpoint);
        log.info("Client connected: sessionId={}, endpoint={}", session.getId(), endpoint);
    }
    
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        try {
            SubscriptionRequestDto request = objectMapper.readValue(
                message.getPayload(), SubscriptionRequestDto.class);
            
            if ("SUBSCRIBE".equals(request.getAction())) {
                sessionManager.addSubscriptions(session.getId(), request.getSymbols());
                log.info("Subscribed: sessionId={}, symbols={}", 
                    session.getId(), request.getSymbols());
            } else if ("UNSUBSCRIBE".equals(request.getAction())) {
                sessionManager.removeSubscriptions(session.getId(), request.getSymbols());
                log.info("Unsubscribed: sessionId={}, symbols={}", 
                    session.getId(), request.getSymbols());
            }
        } catch (Exception e) {
            sendError(session, "Invalid subscription message: " + e.getMessage());
        }
    }
    
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessionManager.removeSession(session.getId());
        log.info("Client disconnected: sessionId={}, status={}", session.getId(), status);
    }
}
```

#### TickRestController

Provides REST endpoints for querying tick data and subscriptions.

```java
@RestController
@RequestMapping("/api/ticks")
@Tag(name = "Market Ticks", description = "Market tick data operations")
public class TickRestController {
    
    private final TickCacheService cacheService;
    private final TickRepository tickRepository;
    private final SessionManager sessionManager;
    
    @GetMapping("/today/{symbol}")
    public ResponseEntity<List<TickDto>> getTodayTicks(
            @PathVariable String symbol,
            @RequestParam(required = false) Integer lastMinutes) {
        
        List<Tick> ticks = cacheService.getTodayTicks(symbol, lastMinutes);
        return ResponseEntity.ok(ticks.stream()
            .map(this::toDto)
            .collect(Collectors.toList()));
    }
    
    @GetMapping("/historical")
    public ResponseEntity<List<TickDto>> getHistoricalTicks(
            @RequestParam String symbol,
            @RequestParam @DateTimeFormat(iso = ISO.DATE_TIME) Instant startTime,
            @RequestParam @DateTimeFormat(iso = ISO.DATE_TIME) Instant endTime) {
        
        if (startTime.isAfter(endTime)) {
            return ResponseEntity.badRequest().build();
        }
        
        List<TickEntity> entities = tickRepository.findByTradingSymbolAndTimestampBetween(
            symbol, startTime, endTime);
        
        // Parse raw binary data on demand
        List<TickDto> ticks = entities.stream()
            .map(entity -> parseRawTickData(entity.getRawTickData()))
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(ticks);
    }
    
    @GetMapping("/subscriptions")
    public ResponseEntity<Map<String, SubscriptionResponseDto>> getActiveSubscriptions() {
        return ResponseEntity.ok(sessionManager.getAllSubscriptions());
    }
    
    @PostMapping("/admin/refresh-instruments")
    public ResponseEntity<String> refreshInstrumentCache() {
        try {
            instrumentLoader.refreshCache();
            return ResponseEntity.ok("Instrument cache refreshed successfully");
        } catch (Exception e) {
            log.error("Failed to refresh instrument cache", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to refresh cache: " + e.getMessage());
        }
    }
}
```


### 2. Domain Layer

#### Tick (Domain Model)

```java
@Value
@Builder
public class Tick {
    String symbol;
    long instrumentToken;
    InstrumentType type;  // INDEX or STOCK
    Instant timestamp;
    double lastTradedPrice;
    long volume;
    OHLC ohlc;
    byte[] rawBinaryData;  // Original binary response from Kite
    
    @Value
    @Builder
    public static class OHLC {
        double open;
        double high;
        double low;
        double close;
    }
}
```

#### TickReceivedEvent (Domain Event)

```java
public record TickReceivedEvent(
    Tick tick,
    Instant receivedAt
) {
    public TickReceivedEvent(Tick tick) {
        this(tick, Instant.now());
    }
}
```

#### InstrumentInfo

```java
@Value
@Builder
public class InstrumentInfo {
    long instrumentToken;
    long exchangeToken;
    String tradingSymbol;
    InstrumentType type;  // INDEX or STOCK
}
```

### 3. Kite Integration Layer

#### KiteWebSocketClient

Manages the single WebSocket connection to Kite and publishes tick events.

```java
@Component
@Slf4j
public class KiteWebSocketClient {
    
    private final SocketEngineProperties properties;
    private final ApplicationEventPublisher eventPublisher;
    private final KiteTickParser tickParser;
    private final ReconnectionStrategy reconnectionStrategy;
    private final InstrumentLoader instrumentLoader;
    
    private WebSocketClient webSocketClient;
    private volatile boolean connected = false;
    
    @PostConstruct
    public void initialize() {
        // Load instruments from database
        List<InstrumentInfo> instruments = instrumentLoader.loadAllInstruments();
        log.info("Loaded {} instruments for subscription", instruments.size());
        
        // Connect to Kite
        connect(instruments);
    }
    
    private void connect(List<InstrumentInfo> instruments) {
        try {
            String wsUrl = properties.getKite().getWebsocketUrl();
            String apiKey = properties.getKite().getApiKey();
            String accessToken = properties.getKite().getAccessToken();
            
            webSocketClient = new WebSocketClient(new URI(wsUrl)) {
                @Override
                public void onOpen(ServerHandshake handshake) {
                    log.info("Connected to Kite WebSocket");
                    connected = true;
                    reconnectionStrategy.reset();
                    
                    // Subscribe to all instruments
                    subscribeToInstruments(instruments);
                }
                
                @Override
                public void onMessage(ByteBuffer bytes) {
                    try {
                        List<Tick> ticks = tickParser.parse(bytes.array());
                        ticks.forEach(tick -> 
                            eventPublisher.publishEvent(new TickReceivedEvent(tick)));
                    } catch (Exception e) {
                        log.error("Error parsing tick data", e);
                    }
                }
                
                @Override
                public void onClose(int code, String reason, boolean remote) {
                    log.warn("Kite WebSocket closed: code={}, reason={}, remote={}", 
                        code, reason, remote);
                    connected = false;
                    scheduleReconnection(instruments);
                }
                
                @Override
                public void onError(Exception ex) {
                    log.error("Kite WebSocket error", ex);
                }
            };
            
            webSocketClient.addHeader("X-Kite-Version", "3");
            webSocketClient.addHeader("Authorization", "token " + apiKey + ":" + accessToken);
            webSocketClient.connect();
            
        } catch (Exception e) {
            log.error("Failed to connect to Kite WebSocket", e);
            scheduleReconnection(instruments);
        }
    }
    
    private void scheduleReconnection(List<InstrumentInfo> instruments) {
        long delaySeconds = reconnectionStrategy.getNextDelay();
        log.info("Scheduling reconnection in {} seconds", delaySeconds);
        
        CompletableFuture.delayedExecutor(delaySeconds, TimeUnit.SECONDS)
            .execute(() -> connect(instruments));
    }
    
    private void subscribeToInstruments(List<InstrumentInfo> instruments) {
        // Build subscription message for Kite API
        List<Long> tokens = instruments.stream()
            .map(InstrumentInfo::getInstrumentToken)
            .collect(Collectors.toList());
        
        // Kite subscription format: {"a":"subscribe","v":tokens}
        String subscriptionMsg = String.format(
            "{\"a\":\"subscribe\",\"v\":%s}", 
            new ObjectMapper().writeValueAsString(tokens));
        
        webSocketClient.send(subscriptionMsg);
        log.info("Subscribed to {} instruments", tokens.size());
    }
}
```


#### InstrumentLoader

Loads instrument tokens from Redis cache or database on startup. Caches results in Redis with 1-day TTL.

```java
@Component
@Slf4j
public class InstrumentLoader {
    
    private static final String INDICES_CACHE_KEY = "instruments:nse:indices";
    private static final String STOCKS_CACHE_KEY = "instruments:nse:stocks";
    private static final Duration CACHE_TTL = Duration.ofDays(1);
    
    private final JdbcTemplate jdbcTemplate;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    private final Map<Long, InstrumentInfo> indicesMap = new ConcurrentHashMap<>();
    private final Map<Long, InstrumentInfo> stocksMap = new ConcurrentHashMap<>();
    
    public List<InstrumentInfo> loadAllInstruments() {
        loadIndices();
        loadStocks();
        
        List<InstrumentInfo> all = new ArrayList<>();
        all.addAll(indicesMap.values());
        all.addAll(stocksMap.values());
        return all;
    }
    
    private void loadIndices() {
        // Try to load from Redis cache first
        List<InstrumentInfo> indices = loadFromCache(INDICES_CACHE_KEY);
        
        if (indices == null || indices.isEmpty()) {
            log.info("Indices not found in cache, loading from database");
            indices = loadIndicesFromDatabase();
            cacheInstruments(INDICES_CACHE_KEY, indices);
        } else {
            log.info("Loaded {} NSE indices from cache", indices.size());
        }
        
        indices.forEach(info -> indicesMap.put(info.getInstrumentToken(), info));
    }
    
    private List<InstrumentInfo> loadIndicesFromDatabase() {
        String sql = """
            SELECT instrument_token, exchange_token, tradingsymbol
            FROM kite_instrument_master
            WHERE exchange = 'NSE' AND segment = 'INDICES'
            """;
        
        List<InstrumentInfo> indices = jdbcTemplate.query(sql, (rs, rowNum) ->
            InstrumentInfo.builder()
                .instrumentToken(rs.getLong("instrument_token"))
                .exchangeToken(rs.getLong("exchange_token"))
                .tradingSymbol(rs.getString("tradingsymbol"))
                .type(InstrumentType.INDEX)
                .build()
        );
        
        log.info("Loaded {} NSE indices from database", indices.size());
        return indices;
    }
    
    private void loadStocks() {
        // Try to load from Redis cache first
        List<InstrumentInfo> stocks = loadFromCache(STOCKS_CACHE_KEY);
        
        if (stocks == null || stocks.isEmpty()) {
            log.info("Stocks not found in cache, loading from database");
            stocks = loadStocksFromDatabase();
            cacheInstruments(STOCKS_CACHE_KEY, stocks);
        } else {
            log.info("Loaded {} NSE equity stocks from cache", stocks.size());
        }
        
        stocks.forEach(info -> stocksMap.put(info.getInstrumentToken(), info));
    }
    
    private List<InstrumentInfo> loadStocksFromDatabase() {
        String sql = """
            SELECT instrument_token, exchange_token, tradingsymbol
            FROM kite_instrument_master
            WHERE exchange = 'NSE' 
              AND segment = 'NSE'
              AND instrument_type = 'EQ'
              AND expiry IS NULL
              AND lot_size = 1
              AND name IS NOT NULL
              AND name NOT LIKE '%LOAN%'
            ORDER BY tradingsymbol
            """;
        
        List<InstrumentInfo> stocks = jdbcTemplate.query(sql, (rs, rowNum) ->
            InstrumentInfo.builder()
                .instrumentToken(rs.getLong("instrument_token"))
                .exchangeToken(rs.getLong("exchange_token"))
                .tradingSymbol(rs.getString("tradingsymbol"))
                .type(InstrumentType.STOCK)
                .build()
        );
        
        log.info("Loaded {} NSE equity stocks from database", stocks.size());
        return stocks;
    }
    
    private List<InstrumentInfo> loadFromCache(String cacheKey) {
        try {
            List<String> cachedJson = redisTemplate.opsForList().range(cacheKey, 0, -1);
            if (cachedJson == null || cachedJson.isEmpty()) {
                return null;
            }
            
            return cachedJson.stream()
                .map(json -> {
                    try {
                        return objectMapper.readValue(json, InstrumentInfo.class);
                    } catch (Exception e) {
                        log.warn("Failed to deserialize instrument from cache", e);
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            log.warn("Failed to load instruments from cache: {}", e.getMessage());
            return null;
        }
    }
    
    private void cacheInstruments(String cacheKey, List<InstrumentInfo> instruments) {
        try {
            // Delete existing cache
            redisTemplate.delete(cacheKey);
            
            // Cache each instrument as JSON
            List<String> jsonList = instruments.stream()
                .map(info -> {
                    try {
                        return objectMapper.writeValueAsString(info);
                    } catch (Exception e) {
                        log.warn("Failed to serialize instrument", e);
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
            
            if (!jsonList.isEmpty()) {
                redisTemplate.opsForList().rightPushAll(cacheKey, jsonList);
                redisTemplate.expire(cacheKey, CACHE_TTL);
                log.info("Cached {} instruments to Redis with {} TTL", 
                    jsonList.size(), CACHE_TTL);
            }
            
        } catch (Exception e) {
            log.error("Failed to cache instruments to Redis", e);
            // Don't throw - caching failure shouldn't prevent startup
        }
    }
    
    /**
     * Manually refresh instrument cache from database
     * Can be called via admin endpoint or scheduled job
     */
    public void refreshCache() {
        log.info("Manually refreshing instrument cache");
        
        List<InstrumentInfo> indices = loadIndicesFromDatabase();
        cacheInstruments(INDICES_CACHE_KEY, indices);
        indicesMap.clear();
        indices.forEach(info -> indicesMap.put(info.getInstrumentToken(), info));
        
        List<InstrumentInfo> stocks = loadStocksFromDatabase();
        cacheInstruments(STOCKS_CACHE_KEY, stocks);
        stocksMap.clear();
        stocks.forEach(info -> stocksMap.put(info.getInstrumentToken(), info));
        
        log.info("Instrument cache refreshed successfully");
    }
    
    public boolean isIndexToken(long instrumentToken) {
        return indicesMap.containsKey(instrumentToken);
    }
    
    public boolean isStockToken(long instrumentToken) {
        return stocksMap.containsKey(instrumentToken);
    }
    
    public InstrumentInfo getInstrumentInfo(long instrumentToken) {
        InstrumentInfo info = indicesMap.get(instrumentToken);
        if (info == null) {
            info = stocksMap.get(instrumentToken);
        }
        return info;
    }
}
```

#### ReconnectionStrategy

Implements exponential backoff for reconnection attempts.

```java
@Component
public class ReconnectionStrategy {
    
    private static final long MIN_DELAY_SECONDS = 1;
    private static final long MAX_DELAY_SECONDS = 60;
    
    private final AtomicInteger attemptCount = new AtomicInteger(0);
    
    public long getNextDelay() {
        int attempt = attemptCount.incrementAndGet();
        long delay = Math.min(
            MIN_DELAY_SECONDS * (1L << (attempt - 1)),  // Exponential: 1, 2, 4, 8, 16, 32, 60
            MAX_DELAY_SECONDS
        );
        return delay;
    }
    
    public void reset() {
        attemptCount.set(0);
    }
}
```


### 4. Broadcast Layer (Hot Path - Synchronous)

#### TickBroadcaster

Immediately broadcasts ticks to connected WebSocket clients. This is the hot path and must be fast.

```java
@Component
@Slf4j
public class TickBroadcaster {
    
    private final SessionManager sessionManager;
    private final InstrumentLoader instrumentLoader;
    private final ObjectMapper objectMapper;
    
    /**
     * Hot path: Synchronous event listener for immediate broadcast
     * This runs on the same thread as the Kite WebSocket receiver
     */
    @EventListener
    public void onTickReceived(TickReceivedEvent event) {
        Tick tick = event.tick();
        
        try {
            // Convert to DTO once
            TickDto dto = toDto(tick);
            String json = objectMapper.writeValueAsString(dto);
            
            // Determine which sessions should receive this tick
            Set<String> targetSessions = new HashSet<>();
            
            // 1. Sessions with explicit subscriptions
            targetSessions.addAll(
                sessionManager.getSessionsSubscribedTo(tick.getSymbol()));
            
            // 2. /ws/indices/all sessions (if this is an index tick)
            if (instrumentLoader.isIndexToken(tick.getInstrumentToken())) {
                targetSessions.addAll(sessionManager.getIndicesAllSessions());
            }
            
            // 3. /ws/stocks/nse/all sessions (if this is a stock tick)
            if (instrumentLoader.isStockToken(tick.getInstrumentToken())) {
                targetSessions.addAll(sessionManager.getStocksAllSessions());
            }
            
            // Broadcast to all target sessions (non-blocking)
            targetSessions.forEach(sessionId -> {
                try {
                    sessionManager.sendMessage(sessionId, json);
                } catch (Exception e) {
                    log.warn("Failed to send tick to session {}: {}", 
                        sessionId, e.getMessage());
                }
            });
            
        } catch (Exception e) {
            log.error("Error broadcasting tick for {}", tick.getSymbol(), e);
        }
    }
    
    private TickDto toDto(Tick tick) {
        return TickDto.builder()
            .symbol(tick.getSymbol())
            .instrumentToken(tick.getInstrumentToken())
            .type(tick.getType().name())
            .timestamp(tick.getTimestamp().toString())
            .lastTradedPrice(tick.getLastTradedPrice())
            .volume(tick.getVolume())
            .ohlc(new TickDto.OHLCDto(
                tick.getOhlc().getOpen(),
                tick.getOhlc().getHigh(),
                tick.getOhlc().getLow(),
                tick.getOhlc().getClose()
            ))
            .build();
    }
}
```

#### SessionManager

Manages WebSocket sessions and their subscriptions with thread-safe collections.

```java
@Component
@Slf4j
public class SessionManager {
    
    // Thread-safe collections for concurrent access
    private final ConcurrentHashMap<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, String> sessionEndpoints = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Set<String>> sessionSubscriptions = new ConcurrentHashMap<>();
    
    // Reverse index: symbol -> sessions subscribed to it
    private final ConcurrentHashMap<String, Set<String>> symbolToSessions = new ConcurrentHashMap<>();
    
    public void registerSession(String sessionId, String endpoint, WebSocketSession session) {
        sessions.put(sessionId, session);
        sessionEndpoints.put(sessionId, endpoint);
        sessionSubscriptions.put(sessionId, ConcurrentHashMap.newKeySet());
        log.info("Registered session: {} on endpoint: {}", sessionId, endpoint);
    }
    
    public void addSubscriptions(String sessionId, List<String> symbols) {
        Set<String> subs = sessionSubscriptions.get(sessionId);
        if (subs != null) {
            subs.addAll(symbols);
            
            // Update reverse index
            symbols.forEach(symbol -> 
                symbolToSessions.computeIfAbsent(symbol, k -> ConcurrentHashMap.newKeySet())
                    .add(sessionId)
            );
        }
    }
    
    public void removeSubscriptions(String sessionId, List<String> symbols) {
        Set<String> subs = sessionSubscriptions.get(sessionId);
        if (subs != null) {
            subs.removeAll(symbols);
            
            // Update reverse index
            symbols.forEach(symbol -> {
                Set<String> sessions = symbolToSessions.get(symbol);
                if (sessions != null) {
                    sessions.remove(sessionId);
                }
            });
        }
    }
    
    public void removeSession(String sessionId) {
        sessions.remove(sessionId);
        sessionEndpoints.remove(sessionId);
        
        // Clean up subscriptions
        Set<String> subs = sessionSubscriptions.remove(sessionId);
        if (subs != null) {
            subs.forEach(symbol -> {
                Set<String> sessions = symbolToSessions.get(symbol);
                if (sessions != null) {
                    sessions.remove(sessionId);
                }
            });
        }
        
        log.info("Removed session: {}", sessionId);
    }
    
    public Set<String> getSessionsSubscribedTo(String symbol) {
        return symbolToSessions.getOrDefault(symbol, Collections.emptySet());
    }
    
    public Set<String> getIndicesAllSessions() {
        return sessionEndpoints.entrySet().stream()
            .filter(e -> "/ws/indices/all".equals(e.getValue()))
            .map(Map.Entry::getKey)
            .collect(Collectors.toSet());
    }
    
    public Set<String> getStocksAllSessions() {
        return sessionEndpoints.entrySet().stream()
            .filter(e -> "/ws/stocks/nse/all".equals(e.getValue()))
            .map(Map.Entry::getKey)
            .collect(Collectors.toSet());
    }
    
    public void sendMessage(String sessionId, String message) throws IOException {
        WebSocketSession session = sessions.get(sessionId);
        if (session != null && session.isOpen()) {
            session.sendMessage(new TextMessage(message));
        }
    }
}
```


### 5. Redis Cache Layer (Cold Path - Asynchronous Consumer A)

#### TickCacheService

Asynchronously caches ticks to Redis for fast intraday queries.

```java
@Component
@Slf4j
public class TickCacheService {
    
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    
    /**
     * Cold path: Asynchronous event listener for Redis caching
     * Runs on separate thread pool to avoid blocking the hot path
     */
    @Async("tickCacheExecutor")
    @EventListener
    @Order(1)  // Lower priority than broadcast
    public void onTickReceived(TickReceivedEvent event) {
        Tick tick = event.tick();
        
        try {
            String tradingDate = getTradingDate();
            String key = String.format("ticks:%s:%s", tradingDate, tick.getSymbol());
            
            // Serialize tick to JSON
            String tickJson = objectMapper.writeValueAsString(toDto(tick));
            
            // Append to Redis List (RPUSH is O(1))
            redisTemplate.opsForList().rightPush(key, tickJson);
            
            // Set TTL on first write (2 days)
            if (redisTemplate.getExpire(key) == -1) {
                redisTemplate.expire(key, Duration.ofDays(2));
            }
            
        } catch (Exception e) {
            log.error("Error caching tick for {}: {}", tick.getSymbol(), e.getMessage());
            // Don't rethrow - cache failures shouldn't affect other consumers
        }
    }
    
    public List<Tick> getTodayTicks(String symbol, Integer lastMinutes) {
        String tradingDate = getTradingDate();
        String key = String.format("ticks:%s:%s", tradingDate, symbol);
        
        List<String> tickJsonList = redisTemplate.opsForList().range(key, 0, -1);
        if (tickJsonList == null) {
            return Collections.emptyList();
        }
        
        Stream<String> stream = tickJsonList.stream();
        
        // Filter by time window if requested
        if (lastMinutes != null) {
            Instant cutoff = Instant.now().minus(Duration.ofMinutes(lastMinutes));
            stream = stream.filter(json -> {
                try {
                    TickDto dto = objectMapper.readValue(json, TickDto.class);
                    return Instant.parse(dto.getTimestamp()).isAfter(cutoff);
                } catch (Exception e) {
                    return false;
                }
            });
        }
        
        return stream
            .map(this::fromJson)
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }
    
    private String getTradingDate() {
        // Get current date in IST timezone
        return ZonedDateTime.now(ZoneId.of("Asia/Kolkata"))
            .toLocalDate()
            .toString();
    }
}
```

### 6. Persistence Layer (Cold Path - Asynchronous Consumer B)

#### TickBatchBuffer

Thread-safe buffer that accumulates ticks for batch persistence.

```java
@Component
@Slf4j
public class TickBatchBuffer {
    
    private final ConcurrentLinkedQueue<TickEntity> buffer = new ConcurrentLinkedQueue<>();
    private final AtomicLong bufferSize = new AtomicLong(0);
    
    /**
     * Cold path: Asynchronous event listener for buffering
     * Runs on separate thread pool to avoid blocking the hot path
     */
    @Async("tickPersistenceExecutor")
    @EventListener
    @Order(2)  // Lower priority than broadcast and cache
    public void onTickReceived(TickReceivedEvent event) {
        Tick tick = event.tick();
        InstrumentInfo info = instrumentLoader.getInstrumentInfo(tick.getInstrumentToken());
        
        try {
            TickEntity entity = TickEntity.builder()
                .instrumentToken(tick.getInstrumentToken())
                .tradingSymbol(info != null ? info.getTradingSymbol() : tick.getSymbol())
                .exchange(info != null ? getExchange(info) : "NSE")
                .tickTimestamp(tick.getTimestamp())
                .rawTickData(tick.getRawBinaryData())  // Store raw binary from Kite
                .build();
            
            buffer.offer(entity);
            long size = bufferSize.incrementAndGet();
            
            if (size % 10000 == 0) {
                log.debug("Buffer size: {} ticks", size);
            }
            
        } catch (Exception e) {
            log.error("Error buffering tick for {}: {}", tick.getSymbol(), e.getMessage());
        }
    }
    
    public List<TickEntity> drainBuffer() {
        List<TickEntity> batch = new ArrayList<>();
        TickEntity entity;
        
        while ((entity = buffer.poll()) != null) {
            batch.add(entity);
        }
        
        bufferSize.set(0);
        return batch;
    }
    
    public long getBufferSize() {
        return bufferSize.get();
    }
}
```

#### TickPersistenceService

Scheduled service that batch-persists ticks to TimescaleDB every 15 minutes.

```java
@Service
@Slf4j
public class TickPersistenceService {
    
    private final TickBatchBuffer buffer;
    private final JdbcTemplate jdbcTemplate;
    
    @Scheduled(cron = "0 */15 * * * *")  // Every 15 minutes
    public void persistBatch() {
        long startTime = System.currentTimeMillis();
        
        List<TickEntity> batch = buffer.drainBuffer();
        if (batch.isEmpty()) {
            log.debug("No ticks to persist");
            return;
        }
        
        try {
            int rowsInserted = batchInsert(batch);
            long duration = System.currentTimeMillis() - startTime;
            
            log.info("Persisted {} ticks to TimescaleDB in {}ms", rowsInserted, duration);
            
        } catch (Exception e) {
            log.error("Failed to persist batch of {} ticks", batch.size(), e);
            
            // Re-add failed batch to buffer for retry
            batch.forEach(buffer::onTickReceived);
        }
    }
    
    @Scheduled(cron = "0 0 16 * * MON-FRI")  // End of trading day (4 PM IST)
    public void endOfDayFlush() {
        log.info("Executing end-of-day flush");
        persistBatch();
    }
    
    private int batchInsert(List<TickEntity> entities) {
        String sql = """
            INSERT INTO kite_ticks_data 
            (instrument_token, tradingsymbol, exchange, tick_timestamp, raw_tick_data)
            VALUES (?, ?, ?, ?, ?)
            """;
        
        return jdbcTemplate.batchUpdate(sql, entities, 1000, (ps, entity) -> {
            ps.setLong(1, entity.getInstrumentToken());
            ps.setString(2, entity.getTradingSymbol());
            ps.setString(3, entity.getExchange());
            ps.setTimestamp(4, Timestamp.from(entity.getTickTimestamp()));
            ps.setBytes(5, entity.getRawTickData());
        }).length;
    }
}
```


### 7. Configuration

#### AsyncConfig

Configures separate thread pools for async consumers to prevent blocking the hot path.

```java
@Configuration
@EnableAsync
public class AsyncConfig {
    
    /**
     * Thread pool for Redis caching (Consumer A)
     * Higher throughput, can tolerate some latency
     */
    @Bean(name = "tickCacheExecutor")
    public Executor tickCacheExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(10000);
        executor.setThreadNamePrefix("tick-cache-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
    
    /**
     * Thread pool for persistence buffering (Consumer B)
     * Lower priority, can handle backpressure
     */
    @Bean(name = "tickPersistenceExecutor")
    public Executor tickPersistenceExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(4);
        executor.setQueueCapacity(20000);
        executor.setThreadNamePrefix("tick-persist-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}
```

#### WebSocketConfig

Configures WebSocket endpoints and routing.

```java
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    
    private final TickWebSocketHandler tickWebSocketHandler;
    
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(tickWebSocketHandler, 
                "/ws/indices", 
                "/ws/stocks",
                "/ws/indices/all",
                "/ws/stocks/nse/all")
            .setAllowedOrigins("*")  // Configure appropriately for production
            .withSockJS();  // Fallback for browsers without WebSocket support
    }
}
```

#### SocketEngineProperties

Externalized configuration properties.

```java
@ConfigurationProperties(prefix = "socketengine")
@Validated
public class SocketEngineProperties {
    
    @NotNull
    private KiteConfig kite;
    
    @NotNull
    private RedisConfig redis;
    
    @NotNull
    private PersistenceConfig persistence;
    
    @Data
    public static class KiteConfig {
        @NotBlank
        private String apiKey;
        
        @NotBlank
        private String apiSecret;
        
        @NotBlank
        private String accessToken;
        
        private String websocketUrl = "wss://ws.kite.trade";
    }
    
    @Data
    public static class RedisConfig {
        private String host = "localhost";
        private int port = 6379;
        private String password;
        private int database = 0;
    }
    
    @Data
    public static class PersistenceConfig {
        private int batchSize = 1000;
        private String batchCron = "0 */15 * * * *";  // Every 15 minutes
        private String eodCron = "0 0 16 * * MON-FRI";  // 4 PM IST on weekdays
    }
    
    // Getters and setters
}
```

#### application.yml

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
    batch-cron: "0 */15 * * * *"
    eod-cron: "0 0 16 * * MON-FRI"

spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/moneytree}
    username: ${DB_USERNAME:postgres}
    password: ${DB_PASSWORD:postgres}
```


## Data Models

### Database Schema

#### kite_ticks_data (TimescaleDB Hypertable)

```sql
CREATE TABLE IF NOT EXISTS kite_ticks_data (
    instrument_token BIGINT NOT NULL,
    tradingsymbol VARCHAR(50) NOT NULL,
    exchange VARCHAR(10) NOT NULL,
    tick_timestamp TIMESTAMPTZ NOT NULL,
    raw_tick_data BYTEA NOT NULL,
    PRIMARY KEY (instrument_token, tick_timestamp)
);

-- Convert to hypertable (TimescaleDB)
SELECT create_hypertable('kite_ticks_data', 'tick_timestamp', 
    if_not_exists => TRUE,
    chunk_time_interval => INTERVAL '1 day');

-- Create index for efficient queries by tradingsymbol
CREATE INDEX IF NOT EXISTS idx_kite_ticks_symbol_time 
    ON kite_ticks_data (tradingsymbol, tick_timestamp DESC);

-- Create index for efficient queries by exchange
CREATE INDEX IF NOT EXISTS idx_kite_ticks_exchange_time 
    ON kite_ticks_data (exchange, tick_timestamp DESC);

-- Create composite index for instrument_token queries
CREATE INDEX IF NOT EXISTS idx_kite_ticks_token_time 
    ON kite_ticks_data (instrument_token, tick_timestamp DESC);

-- Enable compression for older data (optional)
ALTER TABLE kite_ticks_data SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'instrument_token, tradingsymbol, exchange'
);

-- Compress chunks older than 7 days
SELECT add_compression_policy('kite_ticks_data', INTERVAL '7 days');
```

### Entity Classes

#### TickEntity

```java
@Entity
@Table(name = "kite_ticks_data")
@IdClass(TickEntityId.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TickEntity {
    
    @Id
    @Column(name = "instrument_token", nullable = false)
    private Long instrumentToken;
    
    @Column(name = "tradingsymbol", nullable = false, length = 50)
    private String tradingSymbol;
    
    @Column(name = "exchange", nullable = false, length = 10)
    private String exchange;
    
    @Id
    @Column(name = "tick_timestamp", nullable = false)
    private Instant tickTimestamp;
    
    @Column(name = "raw_tick_data", nullable = false)
    @Lob
    private byte[] rawTickData;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TickEntityId implements Serializable {
    private Long instrumentToken;
    private Instant tickTimestamp;
}
```

#### TickRepository

```java
@Repository
public interface TickRepository extends JpaRepository<TickEntity, TickEntityId> {
    
    @Query("""
        SELECT t FROM TickEntity t 
        WHERE t.tradingSymbol = :tradingSymbol 
        AND t.tickTimestamp BETWEEN :startTime AND :endTime
        ORDER BY t.tickTimestamp ASC
        """)
    List<TickEntity> findByTradingSymbolAndTimestampBetween(
        @Param("tradingSymbol") String tradingSymbol,
        @Param("startTime") Instant startTime,
        @Param("endTime") Instant endTime
    );
    
    @Query("""
        SELECT t FROM TickEntity t 
        WHERE t.instrumentToken = :instrumentToken 
        AND t.tickTimestamp BETWEEN :startTime AND :endTime
        ORDER BY t.tickTimestamp ASC
        """)
    List<TickEntity> findByInstrumentTokenAndTimestampBetween(
        @Param("instrumentToken") Long instrumentToken,
        @Param("startTime") Instant startTime,
        @Param("endTime") Instant endTime
    );
    
    @Query("""
        SELECT t FROM TickEntity t 
        WHERE t.exchange = :exchange 
        AND t.tickTimestamp BETWEEN :startTime AND :endTime
        ORDER BY t.tickTimestamp ASC
        """)
    List<TickEntity> findByExchangeAndTimestampBetween(
        @Param("exchange") String exchange,
        @Param("startTime") Instant startTime,
        @Param("endTime") Instant endTime
    );
    
    @Query("""
        SELECT t FROM TickEntity t 
        WHERE t.tickTimestamp BETWEEN :startTime AND :endTime
        ORDER BY t.tickTimestamp ASC
        """)
    List<TickEntity> findByTimestampBetween(
        @Param("startTime") Instant startTime,
        @Param("endTime") Instant endTime
    );
}
```

### DTOs

#### TickDto

```java
@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TickDto {
    private String symbol;
    private long instrumentToken;
    private String type;  // "INDEX" or "STOCK"
    private String timestamp;  // ISO 8601 format
    private double lastTradedPrice;
    private long volume;
    private OHLCDto ohlc;
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class OHLCDto {
        private double open;
        private double high;
        private double low;
        private double close;
    }
}
```

#### SubscriptionRequestDto

```java
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SubscriptionRequestDto {
    
    @NotBlank
    @Pattern(regexp = "SUBSCRIBE|UNSUBSCRIBE")
    private String action;
    
    @NotBlank
    @Pattern(regexp = "INDEX|STOCK")
    private String type;
    
    @NotEmpty
    private List<String> symbols;
}
```

#### SubscriptionResponseDto

```java
@Data
@Builder
public class SubscriptionResponseDto {
    private String sessionId;
    private String endpoint;
    private Set<String> subscribedSymbols;
    private Instant connectedAt;
}
```

### Redis Data Structures

#### 1. Tick Data Cache (Intraday)

```
Key Pattern: ticks:{tradingDate}:{symbol}
Type: List
Value: JSON strings of TickDto
TTL: 2 days

Example:
Key: ticks:2025-12-08:NIFTY 50
Value: [
  "{\"symbol\":\"NIFTY 50\",\"instrumentToken\":256265,\"type\":\"INDEX\",\"timestamp\":\"2025-12-08T09:15:00.123+05:30\",\"lastTradedPrice\":23754.25,...}",
  "{\"symbol\":\"NIFTY 50\",\"instrumentToken\":256265,\"type\":\"INDEX\",\"timestamp\":\"2025-12-08T09:15:01.456+05:30\",\"lastTradedPrice\":23755.50,...}",
  ...
]
```

#### 2. Instrument Lists Cache (Reference Data)

```
Key Pattern: instruments:nse:indices
Type: List
Value: JSON strings of InstrumentInfo
TTL: 1 day

Example:
Key: instruments:nse:indices
Value: [
  "{\"instrumentToken\":256265,\"exchangeToken\":1024,\"tradingSymbol\":\"NIFTY 50\",\"type\":\"INDEX\"}",
  "{\"instrumentToken\":260105,\"exchangeToken\":1016,\"tradingSymbol\":\"NIFTY BANK\",\"type\":\"INDEX\"}",
  ...
]

Key Pattern: instruments:nse:stocks
Type: List
Value: JSON strings of InstrumentInfo
TTL: 1 day

Example:
Key: instruments:nse:stocks
Value: [
  "{\"instrumentToken\":738561,\"exchangeToken\":2885,\"tradingSymbol\":\"RELIANCE\",\"type\":\"STOCK\"}",
  "{\"instrumentToken\":408065,\"exchangeToken\":1594,\"tradingSymbol\":\"INFY\",\"type\":\"STOCK\"}",
  ...
]
```

**Benefits of Caching Instrument Lists**:
- Faster module startup (no database query needed)
- Reduced database load on restarts
- Instruments rarely change (daily at most)
- Can be refreshed manually via admin endpoint if needed


## Error Handling

### 1. Kite WebSocket Connection Errors

**Scenario**: Connection drops, authentication fails, or network issues occur

**Handling**:
- Log error with full context (attempt number, error message, stack trace)
- Implement exponential backoff reconnection strategy (1s, 2s, 4s, 8s, 16s, 32s, 60s max)
- For authentication failures, stop reconnection attempts and alert operators
- Maintain connection state monitoring with health check endpoint

```java
@Override
public void onError(Exception ex) {
    if (ex instanceof AuthenticationException) {
        log.error("Kite authentication failed - stopping reconnection attempts", ex);
        connected = false;
        // Don't schedule reconnection for auth failures
    } else {
        log.error("Kite WebSocket error - will attempt reconnection", ex);
        scheduleReconnection(instruments);
    }
}
```

### 2. Tick Parsing Errors

**Scenario**: Binary data from Kite is malformed or unexpected format

**Handling**:
- Log the error with hex dump of problematic binary data
- Skip the malformed tick and continue processing
- Increment error counter for monitoring
- Don't crash the WebSocket connection

```java
@Override
public void onMessage(ByteBuffer bytes) {
    try {
        List<Tick> ticks = tickParser.parse(bytes.array());
        ticks.forEach(tick -> eventPublisher.publishEvent(new TickReceivedEvent(tick)));
    } catch (Exception e) {
        log.error("Error parsing tick data: {}", 
            HexFormat.of().formatHex(bytes.array()), e);
        metrics.incrementParseErrors();
        // Continue processing - don't let one bad tick break everything
    }
}
```

### 3. WebSocket Broadcast Errors

**Scenario**: Client connection is closed or network issue prevents sending

**Handling**:
- Catch IOException when sending to individual sessions
- Log warning (not error) since client disconnections are normal
- Remove dead sessions from SessionManager
- Continue broadcasting to other sessions

```java
public void sendMessage(String sessionId, String message) {
    try {
        WebSocketSession session = sessions.get(sessionId);
        if (session != null && session.isOpen()) {
            session.sendMessage(new TextMessage(message));
        } else {
            removeSession(sessionId);
        }
    } catch (IOException e) {
        log.warn("Failed to send message to session {}, removing", sessionId);
        removeSession(sessionId);
    }
}
```

### 4. Redis Cache Errors

**Scenario**: Redis is unavailable or operation fails

**Handling**:
- Log error but don't throw exception (cache is not critical path)
- Continue processing - other consumers should not be affected
- Implement circuit breaker pattern for Redis operations
- Fall back to database queries if Redis is unavailable

```java
@Async("tickCacheExecutor")
@EventListener
public void onTickReceived(TickReceivedEvent event) {
    try {
        // Cache to Redis
        redisTemplate.opsForList().rightPush(key, tickJson);
    } catch (Exception e) {
        log.error("Redis cache error for {}: {}", tick.getSymbol(), e.getMessage());
        metrics.incrementRedisCacheErrors();
        // Don't rethrow - cache failures shouldn't affect other consumers
    }
}
```

### 5. TimescaleDB Persistence Errors

**Scenario**: Database is unavailable or batch insert fails

**Handling**:
- Log error with full stack trace
- Keep failed batch in memory buffer
- Retry on next scheduled execution (15 minutes later)
- If buffer grows too large, implement overflow strategy (write to disk, alert operators)

```java
@Scheduled(cron = "0 */15 * * * *")
public void persistBatch() {
    try {
        int rowsInserted = batchInsert(batch);
        log.info("Persisted {} ticks", rowsInserted);
    } catch (Exception e) {
        log.error("Failed to persist batch of {} ticks - will retry", batch.size(), e);
        
        // Re-add to buffer for retry
        batch.forEach(entity -> buffer.offer(entity));
        
        // Alert if buffer is growing too large
        if (buffer.getBufferSize() > 100000) {
            log.error("ALERT: Tick buffer size exceeded 100k - database may be down");
            metrics.alertBufferOverflow();
        }
    }
}
```

### 6. Invalid Subscription Messages

**Scenario**: Client sends malformed subscription request

**Handling**:
- Validate message format using Bean Validation
- Send error response to client with clear message
- Don't modify existing subscriptions
- Log the invalid message for debugging

```java
@Override
protected void handleTextMessage(WebSocketSession session, TextMessage message) {
    try {
        SubscriptionRequestDto request = objectMapper.readValue(
            message.getPayload(), SubscriptionRequestDto.class);
        
        // Validate
        Set<ConstraintViolation<SubscriptionRequestDto>> violations = 
            validator.validate(request);
        
        if (!violations.isEmpty()) {
            String errors = violations.stream()
                .map(ConstraintViolation::getMessage)
                .collect(Collectors.joining(", "));
            sendError(session, "Invalid subscription request: " + errors);
            return;
        }
        
        // Process valid request
        handleSubscription(session, request);
        
    } catch (JsonProcessingException e) {
        sendError(session, "Invalid JSON format: " + e.getMessage());
        log.warn("Invalid subscription message from {}: {}", 
            session.getId(), message.getPayload());
    }
}
```


## Testing Strategy

### Unit Testing

#### 1. Tick Parsing Tests

Test the binary data parsing logic from Kite WebSocket.

```java
@Test
void shouldParseBinaryTickData() {
    // Given: Sample binary tick data from Kite
    byte[] binaryData = createSampleKiteTickData();
    
    // When: Parse the binary data
    List<Tick> ticks = kiteTickParser.parse(binaryData);
    
    // Then: Verify tick fields are correctly extracted
    assertThat(ticks).hasSize(1);
    Tick tick = ticks.get(0);
    assertThat(tick.getSymbol()).isEqualTo("NIFTY 50");
    assertThat(tick.getInstrumentToken()).isEqualTo(256265L);
    assertThat(tick.getLastTradedPrice()).isEqualTo(23754.25);
    assertThat(tick.getRawBinaryData()).isEqualTo(binaryData);
}

@Test
void shouldHandleMalformedBinaryData() {
    // Given: Malformed binary data
    byte[] malformedData = new byte[]{0x00, 0x01, 0x02};
    
    // When/Then: Should throw ParseException
    assertThatThrownBy(() -> kiteTickParser.parse(malformedData))
        .isInstanceOf(TickParseException.class);
}
```

#### 2. Session Management Tests

Test subscription management and session tracking.

```java
@Test
void shouldAddSubscriptionsToSession() {
    // Given: A registered session
    String sessionId = "session-123";
    sessionManager.registerSession(sessionId, "/ws/indices", mockSession);
    
    // When: Add subscriptions
    sessionManager.addSubscriptions(sessionId, List.of("NIFTY 50", "BANKNIFTY"));
    
    // Then: Session should be subscribed to both symbols
    Set<String> sessions = sessionManager.getSessionsSubscribedTo("NIFTY 50");
    assertThat(sessions).contains(sessionId);
    
    sessions = sessionManager.getSessionsSubscribedTo("BANKNIFTY");
    assertThat(sessions).contains(sessionId);
}

@Test
void shouldRemoveSubscriptionsFromSession() {
    // Given: A session with subscriptions
    String sessionId = "session-123";
    sessionManager.registerSession(sessionId, "/ws/indices", mockSession);
    sessionManager.addSubscriptions(sessionId, List.of("NIFTY 50", "BANKNIFTY"));
    
    // When: Remove one subscription
    sessionManager.removeSubscriptions(sessionId, List.of("NIFTY 50"));
    
    // Then: Should only be subscribed to BANKNIFTY
    assertThat(sessionManager.getSessionsSubscribedTo("NIFTY 50")).doesNotContain(sessionId);
    assertThat(sessionManager.getSessionsSubscribedTo("BANKNIFTY")).contains(sessionId);
}

@Test
void shouldIdentifyIndicesAllSessions() {
    // Given: Multiple sessions on different endpoints
    sessionManager.registerSession("session-1", "/ws/indices", mockSession1);
    sessionManager.registerSession("session-2", "/ws/indices/all", mockSession2);
    sessionManager.registerSession("session-3", "/ws/stocks", mockSession3);
    
    // When: Get indices/all sessions
    Set<String> indicesAllSessions = sessionManager.getIndicesAllSessions();
    
    // Then: Should only return session-2
    assertThat(indicesAllSessions).containsExactly("session-2");
}
```

#### 3. Reconnection Strategy Tests

Test exponential backoff logic.

```java
@Test
void shouldImplementExponentialBackoff() {
    // Given: Fresh reconnection strategy
    ReconnectionStrategy strategy = new ReconnectionStrategy();
    
    // When/Then: Delays should increase exponentially
    assertThat(strategy.getNextDelay()).isEqualTo(1);   // 1st attempt
    assertThat(strategy.getNextDelay()).isEqualTo(2);   // 2nd attempt
    assertThat(strategy.getNextDelay()).isEqualTo(4);   // 3rd attempt
    assertThat(strategy.getNextDelay()).isEqualTo(8);   // 4th attempt
    assertThat(strategy.getNextDelay()).isEqualTo(16);  // 5th attempt
    assertThat(strategy.getNextDelay()).isEqualTo(32);  // 6th attempt
    assertThat(strategy.getNextDelay()).isEqualTo(60);  // 7th attempt (capped)
    assertThat(strategy.getNextDelay()).isEqualTo(60);  // 8th attempt (capped)
}

@Test
void shouldResetAfterSuccessfulConnection() {
    // Given: Strategy with multiple attempts
    ReconnectionStrategy strategy = new ReconnectionStrategy();
    strategy.getNextDelay();
    strategy.getNextDelay();
    strategy.getNextDelay();
    
    // When: Reset after successful connection
    strategy.reset();
    
    // Then: Next delay should be back to 1 second
    assertThat(strategy.getNextDelay()).isEqualTo(1);
}
```

#### 4. Instrument Loader Tests

Test database queries for loading instruments.

```java
@Test
void shouldLoadNSEIndices() {
    // Given: Database with NSE indices
    // (Use @Sql to populate test data)
    
    // When: Load indices
    instrumentLoader.loadIndices();
    
    // Then: Should load all NSE INDICES segment instruments
    assertThat(instrumentLoader.isIndexToken(256265L)).isTrue();  // NIFTY 50
    assertThat(instrumentLoader.isIndexToken(260105L)).isTrue();  // BANKNIFTY
}

@Test
void shouldLoadNSEEquityStocks() {
    // Given: Database with NSE stocks
    
    // When: Load stocks
    instrumentLoader.loadStocks();
    
    // Then: Should load NSE EQ stocks excluding LOAN instruments
    assertThat(instrumentLoader.isStockToken(738561L)).isTrue();  // RELIANCE
    assertThat(instrumentLoader.isStockToken(408065L)).isTrue();  // INFY
}
```


### Integration Testing

#### 1. Redis Cache Integration Tests

Use Testcontainers to test Redis caching with real Redis instance.

```java
@SpringBootTest
@Testcontainers
class TickCacheServiceIntegrationTest {
    
    @Container
    static GenericContainer<?> redis = new GenericContainer<>("redis:7-alpine")
        .withExposedPorts(6379);
    
    @DynamicPropertySource
    static void redisProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.redis.host", redis::getHost);
        registry.add("spring.redis.port", redis::getFirstMappedPort);
    }
    
    @Autowired
    private TickCacheService cacheService;
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    @Test
    void shouldCacheTickToRedis() {
        // Given: A tick event
        Tick tick = createSampleTick("NIFTY 50");
        TickReceivedEvent event = new TickReceivedEvent(tick);
        
        // When: Cache the tick
        cacheService.onTickReceived(event);
        
        // Wait for async processing
        await().atMost(Duration.ofSeconds(2))
            .until(() -> redisTemplate.hasKey("ticks:" + getTradingDate() + ":NIFTY 50"));
        
        // Then: Tick should be in Redis
        List<String> cachedTicks = redisTemplate.opsForList()
            .range("ticks:" + getTradingDate() + ":NIFTY 50", 0, -1);
        assertThat(cachedTicks).hasSize(1);
    }
    
    @Test
    void shouldRetrieveTodayTicksFromCache() {
        // Given: Multiple ticks cached in Redis
        cacheSampleTicks("RELIANCE", 10);
        
        // When: Retrieve today's ticks
        List<Tick> ticks = cacheService.getTodayTicks("RELIANCE", null);
        
        // Then: Should return all cached ticks
        assertThat(ticks).hasSize(10);
    }
    
    @Test
    void shouldFilterTicksByTimeWindow() {
        // Given: Ticks from last 30 minutes
        cacheSampleTicks("INFY", 30);
        
        // When: Retrieve last 5 minutes
        List<Tick> ticks = cacheService.getTodayTicks("INFY", 5);
        
        // Then: Should return only recent ticks
        assertThat(ticks).hasSizeLessThanOrEqualTo(5);
        assertThat(ticks).allMatch(tick -> 
            tick.getTimestamp().isAfter(Instant.now().minus(Duration.ofMinutes(5))));
    }
}
```

#### 2. TimescaleDB Persistence Integration Tests

Use Testcontainers with TimescaleDB image.

```java
@SpringBootTest
@Testcontainers
class TickPersistenceServiceIntegrationTest {
    
    @Container
    static PostgreSQLContainer<?> timescaleDB = new PostgreSQLContainer<>(
        "timescale/timescaledb:latest-pg15")
        .withDatabaseName("test")
        .withUsername("test")
        .withPassword("test");
    
    @DynamicPropertySource
    static void dbProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", timescaleDB::getJdbcUrl);
        registry.add("spring.datasource.username", timescaleDB::getUsername);
        registry.add("spring.datasource.password", timescaleDB::getPassword);
    }
    
    @Autowired
    private TickPersistenceService persistenceService;
    
    @Autowired
    private TickBatchBuffer buffer;
    
    @Autowired
    private TickRepository repository;
    
    @Test
    void shouldBatchInsertTicksToTimescaleDB() {
        // Given: Buffered ticks
        for (int i = 0; i < 100; i++) {
            Tick tick = createSampleTick("NIFTY 50");
            buffer.onTickReceived(new TickReceivedEvent(tick));
        }
        
        // Wait for async buffering
        await().atMost(Duration.ofSeconds(2))
            .until(() -> buffer.getBufferSize() == 100);
        
        // When: Persist batch
        persistenceService.persistBatch();
        
        // Then: Ticks should be in database
        List<TickEntity> entities = repository.findBySymbolAndTimestampBetween(
            "NIFTY 50",
            Instant.now().minus(Duration.ofMinutes(5)),
            Instant.now()
        );
        assertThat(entities).hasSize(100);
    }
    
    @Test
    void shouldStoreRawBinaryData() {
        // Given: Tick with raw binary data
        byte[] rawData = new byte[]{0x01, 0x02, 0x03, 0x04};
        Tick tick = createSampleTick("RELIANCE", rawData);
        buffer.onTickReceived(new TickReceivedEvent(tick));
        
        // When: Persist and retrieve
        persistenceService.persistBatch();
        List<TickEntity> entities = repository.findBySymbolAndTimestampBetween(
            "RELIANCE",
            tick.getTimestamp().minus(Duration.ofSeconds(1)),
            tick.getTimestamp().plus(Duration.ofSeconds(1))
        );
        
        // Then: Raw binary data should be preserved
        assertThat(entities).hasSize(1);
        assertThat(entities.get(0).getRawTickData()).isEqualTo(rawData);
    }
    
    @Test
    void shouldRetryFailedBatch() {
        // Given: Database is temporarily unavailable
        // (Simulate by stopping container or using wrong credentials)
        
        // When: Attempt to persist
        buffer.onTickReceived(new TickReceivedEvent(createSampleTick("TEST")));
        persistenceService.persistBatch();
        
        // Then: Failed batch should remain in buffer
        assertThat(buffer.getBufferSize()).isGreaterThan(0);
    }
}
```

#### 3. End-to-End Flow Integration Test

Test the complete flow from tick arrival to persistence.

```java
@SpringBootTest
@Testcontainers
class SocketEngineEndToEndTest {
    
    @Container
    static GenericContainer<?> redis = new GenericContainer<>("redis:7-alpine")
        .withExposedPorts(6379);
    
    @Container
    static PostgreSQLContainer<?> timescaleDB = new PostgreSQLContainer<>(
        "timescale/timescaledb:latest-pg15");
    
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    @Autowired
    private TickCacheService cacheService;
    
    @Autowired
    private TickPersistenceService persistenceService;
    
    @Autowired
    private TickRepository repository;
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    @Test
    void shouldProcessTickThroughCompleteFlow() {
        // Given: A tick arrives from Kite
        Tick tick = Tick.builder()
            .symbol("NIFTY 50")
            .instrumentToken(256265L)
            .type(InstrumentType.INDEX)
            .timestamp(Instant.now())
            .lastTradedPrice(23754.25)
            .volume(1234567L)
            .ohlc(Tick.OHLC.builder()
                .open(23450.0)
                .high(23800.0)
                .low(23320.0)
                .close(23500.0)
                .build())
            .rawBinaryData(new byte[]{0x01, 0x02, 0x03})
            .build();
        
        // When: Publish tick event
        eventPublisher.publishEvent(new TickReceivedEvent(tick));
        
        // Then: Tick should be cached in Redis
        await().atMost(Duration.ofSeconds(3))
            .until(() -> {
                String key = "ticks:" + getTradingDate() + ":NIFTY 50";
                return redisTemplate.hasKey(key);
            });
        
        // And: Tick should be buffered for persistence
        await().atMost(Duration.ofSeconds(3))
            .until(() -> buffer.getBufferSize() > 0);
        
        // When: Batch persistence runs
        persistenceService.persistBatch();
        
        // Then: Tick should be in TimescaleDB
        List<TickEntity> entities = repository.findBySymbolAndTimestampBetween(
            "NIFTY 50",
            tick.getTimestamp().minus(Duration.ofSeconds(1)),
            tick.getTimestamp().plus(Duration.ofSeconds(1))
        );
        assertThat(entities).hasSize(1);
        assertThat(entities.get(0).getRawTickData()).isEqualTo(tick.getRawBinaryData());
    }
}
```

### Performance Testing

#### Load Test Scenarios

1. **High-frequency tick ingestion**: Simulate 1000 ticks/second from Kite
2. **Multiple client connections**: 100 concurrent WebSocket clients
3. **Subscription churn**: Clients frequently subscribe/unsubscribe
4. **Large batch persistence**: 100,000 ticks in single batch

#### Performance Metrics to Monitor

- Tick processing latency (p50, p95, p99)
- WebSocket broadcast latency
- Redis cache write latency
- TimescaleDB batch insert duration
- Memory usage of tick buffer
- Thread pool queue sizes
- Event bus throughput


## Deployment Considerations

### 1. Standalone Service Architecture

The socketengine runs as a **separate Spring Boot application** on port 8081:
- **Backend API**: Port 8080 (existing ./backend/)
- **SocketEngine**: Port 8081 (new ./socketengine/)
- **Frontend**: Port 4200 (existing ./frontend/)

All three services share the same Redis and TimescaleDB infrastructure.

### 2. Environment Configuration

The module requires the following environment variables in `./socketengine/.env`:

```bash
# Kite API Configuration
KITE_API_KEY=your_api_key
KITE_API_SECRET=your_api_secret
KITE_ACCESS_TOKEN=your_access_token

# Database Configuration
DB_URL=jdbc:postgresql://localhost:5432/moneytree
DB_USERNAME=postgres
DB_PASSWORD=your_password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

### 3. Resource Requirements

**Minimum**:
- CPU: 2 cores
- Memory: 2 GB RAM
- Disk: 10 GB (for logs and temporary buffering)

**Recommended**:
- CPU: 4 cores (for async thread pools)
- Memory: 4 GB RAM (for tick buffering during high volume)
- Disk: 50 GB SSD (for TimescaleDB storage)

### 4. Scaling Considerations

**Vertical Scaling**:
- Increase thread pool sizes for async consumers
- Increase JVM heap size for larger tick buffers
- Increase database connection pool size

**Horizontal Scaling**:
- Currently designed as single instance (one Kite WebSocket connection)
- For high availability, implement active-passive failover
- Use Redis Pub/Sub for broadcasting across multiple instances (future enhancement)

### 5. Monitoring and Observability

**Health Checks**:
```java
@Component
public class SocketEngineHealthIndicator implements HealthIndicator {
    
    @Override
    public Health health() {
        boolean kiteConnected = kiteWebSocketClient.isConnected();
        long bufferSize = tickBatchBuffer.getBufferSize();
        
        if (!kiteConnected) {
            return Health.down()
                .withDetail("kite", "disconnected")
                .build();
        }
        
        if (bufferSize > 100000) {
            return Health.down()
                .withDetail("buffer", "overflow")
                .withDetail("size", bufferSize)
                .build();
        }
        
        return Health.up()
            .withDetail("kite", "connected")
            .withDetail("bufferSize", bufferSize)
            .build();
    }
}
```

**Metrics to Expose**:
- `socketengine.ticks.received.total` - Counter of ticks received from Kite
- `socketengine.ticks.broadcast.total` - Counter of ticks broadcast to clients
- `socketengine.ticks.cached.total` - Counter of ticks cached to Redis
- `socketengine.ticks.persisted.total` - Counter of ticks persisted to TimescaleDB
- `socketengine.websocket.sessions.active` - Gauge of active WebSocket sessions
- `socketengine.kite.connection.status` - Gauge (1=connected, 0=disconnected)
- `socketengine.buffer.size` - Gauge of current buffer size
- `socketengine.persistence.duration` - Timer for batch persistence operations

### 6. Logging Strategy

**Log Levels**:
- **INFO**: Connection events, batch persistence summaries, session management
- **WARN**: Reconnection attempts, client disconnections, Redis cache failures
- **ERROR**: Kite authentication failures, database persistence failures, parsing errors
- **DEBUG**: Individual tick processing, subscription changes (disabled in production)

**Log Aggregation**:
- Use structured logging (JSON format) for easy parsing
- Include correlation IDs for tracing tick flow
- Aggregate logs to centralized system (ELK, Splunk, etc.)

### 7. Security Considerations

**API Credentials**:
- Store Kite API credentials in secure vault (AWS Secrets Manager, HashiCorp Vault)
- Rotate access tokens regularly
- Never log credentials or tokens

**WebSocket Security**:
- Implement authentication for WebSocket connections (JWT tokens)
- Validate origin headers to prevent CSRF
- Rate limit subscription requests per session
- Implement connection limits per IP address

**Database Security**:
- Use read-only database user for instrument loading
- Use separate user with insert-only permissions for tick persistence
- Enable SSL/TLS for database connections

### 8. Disaster Recovery

**Data Loss Prevention**:
- Redis cache is ephemeral - data loss is acceptable (can rebuild from TimescaleDB)
- TimescaleDB is primary source of truth - implement regular backups
- Tick buffer is in-memory - data loss on crash is acceptable (15 minutes max)

**Backup Strategy**:
- Daily full backups of TimescaleDB
- Continuous archiving (WAL) for point-in-time recovery
- Test restore procedures monthly

**Failover Procedure**:
1. Detect primary instance failure (health check timeout)
2. Promote standby instance to primary
3. Update DNS/load balancer to point to new primary
4. Reconnect to Kite WebSocket
5. Reload instruments from database
6. Resume normal operations


## Spring Modulith Boundaries

### Module Definition

```java
/**
 * SocketEngine Module - Real-time market data streaming engine
 * 
 * This module is responsible for:
 * - Connecting to Zerodha Kite WebSocket API
 * - Streaming live ticks to frontend clients
 * - Caching intraday data in Redis
 * - Persisting historical data to TimescaleDB
 * 
 * Public API:
 * - WebSocket endpoints: /ws/indices, /ws/stocks, /ws/indices/all, /ws/stocks/nse/all
 * - REST endpoints: /api/ticks/*
 * 
 * Internal components are package-private and not accessible to other modules.
 */
@org.springframework.modulith.ApplicationModule(
    displayName = "Socket Engine",
    allowedDependencies = {"common", "database"}
)
package com.moneytree.socketengine;
```

### Public API (Exposed to Other Modules)

**Package**: `com.moneytree.socketengine.api`

Classes that other modules can depend on:
- `TickDto` - Data transfer object for tick data
- `TickRestController` - REST endpoints for querying ticks
- `TickWebSocketHandler` - WebSocket handler (registered in WebSocketConfig)

### Internal Components (Module-Private)

All other packages are internal and should not be accessed by other modules:
- `com.moneytree.socketengine.kite` - Kite integration (internal)
- `com.moneytree.socketengine.broadcast` - WebSocket broadcasting (internal)
- `com.moneytree.socketengine.redis` - Redis caching (internal)
- `com.moneytree.socketengine.persistence` - TimescaleDB persistence (internal)
- `com.moneytree.socketengine.domain` - Domain model and events (internal)

### Domain Events (Published to Other Modules)

The module publishes the following domain events that other modules can listen to:

```java
/**
 * Published when a tick is received from Kite WebSocket
 * Other modules can listen to this event to react to market data updates
 */
public record TickReceivedEvent(
    Tick tick,
    Instant receivedAt
) {
    // Event is published via Spring's ApplicationEventPublisher
    // Other modules can listen using @EventListener or @TransactionalEventListener
}
```

### Module Dependencies

The socketengine module depends on:
- **Spring Boot Core**: Web, WebSocket, Scheduling, Async
- **Spring Data JPA**: For TimescaleDB persistence
- **Spring Data Redis**: For caching
- **Spring Modulith**: For module boundaries and testing
- **Jackson**: For JSON serialization
- **Lombok**: For reducing boilerplate
- **Validation API**: For request validation

### Module Testing

Spring Modulith provides testing support to verify module boundaries:

```java
@SpringBootTest
class SocketEngineModularityTest {
    
    @Autowired
    ApplicationModules modules;
    
    @Test
    void shouldRespectModuleBoundaries() {
        // Verify that the socketengine module is properly defined
        modules.verify();
    }
    
    @Test
    void shouldOnlyExposePublicAPI() {
        ApplicationModule socketEngine = modules.getModuleByName("socketengine")
            .orElseThrow();
        
        // Verify that only api package is exposed
        assertThat(socketEngine.getExposedPackages())
            .containsOnly("com.moneytree.socketengine.api");
    }
}
```

## Build and Deployment Integration

### Maven/Gradle Configuration

The socketengine module should be integrated into the existing build system.

**pom.xml** (if using Maven):
```xml
<dependencies>
    <!-- Spring Boot Starters -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-websocket</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-redis</artifactId>
    </dependency>
    
    <!-- Spring Modulith -->
    <dependency>
        <groupId>org.springframework.modulith</groupId>
        <artifactId>spring-modulith-starter-core</artifactId>
    </dependency>
    
    <!-- Database -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
    </dependency>
    
    <!-- WebSocket Client -->
    <dependency>
        <groupId>org.java-websocket</groupId>
        <artifactId>Java-WebSocket</artifactId>
        <version>1.5.4</version>
    </dependency>
    
    <!-- Testing -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.testcontainers</groupId>
        <artifactId>postgresql</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.testcontainers</groupId>
        <artifactId>junit-jupiter</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### Build Script Integration

**./build-all.sh** - Add socketengine module:
```bash
#!/bin/bash
set -e

echo "Building all modules..."

# Build backend (includes socketengine module)
cd backend
./mvnw clean package -DskipTests
cd ..

# Build frontend
cd frontend
npm run build
cd ..

echo "Build complete!"
```

**./start-all.sh** - Add socketengine startup:
```bash
#!/bin/bash
set -e

echo "Starting all services..."

# Start backend (includes socketengine module)
cd backend
./start-app.sh &
BACKEND_PID=$!
cd ..

# Start frontend
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "All services started!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
```

## Summary

The socketengine module is designed as a high-performance, event-driven component that:

1. **Maintains a single WebSocket connection** to Zerodha Kite for all market data
2. **Provides four WebSocket endpoints** for selective and bulk streaming to Angular clients
3. **Uses asynchronous processing** with separate thread pools for hot path (broadcast) and cold path (cache/persist)
4. **Caches intraday data in Redis** for fast queries with 2-day TTL
5. **Persists historical data to TimescaleDB** in compressed binary format every 15 minutes
6. **Follows Spring Modulith conventions** with clear boundaries and public API
7. **Implements robust error handling** with reconnection, retry, and graceful degradation
8. **Provides comprehensive testing** with unit, integration, and end-to-end tests
9. **Integrates with existing build scripts** for seamless deployment

The design prioritizes performance by immediately broadcasting ticks to clients while asynchronously handling caching and persistence, ensuring minimal latency for real-time data delivery.
