package com.moneytree.strategy;

import com.moneytree.strategy.entity.Strategy;
import com.moneytree.strategy.entity.StrategyMetrics;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for managing strategy performance metrics.
 * Provides methods to calculate, store, and retrieve performance metrics over time.
 */
@Service
@Transactional
public class StrategyMetricsService {

    private static final Logger log = LoggerFactory.getLogger(StrategyMetricsService.class);

    private final StrategyMetricsRepository metricsRepository;
    private final StrategyRepository strategyRepository;

    public StrategyMetricsService(StrategyMetricsRepository metricsRepository, StrategyRepository strategyRepository) {
        this.metricsRepository = metricsRepository;
        this.strategyRepository = strategyRepository;
    }

    /**
     * Get the latest metrics for a strategy.
     * 
     * @param strategyId the strategy ID
     * @return Optional containing the most recent metrics
     */
    public Optional<StrategyMetrics> getLatestMetrics(UUID strategyId) {
        log.info("getLatestMetrics strategyId={}", strategyId);
        return metricsRepository.findLatestByStrategyId(strategyId);
    }

    /**
     * Get all metrics history for a strategy.
     * 
     * @param strategyId the strategy ID
     * @return list of metrics ordered by date descending
     */
    public List<StrategyMetrics> getMetricsHistory(UUID strategyId) {
        log.info("getMetricsHistory strategyId={}", strategyId);
        return metricsRepository.findByStrategyIdOrderByMetricDateDesc(strategyId);
    }

    /**
     * Get metrics for a strategy within a date range.
     * 
     * @param strategyId the strategy ID
     * @param startDate the start date (inclusive)
     * @param endDate the end date (inclusive)
     * @return list of metrics within the date range
     */
    public List<StrategyMetrics> getMetricsInDateRange(UUID strategyId, LocalDate startDate, LocalDate endDate) {
        log.info("getMetricsInDateRange strategyId={} startDate={} endDate={}", strategyId, startDate, endDate);
        
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date must be before or equal to end date");
        }
        
        return metricsRepository.findByStrategyIdAndDateRange(strategyId, startDate, endDate);
    }

    /**
     * Get metrics for a specific date.
     * 
     * @param strategyId the strategy ID
     * @param metricDate the metric date
     * @return Optional containing the metrics if found
     */
    public Optional<StrategyMetrics> getMetricsForDate(UUID strategyId, LocalDate metricDate) {
        log.info("getMetricsForDate strategyId={} metricDate={}", strategyId, metricDate);
        return metricsRepository.findByStrategyIdAndMetricDate(strategyId, metricDate);
    }

    /**
     * Save or update metrics for a strategy.
     * If metrics already exist for the given strategy and date, they will be updated.
     * 
     * @param strategyId the strategy ID
     * @param metrics the metrics to save
     * @return the saved metrics
     * @throws IllegalArgumentException if strategy doesn't exist or validation fails
     */
    public StrategyMetrics saveMetrics(UUID strategyId, StrategyMetrics metrics) {
        log.info("saveMetrics strategyId={} metricDate={}", strategyId, metrics.getMetricDate());
        
        // Validate strategy exists
        Strategy strategy = strategyRepository.findById(strategyId)
                .orElseThrow(() -> new IllegalArgumentException("Strategy not found with id: " + strategyId));
        
        // Validate metric date
        if (metrics.getMetricDate() == null) {
            throw new IllegalArgumentException("Metric date is required");
        }
        
        // Check if metrics already exist for this strategy and date
        Optional<StrategyMetrics> existingOpt = metricsRepository.findByStrategyIdAndMetricDate(
                strategyId, metrics.getMetricDate());
        
        StrategyMetrics toSave;
        if (existingOpt.isPresent()) {
            // Update existing metrics
            toSave = existingOpt.get();
            updateMetricsFields(toSave, metrics);
            log.info("Updating existing metrics for strategyId={} date={}", strategyId, metrics.getMetricDate());
        } else {
            // Create new metrics
            toSave = metrics;
            if (toSave.getId() == null) {
                toSave.setId(UUID.randomUUID());
            }
            toSave.setStrategy(strategy);
            log.info("Creating new metrics for strategyId={} date={}", strategyId, metrics.getMetricDate());
        }
        
        // Validate metrics values
        validateMetrics(toSave);
        
        return metricsRepository.save(toSave);
    }

    /**
     * Calculate and store metrics from trade data.
     * This method would typically be called after a backtest or at the end of a trading period.
     * 
     * @param strategyId the strategy ID
     * @param metricDate the date for these metrics
     * @param totalReturn total return percentage
     * @param trades list of trade results (profit/loss values)
     * @return the calculated and saved metrics
     */
    public StrategyMetrics calculateAndStoreMetrics(
            UUID strategyId, 
            LocalDate metricDate,
            BigDecimal totalReturn,
            List<BigDecimal> trades) {
        
        log.info("calculateAndStoreMetrics strategyId={} metricDate={} totalTrades={}", 
                strategyId, metricDate, trades.size());
        
        StrategyMetrics metrics = new StrategyMetrics();
        metrics.setMetricDate(metricDate);
        metrics.setTotalReturn(totalReturn);
        metrics.setTotalTrades(trades.size());
        
        if (!trades.isEmpty()) {
            // Calculate win rate
            long winningTrades = trades.stream().filter(t -> t.compareTo(BigDecimal.ZERO) > 0).count();
            BigDecimal winRate = BigDecimal.valueOf(winningTrades)
                    .divide(BigDecimal.valueOf(trades.size()), 4, RoundingMode.HALF_UP);
            metrics.setWinRate(winRate);
            
            // Calculate average win and average loss
            List<BigDecimal> wins = trades.stream()
                    .filter(t -> t.compareTo(BigDecimal.ZERO) > 0)
                    .toList();
            List<BigDecimal> losses = trades.stream()
                    .filter(t -> t.compareTo(BigDecimal.ZERO) < 0)
                    .toList();
            
            if (!wins.isEmpty()) {
                BigDecimal avgWin = wins.stream()
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .divide(BigDecimal.valueOf(wins.size()), 2, RoundingMode.HALF_UP);
                metrics.setAvgWin(avgWin);
            }
            
            if (!losses.isEmpty()) {
                BigDecimal avgLoss = losses.stream()
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .divide(BigDecimal.valueOf(losses.size()), 2, RoundingMode.HALF_UP);
                metrics.setAvgLoss(avgLoss);
            }
            
            // Calculate profit factor
            if (!wins.isEmpty() && !losses.isEmpty()) {
                BigDecimal totalWins = wins.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
                BigDecimal totalLosses = losses.stream().reduce(BigDecimal.ZERO, BigDecimal::add).abs();
                
                if (totalLosses.compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal profitFactor = totalWins.divide(totalLosses, 4, RoundingMode.HALF_UP);
                    metrics.setProfitFactor(profitFactor);
                }
            }
            
            // Calculate expectancy
            if (metrics.getAvgWin() != null && metrics.getAvgLoss() != null) {
                BigDecimal expectancy = winRate.multiply(metrics.getAvgWin())
                        .add(BigDecimal.ONE.subtract(winRate).multiply(metrics.getAvgLoss()));
                metrics.setExpectancy(expectancy);
            }
            
            // Calculate consecutive wins/losses
            int[] consecutiveStats = calculateConsecutiveStats(trades);
            metrics.setMaxConsecutiveWins(consecutiveStats[0]);
            metrics.setMaxConsecutiveLosses(consecutiveStats[1]);
        }
        
        return saveMetrics(strategyId, metrics);
    }

    /**
     * Delete all metrics for a strategy.
     * 
     * @param strategyId the strategy ID
     */
    public void deleteMetricsForStrategy(UUID strategyId) {
        log.info("deleteMetricsForStrategy strategyId={}", strategyId);
        metricsRepository.deleteByStrategyId(strategyId);
    }

    /**
     * Get the count of metrics records for a strategy.
     * 
     * @param strategyId the strategy ID
     * @return count of metrics records
     */
    public Long getMetricsCount(UUID strategyId) {
        return metricsRepository.countByStrategyId(strategyId);
    }

    /**
     * Update fields from source metrics to target metrics.
     */
    private void updateMetricsFields(StrategyMetrics target, StrategyMetrics source) {
        if (source.getTotalReturn() != null) target.setTotalReturn(source.getTotalReturn());
        if (source.getCagr() != null) target.setCagr(source.getCagr());
        if (source.getSharpeRatio() != null) target.setSharpeRatio(source.getSharpeRatio());
        if (source.getSortinoRatio() != null) target.setSortinoRatio(source.getSortinoRatio());
        if (source.getMaxDrawdown() != null) target.setMaxDrawdown(source.getMaxDrawdown());
        if (source.getWinRate() != null) target.setWinRate(source.getWinRate());
        if (source.getTotalTrades() != null) target.setTotalTrades(source.getTotalTrades());
        if (source.getProfitFactor() != null) target.setProfitFactor(source.getProfitFactor());
        if (source.getAvgWin() != null) target.setAvgWin(source.getAvgWin());
        if (source.getAvgLoss() != null) target.setAvgLoss(source.getAvgLoss());
        if (source.getAvgHoldingDays() != null) target.setAvgHoldingDays(source.getAvgHoldingDays());
        if (source.getMaxConsecutiveWins() != null) target.setMaxConsecutiveWins(source.getMaxConsecutiveWins());
        if (source.getMaxConsecutiveLosses() != null) target.setMaxConsecutiveLosses(source.getMaxConsecutiveLosses());
        if (source.getExpectancy() != null) target.setExpectancy(source.getExpectancy());
        if (source.getCalmarRatio() != null) target.setCalmarRatio(source.getCalmarRatio());
        if (source.getRecoveryFactor() != null) target.setRecoveryFactor(source.getRecoveryFactor());
    }

    /**
     * Validate metrics values are within acceptable ranges.
     */
    private void validateMetrics(StrategyMetrics metrics) {
        // Validate win rate is between 0 and 1
        if (metrics.getWinRate() != null) {
            if (metrics.getWinRate().compareTo(BigDecimal.ZERO) < 0 || 
                metrics.getWinRate().compareTo(BigDecimal.ONE) > 0) {
                throw new IllegalArgumentException("Win rate must be between 0 and 1");
            }
        }
        
        // Validate total trades is non-negative
        if (metrics.getTotalTrades() != null && metrics.getTotalTrades() < 0) {
            throw new IllegalArgumentException("Total trades cannot be negative");
        }
        
        // Validate profit factor is non-negative
        if (metrics.getProfitFactor() != null && metrics.getProfitFactor().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Profit factor cannot be negative");
        }
        
        // Validate consecutive stats are non-negative
        if (metrics.getMaxConsecutiveWins() != null && metrics.getMaxConsecutiveWins() < 0) {
            throw new IllegalArgumentException("Max consecutive wins cannot be negative");
        }
        if (metrics.getMaxConsecutiveLosses() != null && metrics.getMaxConsecutiveLosses() < 0) {
            throw new IllegalArgumentException("Max consecutive losses cannot be negative");
        }
    }

    /**
     * Calculate maximum consecutive wins and losses from trade results.
     * 
     * @param trades list of trade profit/loss values
     * @return array with [maxConsecutiveWins, maxConsecutiveLosses]
     */
    private int[] calculateConsecutiveStats(List<BigDecimal> trades) {
        int maxWins = 0;
        int maxLosses = 0;
        int currentWins = 0;
        int currentLosses = 0;
        
        for (BigDecimal trade : trades) {
            if (trade.compareTo(BigDecimal.ZERO) > 0) {
                currentWins++;
                currentLosses = 0;
                maxWins = Math.max(maxWins, currentWins);
            } else if (trade.compareTo(BigDecimal.ZERO) < 0) {
                currentLosses++;
                currentWins = 0;
                maxLosses = Math.max(maxLosses, currentLosses);
            }
        }
        
        return new int[]{maxWins, maxLosses};
    }
}
