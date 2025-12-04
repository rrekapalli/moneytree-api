package com.moneytree.backtest;

import com.moneytree.backtest.entity.BacktestRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for BacktestRun entity.
 * Provides methods to query backtest runs by strategy name.
 */
@Repository
public interface BacktestRunRepository extends JpaRepository<BacktestRun, UUID> {

    /**
     * Find all backtest runs for a specific strategy, ordered by creation date descending.
     * 
     * @param strategyName the strategy name
     * @return list of backtest runs
     */
    List<BacktestRun> findByStrategyNameOrderByCreatedAtDesc(String strategyName);

    /**
     * Find the most recent backtest run for a specific strategy.
     * 
     * @param strategyName the strategy name
     * @return Optional containing the most recent backtest run if found
     */
    @Query("SELECT br FROM BacktestRun br WHERE br.strategyName = :strategyName ORDER BY br.createdAt DESC LIMIT 1")
    Optional<BacktestRun> findLatestByStrategyName(@Param("strategyName") String strategyName);
}
