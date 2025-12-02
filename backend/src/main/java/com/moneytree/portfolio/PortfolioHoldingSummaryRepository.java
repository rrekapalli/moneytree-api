package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.PortfolioHoldingSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PortfolioHoldingSummaryRepository extends JpaRepository<PortfolioHoldingSummary, PortfolioHoldingSummary.PortfolioHoldingSummaryId> {

    @Query(value = "SELECT * FROM portfolio_holdings_summary WHERE portfolio_id = CAST(:portfolioId AS uuid)", nativeQuery = true)
    List<PortfolioHoldingSummary> findByPortfolioId(@Param("portfolioId") String portfolioId);
}
