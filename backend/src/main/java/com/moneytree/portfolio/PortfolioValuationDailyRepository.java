package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.PortfolioValuationDaily;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PortfolioValuationDailyRepository extends JpaRepository<PortfolioValuationDaily, Long> {

    List<PortfolioValuationDaily> findByPortfolioId(Long portfolioId);

    List<PortfolioValuationDaily> findByPortfolioIdAndDateBetween(Long portfolioId, LocalDate start, LocalDate end);

    Optional<PortfolioValuationDaily> findByPortfolioIdAndDate(Long portfolioId, LocalDate date);

    @Query("SELECT pvd FROM PortfolioValuationDaily pvd WHERE pvd.portfolio.id = ?1 ORDER BY pvd.date DESC")
    List<PortfolioValuationDaily> findByPortfolioIdOrderByDateDesc(Long portfolioId);
}

