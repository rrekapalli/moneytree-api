package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.PortfolioTradeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface PortfolioTradeLogRepository extends JpaRepository<PortfolioTradeLog, Integer> {

    List<PortfolioTradeLog> findByPortfolioId(Long portfolioId);

    List<PortfolioTradeLog> findByPortfolioIdAndSymbol(Long portfolioId, String symbol);

    List<PortfolioTradeLog> findByEvaluationType(String evaluationType);

    List<PortfolioTradeLog> findByPortfolioIdAndCycleTimestampBetween(Long portfolioId, Instant start, Instant end);

    @Query("SELECT ptl FROM PortfolioTradeLog ptl WHERE ptl.portfolio.id = ?1 ORDER BY ptl.cycleTimestamp DESC")
    List<PortfolioTradeLog> findByPortfolioIdOrderByCycleTimestampDesc(Long portfolioId);
}

