package com.moneytree.strategy;

import com.moneytree.strategy.entity.StrategyMetrics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for StrategyMetrics entity with time-series queries and aggregation methods.
 */
@Repository
public interface StrategyMetricsRepository extends JpaRepository<StrategyMetrics, UUID> {

    /**
     * Find the latest metrics for a strategy.
     * 
     * @param strategyId the strategy ID
     * @return Optional containing the most recent metrics
     */
    @Query("SELECT sm FROM StrategyMetrics sm WHERE sm.strategy.id = ?1 ORDER BY sm.metricDate DESC LIMIT 1")
    Optional<StrategyMetrics> findLatestByStrategyId(UUID strategyId);

    /**
     * Find all metrics for a strategy ordered by date descending.
     * 
     * @param strategyId the strategy ID
     * @return list of metrics ordered by date descending
     */
    @Query("SELECT sm FROM StrategyMetrics sm WHERE sm.strategy.id = ?1 ORDER BY sm.metricDate DESC")
    List<StrategyMetrics> findByStrategyIdOrderByMetricDateDesc(UUID strategyId);

    /**
     * Find metrics for a strategy within a date range.
     * 
     * @param strategyId the strategy ID
     * @param startDate the start date (inclusive)
     * @param endDate the end date (inclusive)
     * @return list of metrics within the date range
     */
    @Query("SELECT sm FROM StrategyMetrics sm WHERE sm.strategy.id = ?1 AND sm.metricDate >= ?2 AND sm.metricDate <= ?3 ORDER BY sm.metricDate ASC")
    List<StrategyMetrics> findByStrategyIdAndDateRange(UUID strategyId, LocalDate startDate, LocalDate endDate);

    /**
     * Find metrics for a specific strategy and date.
     * 
     * @param strategyId the strategy ID
     * @param metricDate the metric date
     * @return Optional containing the metrics if found
     */
    @Query("SELECT sm FROM StrategyMetrics sm WHERE sm.strategy.id = ?1 AND sm.metricDate = ?2")
    Optional<StrategyMetrics> findByStrategyIdAndMetricDate(UUID strategyId, LocalDate metricDate);

    /**
     * Get the count of metrics records for a strategy.
     * 
     * @param strategyId the strategy ID
     * @return count of metrics records
     */
    @Query("SELECT COUNT(sm) FROM StrategyMetrics sm WHERE sm.strategy.id = ?1")
    Long countByStrategyId(UUID strategyId);

    /**
     * Find top performing strategies by total return.
     * Returns the latest metrics for each strategy ordered by total return.
     * 
     * @param limit the maximum number of results
     * @return list of top performing strategy metrics
     */
    @Query(value = """
        SELECT DISTINCT ON (sm.strategy_id) sm.*
        FROM strategy_metrics sm
        INNER JOIN (
            SELECT strategy_id, MAX(metric_date) as max_date
            FROM strategy_metrics
            GROUP BY strategy_id
        ) latest ON sm.strategy_id = latest.strategy_id AND sm.metric_date = latest.max_date
        ORDER BY sm.strategy_id, sm.total_return DESC
        LIMIT ?1
        """, nativeQuery = true)
    List<StrategyMetrics> findTopPerformingStrategies(int limit);

    /**
     * Calculate average metrics across all strategies for a specific date.
     * 
     * @param metricDate the date to calculate averages for
     * @return map of average values
     */
    @Query("""
        SELECT 
            AVG(sm.totalReturn) as avgTotalReturn,
            AVG(sm.cagr) as avgCagr,
            AVG(sm.sharpeRatio) as avgSharpeRatio,
            AVG(sm.maxDrawdown) as avgMaxDrawdown,
            AVG(sm.winRate) as avgWinRate
        FROM StrategyMetrics sm 
        WHERE sm.metricDate = ?1
        """)
    Object[] calculateAverageMetrics(LocalDate metricDate);

    /**
     * Delete all metrics for a strategy.
     * This is automatically handled by cascade delete, but provided for explicit use.
     * 
     * @param strategyId the strategy ID
     */
    @Query("DELETE FROM StrategyMetrics sm WHERE sm.strategy.id = ?1")
    void deleteByStrategyId(UUID strategyId);
}
