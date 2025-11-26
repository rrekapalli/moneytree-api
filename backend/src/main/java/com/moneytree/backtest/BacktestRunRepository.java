package com.moneytree.backtest;

import com.moneytree.backtest.entity.BacktestRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface BacktestRunRepository extends JpaRepository<BacktestRun, UUID> {

    List<BacktestRun> findByStrategyName(String strategyName);

    List<BacktestRun> findBySymbol(String symbol);

    List<BacktestRun> findByStartDateBetween(LocalDate start, LocalDate end);

    @Query("SELECT b FROM BacktestRun b ORDER BY b.createdAt DESC")
    List<BacktestRun> findAllOrderByCreatedAtDesc();
}

