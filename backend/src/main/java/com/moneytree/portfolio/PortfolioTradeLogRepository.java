package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.PortfolioTradeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface PortfolioTradeLogRepository extends JpaRepository<PortfolioTradeLog, UUID> {

    List<PortfolioTradeLog> findByPortfolioId(UUID portfolioId);

    List<PortfolioTradeLog> findByPortfolioIdAndSymbol(UUID portfolioId, String symbol);

    List<PortfolioTradeLog> findByEvaluationType(String evaluationType);

    List<PortfolioTradeLog> findByPortfolioIdAndCycleTimestampBetween(UUID portfolioId, Instant start, Instant end);

    @Query("SELECT ptl FROM PortfolioTradeLog ptl WHERE ptl.portfolio.id = ?1 ORDER BY ptl.cycleTimestamp DESC")
    List<PortfolioTradeLog> findByPortfolioIdOrderByCycleTimestampDesc(UUID portfolioId);
}

