package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.PortfolioHolding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PortfolioHoldingRepository extends JpaRepository<PortfolioHolding, Long> {

    List<PortfolioHolding> findByPortfolioId(Long portfolioId);

    Optional<PortfolioHolding> findByPortfolioIdAndSymbol(Long portfolioId, String symbol);

    List<PortfolioHolding> findBySymbol(String symbol);
}

