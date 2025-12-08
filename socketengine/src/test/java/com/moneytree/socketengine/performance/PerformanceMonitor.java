package com.moneytree.socketengine.performance;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.management.ManagementFactory;
import java.lang.management.ThreadMXBean;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Utility class for monitoring performance metrics during tests
 */
public class PerformanceMonitor {
    
    private static final Logger log = LoggerFactory.getLogger(PerformanceMonitor.class);
    
    private final ConcurrentMap<String, List<Long>> metrics = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, AtomicLong> counters = new ConcurrentHashMap<>();
    private final ThreadMXBean threadMXBean = ManagementFactory.getThreadMXBean();
    
    /**
     * Record a latency measurement
     */
    public void recordLatency(String metricName, long latencyMs) {
        metrics.computeIfAbsent(metricName, k -> new ArrayList<>()).add(latencyMs);
    }
    
    /**
     * Increment a counter
     */
    public void incrementCounter(String counterName) {
        counters.computeIfAbsent(counterName, k -> new AtomicLong(0)).incrementAndGet();
    }
    
    /**
     * Get counter value
     */
    public long getCounter(String counterName) {
        AtomicLong counter = counters.get(counterName);
        return counter != null ? counter.get() : 0;
    }
    
    /**
     * Calculate percentile for a metric
     */
    public long getPercentile(String metricName, int percentile) {
        List<Long> values = metrics.get(metricName);
        if (values == null || values.isEmpty()) {
            return 0;
        }
        
        List<Long> sorted = new ArrayList<>(values);
        Collections.sort(sorted);
        
        int index = (int) Math.ceil(percentile / 100.0 * sorted.size()) - 1;
        return sorted.get(Math.max(0, Math.min(index, sorted.size() - 1)));
    }
    
    /**
     * Get average for a metric
     */
    public double getAverage(String metricName) {
        List<Long> values = metrics.get(metricName);
        if (values == null || values.isEmpty()) {
            return 0;
        }
        
        return values.stream().mapToLong(Long::longValue).average().orElse(0);
    }
    
    /**
     * Get max for a metric
     */
    public long getMax(String metricName) {
        List<Long> values = metrics.get(metricName);
        if (values == null || values.isEmpty()) {
            return 0;
        }
        
        return values.stream().mapToLong(Long::longValue).max().orElse(0);
    }
    
    /**
     * Get min for a metric
     */
    public long getMin(String metricName) {
        List<Long> values = metrics.get(metricName);
        if (values == null || values.isEmpty()) {
            return 0;
        }
        
        return values.stream().mapToLong(Long::longValue).min().orElse(0);
    }
    
    /**
     * Get sample count for a metric
     */
    public int getSampleCount(String metricName) {
        List<Long> values = metrics.get(metricName);
        return values != null ? values.size() : 0;
    }
    
    /**
     * Print statistics for a metric
     */
    public void printStatistics(String metricName) {
        log.info("=== Statistics for {} ===", metricName);
        log.info("  Samples: {}", getSampleCount(metricName));
        log.info("  Average: {:.2f}ms", getAverage(metricName));
        log.info("  Min: {}ms", getMin(metricName));
        log.info("  P50: {}ms", getPercentile(metricName, 50));
        log.info("  P95: {}ms", getPercentile(metricName, 95));
        log.info("  P99: {}ms", getPercentile(metricName, 99));
        log.info("  Max: {}ms", getMax(metricName));
    }
    
    /**
     * Print all counters
     */
    public void printCounters() {
        log.info("=== Counters ===");
        counters.forEach((name, value) -> 
            log.info("  {}: {}", name, value.get()));
    }
    
    /**
     * Get current thread count
     */
    public int getThreadCount() {
        return threadMXBean.getThreadCount();
    }
    
    /**
     * Get peak thread count
     */
    public int getPeakThreadCount() {
        return threadMXBean.getPeakThreadCount();
    }
    
    /**
     * Get current memory usage in MB
     */
    public long getMemoryUsageMB() {
        Runtime runtime = Runtime.getRuntime();
        return (runtime.totalMemory() - runtime.freeMemory()) / 1024 / 1024;
    }
    
    /**
     * Print system statistics
     */
    public void printSystemStatistics() {
        log.info("=== System Statistics ===");
        log.info("  Thread count: {}", getThreadCount());
        log.info("  Peak thread count: {}", getPeakThreadCount());
        log.info("  Memory usage: {} MB", getMemoryUsageMB());
        log.info("  Available processors: {}", Runtime.getRuntime().availableProcessors());
    }
    
    /**
     * Reset all metrics
     */
    public void reset() {
        metrics.clear();
        counters.clear();
        threadMXBean.resetPeakThreadCount();
    }
    
    /**
     * Generate a performance report
     */
    public String generateReport() {
        StringBuilder report = new StringBuilder();
        report.append("\n=== PERFORMANCE REPORT ===\n\n");
        
        // System stats
        report.append("System Statistics:\n");
        report.append(String.format("  Thread count: %d\n", getThreadCount()));
        report.append(String.format("  Peak thread count: %d\n", getPeakThreadCount()));
        report.append(String.format("  Memory usage: %d MB\n", getMemoryUsageMB()));
        report.append(String.format("  Available processors: %d\n\n", 
            Runtime.getRuntime().availableProcessors()));
        
        // Metrics
        if (!metrics.isEmpty()) {
            report.append("Latency Metrics:\n");
            metrics.keySet().forEach(metricName -> {
                report.append(String.format("  %s:\n", metricName));
                report.append(String.format("    Samples: %d\n", getSampleCount(metricName)));
                report.append(String.format("    Average: %.2fms\n", getAverage(metricName)));
                report.append(String.format("    P50: %dms\n", getPercentile(metricName, 50)));
                report.append(String.format("    P95: %dms\n", getPercentile(metricName, 95)));
                report.append(String.format("    P99: %dms\n", getPercentile(metricName, 99)));
                report.append(String.format("    Max: %dms\n", getMax(metricName)));
            });
            report.append("\n");
        }
        
        // Counters
        if (!counters.isEmpty()) {
            report.append("Counters:\n");
            counters.forEach((name, value) -> 
                report.append(String.format("  %s: %d\n", name, value.get())));
            report.append("\n");
        }
        
        report.append("=== END REPORT ===\n");
        return report.toString();
    }
}
