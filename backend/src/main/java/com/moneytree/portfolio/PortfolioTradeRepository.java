package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.PortfolioTrade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface PortfolioTradeRepository extends JpaRepository<PortfolioTrade, UUID> {

    List<PortfolioTrade> findByPortfolioId(UUID portfolioId);

    List<PortfolioTrade> findByPortfolioIdAndSymbol(UUID portfolioId, String symbol);

    List<PortfolioTrade> findBySymbol(String symbol);

    List<PortfolioTrade> findByExitType(String exitType);

    List<PortfolioTrade> findByPortfolioIdAndEntryDateBetween(UUID portfolioId, Instant start, Instant end);

    @Query("SELECT pt FROM PortfolioTrade pt WHERE pt.portfolio.id = :portfolioId ORDER BY pt.entryDate DESC")
    List<PortfolioTrade> findByPortfolioIdOrderByEntryDateDesc(UUID portfolioId);
}

