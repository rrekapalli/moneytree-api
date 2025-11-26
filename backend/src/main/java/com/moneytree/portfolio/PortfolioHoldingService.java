package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.PortfolioHolding;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PortfolioHoldingService {

    private static final Logger log = LoggerFactory.getLogger(PortfolioHoldingService.class);
    private final PortfolioHoldingRepository repository;

    public PortfolioHoldingService(PortfolioHoldingRepository repository) {
        this.repository = repository;
    }

    public List<PortfolioHolding> findByPortfolioId(Long portfolioId) {
        return repository.findByPortfolioId(portfolioId);
    }

    public Optional<PortfolioHolding> findByPortfolioIdAndSymbol(Long portfolioId, String symbol) {
        return repository.findByPortfolioIdAndSymbol(portfolioId, symbol);
    }

    public PortfolioHolding save(PortfolioHolding holding) {
        return repository.save(holding);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}

