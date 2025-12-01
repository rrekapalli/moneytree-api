package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.PortfolioHolding;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class PortfolioHoldingService {

    private static final Logger log = LoggerFactory.getLogger(PortfolioHoldingService.class);
    private final PortfolioHoldingRepository repository;

    public PortfolioHoldingService(PortfolioHoldingRepository repository) {
        this.repository = repository;
    }

    public List<PortfolioHolding> findByPortfolioId(UUID portfolioId) {
        return repository.findByPortfolio_Id(portfolioId);
    }

    public Optional<PortfolioHolding> findByPortfolioIdAndSymbol(UUID portfolioId, String symbol) {
        return repository.findByPortfolio_IdAndSymbol(portfolioId, symbol);
    }

    public PortfolioHolding save(PortfolioHolding holding) {
        return repository.save(holding);
    }

    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}

