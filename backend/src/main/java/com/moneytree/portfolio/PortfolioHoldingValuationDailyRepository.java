package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.PortfolioHoldingValuationDaily;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PortfolioHoldingValuationDailyRepository extends JpaRepository<PortfolioHoldingValuationDaily, Long> {

    List<PortfolioHoldingValuationDaily> findByPortfolioId(Long portfolioId);

    List<PortfolioHoldingValuationDaily> findByPortfolioIdAndDateBetween(Long portfolioId, LocalDate start, LocalDate end);

    List<PortfolioHoldingValuationDaily> findByPortfolioIdAndSymbol(Long portfolioId, String symbol);

    Optional<PortfolioHoldingValuationDaily> findByPortfolioIdAndSymbolAndDate(Long portfolioId, String symbol, LocalDate date);

    @Query("SELECT phvd FROM PortfolioHoldingValuationDaily phvd WHERE phvd.portfolio.id = ?1 ORDER BY phvd.date DESC")
    List<PortfolioHoldingValuationDaily> findByPortfolioIdOrderByDateDesc(Long portfolioId);
}

