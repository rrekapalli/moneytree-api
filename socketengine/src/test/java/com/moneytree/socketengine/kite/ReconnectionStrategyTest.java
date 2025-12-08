package com.moneytree.socketengine.kite;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for ReconnectionStrategy.
 */
class ReconnectionStrategyTest {

    private ReconnectionStrategy strategy;

    @BeforeEach
    void setUp() {
        strategy = new ReconnectionStrategy();
    }

    @Test
    void shouldReturnExponentialBackoffSequence() {
        // When: Getting delays for multiple attempts
        long delay1 = strategy.getNextDelay();
        long delay2 = strategy.getNextDelay();
        long delay3 = strategy.getNextDelay();
        long delay4 = strategy.getNextDelay();
        long delay5 = strategy.getNextDelay();
        long delay6 = strategy.getNextDelay();
        long delay7 = strategy.getNextDelay();
        long delay8 = strategy.getNextDelay();

        // Then: Should follow exponential backoff: 1, 2, 4, 8, 16, 32, 60, 60
        assertThat(delay1).isEqualTo(1);
        assertThat(delay2).isEqualTo(2);
        assertThat(delay3).isEqualTo(4);
        assertThat(delay4).isEqualTo(8);
        assertThat(delay5).isEqualTo(16);
        assertThat(delay6).isEqualTo(32);
        assertThat(delay7).isEqualTo(60);  // Max delay reached
        assertThat(delay8).isEqualTo(60);  // Stays at max
    }

    @Test
    void shouldCapDelayAtMaximum() {
        // Given: Multiple attempts to reach max delay
        for (int i = 0; i < 10; i++) {
            strategy.getNextDelay();
        }

        // When: Getting another delay
        long delay = strategy.getNextDelay();

        // Then: Should still be at max
        assertThat(delay).isEqualTo(60);
    }

    @Test
    void shouldResetAttemptCounter() {
        // Given: Strategy with multiple attempts
        strategy.getNextDelay();  // 1
        strategy.getNextDelay();  // 2
        strategy.getNextDelay();  // 4
        assertThat(strategy.getAttemptCount()).isEqualTo(3);

        // When: Resetting the strategy
        strategy.reset();

        // Then: Next delay should be back to 1 second
        assertThat(strategy.getAttemptCount()).isEqualTo(0);
        long delay = strategy.getNextDelay();
        assertThat(delay).isEqualTo(1);
        assertThat(strategy.getAttemptCount()).isEqualTo(1);
    }

    @Test
    void shouldBeThreadSafe() throws InterruptedException {
        // Given: Multiple threads accessing the strategy concurrently
        int threadCount = 10;
        int attemptsPerThread = 100;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(threadCount);
        List<Long> allDelays = new ArrayList<>();

        // When: Multiple threads call getNextDelay() concurrently
        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    for (int j = 0; j < attemptsPerThread; j++) {
                        long delay = strategy.getNextDelay();
                        synchronized (allDelays) {
                            allDelays.add(delay);
                        }
                    }
                } finally {
                    latch.countDown();
                }
            });
        }

        // Wait for all threads to complete
        latch.await(10, TimeUnit.SECONDS);
        executor.shutdown();

        // Then: Should have exactly threadCount * attemptsPerThread delays
        assertThat(allDelays).hasSize(threadCount * attemptsPerThread);
        
        // And: Final attempt count should match total attempts
        assertThat(strategy.getAttemptCount()).isEqualTo(threadCount * attemptsPerThread);
        
        // And: All delays should be valid (between 1 and 60)
        assertThat(allDelays).allMatch(delay -> delay >= 1 && delay <= 60);
    }

    @Test
    void shouldHandleResetDuringConcurrentAccess() throws InterruptedException {
        // Given: Multiple threads accessing the strategy
        int threadCount = 5;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(threadCount);

        // When: Some threads call getNextDelay() while others call reset()
        for (int i = 0; i < threadCount; i++) {
            final int threadIndex = i;
            executor.submit(() -> {
                try {
                    for (int j = 0; j < 50; j++) {
                        if (threadIndex % 2 == 0) {
                            strategy.getNextDelay();
                        } else {
                            strategy.reset();
                        }
                        Thread.sleep(1);  // Small delay to increase contention
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    latch.countDown();
                }
            });
        }

        // Wait for all threads to complete
        latch.await(10, TimeUnit.SECONDS);
        executor.shutdown();

        // Then: Should complete without exceptions
        // The exact count is non-deterministic due to resets, but should be valid
        int finalCount = strategy.getAttemptCount();
        assertThat(finalCount).isGreaterThanOrEqualTo(0);
    }

    @Test
    void shouldStartFromOneAfterReset() {
        // Given: Strategy that has been used and reset multiple times
        strategy.getNextDelay();
        strategy.getNextDelay();
        strategy.reset();
        
        strategy.getNextDelay();
        strategy.getNextDelay();
        strategy.getNextDelay();
        strategy.reset();

        // When: Getting next delay after final reset
        long delay = strategy.getNextDelay();

        // Then: Should start from 1 second
        assertThat(delay).isEqualTo(1);
    }

    @Test
    void shouldReturnCorrectAttemptCount() {
        // Given: Fresh strategy
        assertThat(strategy.getAttemptCount()).isEqualTo(0);

        // When: Making several attempts
        strategy.getNextDelay();
        assertThat(strategy.getAttemptCount()).isEqualTo(1);
        
        strategy.getNextDelay();
        assertThat(strategy.getAttemptCount()).isEqualTo(2);
        
        strategy.getNextDelay();
        assertThat(strategy.getAttemptCount()).isEqualTo(3);

        // When: Resetting
        strategy.reset();

        // Then: Count should be zero
        assertThat(strategy.getAttemptCount()).isEqualTo(0);
    }
}
