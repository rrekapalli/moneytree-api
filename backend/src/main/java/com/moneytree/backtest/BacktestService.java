package com.moneytree.backtest;

import com.moneytree.backtest.entity.BacktestRun;
import com.moneytree.backtest.entity.BacktestTrade;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for backtest CRUD operations using Spring Data JPA.
 */
@Service
@Transactional
public class BacktestService {

    private static final Logger log = LoggerFactory.getLogger(BacktestService.class);

    private final BacktestRunRepository backtestRunRepository;
    private final BacktestTradeRepository backtestTradeRepository;

    public BacktestService(BacktestRunRepository backtestRunRepository,
                          BacktestTradeRepository backtestTradeRepository) {
        this.backtestRunRepository = backtestRunRepository;
        this.backtestTradeRepository = backtestTradeRepository;
    }

    public List<BacktestRun> listBacktests() {
        log.info("listBacktests called");
        return backtestRunRepository.findAllOrderByCreatedAtDesc();
    }

    public List<BacktestRun> listBacktestsByStrategy(String strategyName) {
        log.info("listBacktestsByStrategy strategyName={}", strategyName);
        return backtestRunRepository.findByStrategyName(strategyName);
    }

    public List<BacktestRun> listBacktestsBySymbol(String symbol) {
        log.info("listBacktestsBySymbol symbol={}", symbol);
        return backtestRunRepository.findBySymbol(symbol);
    }

    public Optional<BacktestRun> getBacktestRun(UUID runId) {
        log.info("getBacktestRun runId={}", runId);
        return backtestRunRepository.findById(runId);
    }

    public BacktestRun createBacktestRun(BacktestRun backtestRun) {
        log.info("createBacktestRun strategyName={}, symbol={}", backtestRun.getStrategyName(), backtestRun.getSymbol());
        return backtestRunRepository.save(backtestRun);
    }

    public BacktestRun updateBacktestRun(BacktestRun backtestRun) {
        log.info("updateBacktestRun runId={}", backtestRun.getRunId());
        return backtestRunRepository.save(backtestRun);
    }

    public void deleteBacktestRun(UUID runId) {
        log.info("deleteBacktestRun runId={}", runId);
        backtestRunRepository.deleteById(runId);
    }

    public List<BacktestTrade> getBacktestTrades(UUID runId) {
        log.info("getBacktestTrades runId={}", runId);
        return backtestTradeRepository.findByRunRunId(runId);
    }

    public BacktestTrade createBacktestTrade(BacktestTrade trade) {
        log.info("createBacktestTrade runId={}, tradeType={}", trade.getRun().getRunId(), trade.getTradeType());
        return backtestTradeRepository.save(trade);
    }
}


