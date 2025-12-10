package com.moneytree.socketengine.kite;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneytree.socketengine.config.SocketEngineProperties;
import com.moneytree.socketengine.domain.InstrumentInfo;
import com.moneytree.socketengine.domain.InstrumentType;
import com.moneytree.socketengine.domain.Tick;
import com.moneytree.socketengine.domain.events.TickReceivedEvent;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.nio.ByteBuffer;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * Manages the single WebSocket connection to Kite market data API.
 * Subscribes to all configured instruments and publishes TickReceivedEvent
 * for each incoming tick.
 * 
 * <p>Features:
 * <ul>
 *   <li>Automatic reconnection with exponential backoff on connection loss</li>
 *   <li>Authentication using Kite API credentials</li>
 *   <li>Binary tick data parsing and event publishing</li>
 *   <li>Connection state tracking</li>
 * </ul>
 * 
 * <p>The client establishes connection on startup (@PostConstruct) and
 * automatically reconnects if the connection drops, unless authentication fails.
 */
@Component
@Slf4j
public class KiteWebSocketClient {
    
    private final SocketEngineProperties properties;
    private final ApplicationEventPublisher eventPublisher;
    private final KiteTickParser tickParser;
    private final ReconnectionStrategy reconnectionStrategy;
    private final InstrumentLoader instrumentLoader;
    private final ObjectMapper objectMapper;
    private final Counter ticksReceivedCounter;
    
    private WebSocketClient webSocketClient;
    private volatile boolean connected = false;
    private volatile boolean shouldReconnect = true;
    private List<InstrumentInfo> instruments;
    private int debugMessageCount = 0;
    
    public KiteWebSocketClient(
            SocketEngineProperties properties,
            ApplicationEventPublisher eventPublisher,
            KiteTickParser tickParser,
            ReconnectionStrategy reconnectionStrategy,
            InstrumentLoader instrumentLoader,
            ObjectMapper objectMapper,
            MeterRegistry meterRegistry) {
        this.properties = properties;
        this.eventPublisher = eventPublisher;
        this.tickParser = tickParser;
        this.reconnectionStrategy = reconnectionStrategy;
        this.instrumentLoader = instrumentLoader;
        this.objectMapper = objectMapper;
        
        // Register counter for ticks received from Kite
        this.ticksReceivedCounter = Counter.builder("socketengine.ticks.received")
            .description("Total number of ticks received from Kite WebSocket")
            .register(meterRegistry);
    }
    
    /**
     * Initializes the Kite WebSocket client on application startup.
     * Loads instruments from database/cache and establishes connection.
     */
    @PostConstruct
    public void initialize() {
        log.info("Initializing Kite WebSocket client");
        
        // Load instruments from database or cache
        instruments = instrumentLoader.loadAllInstruments();
        log.info("Loaded {} instruments for subscription", instruments.size());
        
        // Connect to Kite
        connect();
    }
    
    /**
     * Cleanup on application shutdown.
     * Unsubscribes from all instruments and closes WebSocket connection gracefully.
     */
    @PreDestroy
    public void shutdown() {
        log.warn("🛑 SHUTDOWN INITIATED - Kite WebSocket client shutdown starting");
        shouldReconnect = false;
        
        if (webSocketClient != null) {
            try {
                if (webSocketClient.isOpen()) {
                    log.warn("🔌 WebSocket is OPEN - proceeding with unsubscribe and close");
                    
                    // First, unsubscribe from all instruments to stop tick data flow
                    log.warn("📤 SENDING UNSUBSCRIBE MESSAGE to Kite API");
                    unsubscribeFromAllInstruments();
                    
                    // Give Kite more time to process the unsubscribe message
                    log.warn("⏳ Waiting 3 seconds for Kite to process unsubscribe...");
                    Thread.sleep(3000);
                    
                    log.warn("🔒 CLOSING WebSocket connection...");
                    // Close with normal closure code (1000) and wait for completion
                    webSocketClient.closeBlocking();
                    log.warn("✅ Kite WebSocket connection CLOSED successfully");
                    
                } else {
                    log.warn("🔌 WebSocket is already CLOSED or not connected");
                }
                
            } catch (InterruptedException e) {
                log.error("❌ INTERRUPTED while closing Kite WebSocket connection", e);
                Thread.currentThread().interrupt();
                // Force close if blocking close was interrupted
                webSocketClient.close();
                log.warn("🔨 FORCE CLOSED WebSocket due to interruption");
            } catch (Exception e) {
                log.error("❌ ERROR during graceful shutdown, forcing close", e);
                // Force close on any error
                webSocketClient.close();
                log.warn("🔨 FORCE CLOSED WebSocket due to error");
            }
        } else {
            log.warn("🔌 WebSocket client is NULL - no cleanup needed");
        }
        
        // Final cleanup
        webSocketClient = null;
        connected = false;
        
        log.warn("🏁 Kite WebSocket client shutdown COMPLETED");
    }
    
    /**
     * Establishes WebSocket connection to Kite API.
     * Sets up authentication headers and connection handlers.
     * 
     * Security: API credentials are never logged.
     */
    private void connect() {
        try {
            String wsUrl = properties.getKite().getWebsocketUrl();
            String apiKey = properties.getKite().getApiKey();
            String accessToken = properties.getKite().getAccessToken();
            
            // Validate credentials are present (but don't log them)
            if (apiKey == null || apiKey.isEmpty() || 
                accessToken == null || accessToken.isEmpty()) {
                log.error("Kite API credentials are missing or empty. Please check configuration.");
                return;
            }
            
            log.info("Connecting to Kite WebSocket: {}", wsUrl);
            
            webSocketClient = new WebSocketClient(new URI(wsUrl)) {
                @Override
                public void onOpen(ServerHandshake handshake) {
                    handleOpen(handshake);
                }
                
                @Override
                public void onMessage(String message) {
                    // Text messages are not expected from Kite, log for debugging
                    log.debug("Received text message from Kite: {}", message);
                }
                
                @Override
                public void onMessage(ByteBuffer bytes) {
                    handleBinaryMessage(bytes);
                }
                
                @Override
                public void onClose(int code, String reason, boolean remote) {
                    handleClose(code, reason, remote);
                }
                
                @Override
                public void onError(Exception ex) {
                    handleError(ex);
                }
            };
            
            // Authentication is done via query parameters in the URL, not headers
            
            // Connect (non-blocking)
            webSocketClient.connect();
            
        } catch (Exception e) {
            log.error("Failed to create Kite WebSocket connection", e);
            scheduleReconnection();
        }
    }
    
    /**
     * Handles WebSocket connection established event.
     * Subscribes to all loaded instruments.
     */
    private void handleOpen(ServerHandshake handshake) {
        log.info("Connected to Kite WebSocket - HTTP status: {}", handshake.getHttpStatus());
        connected = true;
        reconnectionStrategy.reset();
        
        // Subscribe to all instruments
        subscribeToInstruments(instruments);
    }
    
    /**
     * Handles incoming binary tick data from Kite.
     * Parses the binary data and publishes TickReceivedEvent for each tick.
     */
    private void handleBinaryMessage(ByteBuffer bytes) {
        try {
            byte[] data = new byte[bytes.remaining()];
            bytes.get(data);
            
            // DEBUG: Analyze first few binary messages to detect parsing issues
            // This will help identify the root cause of corrupted price data
            if (debugMessageCount < 3) {
                debugMessageCount++;
                log.warn("🔍 DEBUG MESSAGE #{}: Analyzing binary data for parsing issues", debugMessageCount);
                tickParser.debugBinaryData(data);
            }
            
            List<Tick> ticks = tickParser.parse(data);
            
            // DEBUG: Log parsed ticks to verify data quality
            if (debugMessageCount <= 3) {
                ticks.forEach(tick -> {
                    if (tick.getType() == com.moneytree.socketengine.domain.InstrumentType.INDEX) {
                        log.warn("🔍 PARSED INDEX TICK: {} = ₹{} (OHLC: O={}, H={}, L={}, C={})", 
                            tick.getSymbol(), tick.getLastTradedPrice(),
                            tick.getOhlc().getOpen(), tick.getOhlc().getHigh(), 
                            tick.getOhlc().getLow(), tick.getOhlc().getClose());
                        
                        // Check for obviously corrupted data
                        if (tick.getLastTradedPrice() < 0 || tick.getLastTradedPrice() > 1000000) {
                            log.error("❌ CORRUPTED PRICE DETECTED: {} has price ₹{}", 
                                tick.getSymbol(), tick.getLastTradedPrice());
                        }
                    }
                });
            }
            
            // Publish event for each tick
            ticks.forEach(tick -> {
                try {
                    eventPublisher.publishEvent(new TickReceivedEvent(tick));
                    ticksReceivedCounter.increment();
                } catch (Exception e) {
                    log.error("Error publishing TickReceivedEvent for {}", tick.getSymbol(), e);
                }
            });
            
        } catch (TickParseException e) {
            log.error("Error parsing tick data: {}", e.getMessage());
            // Continue processing - don't let one bad tick break everything
        } catch (Exception e) {
            log.error("Unexpected error processing tick data", e);
        }
    }
    
    /**
     * Handles WebSocket connection closed event.
     * Schedules reconnection with exponential backoff unless shutdown is in progress.
     */
    private void handleClose(int code, String reason, boolean remote) {
        log.warn("Kite WebSocket closed - code: {}, reason: {}, remote: {}", 
            code, reason, remote);
        connected = false;
        
        if (shouldReconnect) {
            scheduleReconnection();
        } else {
            log.info("Reconnection disabled, not attempting to reconnect");
        }
    }
    
    /**
     * Handles WebSocket errors.
     * Special handling for authentication failures - stops reconnection attempts.
     */
    private void handleError(Exception ex) {
        String errorMessage = ex.getMessage() != null ? ex.getMessage().toLowerCase() : "";
        
        // Check for authentication failures
        if (errorMessage.contains("401") || 
            errorMessage.contains("unauthorized") || 
            errorMessage.contains("authentication")) {
            
            log.error("Kite authentication failed - stopping reconnection attempts. " +
                     "Please check API credentials.", ex);
            connected = false;
            shouldReconnect = false;
            
        } else {
            log.error("Kite WebSocket error - will attempt reconnection", ex);
            
            if (shouldReconnect) {
                scheduleReconnection();
            }
        }
    }
    
    /**
     * Schedules reconnection attempt with exponential backoff delay.
     * Uses CompletableFuture for non-blocking delayed execution.
     */
    private void scheduleReconnection() {
        if (!shouldReconnect) {
            return;
        }
        
        long delaySeconds = reconnectionStrategy.getNextDelay();
        int attemptNumber = reconnectionStrategy.getAttemptCount();
        
        log.info("Scheduling reconnection attempt #{} in {} seconds", 
            attemptNumber, delaySeconds);
        
        CompletableFuture.delayedExecutor(delaySeconds, TimeUnit.SECONDS)
            .execute(() -> {
                if (shouldReconnect) {
                    log.info("Attempting reconnection #{}", attemptNumber);
                    connect();
                }
            });
    }
    
    /**
     * Subscribes to all instruments by sending subscription message to Kite.
     * 
     * <p>Kite subscription message format:
     * <pre>
     * {
     *   "a": "subscribe",
     *   "v": [token1, token2, ...]
     * }
     * </pre>
     * 
     * @param instrumentsToSubscribe List of instruments to subscribe to
     */
    private void subscribeToInstruments(List<InstrumentInfo> instrumentsToSubscribe) {
        try {
            // Extract instrument tokens
            List<Long> tokens = instrumentsToSubscribe.stream()
                .map(InstrumentInfo::getInstrumentToken)
                .collect(Collectors.toList());
            
            if (tokens.isEmpty()) {
                log.warn("No instruments to subscribe to");
                return;
            }
            
            // Log breakdown by type for debugging
            long indexCount = instrumentsToSubscribe.stream()
                .filter(i -> i.getType() == InstrumentType.INDEX)
                .count();
            long stockCount = instrumentsToSubscribe.stream()
                .filter(i -> i.getType() == InstrumentType.STOCK)
                .count();
            
            log.info("Subscribing to {} instruments: {} indices, {} stocks", 
                tokens.size(), indexCount, stockCount);
            
            // Log first few index tokens for verification
            List<Long> indexTokens = instrumentsToSubscribe.stream()
                .filter(i -> i.getType() == InstrumentType.INDEX)
                .map(InstrumentInfo::getInstrumentToken)
                .limit(10)
                .collect(Collectors.toList());
            log.info("Sample index tokens being subscribed: {}", indexTokens);
            
            // Build Kite subscription message
            var subscriptionMessage = new java.util.HashMap<String, Object>();
            subscriptionMessage.put("a", "subscribe");
            subscriptionMessage.put("v", tokens);
            
            String messageJson = objectMapper.writeValueAsString(subscriptionMessage);
            
            // Send subscription message
            webSocketClient.send(messageJson);
            
            log.info("Subscription message sent to Kite WebSocket");
            log.debug("Full subscription message: {}", messageJson);
            
        } catch (Exception e) {
            log.error("Failed to subscribe to instruments", e);
        }
    }
    
    /**
     * Unsubscribes from all instruments by sending unsubscribe message to Kite.
     * This is called during shutdown to stop tick data flow before closing the connection.
     * 
     * <p>Kite unsubscribe message format:
     * <pre>
     * {
     *   "a": "unsubscribe",
     *   "v": [token1, token2, ...]
     * }
     * </pre>
     */
    private void unsubscribeFromAllInstruments() {
        if (instruments == null || instruments.isEmpty()) {
            log.warn("⚠️ NO INSTRUMENTS to unsubscribe from - instruments list is empty");
            return;
        }
        
        try {
            // Extract instrument tokens
            List<Long> tokens = instruments.stream()
                .map(InstrumentInfo::getInstrumentToken)
                .collect(Collectors.toList());
            
            log.warn("📤 UNSUBSCRIBING from {} instruments", tokens.size());
            
            // Log first few tokens for verification
            List<Long> sampleTokens = tokens.stream().limit(5).collect(Collectors.toList());
            log.warn("📋 Sample tokens being unsubscribed: {}", sampleTokens);
            
            // Build Kite unsubscribe message
            var unsubscribeMessage = new java.util.HashMap<String, Object>();
            unsubscribeMessage.put("a", "unsubscribe");
            unsubscribeMessage.put("v", tokens);
            
            String messageJson = objectMapper.writeValueAsString(unsubscribeMessage);
            
            // Send unsubscribe message
            if (webSocketClient != null && webSocketClient.isOpen()) {
                log.warn("📡 SENDING unsubscribe message to Kite WebSocket...");
                webSocketClient.send(messageJson);
                log.warn("✅ UNSUBSCRIBE MESSAGE SENT successfully");
                log.warn("📄 Full unsubscribe message: {}", messageJson);
                
                // Verify the message was sent by checking connection state
                if (webSocketClient.isOpen()) {
                    log.warn("🔗 WebSocket connection is still OPEN after sending unsubscribe");
                } else {
                    log.warn("🔌 WebSocket connection CLOSED immediately after unsubscribe");
                }
                
            } else {
                log.error("❌ CANNOT send unsubscribe message - WebSocket is NOT OPEN");
                log.error("🔍 WebSocket state: client={}, isOpen={}", 
                    webSocketClient != null ? "exists" : "null",
                    webSocketClient != null ? webSocketClient.isOpen() : "N/A");
            }
            
        } catch (Exception e) {
            log.error("❌ FAILED to unsubscribe from instruments", e);
            log.error("🔍 Error details: {}", e.getMessage());
        }
    }
    
    /**
     * Checks if the WebSocket connection is currently active.
     * 
     * @return true if connected, false otherwise
     */
    public boolean isConnected() {
        return connected && webSocketClient != null && webSocketClient.isOpen();
    }
    
    /**
     * Gets the current reconnection attempt count.
     * Useful for monitoring and health checks.
     * 
     * @return number of reconnection attempts since last successful connection
     */
    public int getReconnectionAttempts() {
        return reconnectionStrategy.getAttemptCount();
    }
    
    /**
     * Manual shutdown method for testing purposes.
     * This can be called via REST endpoint or management interface to test shutdown behavior.
     */
    public void manualShutdown() {
        log.warn("🧪 MANUAL SHUTDOWN TRIGGERED for testing");
        shutdown();
    }
    
    /**
     * Get current subscription status for monitoring.
     * 
     * @return Map containing subscription details
     */
    public java.util.Map<String, Object> getSubscriptionStatus() {
        var status = new java.util.HashMap<String, Object>();
        status.put("connected", isConnected());
        status.put("shouldReconnect", shouldReconnect);
        status.put("instrumentCount", instruments != null ? instruments.size() : 0);
        status.put("reconnectionAttempts", getReconnectionAttempts());
        
        if (instruments != null && !instruments.isEmpty()) {
            // Sample of subscribed instruments
            List<String> sampleInstruments = instruments.stream()
                .limit(5)
                .map(i -> i.getTradingSymbol() + ":" + i.getInstrumentToken())
                .collect(Collectors.toList());
            status.put("sampleInstruments", sampleInstruments);
        }
        
        return status;
    }
}
