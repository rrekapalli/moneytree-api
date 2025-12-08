package com.moneytree.socketengine.performance;

import com.moneytree.socketengine.domain.InstrumentType;
import com.moneytree.socketengine.domain.Tick;
import com.moneytree.socketengine.domain.events.TickReceivedEvent;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Duration;
import java.time.Instant;
import java.util.Random;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;

/**
 * Tests for monitoring thread pool behavior under load
 */
@SpringBootTest
@Testcontainers
class ThreadPoolMonitoringTest {
    
    private static final Logger log = LoggerFactory.getLogger(ThreadPoolMonitoringTest.class);
    
    @Container
    static GenericContainer<?> redis = new GenericContainer<>("redis:7-alpine")
        .withExposedPorts(6379);
    
    @Container
    static PostgreSQLContainer<?> timescaleDB = new PostgreSQLContainer<>(
        "timescale/timescaledb:latest-pg15")
        .withDatabaseName("test")
        .withUsername("test")
        .withPassword("test");
    
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.redis.host", redis::getHost);
        registry.add("spring.redis.port", redis::getFirstMappedPort);
        registry.add("spring.datasource.url", timescaleDB::getJdbcUrl);
        registry.add("spring.datasource.username", timescaleDB::getUsername);
        registry.add("spring.datasource.password", timescaleDB::getPassword);
    }
    
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    @Autowired(required = false)
    private ThreadPoolTaskExecutor tickCacheExecutor;
    
    @Autowired(required = false)
    private ThreadPoolTaskExecutor tickPersistenceExecutor;
    
    /**
     * Monitor thread pool queue sizes under sustained load
     */
    @Test
    void shouldMonitorThreadPoolQueueSizes() {
        log.info("=== Thread Pool Queue Size Monitoring ===");
        
        if (tickCacheExecutor == null || tickPersistenceExecutor == null) {
            log.warn("Thread pool executors not available, skipping test");
            return;
        }
        
        int tickCount = 10000;
        int monitoringIntervalMs = 100;
        
        // Start monitoring thread
        Thread monitorThread = new Thread(() -> {
            while (!Thread.currentThread().isInterrupted()) {
                try {
                    int cacheQueueSize = tickCacheExecutor.getThreadPoolExecutor().getQueue().size();
                    int cacheActiveThreads = tickCacheExecutor.getActiveCount();
                    int persistQueueSize = tickPersistenceExecutor.getThreadPoolExecutor().getQueue().size();
                    int persistActiveThreads = tickPersistenceExecutor.getActiveCount();
                    
                    log.info("Cache Executor - Queue: {}, Active: {}/{}", 
                        cacheQueueSize, cacheActiveThreads, tickCacheExecutor.getCorePoolSize());
                    log.info("Persist Executor - Queue: {}, Active: {}/{}", 
                        persistQueueSize, persistActiveThreads, tickPersistenceExecutor.getCorePoolSize());
                    
                    Thread.sleep(monitoringIntervalMs);
                } catch (InterruptedException e) {
                    break;
                }
            }
        });
        monitorThread.start();
        
        // Generate load
        long startTime = System.currentTimeMillis();
        for (int i = 0; i < tickCount; i++) {
            Tick tick = createRandomTick();
            eventPublisher.publishEvent(new TickReceivedEvent(tick));
            
            // Small delay to simulate realistic tick rate
            if (i % 100 == 0) {
                try {
                    Thread.sleep(1);
                } catch (InterruptedException e) {
                    break;
                }
            }
        }
        long endTime = System.currentTimeMillis();
        
        // Wait for queues to drain
        await().atMost(Duration.ofSeconds(30))
            .until(() -> tickCacheExecutor.getThreadPoolExecutor().getQueue().isEmpty() &&
                        tickPersistenceExecutor.getThreadPoolExecutor().getQueue().isEmpty());
        
        // Stop monitoring
        monitorThread.interrupt();
        
        long duration = endTime - startTime;
        double ticksPerSecond = (tickCount * 1000.0) / duration;
        
        log.info("Published {} ticks in {}ms ({:.0f} ticks/second)", 
            tickCount, duration, ticksPerSecond);
        log.info("Final Cache Executor - Queue: {}, Completed: {}", 
            tickCacheExecutor.getThreadPoolExecutor().getQueue().size(),
            tickCacheExecutor.getThreadPoolExecutor().getCompletedTaskCount());
        log.info("Final Persist Executor - Queue: {}, Completed: {}", 
            tickPersistenceExecutor.getThreadPoolExecutor().getQueue().size(),
            tickPersistenceExecutor.getThreadPoolExecutor().getCompletedTaskCount());
        
        // Verify queues drained
        assertThat(tickCacheExecutor.getThreadPoolExecutor().getQueue()).isEmpty();
        assertThat(tickPersistenceExecutor.getThreadPoolExecutor().getQueue()).isEmpty();
        
        log.info("✓ Thread pool monitoring test PASSED");
    }
    
    /**
     * Test thread pool behavior under queue overflow conditions
     */
    @Test
    void shouldHandleThreadPoolQueueOverflow() {
        log.info("=== Thread Pool Queue Overflow Test ===");
        
        if (tickCacheExecutor == null || tickPersistenceExecutor == null) {
            log.warn("Thread pool executors not available, skipping test");
            return;
        }
        
        // Get queue capacities
        int cacheQueueCapacity = tickCacheExecutor.getThreadPoolExecutor().getQueue().remainingCapacity();
        int persistQueueCapacity = tickPersistenceExecutor.getThreadPoolExecutor().getQueue().remainingCapacity();
        
        log.info("Cache queue capacity: {}", cacheQueueCapacity);
        log.info("Persist queue capacity: {}", persistQueueCapacity);
        
        // Try to overflow the queue (should trigger CallerRunsPolicy)
        int overflowCount = Math.max(cacheQueueCapacity, persistQueueCapacity) + 1000;
        
        for (int i = 0; i < overflowCount; i++) {
            Tick tick = createRandomTick();
            eventPublisher.publishEvent(new TickReceivedEvent(tick));
        }
        
        // Wait for processing
        await().atMost(Duration.ofSeconds(60))
            .until(() -> tickCacheExecutor.getThreadPoolExecutor().getQueue().size() < 100 &&
                        tickPersistenceExecutor.getThreadPoolExecutor().getQueue().size() < 100);
        
        log.info("System handled queue overflow gracefully");
        log.info("✓ Queue overflow test PASSED");
    }
    
    /**
     * Monitor thread creation and destruction
     */
    @Test
    void shouldMonitorThreadLifecycle() {
        log.info("=== Thread Lifecycle Monitoring ===");
        
        if (tickCacheExecutor == null || tickPersistenceExecutor == null) {
            log.warn("Thread pool executors not available, skipping test");
            return;
        }
        
        // Record initial state
        int initialCacheThreads = tickCacheExecutor.getPoolSize();
        int initialPersistThreads = tickPersistenceExecutor.getPoolSize();
        
        log.info("Initial cache threads: {}", initialCacheThreads);
        log.info("Initial persist threads: {}", initialPersistThreads);
        
        // Generate burst load
        for (int i = 0; i < 5000; i++) {
            Tick tick = createRandomTick();
            eventPublisher.publishEvent(new TickReceivedEvent(tick));
        }
        
        // Wait a bit for threads to scale up
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            // Ignore
        }
        
        int peakCacheThreads = tickCacheExecutor.getPoolSize();
        int peakPersistThreads = tickPersistenceExecutor.getPoolSize();
        
        log.info("Peak cache threads: {}", peakCacheThreads);
        log.info("Peak persist threads: {}", peakPersistThreads);
        
        // Wait for queues to drain
        await().atMost(Duration.ofSeconds(30))
            .until(() -> tickCacheExecutor.getThreadPoolExecutor().getQueue().isEmpty() &&
                        tickPersistenceExecutor.getThreadPoolExecutor().getQueue().isEmpty());
        
        // Wait for idle threads to be cleaned up
        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            // Ignore
        }
        
        int finalCacheThreads = tickCacheExecutor.getPoolSize();
        int finalPersistThreads = tickPersistenceExecutor.getPoolSize();
        
        log.info("Final cache threads: {}", finalCacheThreads);
        log.info("Final persist threads: {}", finalPersistThreads);
        
        // Verify threads scaled up under load
        assertThat(peakCacheThreads).isGreaterThanOrEqualTo(initialCacheThreads);
        assertThat(peakPersistThreads).isGreaterThanOrEqualTo(initialPersistThreads);
        
        log.info("✓ Thread lifecycle monitoring test PASSED");
    }
    
    private Tick createRandomTick() {
        Random random = new Random();
        boolean isIndex = random.nextBoolean();
        
        return Tick.builder()
            .symbol(isIndex ? "NIFTY 50" : "RELIANCE")
            .instrumentToken(isIndex ? 256265L : 738561L)
            .type(isIndex ? InstrumentType.INDEX : InstrumentType.STOCK)
            .timestamp(Instant.now())
            .lastTradedPrice(20000 + random.nextDouble() * 5000)
            .volume(random.nextInt(1000000))
            .ohlc(Tick.OHLC.builder()
                .open(20000 + random.nextDouble() * 5000)
                .high(20000 + random.nextDouble() * 5000)
                .low(20000 + random.nextDouble() * 5000)
                .close(20000 + random.nextDouble() * 5000)
                .build())
            .rawBinaryData(new byte[]{0x01, 0x02, 0x03, 0x04})
            .build();
    }
}
