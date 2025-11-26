package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.PortfolioTransaction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PortfolioTransactionService {

    private static final Logger log = LoggerFactory.getLogger(PortfolioTransactionService.class);
    private final PortfolioTransactionRepository repository;

    public PortfolioTransactionService(PortfolioTransactionRepository repository) {
        this.repository = repository;
    }

    public List<PortfolioTransaction> findByPortfolioId(Long portfolioId) {
        return repository.findByPortfolioIdOrderByTradeDateDesc(portfolioId);
    }

    public List<PortfolioTransaction> findByPortfolioIdAndDateRange(Long portfolioId, LocalDate start, LocalDate end) {
        return repository.findByPortfolioIdAndTradeDateBetween(portfolioId, start, end);
    }

    public Optional<PortfolioTransaction> findById(Long id) {
        return repository.findById(id);
    }

    public PortfolioTransaction save(PortfolioTransaction transaction) {
        return repository.save(transaction);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}

