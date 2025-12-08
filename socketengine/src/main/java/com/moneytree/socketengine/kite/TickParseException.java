package com.moneytree.socketengine.kite;

/**
 * Exception thrown when binary tick data from Kite WebSocket cannot be parsed.
 * This typically indicates malformed data, unexpected format, or protocol changes.
 */
public class TickParseException extends RuntimeException {
    
    public TickParseException(String message) {
        super(message);
    }
    
    public TickParseException(String message, Throwable cause) {
        super(message, cause);
    }
}
