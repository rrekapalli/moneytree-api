package com.moneytree.socketengine.kite;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneytree.socketengine.config.SocketEngineProperties;
import com.moneytree.socketengine.domain.InstrumentInfo;
import com.moneytree.socketengine.domain.InstrumentType;
import com.moneytree.socketengine.domain.events.TickReceivedEvent;
import com.zerodhatech.kiteconnect.KiteConnect;
import com.zerodhatech.models.Tick;
import com.zerodhatech.ticker.KiteTicker;
import com.zerodhatech.ticker.OnConnect;
import com.zerodhatech.ticker.OnDisconnect;
import com.zerodhatech.ticker.OnError;
import com.zerodhatech.ticker.OnTicks;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * Manages the WebSocket connection to Kite market data API using the official Kite Connect library.
 * Uses KiteTicker from the official library for reliable binary parsing and connection management.
 * 
 * <p>Features:
 * <ul>
 *   <li>Official Kite Connect library integration</li>
 *   <li>Automatic binary parsing using Kite's proven implementation</li>
 *   <li>Automatic reconnection handled by KiteTicker</li>
 *   <li>Event publishing for tick data</li>
 * </ul>
 */
@Component
@Slf4j
public class KiteWebSocketClient {
    
    private final SocketEngineProperties properties;
    private final ApplicationEventPublisher eventPublisher;
    private final InstrumentLoader instrumentLoader;
    private final Counter ticksReceivedCounter;
    
    private KiteTicker kiteTicker;
    private volatile boolean connected = false;
    private volatile boolean shouldReconnect = true;
    private List<InstrumentInfo> instruments;
    private int debugMessageCount = 0;
    
    public KiteWebSocketClient(
            SocketEngineProperties properties,
            ApplicationEventPublisher eventPublisher,
            InstrumentLoader instrumentLoader,
            MeterRegistry meterRegistry) {
        this.properties = properties;
        this.eventPublisher = eventPublisher;
        this.instrumentLoader = instrumentLoader;
        
        // Register counter for ticks received from Kite
        this.ticksReceivedCounter = Counter.builder("socketengine.ticks.received")
            .description("Total number of ticks received from Kite WebSocket")
            .register(meterRegistry);
    }
    
    /**
     * Initializes the Kite WebSocket client using official KiteTicker.
     * Loads instruments from database/cache and establishes connection.
     */
    @PostConstruct
    public void initialize() {
        log.info("Initializing Kite WebSocket client with official KiteTicker");
        
        // Load instruments from database or cache
        instruments = instrumentLoader.loadAllInstruments();
        log.info("Loaded {} instruments for subscription", instruments.size());
        
        // Initialize and connect using official KiteTicker
        initializeKiteTicker();
    }
    
    /**
     * Cleanup on application shutdown.
     * Disconnects KiteTicker gracefully.
     */
    @PreDestroy
    public void shutdown() {
        log.warn("🛑 SHUTDOWN INITIATED - Kite WebSocket client shutdown starting");
        shouldReconnect = false;
        
        if (kiteTicker != null) {
            try {
                log.warn("🔒 DISCONNECTING KiteTicker...");
                kiteTicker.disconnect();
                log.warn("✅ KiteTicker disconnected successfully");
            } catch (Exception e) {
                log.error("❌ ERROR during KiteTicker shutdown", e);
            }
        }
        
        // Final cleanup
        kiteTicker = null;
        connected = false;
        
        log.warn("🏁 Kite WebSocket client shutdown COMPLETED");
    }
    
    /**
     * Initializes KiteTicker with official Kite Connect library.
     * Sets up event handlers and establishes connection.
     */
    private void initializeKiteTicker() {
        try {
            String apiKey = properties.getKite().getApiKey();
            String accessToken = properties.getKite().getAccessToken();
            
            // Validate credentials are present (but don't log them)
            if (apiKey == null || apiKey.isEmpty() || 
                accessToken == null || accessToken.isEmpty()) {
                log.error("Kite API credentials are missing or empty. Please check configuration.");
                return;
            }
            
            log.info("Initializing KiteTicker with official Kite Connect library");
            
            // Create KiteTicker instance
            kiteTicker = new KiteTicker(accessToken, apiKey);
            
            // Set up event handlers
            kiteTicker.setOnConnectedListener(new OnConnect() {
                @Override
                public void onConnected() {
                    handleKiteConnected();
                }
            });
            
            kiteTicker.setOnDisconnectedListener(new OnDisconnect() {
                @Override
                public void onDisconnected() {
                    handleKiteDisconnected();
                }
            });
            
            kiteTicker.setOnTickerArrivalListener(new OnTicks() {
                @Override
                public void onTicks(ArrayList<Tick> ticks) {
                    handleKiteTicks(ticks);
                }
            });
            
            kiteTicker.setOnErrorListener(new OnError() {
                @Override
                public void onError(Exception exception) {
                    handleKiteError(exception);
                }
                
                @Override
                public void onError(String error) {
                    handleKiteError(new RuntimeException(error));
                }
                
                @Override
                public void onError(com.zerodhatech.kiteconnect.kitehttp.exceptions.KiteException kiteException) {
                    handleKiteException(kiteException);
                }
            });
            
            // Connect to Kite
            log.info("Connecting to Kite WebSocket using official KiteTicker...");
            kiteTicker.connect();
            
        } catch (Exception e) {
            log.error("Failed to initialize KiteTicker", e);
        }
    }
    
    /**
     * Handles KiteTicker connection established event.
     * Subscribes to all loaded instruments.
     */
    private void handleKiteConnected() {
        log.info("✅ Connected to Kite WebSocket using official KiteTicker");
        connected = true;
        
        // Subscribe to all instruments
        subscribeToInstruments();
    }
    
    /**
     * Handles incoming tick data from KiteTicker.
     * Converts Kite ticks to our domain objects and publishes events.
     */
    private void handleKiteTicks(ArrayList<Tick> kiteTicks) {
        try {
            if (debugMessageCount < 3) {
                debugMessageCount++;
                log.info("🔍 RECEIVED {} TICKS from official KiteTicker (debug #{})", 
                    kiteTicks.size(), debugMessageCount);
            }
            
            // Convert Kite ticks to our domain objects and publish events
            for (Tick kiteTick : kiteTicks) {
                try {
                    com.moneytree.socketengine.domain.Tick domainTick = convertKiteTickToDomain(kiteTick);
                    if (domainTick != null) {
                        eventPublisher.publishEvent(new TickReceivedEvent(domainTick));
                        ticksReceivedCounter.increment();
                        
                        // Log index ticks for debugging
                        if (domainTick.getType() == InstrumentType.INDEX && debugMessageCount <= 3) {
                            log.info("✅ INDEX TICK: {} = ₹{} (OHLC: {},{},{},{})", 
                                domainTick.getSymbol(), domainTick.getLastTradedPrice(),
                                domainTick.getOhlc().getOpen(), domainTick.getOhlc().getHigh(),
                                domainTick.getOhlc().getLow(), domainTick.getOhlc().getClose());
                        }
                    }
                } catch (Exception e) {
                    log.error("Error processing tick for instrument {}: {}", kiteTick.getInstrumentToken(), e.getMessage());
                }
            }
            
        } catch (Exception e) {
            log.error("Unexpected error processing tick data from KiteTicker", e);
        }
    }
    
    /**
     * Handles KiteTicker disconnection event.
     */
    private void handleKiteDisconnected() {
        log.warn("❌ KiteTicker disconnected from Kite WebSocket");
        connected = false;
        
        if (shouldReconnect) {
            log.info("Will attempt to reconnect (handled by KiteTicker automatically)");
        } else {
            log.info("Reconnection disabled, not attempting to reconnect");
        }
    }
    
    /**
     * Handles KiteTicker errors.
     * Special handling for authentication failures.
     */
    private void handleKiteError(Exception ex) {
        String errorMessage = ex.getMessage() != null ? ex.getMessage().toLowerCase() : "";
        
        // Check for authentication failures
        if (errorMessage.contains("401") || 
            errorMessage.contains("unauthorized") || 
            errorMessage.contains("authentication")) {
            
            log.error("❌ Kite authentication failed - stopping reconnection attempts. " +
                     "Please check API credentials.", ex);
            connected = false;
            shouldReconnect = false;
            
        } else {
            log.error("❌ KiteTicker error (reconnection handled automatically by KiteTicker)", ex);
        }
    }
    
    /**
     * Handles KiteException errors from the official library.
     */
    private void handleKiteException(com.zerodhatech.kiteconnect.kitehttp.exceptions.KiteException ex) {
        String errorMessage = ex.getMessage() != null ? ex.getMessage().toLowerCase() : "";
        
        // Check for authentication failures
        if (errorMessage.contains("401") || 
            errorMessage.contains("unauthorized") || 
            errorMessage.contains("authentication")) {
            
            log.error("❌ Kite authentication failed (KiteException) - stopping reconnection attempts. " +
                     "Please check API credentials.", ex);
            connected = false;
            shouldReconnect = false;
            
        } else {
            log.error("❌ KiteTicker KiteException (reconnection handled automatically by KiteTicker)", ex);
        }
    }
    
    /**
     * Converts Kite Connect library Tick to our domain Tick object.
     */
    private com.moneytree.socketengine.domain.Tick convertKiteTickToDomain(Tick kiteTick) {
        try {
            // Look up instrument info
            var instrumentInfo = instrumentLoader.getInstrumentInfo(kiteTick.getInstrumentToken());
            
            String symbol;
            InstrumentType type;
            
            if (instrumentInfo != null) {
                symbol = instrumentInfo.getTradingSymbol();
                type = instrumentInfo.getType();
            } else {
                symbol = String.valueOf(kiteTick.getInstrumentToken());
                type = InstrumentType.STOCK;
                log.warn("Instrument token {} not found, using token as symbol", kiteTick.getInstrumentToken());
            }
            
            return com.moneytree.socketengine.domain.Tick.builder()
                .symbol(symbol)
                .instrumentToken(kiteTick.getInstrumentToken())
                .type(type)
                .timestamp(Instant.now())
                .lastTradedPrice(kiteTick.getLastTradedPrice())
                .volume(kiteTick.getVolumeTradedToday())
                .ohlc(com.moneytree.socketengine.domain.Tick.OHLC.builder()
                    .open(kiteTick.getOpenPrice())
                    .high(kiteTick.getHighPrice())
                    .low(kiteTick.getLowPrice())
                    .close(kiteTick.getClosePrice())
                    .build())
                .build();
                
        } catch (Exception e) {
            log.error("Error converting Kite tick to domain object for instrument {}: {}", 
                kiteTick.getInstrumentToken(), e.getMessage());
            return null;
        }
    }
    
    /**
     * Subscribes to all instruments using KiteTicker.
     */
    private void subscribeToInstruments() {
        try {
            if (instruments == null || instruments.isEmpty()) {
                log.warn("No instruments to subscribe to");
                return;
            }
            
            // Extract instrument tokens as ArrayList<Long> (required by KiteTicker)
            ArrayList<Long> tokens = instruments.stream()
                .map(InstrumentInfo::getInstrumentToken)
                .collect(Collectors.toCollection(ArrayList::new));
            
            // Log breakdown by type for debugging
            long indexCount = instruments.stream()
                .filter(i -> i.getType() == InstrumentType.INDEX)
                .count();
            long stockCount = instruments.stream()
                .filter(i -> i.getType() == InstrumentType.STOCK)
                .count();
            
            log.info("Subscribing to {} instruments using KiteTicker: {} indices, {} stocks", 
                tokens.size(), indexCount, stockCount);
            
            // Log first few index tokens for verification
            List<Long> indexTokens = instruments.stream()
                .filter(i -> i.getType() == InstrumentType.INDEX)
                .map(InstrumentInfo::getInstrumentToken)
                .limit(10)
                .collect(Collectors.toList());
            log.info("Sample index tokens being subscribed: {}", indexTokens);
            
            // Subscribe using KiteTicker (handles all the WebSocket messaging internally)
            kiteTicker.subscribe(tokens);
            
            // Set mode to FULL to get complete OHLC data
            kiteTicker.setMode(tokens, KiteTicker.modeFull);
            
            log.info("✅ Subscription completed using official KiteTicker");
            
        } catch (Exception e) {
            log.error("❌ Failed to subscribe to instruments using KiteTicker", e);
        }
    }
    

    
    /**
     * Checks if the KiteTicker connection is currently active.
     * 
     * @return true if connected, false otherwise
     */
    public boolean isConnected() {
        return connected && kiteTicker != null;
    }
    
    /**
     * Manual shutdown method for testing purposes.
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
        status.put("usingOfficialKiteTicker", true);
        
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
