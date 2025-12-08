package com.moneytree.socketengine.kite;

import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicInteger;

/**
 * Implements exponential backoff strategy for WebSocket reconnection attempts.
 * <p>
 * The delay sequence follows: 1s, 2s, 4s, 8s, 16s, 32s, 60s (max)
 * After reaching the maximum delay, all subsequent attempts use 60 seconds.
 * <p>
 * Thread-safe implementation using AtomicInteger for concurrent access.
 */
@Component
public class ReconnectionStrategy {

    private static final long MIN_DELAY_SECONDS = 1;
    private static final long MAX_DELAY_SECONDS = 60;

    private final AtomicInteger attemptCount = new AtomicInteger(0);

    /**
     * Calculates the next reconnection delay using exponential backoff.
     * <p>
     * Formula: delay = min(2^(attempt-1), MAX_DELAY_SECONDS)
     * <p>
     * Sequence: 1, 2, 4, 8, 16, 32, 60, 60, 60...
     *
     * @return delay in seconds before next reconnection attempt
     */
    public long getNextDelay() {
        int attempt = attemptCount.incrementAndGet();
        
        // Prevent overflow: if attempt is too large, just return max delay
        if (attempt > 6) {  // 2^6 = 64, which is already > MAX_DELAY_SECONDS
            return MAX_DELAY_SECONDS;
        }
        
        long delay = Math.min(
            MIN_DELAY_SECONDS * (1L << (attempt - 1)),  // Exponential: 2^(attempt-1)
            MAX_DELAY_SECONDS
        );
        return delay;
    }

    /**
     * Resets the attempt counter to zero.
     * Should be called after a successful connection is established.
     */
    public void reset() {
        attemptCount.set(0);
    }

    /**
     * Gets the current attempt count.
     * Useful for monitoring and logging purposes.
     *
     * @return current number of reconnection attempts
     */
    public int getAttemptCount() {
        return attemptCount.get();
    }
}
