package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.PortfolioValuationDaily;
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
public class PortfolioValuationDailyService {

    private static final Logger log = LoggerFactory.getLogger(PortfolioValuationDailyService.class);
    private final PortfolioValuationDailyRepository repository;

    public PortfolioValuationDailyService(PortfolioValuationDailyRepository repository) {
        this.repository = repository;
    }

    public List<PortfolioValuationDaily> findByPortfolioId(UUID portfolioId) {
        return repository.findByPortfolioIdOrderByDateDesc(portfolioId);
    }

    public List<PortfolioValuationDaily> findByPortfolioIdAndDateRange(UUID portfolioId, LocalDate start, LocalDate end) {
        return repository.findByPortfolioIdAndDateBetween(portfolioId, start, end);
    }

    public Optional<PortfolioValuationDaily> findByPortfolioIdAndDate(UUID portfolioId, LocalDate date) {
        return repository.findByPortfolioIdAndDate(portfolioId, date);
    }

    public PortfolioValuationDaily save(PortfolioValuationDaily valuation) {
        return repository.save(valuation);
    }

    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}

