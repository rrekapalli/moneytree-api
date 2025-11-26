package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.PortfolioCashFlow;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class PortfolioCashFlowService {

    private static final Logger log = LoggerFactory.getLogger(PortfolioCashFlowService.class);
    private final PortfolioCashFlowRepository repository;

    public PortfolioCashFlowService(PortfolioCashFlowRepository repository) {
        this.repository = repository;
    }

    public List<PortfolioCashFlow> findByPortfolioId(UUID portfolioId) {
        return repository.findByPortfolioIdOrderByFlowDateDesc(portfolioId);
    }

    public List<PortfolioCashFlow> findByPortfolioIdAndDateRange(UUID portfolioId, LocalDate start, LocalDate end) {
        return repository.findByPortfolioIdAndFlowDateBetween(portfolioId, start, end);
    }

    public Optional<PortfolioCashFlow> findById(UUID id) {
        return repository.findById(id);
    }

    public PortfolioCashFlow save(PortfolioCashFlow cashFlow) {
        return repository.save(cashFlow);
    }

    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}

