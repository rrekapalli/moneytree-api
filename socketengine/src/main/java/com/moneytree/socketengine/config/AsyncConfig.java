package com.moneytree.socketengine.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * Async configuration for socketengine module.
 * Configures separate thread pools for async consumers to prevent blocking the hot path.
 * 
 * Thread pools:
 * - tickCacheExecutor: For Redis caching operations (Consumer A)
 * - tickPersistenceExecutor: For persistence buffering operations (Consumer B)
 */
@Configuration
@EnableAsync
public class AsyncConfig {
    
    /**
     * Thread pool for Redis caching (Consumer A).
     * Higher throughput, can tolerate some latency.
     * 
     * Configuration:
     * - Core pool size: 4 threads
     * - Max pool size: 8 threads
     * - Queue capacity: 10,000 tasks
     * - Rejection policy: CallerRunsPolicy (caller thread executes if queue is full)
     */
    @Bean(name = "tickCacheExecutor")
    public Executor tickCacheExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(10000);
        executor.setThreadNamePrefix("tick-cache-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
    
    /**
     * Thread pool for persistence buffering (Consumer B).
     * Lower priority, can handle backpressure.
     * 
     * Configuration:
     * - Core pool size: 2 threads
     * - Max pool size: 4 threads
     * - Queue capacity: 20,000 tasks
     * - Rejection policy: CallerRunsPolicy (caller thread executes if queue is full)
     */
    @Bean(name = "tickPersistenceExecutor")
    public Executor tickPersistenceExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(4);
        executor.setQueueCapacity(20000);
        executor.setThreadNamePrefix("tick-persist-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}
