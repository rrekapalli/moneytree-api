package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.PortfolioStockMetricsDaily;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PortfolioStockMetricsDailyRepository extends JpaRepository<PortfolioStockMetricsDaily, Integer> {

    List<PortfolioStockMetricsDaily> findByPortfolioId(Long portfolioId);

    List<PortfolioStockMetricsDaily> findByPortfolioIdAndSymbol(Long portfolioId, String symbol);

    List<PortfolioStockMetricsDaily> findByPortfolioIdAndDateBetween(Long portfolioId, LocalDate start, LocalDate end);

    Optional<PortfolioStockMetricsDaily> findByPortfolioIdAndSymbolAndDate(Long portfolioId, String symbol, LocalDate date);

    @Query("SELECT psmd FROM PortfolioStockMetricsDaily psmd WHERE psmd.portfolio.id = ?1 ORDER BY psmd.date DESC")
    List<PortfolioStockMetricsDaily> findByPortfolioIdOrderByDateDesc(Long portfolioId);
}

