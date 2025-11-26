package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.PortfolioHoldingValuationDaily;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PortfolioHoldingValuationDailyRepository extends JpaRepository<PortfolioHoldingValuationDaily, UUID> {

    List<PortfolioHoldingValuationDaily> findByPortfolioId(UUID portfolioId);

    List<PortfolioHoldingValuationDaily> findByPortfolioIdAndDateBetween(UUID portfolioId, LocalDate start, LocalDate end);

    List<PortfolioHoldingValuationDaily> findByPortfolioIdAndSymbol(UUID portfolioId, String symbol);

    Optional<PortfolioHoldingValuationDaily> findByPortfolioIdAndSymbolAndDate(UUID portfolioId, String symbol, LocalDate date);

    @Query("SELECT phvd FROM PortfolioHoldingValuationDaily phvd WHERE phvd.portfolio.id = ?1 ORDER BY phvd.date DESC")
    List<PortfolioHoldingValuationDaily> findByPortfolioIdOrderByDateDesc(UUID portfolioId);
}

