package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.PortfolioCashFlow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PortfolioCashFlowRepository extends JpaRepository<PortfolioCashFlow, Long> {

    List<PortfolioCashFlow> findByPortfolioId(Long portfolioId);

    List<PortfolioCashFlow> findByPortfolioIdAndFlowDateBetween(Long portfolioId, LocalDate start, LocalDate end);

    List<PortfolioCashFlow> findByFlowType(String flowType);

    @Query("SELECT pcf FROM PortfolioCashFlow pcf WHERE pcf.portfolio.id = ?1 ORDER BY pcf.flowDate DESC")
    List<PortfolioCashFlow> findByPortfolioIdOrderByFlowDateDesc(Long portfolioId);
}

