package com.moneytree.backtest;

import com.moneytree.backtest.entity.BacktestRun;
import com.moneytree.backtest.entity.BacktestTrade;
import com.moneytree.strategy.StrategyRepository;
import com.moneytree.strategy.entity.Strategy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for backtest operations.
 * Handles backtest execution triggering, status tracking, and results retrieval.
 */
@Service
@Transactional
public class BacktestService {

    private static final Logger log = LoggerFactory.getLogger(BacktestService.class);

    private final BacktestRunRepository backtestRunRepository;
    private final BacktestTradeRepository backtestTradeRepository;
    private final StrategyRepository strategyRepository;

    public BacktestService(BacktestRunRepository backtestRunRepository,
                          BacktestTradeRepository backtestTradeRepository,
                          StrategyRepository strategyRepository) {
        this.backtestRunRepository = backtestRunRepository;
        this.backtestTradeRepository = backtestTradeRepository;
        this.strategyRepository = strategyRepository;
    }

    /**
     * Trigger a backtest execution for a strategy.
     * This creates a backtest run record and would typically trigger an async backtest process.
     * For now, this is a placeholder that creates the run record.
     * 
     * @param strategyId the strategy ID
     * @param startDate backtest start date
     * @param endDate backtest end date
     * @param initialCapital initial capital for the backtest
     * @param symbol the symbol to backtest (optional, can be derived from strategy config)
     * @return the created BacktestRun
     * @throws IllegalArgumentException if validation fails
     */
    public BacktestRun triggerBacktest(UUID strategyId, LocalDate startDate, LocalDate endDate, 
                                      BigDecimal initialCapital, String symbol) {
        log.info("triggerBacktest strategyId={}, startDate={}, endDate={}, initialCapital={}, symbol={}", 
                 strategyId, startDate, endDate, initialCapital, symbol);
        
        // Validate inputs
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Start date and end date are required");
        }
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date must be before or equal to end date");
        }
        if (initialCapital == null || initialCapital.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Initial capital must be greater than zero");
        }
        
        // Verify strategy exists
        Optional<Strategy> strategyOpt = strategyRepository.findById(strategyId);
        if (strategyOpt.isEmpty()) {
            throw new IllegalArgumentException("Strategy not found with ID: " + strategyId);
        }
        
        Strategy strategy = strategyOpt.get();
        
        // Create backtest run record
        BacktestRun run = new BacktestRun();
        run.setRunId(UUID.randomUUID());
        run.setStrategyName(strategy.getName());
        run.setSymbol(symbol != null ? symbol : "NIFTY50"); // Default symbol if not provided
        run.setStartDate(startDate);
        run.setEndDate(endDate);
        run.setInitialCapital(initialCapital);
        run.setCreatedAt(Instant.now());
        
        // Set default values for metrics (will be updated when backtest completes)
        run.setFinalEquity(initialCapital);
        run.setFinalCash(initialCapital);
        run.setTotalTrades(0);
        run.setWinningTrades(0);
        run.setLosingTrades(0);
        
        BacktestRun saved = backtestRunRepository.save(run);
        
        // TODO: Trigger async backtest execution process here
        // This would typically send a message to a queue or call an async service
        log.info("Backtest run created with ID: {}", saved.getRunId());
        
        return saved;
    }

    /**
     * Get all backtest runs for a specific strategy.
     * 
     * @param strategyId the strategy ID
     * @return list of backtest runs ordered by creation date descending
     */
    public List<BacktestRun> getBacktestsByStrategy(UUID strategyId) {
        log.info("getBacktestsByStrategy strategyId={}", strategyId);
        
        // Get strategy to retrieve its name
        Optional<Strategy> strategyOpt = strategyRepository.findById(strategyId);
        if (strategyOpt.isEmpty()) {
            throw new IllegalArgumentException("Strategy not found with ID: " + strategyId);
        }
        
        String strategyName = strategyOpt.get().getName();
        return backtestRunRepository.findByStrategyNameOrderByCreatedAtDesc(strategyName);
    }

    /**
     * Get the most recent backtest run for a strategy.
     * 
     * @param strategyId the strategy ID
     * @return Optional containing the most recent backtest run if found
     */
    public Optional<BacktestRun> getLatestBacktest(UUID strategyId) {
        log.info("getLatestBacktest strategyId={}", strategyId);
        
        // Get strategy to retrieve its name
        Optional<Strategy> strategyOpt = strategyRepository.findById(strategyId);
        if (strategyOpt.isEmpty()) {
            return Optional.empty();
        }
        
        String strategyName = strategyOpt.get().getName();
        return backtestRunRepository.findLatestByStrategyName(strategyName);
    }

    /**
     * Get a specific backtest run by ID.
     * 
     * @param runId the backtest run ID
     * @return Optional containing the backtest run if found
     */
    public Optional<BacktestRun> getBacktestRun(UUID runId) {
        log.info("getBacktestRun runId={}", runId);
        return backtestRunRepository.findById(runId);
    }

    /**
     * Get all trades for a specific backtest run.
     * 
     * @param runId the backtest run ID
     * @return list of trades ordered by trade date
     */
    public List<BacktestTrade> getBacktestTrades(UUID runId) {
        log.info("getBacktestTrades runId={}", runId);
        return backtestTradeRepository.findByRunIdOrderByTradeDate(runId);
    }

    /**
     * Get the status of a backtest run.
     * This is a simple implementation that checks if the run has completed metrics.
     * 
     * @param runId the backtest run ID
     * @return status string: "COMPLETED", "RUNNING", or "NOT_FOUND"
     */
    public String getBacktestStatus(UUID runId) {
        log.info("getBacktestStatus runId={}", runId);
        
        Optional<BacktestRun> runOpt = backtestRunRepository.findById(runId);
        if (runOpt.isEmpty()) {
            return "NOT_FOUND";
        }
        
        BacktestRun run = runOpt.get();
        
        // Check if backtest has completed by verifying if key metrics are populated
        if (run.getTotalReturnPct() != null && run.getSharpeRatio() != null) {
            return "COMPLETED";
        }
        
        return "RUNNING";
    }

    /**
     * List all backtest runs ordered by creation date descending.
     * 
     * @return list of all backtest runs
     */
    public List<BacktestRun> listBacktests() {
        log.info("listBacktests called");
        return backtestRunRepository.findAll();
    }

    /**
     * Create a new backtest run.
     * This is used by the generic BacktestController for direct backtest run creation.
     * 
     * @param backtestRun the backtest run to create
     * @return the created backtest run
     */
    public BacktestRun createBacktestRun(BacktestRun backtestRun) {
        log.info("createBacktestRun strategyName={}", backtestRun.getStrategyName());
        
        if (backtestRun.getRunId() == null) {
            backtestRun.setRunId(UUID.randomUUID());
        }
        if (backtestRun.getCreatedAt() == null) {
            backtestRun.setCreatedAt(Instant.now());
        }
        
        return backtestRunRepository.save(backtestRun);
    }

    /**
     * Update an existing backtest run.
     * 
     * @param backtestRun the backtest run with updated fields
     * @return the updated backtest run
     */
    public BacktestRun updateBacktestRun(BacktestRun backtestRun) {
        log.info("updateBacktestRun runId={}", backtestRun.getRunId());
        return backtestRunRepository.save(backtestRun);
    }

    /**
     * Delete a backtest run.
     * This will cascade delete all associated trades.
     * 
     * @param runId the backtest run ID
     */
    public void deleteBacktestRun(UUID runId) {
        log.info("deleteBacktestRun runId={}", runId);
        backtestRunRepository.deleteById(runId);
    }
}
