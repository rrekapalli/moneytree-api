package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.PortfolioHoldingValuationDaily;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PortfolioHoldingValuationDailyService {

    private static final Logger log = LoggerFactory.getLogger(PortfolioHoldingValuationDailyService.class);
    private final PortfolioHoldingValuationDailyRepository repository;

    public PortfolioHoldingValuationDailyService(PortfolioHoldingValuationDailyRepository repository) {
        this.repository = repository;
    }

    public List<PortfolioHoldingValuationDaily> findByPortfolioId(Long portfolioId) {
        return repository.findByPortfolioIdOrderByDateDesc(portfolioId);
    }

    public List<PortfolioHoldingValuationDaily> findByPortfolioIdAndSymbol(Long portfolioId, String symbol) {
        return repository.findByPortfolioIdAndSymbol(portfolioId, symbol);
    }

    public List<PortfolioHoldingValuationDaily> findByPortfolioIdAndDateRange(Long portfolioId, LocalDate start, LocalDate end) {
        return repository.findByPortfolioIdAndDateBetween(portfolioId, start, end);
    }

    public Optional<PortfolioHoldingValuationDaily> findByPortfolioIdAndSymbolAndDate(Long portfolioId, String symbol, LocalDate date) {
        return repository.findByPortfolioIdAndSymbolAndDate(portfolioId, symbol, date);
    }

    public PortfolioHoldingValuationDaily save(PortfolioHoldingValuationDaily valuation) {
        return repository.save(valuation);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}

