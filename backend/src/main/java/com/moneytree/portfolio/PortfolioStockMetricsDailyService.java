package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.PortfolioStockMetricsDaily;
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
public class PortfolioStockMetricsDailyService {

    private static final Logger log = LoggerFactory.getLogger(PortfolioStockMetricsDailyService.class);
    private final PortfolioStockMetricsDailyRepository repository;

    public PortfolioStockMetricsDailyService(PortfolioStockMetricsDailyRepository repository) {
        this.repository = repository;
    }

    public List<PortfolioStockMetricsDaily> findByPortfolioId(UUID portfolioId) {
        return repository.findByPortfolioIdOrderByDateDesc(portfolioId);
    }

    public List<PortfolioStockMetricsDaily> findByPortfolioIdAndSymbol(UUID portfolioId, String symbol) {
        return repository.findByPortfolioIdAndSymbol(portfolioId, symbol);
    }

    public List<PortfolioStockMetricsDaily> findByPortfolioIdAndDateRange(UUID portfolioId, LocalDate start, LocalDate end) {
        return repository.findByPortfolioIdAndDateBetween(portfolioId, start, end);
    }

    public Optional<PortfolioStockMetricsDaily> findByPortfolioIdAndSymbolAndDate(UUID portfolioId, String symbol, LocalDate date) {
        return repository.findByPortfolioIdAndSymbolAndDate(portfolioId, symbol, date);
    }

    public PortfolioStockMetricsDaily save(PortfolioStockMetricsDaily metrics) {
        return repository.save(metrics);
    }

    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}

