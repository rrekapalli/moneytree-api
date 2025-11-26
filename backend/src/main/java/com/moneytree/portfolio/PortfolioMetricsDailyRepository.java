package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.PortfolioMetricsDaily;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PortfolioMetricsDailyRepository extends JpaRepository<PortfolioMetricsDaily, UUID> {

    List<PortfolioMetricsDaily> findByPortfolioId(UUID portfolioId);

    List<PortfolioMetricsDaily> findByPortfolioIdAndDateBetween(UUID portfolioId, LocalDate start, LocalDate end);

    Optional<PortfolioMetricsDaily> findByPortfolioIdAndDate(UUID portfolioId, LocalDate date);

    @Query("SELECT pmd FROM PortfolioMetricsDaily pmd WHERE pmd.portfolio.id = ?1 ORDER BY pmd.date DESC")
    List<PortfolioMetricsDaily> findByPortfolioIdOrderByDateDesc(UUID portfolioId);
}

