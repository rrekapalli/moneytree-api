package com.moneytree.socketengine.kite;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneytree.socketengine.config.SocketEngineProperties;
import com.moneytree.socketengine.domain.InstrumentInfo;
import com.moneytree.socketengine.domain.Tick;
import com.moneytree.socketengine.domain.events.TickReceivedEvent;
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
    
    private WebSocketClient webSocketClient;
    private volatile boolean connected = false;
    private volatile boolean shouldReconnect = true;
    private List<InstrumentInfo> instruments;
    
    public KiteWebSocketClient(
            SocketEngineProperties properties,
            ApplicationEventPublisher eventPublisher,
            KiteTickParser tickParser,
            ReconnectionStrategy reconnectionStrategy,
            InstrumentLoader instrumentLoader,
            ObjectMapper objectMapper) {
        this.properties = properties;
        this.eventPublisher = eventPublisher;
        this.tickParser = tickParser;
        this.reconnectionStrategy = reconnectionStrategy;
        this.instrumentLoader = instrumentLoader;
        this.objectMapper = objectMapper;
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
     * Closes WebSocket connection gracefully.
     */
    @PreDestroy
    public void shutdown() {
        log.info("Shutting down Kite WebSocket client");
        shouldReconnect = false;
        
        if (webSocketClient != null && webSocketClient.isOpen()) {
            webSocketClient.close();
        }
    }
    
    /**
     * Establishes WebSocket connection to Kite API.
     * Sets up authentication headers and connection handlers.
     */
    private void connect() {
        try {
            String wsUrl = properties.getKite().getWebsocketUrl();
            String apiKey = properties.getKite().getApiKey();
            String accessToken = properties.getKite().getAccessToken();
            
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
            
            // Add authentication headers
            webSocketClient.addHeader("X-Kite-Version", "3");
            webSocketClient.addHeader("Authorization", "token " + apiKey + ":" + accessToken);
            
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
            
            List<Tick> ticks = tickParser.parse(data);
            
            // Publish event for each tick
            ticks.forEach(tick -> {
                try {
                    eventPublisher.publishEvent(new TickReceivedEvent(tick));
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
            
            // Build Kite subscription message
            var subscriptionMessage = new java.util.HashMap<String, Object>();
            subscriptionMessage.put("a", "subscribe");
            subscriptionMessage.put("v", tokens);
            
            String messageJson = objectMapper.writeValueAsString(subscriptionMessage);
            
            // Send subscription message
            webSocketClient.send(messageJson);
            
            log.info("Subscribed to {} instruments", tokens.size());
            log.debug("Subscription message: {}", messageJson);
            
        } catch (Exception e) {
            log.error("Failed to subscribe to instruments", e);
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
}
