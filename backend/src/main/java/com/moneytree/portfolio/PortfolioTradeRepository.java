package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.PortfolioTrade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface PortfolioTradeRepository extends JpaRepository<PortfolioTrade, Integer> {

    List<PortfolioTrade> findByPortfolioId(Long portfolioId);

    List<PortfolioTrade> findByPortfolioIdAndSymbol(Long portfolioId, String symbol);

    List<PortfolioTrade> findBySymbol(String symbol);

    List<PortfolioTrade> findByExitType(String exitType);

    List<PortfolioTrade> findByPortfolioIdAndEntryDateBetween(Long portfolioId, Instant start, Instant end);

    @Query("SELECT pt FROM PortfolioTrade pt WHERE pt.portfolio.id = ?1 ORDER BY pt.entryDate DESC")
    List<PortfolioTrade> findByPortfolioIdOrderByEntryDateDesc(Long portfolioId);
}

