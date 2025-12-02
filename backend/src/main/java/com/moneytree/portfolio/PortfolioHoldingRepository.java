package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.PortfolioHolding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PortfolioHoldingRepository extends JpaRepository<PortfolioHolding, UUID> {

    List<PortfolioHolding> findByPortfolio_Id(UUID portfolioId);

    Optional<PortfolioHolding> findByPortfolio_IdAndSymbol(UUID portfolioId, String symbol);

    List<PortfolioHolding> findBySymbol(String symbol);
}

