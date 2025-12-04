package com.moneytree.backtest;

import com.moneytree.backtest.entity.BacktestTrade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for BacktestTrade entity.
 * Provides methods to query trades for specific backtest runs.
 */
@Repository
public interface BacktestTradeRepository extends JpaRepository<BacktestTrade, UUID> {

    /**
     * Find all trades for a specific backtest run, ordered by trade date.
     * 
     * @param runId the backtest run ID
     * @return list of trades
     */
    @Query("SELECT bt FROM BacktestTrade bt WHERE bt.run.runId = :runId ORDER BY bt.tradeDate ASC")
    List<BacktestTrade> findByRunIdOrderByTradeDate(@Param("runId") UUID runId);
}
