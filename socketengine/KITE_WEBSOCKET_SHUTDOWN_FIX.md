# Kite WebSocket Shutdown Fix

## Issue Summary

When the socketengine application is terminated, the Kite WebSocket connection was not closing properly, leading to:
1. Lingering WebSocket connection to Zerodha Kite API
2. Connection remaining in "OPEN" or "CLOSING" state after application shutdown
3. Potential resource leaks and connection quota issues with Kite API

## Root Cause

The `@PreDestroy` method in `KiteWebSocketClient` was calling `webSocketClient.close()`, which is an **asynchronous** operation. The JVM would shut down before the WebSocket close handshake could complete, leaving the connection in a half-closed state.

```java
// BEFORE (Problematic code)
@PreDestroy
public void shutdown() {
    log.info("Shutting down Kite WebSocket client");
    shouldReconnect = false;
    
    if (webSocketClient != null && webSocketClient.isOpen()) {
        webSocketClient.close();  // ❌ Asynchronous - doesn't wait for completion
    }
}
```

## Solution

Changed to use `closeBlocking()` which **waits** for the WebSocket close handshake to complete before returning. This ensures the connection is properly closed before the JVM shuts down.

```java
// AFTER (Fixed code)
@PreDestroy
public void shutdown() {
    log.info("Shutting down Kite WebSocket client");
    shouldReconnect = false;
    
    if (webSocketClient != null) {
        try {
            if (webSocketClient.isOpen()) {
                log.info("Closing Kite WebSocket connection...");
                // Close with normal closure code (1000) and WAIT for completion
                webSocketClient.closeBlocking();  // ✅ Blocks until close completes
                log.info("Kite WebSocket connection closed successfully");
            } else {
                log.info("Kite WebSocket connection already closed");
            }
        } catch (InterruptedException e) {
            log.warn("Interrupted while closing Kite WebSocket connection", e);
            Thread.currentThread().interrupt();
            // Force close if blocking close was interrupted
            webSocketClient.close();
        } catch (Exception e) {
            log.error("Error closing Kite WebSocket connection", e);
            // Force close on error
            webSocketClient.close();
        }
    }
}
```

## Key Changes

1. **Blocking Close**: Uses `closeBlocking()` instead of `close()`
   - Waits for the WebSocket close handshake to complete
   - Ensures proper cleanup before JVM shutdown

2. **Enhanced Error Handling**:
   - Handles `InterruptedException` if shutdown is interrupted
   - Falls back to force close on errors
   - Preserves interrupt status for proper thread cleanup

3. **Better Logging**:
   - Logs when close starts and completes
   - Logs if connection is already closed
   - Logs any errors during close

## How It Works

### WebSocket Close Handshake

1. **Client sends CLOSE frame** to Kite server
2. **Server acknowledges** with CLOSE frame
3. **Connection fully closed** - both sides agree

### Before Fix (Async Close)
```
Application shutdown initiated
  ↓
@PreDestroy called
  ↓
webSocketClient.close() called (async)
  ↓
JVM shuts down immediately ❌
  ↓
Close handshake incomplete
  ↓
Connection left in CLOSING state
```

### After Fix (Blocking Close)
```
Application shutdown initiated
  ↓
@PreDestroy called
  ↓
webSocketClient.closeBlocking() called
  ↓
Waits for close handshake... ⏳
  ↓
Close handshake completes ✅
  ↓
Method returns
  ↓
JVM shuts down cleanly
```

## Testing

### Manual Test
1. Start socketengine: `./start-app.sh`
2. Verify connection to Kite in logs: `Connected to Kite WebSocket`
3. Stop application: `Ctrl+C` or `kill <pid>`
4. Check logs for clean shutdown:
   ```
   Shutting down Kite WebSocket client
   Closing Kite WebSocket connection...
   Kite WebSocket connection closed successfully
   ```

### Verification
- No lingering connections in `netstat` or network monitoring tools
- Kite API connection quota not consumed by zombie connections
- Clean shutdown logs with no errors

## Benefits

1. **Proper Resource Cleanup**: WebSocket connection fully closed
2. **No Connection Leaks**: Prevents quota exhaustion with Kite API
3. **Clean Shutdown**: Graceful termination with proper handshake
4. **Better Reliability**: Ensures connection state is consistent
5. **Improved Logging**: Clear visibility into shutdown process

## Related Files

- `socketengine/src/main/java/com/moneytree/socketengine/kite/KiteWebSocketClient.java`

## References

- [Java-WebSocket closeBlocking() documentation](https://javadoc.io/doc/org.java-websocket/Java-WebSocket/latest/org/java_websocket/client/WebSocketClient.html#closeBlocking())
- [WebSocket Close Handshake (RFC 6455)](https://datatracker.ietf.org/doc/html/rfc6455#section-7.1.2)
- [Spring @PreDestroy lifecycle](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/annotation/PreDestroy.html)

## Notes

- The `closeBlocking()` method will wait indefinitely by default
- If the server doesn't respond, the close may hang
- The interrupt handling ensures we can still force-close if needed
- This fix is critical for production deployments where connection quotas matter
