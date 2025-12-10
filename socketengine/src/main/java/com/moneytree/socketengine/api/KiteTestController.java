package com.moneytree.socketengine.api;

import com.moneytree.socketengine.kite.KiteWebSocketClient;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for testing Kite WebSocket functionality.
 * This controller provides endpoints to test shutdown behavior and monitor subscription status.
 * 
 * <p><strong>WARNING:</strong> These endpoints are for testing purposes only.
 * Do not use in production without proper authentication and authorization.
 */
@RestController
@RequestMapping("/api/test/kite")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Kite Test", description = "Testing endpoints for Kite WebSocket functionality")
public class KiteTestController {
    
    private final KiteWebSocketClient kiteWebSocketClient;
    
    /**
     * Get current Kite WebSocket subscription status.
     * Useful for monitoring and debugging subscription issues.
     * 
     * @return Current subscription status including connection state and instrument count
     */
    @GetMapping("/status")
    @Operation(
        summary = "Get Kite subscription status",
        description = "Returns current WebSocket connection status, instrument count, and sample subscribed instruments"
    )
    public ResponseEntity<Map<String, Object>> getSubscriptionStatus() {
        try {
            log.info("📊 Getting Kite subscription status");
            Map<String, Object> status = kiteWebSocketClient.getSubscriptionStatus();
            
            log.info("✅ Subscription status retrieved: connected={}, instruments={}", 
                status.get("connected"), status.get("instrumentCount"));
            
            return ResponseEntity.ok(status);
            
        } catch (Exception e) {
            log.error("❌ Error getting subscription status", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to get subscription status: " + e.getMessage()));
        }
    }
    
    /**
     * Manually trigger Kite WebSocket shutdown for testing.
     * This endpoint allows testing the shutdown behavior without stopping the entire application.
     * 
     * <p><strong>WARNING:</strong> This will disconnect from Kite and stop all tick data.
     * Use only for testing purposes.
     * 
     * @return Confirmation of shutdown initiation
     */
    @PostMapping("/shutdown")
    @Operation(
        summary = "Test Kite shutdown behavior",
        description = "Manually triggers Kite WebSocket shutdown to test unsubscribe and cleanup behavior. " +
                     "WARNING: This will stop all tick data streaming."
    )
    public ResponseEntity<Map<String, Object>> testShutdown() {
        try {
            log.warn("🧪 MANUAL SHUTDOWN TEST initiated via REST endpoint");
            
            // Get status before shutdown
            Map<String, Object> beforeStatus = kiteWebSocketClient.getSubscriptionStatus();
            log.warn("📊 Status BEFORE shutdown: {}", beforeStatus);
            
            // Trigger manual shutdown
            kiteWebSocketClient.manualShutdown();
            
            // Wait a moment for shutdown to complete
            Thread.sleep(2000);
            
            // Get status after shutdown
            Map<String, Object> afterStatus = kiteWebSocketClient.getSubscriptionStatus();
            log.warn("📊 Status AFTER shutdown: {}", afterStatus);
            
            return ResponseEntity.ok(Map.of(
                "message", "Shutdown test completed",
                "beforeShutdown", beforeStatus,
                "afterShutdown", afterStatus,
                "timestamp", java.time.Instant.now().toString()
            ));
            
        } catch (Exception e) {
            log.error("❌ Error during shutdown test", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Shutdown test failed: " + e.getMessage()));
        }
    }
    
    /**
     * Check if Kite WebSocket is currently connected.
     * Simple health check endpoint.
     * 
     * @return Connection status
     */
    @GetMapping("/connected")
    @Operation(
        summary = "Check Kite connection",
        description = "Simple endpoint to check if Kite WebSocket is currently connected"
    )
    public ResponseEntity<Map<String, Object>> isConnected() {
        boolean connected = kiteWebSocketClient.isConnected();
        
        return ResponseEntity.ok(Map.of(
            "connected", connected,
            "timestamp", java.time.Instant.now().toString()
        ));
    }
}