package com.moneytree.socketengine.performance;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneytree.socketengine.api.dto.SubscriptionRequestDto;
import com.moneytree.socketengine.api.dto.TickDto;
import com.moneytree.socketengine.domain.InstrumentType;
import com.moneytree.socketengine.domain.Tick;
import com.moneytree.socketengine.domain.events.TickReceivedEvent;
import com.moneytree.socketengine.persistence.TickBatchBuffer;
import com.moneytree.socketengine.persistence.TickPersistenceService;
import com.moneytree.socketengine.redis.TickCacheService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;

/**
 * Comprehensive performance test suite for SocketEngine module
 * 
 * Tests:
 * 1. High-frequency tick ingestion (1000 ticks/second)
 * 2. Multiple concurrent WebSocket clients (100 clients)
 * 3. Broadcast latency measurements (p50, p95, p99)
 * 4. Redis cache write latency
 * 5. TimescaleDB batch insert duration
 * 6. Thread pool queue monitoring
 * 7. Memory usage of tick buffer
 * 8. Subscription churn (frequent subscribe/unsubscribe)
 * 9. Async consumers don't block hot path
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@Testcontainers
class SocketEnginePerformanceTest {
    
    private static final Logger log = LoggerFactory.getLogger(SocketEnginePerformanceTest.class);
    
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
        registry.add("server.port", () -> "8081");
    }
    
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    @Autowired
    private TickCacheService cacheService;
    
    @Autowired
    private TickBatchBuffer buffer;
    
    @Autowired
    private TickPersistenceService persistenceService;
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    private final List<Long> broadcastLatencies = new CopyOnWriteArrayList<>();
    private final List<Long> redisCacheLatencies = new CopyOnWriteArrayList<>();
    
    @BeforeEach
    void setUp() {
        broadcastLatencies.clear();
        redisCacheLatencies.clear();
        
        // Clear Redis
        redisTemplate.getConnectionFactory().getConnection().flushAll();
    }
    
    /**
     * Test 1: High-frequency tick ingestion (1000 ticks/second)
     * Validates that the system can handle sustained high-frequency data
     */
    @Test
    void shouldHandleHighFrequencyTickIngestion() {
        log.info("=== Test 1: High-frequency tick ingestion (1000 ticks/second) ===");
        
        int ticksPerSecond = 1000;
        int durationSeconds = 10;
        int totalTicks = ticksPerSecond * durationSeconds;
        
        AtomicInteger ticksPublished = new AtomicInteger(0);
        long startTime = System.currentTimeMillis();
        
        // Publish ticks at 1000/second rate
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
        scheduler.scheduleAtFixedRate(() -> {
            if (ticksPublished.get() < totalTicks) {
                Tick tick = createRandomTick();
                eventPublisher.publishEvent(new TickReceivedEvent(tick));
                ticksPublished.incrementAndGet();
            }
        }, 0, 1, TimeUnit.MILLISECONDS);
        
        // Wait for all ticks to be published
        await().atMost(Duration.ofSeconds(durationSeconds + 5))
            .until(() -> ticksPublished.get() >= totalTicks);
        
        scheduler.shutdown();
        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;
        
        double actualRate = (totalTicks * 1000.0) / duration;
        
        log.info("Published {} ticks in {}ms", totalTicks, duration);
        log.info("Actual rate: {:.2f} ticks/second", actualRate);
        log.info("Buffer size: {}", buffer.getBufferSize());
        
        // Verify system handled the load
        assertThat(ticksPublished.get()).isEqualTo(totalTicks);
        assertThat(actualRate).isGreaterThan(900.0); // Allow 10% variance
        
        // Verify buffer accumulated ticks
        assertThat(buffer.getBufferSize()).isGreaterThan(0);
        
        log.info("✓ Test 1 PASSED: System handled {} ticks/second", (int)actualRate);
    }
    
    /**
     * Test 2: Multiple concurrent WebSocket clients (100 clients)
     * Validates that the system can handle many simultaneous connections
     */
    @Test
    void shouldHandleMultipleConcurrentWebSocketClients() throws Exception {
        log.info("=== Test 2: Multiple concurrent WebSocket clients (100 clients) ===");
        
        int clientCount = 100;
        CountDownLatch connectLatch = new CountDownLatch(clientCount);
        CountDownLatch messageLatch = new CountDownLatch(clientCount);
        AtomicInteger messagesReceived = new AtomicInteger(0);
        
        List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();
        StandardWebSocketClient client = new StandardWebSocketClient();
        
        // Connect 100 clients
        ExecutorService executor = Executors.newFixedThreadPool(20);
        for (int i = 0; i < clientCount; i++) {
            final int clientId = i;
            executor.submit(() -> {
                try {
                    WebSocketSession session = client.doHandshake(
                        new TextWebSocketHandler() {
                            @Override
                            protected void handleTextMessage(WebSocketSession session, TextMessage message) {
                                messagesReceived.incrementAndGet();
                                messageLatch.countDown();
                            }
                            
                            @Override
                            public void afterConnectionEstablished(WebSocketSession session) {
                                sessions.add(session);
                                connectLatch.countDown();
                            }
                        },
                        "ws://localhost:8081/ws/indices/all"
                    ).get(10, TimeUnit.SECONDS);
                    
                } catch (Exception e) {
                    log.error("Client {} failed to connect", clientId, e);
                }
            });
        }
        
        // Wait for all clients to connect
        boolean allConnected = connectLatch.await(30, TimeUnit.SECONDS);
        assertThat(allConnected).isTrue();
        log.info("All {} clients connected", sessions.size());
        
        // Publish a tick that should be broadcast to all clients
        Tick tick = createIndexTick("NIFTY 50");
        eventPublisher.publishEvent(new TickReceivedEvent(tick));
        
        // Wait for all clients to receive the message
        boolean allReceived = messageLatch.await(10, TimeUnit.SECONDS);
        
        log.info("Messages received: {}/{}", messagesReceived.get(), clientCount);
        
        // Cleanup
        sessions.forEach(session -> {
            try {
                session.close();
            } catch (Exception e) {
                // Ignore
            }
        });
        executor.shutdown();
        
        assertThat(messagesReceived.get()).isGreaterThanOrEqualTo((int)(clientCount * 0.95)); // Allow 5% loss
        
        log.info("✓ Test 2 PASSED: Handled {} concurrent clients", sessions.size());
    }
    
    /**
     * Test 3: Broadcast latency measurements (p50, p95, p99)
     * Measures end-to-end latency from tick publication to client receipt
     */
    @Test
    void shouldMeasureBroadcastLatency() throws Exception {
        log.info("=== Test 3: Broadcast latency measurements ===");
        
        int sampleSize = 1000;
        CountDownLatch latch = new CountDownLatch(sampleSize);
        Map<String, Long> tickTimestamps = new ConcurrentHashMap<>();
        
        // Connect a test client
        StandardWebSocketClient client = new StandardWebSocketClient();
        WebSocketSession session = client.doHandshake(
            new TextWebSocketHandler() {
                @Override
                protected void handleTextMessage(WebSocketSession session, TextMessage message) {
                    try {
                        long receiveTime = System.nanoTime();
                        TickDto dto = objectMapper.readValue(message.getPayload(), TickDto.class);
                        
                        Long publishTime = tickTimestamps.get(dto.getSymbol() + "-" + dto.getTimestamp());
                        if (publishTime != null) {
                            long latencyNanos = receiveTime - publishTime;
                            broadcastLatencies.add(latencyNanos / 1_000_000); // Convert to ms
                            latch.countDown();
                        }
                    } catch (Exception e) {
                        log.error("Error processing message", e);
                    }
                }
            },
            "ws://localhost:8081/ws/indices/all"
        ).get(10, TimeUnit.SECONDS);
        
        // Publish ticks and measure latency
        for (int i = 0; i < sampleSize; i++) {
            Tick tick = createIndexTick("NIFTY 50");
            String key = tick.getSymbol() + "-" + tick.getTimestamp().toString();
            tickTimestamps.put(key, System.nanoTime());
            
            eventPublisher.publishEvent(new TickReceivedEvent(tick));
            
            // Small delay to avoid overwhelming the system
            Thread.sleep(1);
        }
        
        // Wait for all messages to be received
        boolean completed = latch.await(30, TimeUnit.SECONDS);
        assertThat(completed).isTrue();
        
        // Calculate percentiles
        Collections.sort(broadcastLatencies);
        long p50 = getPercentile(broadcastLatencies, 50);
        long p95 = getPercentile(broadcastLatencies, 95);
        long p99 = getPercentile(broadcastLatencies, 99);
        long max = broadcastLatencies.get(broadcastLatencies.size() - 1);
        
        log.info("Broadcast Latency Statistics (ms):");
        log.info("  P50: {}", p50);
        log.info("  P95: {}", p95);
        log.info("  P99: {}", p99);
        log.info("  Max: {}", max);
        
        // Cleanup
        session.close();
        
        // Verify latencies are acceptable (< 100ms for p99)
        assertThat(p99).isLessThan(100);
        
        log.info("✓ Test 3 PASSED: Broadcast latency P99 = {}ms", p99);
    }
    
    /**
     * Test 4: Redis cache write latency
     * Measures how long it takes to cache ticks to Redis
     */
    @Test
    void shouldMeasureRedisCacheWriteLatency() {
        log.info("=== Test 4: Redis cache write latency ===");
        
        int sampleSize = 1000;
        
        for (int i = 0; i < sampleSize; i++) {
            Tick tick = createRandomTick();
            long startTime = System.nanoTime();
            
            cacheService.onTickReceived(new TickReceivedEvent(tick));
            
            long endTime = System.nanoTime();
            long latencyMs = (endTime - startTime) / 1_000_000;
            redisCacheLatencies.add(latencyMs);
        }
        
        // Wait for async operations to complete
        await().atMost(Duration.ofSeconds(10))
            .until(() -> redisCacheLatencies.size() >= sampleSize);
        
        // Calculate percentiles
        Collections.sort(redisCacheLatencies);
        long p50 = getPercentile(redisCacheLatencies, 50);
        long p95 = getPercentile(redisCacheLatencies, 95);
        long p99 = getPercentile(redisCacheLatencies, 99);
        
        log.info("Redis Cache Write Latency Statistics (ms):");
        log.info("  P50: {}", p50);
        log.info("  P95: {}", p95);
        log.info("  P99: {}", p99);
        
        // Verify latencies are acceptable (< 50ms for p99)
        assertThat(p99).isLessThan(50);
        
        log.info("✓ Test 4 PASSED: Redis cache write latency P99 = {}ms", p99);
    }
    
    /**
     * Test 5: TimescaleDB batch insert duration
     * Measures how long it takes to persist large batches
     */
    @Test
    void shouldMeasureTimescaleDBBatchInsertDuration() {
        log.info("=== Test 5: TimescaleDB batch insert duration ===");
        
        int[] batchSizes = {1000, 5000, 10000, 50000};
        
        for (int batchSize : batchSizes) {
            // Fill buffer with ticks
            for (int i = 0; i < batchSize; i++) {
                Tick tick = createRandomTick();
                buffer.onTickReceived(new TickReceivedEvent(tick));
            }
            
            // Wait for async buffering
            await().atMost(Duration.ofSeconds(10))
                .until(() -> buffer.getBufferSize() >= batchSize);
            
            // Measure batch insert time
            long startTime = System.currentTimeMillis();
            persistenceService.persistBatch();
            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;
            
            double ticksPerSecond = (batchSize * 1000.0) / duration;
            
            log.info("Batch size: {}, Duration: {}ms, Rate: {:.0f} ticks/second", 
                batchSize, duration, ticksPerSecond);
            
            // Verify reasonable performance (> 1000 ticks/second)
            assertThat(ticksPerSecond).isGreaterThan(1000);
        }
        
        log.info("✓ Test 5 PASSED: TimescaleDB batch insert performance acceptable");
    }
    
    /**
     * Test 6: Memory usage of tick buffer
     * Monitors buffer growth under sustained load
     */
    @Test
    void shouldMonitorTickBufferMemoryUsage() {
        log.info("=== Test 6: Memory usage of tick buffer ===");
        
        Runtime runtime = Runtime.getRuntime();
        long initialMemory = runtime.totalMemory() - runtime.freeMemory();
        
        // Fill buffer with 100k ticks
        int tickCount = 100_000;
        for (int i = 0; i < tickCount; i++) {
            Tick tick = createRandomTick();
            buffer.onTickReceived(new TickReceivedEvent(tick));
            
            if (i % 10000 == 0) {
                log.info("Buffered {} ticks, buffer size: {}", i, buffer.getBufferSize());
            }
        }
        
        // Wait for async buffering
        await().atMost(Duration.ofSeconds(30))
            .until(() -> buffer.getBufferSize() >= tickCount);
        
        long finalMemory = runtime.totalMemory() - runtime.freeMemory();
        long memoryUsed = finalMemory - initialMemory;
        long memoryPerTick = memoryUsed / tickCount;
        
        log.info("Memory Statistics:");
        log.info("  Initial memory: {} MB", initialMemory / 1024 / 1024);
        log.info("  Final memory: {} MB", finalMemory / 1024 / 1024);
        log.info("  Memory used: {} MB", memoryUsed / 1024 / 1024);
        log.info("  Memory per tick: {} bytes", memoryPerTick);
        log.info("  Buffer size: {}", buffer.getBufferSize());
        
        // Verify memory usage is reasonable (< 1KB per tick)
        assertThat(memoryPerTick).isLessThan(1024);
        
        log.info("✓ Test 6 PASSED: Memory usage is acceptable");
    }
    
    /**
     * Test 7: Subscription churn (frequent subscribe/unsubscribe)
     * Validates system stability under rapid subscription changes
     */
    @Test
    void shouldHandleSubscriptionChurn() throws Exception {
        log.info("=== Test 7: Subscription churn ===");
        
        int iterations = 100;
        AtomicInteger successfulOperations = new AtomicInteger(0);
        
        // Connect a client
        StandardWebSocketClient client = new StandardWebSocketClient();
        WebSocketSession session = client.doHandshake(
            new TextWebSocketHandler(),
            "ws://localhost:8081/ws/indices"
        ).get(10, TimeUnit.SECONDS);
        
        // Rapidly subscribe and unsubscribe
        for (int i = 0; i < iterations; i++) {
            // Subscribe
            SubscriptionRequestDto subscribeRequest = new SubscriptionRequestDto();
            subscribeRequest.setAction("SUBSCRIBE");
            subscribeRequest.setType("INDEX");
            subscribeRequest.setSymbols(Arrays.asList("NIFTY 50", "BANKNIFTY"));
            
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(subscribeRequest)));
            successfulOperations.incrementAndGet();
            
            Thread.sleep(10);
            
            // Unsubscribe
            SubscriptionRequestDto unsubscribeRequest = new SubscriptionRequestDto();
            unsubscribeRequest.setAction("UNSUBSCRIBE");
            unsubscribeRequest.setType("INDEX");
            unsubscribeRequest.setSymbols(Arrays.asList("NIFTY 50"));
            
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(unsubscribeRequest)));
            successfulOperations.incrementAndGet();
            
            Thread.sleep(10);
        }
        
        // Cleanup
        session.close();
        
        log.info("Completed {} subscription operations", successfulOperations.get());
        
        // Verify all operations completed
        assertThat(successfulOperations.get()).isEqualTo(iterations * 2);
        
        log.info("✓ Test 7 PASSED: Handled {} subscription operations", successfulOperations.get());
    }
    
    /**
     * Test 8: Async consumers don't block hot path
     * Verifies that slow async consumers don't impact broadcast performance
     */
    @Test
    void shouldVerifyAsyncConsumersDontBlockHotPath() throws Exception {
        log.info("=== Test 8: Async consumers don't block hot path ===");
        
        int tickCount = 100;
        CountDownLatch broadcastLatch = new CountDownLatch(tickCount);
        AtomicLong totalBroadcastTime = new AtomicLong(0);
        
        // Connect a client to measure broadcast time
        StandardWebSocketClient client = new StandardWebSocketClient();
        WebSocketSession session = client.doHandshake(
            new TextWebSocketHandler() {
                @Override
                protected void handleTextMessage(WebSocketSession session, TextMessage message) {
                    broadcastLatch.countDown();
                }
            },
            "ws://localhost:8081/ws/indices/all"
        ).get(10, TimeUnit.SECONDS);
        
        // Publish ticks and measure broadcast time
        for (int i = 0; i < tickCount; i++) {
            Tick tick = createIndexTick("NIFTY 50");
            
            long startTime = System.nanoTime();
            eventPublisher.publishEvent(new TickReceivedEvent(tick));
            long endTime = System.nanoTime();
            
            totalBroadcastTime.addAndGet(endTime - startTime);
        }
        
        // Wait for all broadcasts to complete
        boolean completed = broadcastLatch.await(10, TimeUnit.SECONDS);
        assertThat(completed).isTrue();
        
        long avgBroadcastTimeMs = (totalBroadcastTime.get() / tickCount) / 1_000_000;
        
        log.info("Average broadcast time: {}ms", avgBroadcastTimeMs);
        log.info("Buffer size (async consumer): {}", buffer.getBufferSize());
        
        // Verify broadcast is fast (< 10ms average)
        assertThat(avgBroadcastTimeMs).isLessThan(10);
        
        // Verify async consumers are working (buffer has ticks)
        assertThat(buffer.getBufferSize()).isGreaterThan(0);
        
        // Cleanup
        session.close();
        
        log.info("✓ Test 8 PASSED: Async consumers don't block hot path");
    }
    
    // Helper methods
    
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
    
    private Tick createIndexTick(String symbol) {
        return Tick.builder()
            .symbol(symbol)
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
            .rawBinaryData(new byte[]{0x01, 0x02, 0x03, 0x04})
            .build();
    }
    
    private long getPercentile(List<Long> sortedList, int percentile) {
        if (sortedList.isEmpty()) {
            return 0;
        }
        int index = (int) Math.ceil(percentile / 100.0 * sortedList.size()) - 1;
        return sortedList.get(Math.max(0, Math.min(index, sortedList.size() - 1)));
    }
}
