package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.PortfolioValuationDaily;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PortfolioValuationDailyRepository extends JpaRepository<PortfolioValuationDaily, UUID> {

    List<PortfolioValuationDaily> findByPortfolioId(UUID portfolioId);

    List<PortfolioValuationDaily> findByPortfolioIdAndDateBetween(UUID portfolioId, LocalDate start, LocalDate end);

    Optional<PortfolioValuationDaily> findByPortfolioIdAndDate(UUID portfolioId, LocalDate date);

    @Query("SELECT pvd FROM PortfolioValuationDaily pvd WHERE pvd.portfolio.id = ?1 ORDER BY pvd.date DESC")
    List<PortfolioValuationDaily> findByPortfolioIdOrderByDateDesc(UUID portfolioId);
}

