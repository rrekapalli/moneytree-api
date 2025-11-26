package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.PortfolioHolding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PortfolioHoldingRepository extends JpaRepository<PortfolioHolding, UUID> {

    List<PortfolioHolding> findByPortfolioId(UUID portfolioId);

    Optional<PortfolioHolding> findByPortfolioIdAndSymbol(UUID portfolioId, String symbol);

    List<PortfolioHolding> findBySymbol(String symbol);
}

