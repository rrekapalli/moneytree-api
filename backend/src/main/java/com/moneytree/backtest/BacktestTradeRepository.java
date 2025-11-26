package com.moneytree.backtest;

import com.moneytree.backtest.entity.BacktestTrade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface BacktestTradeRepository extends JpaRepository<BacktestTrade, Integer> {

    List<BacktestTrade> findByRunRunId(UUID runId);

    List<BacktestTrade> findByTradeDateBetween(LocalDate start, LocalDate end);

    List<BacktestTrade> findByTradeType(String tradeType);
}

