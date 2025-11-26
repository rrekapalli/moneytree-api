package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.PortfolioMetricsDaily;
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
public class PortfolioMetricsDailyService {

    private static final Logger log = LoggerFactory.getLogger(PortfolioMetricsDailyService.class);
    private final PortfolioMetricsDailyRepository repository;

    public PortfolioMetricsDailyService(PortfolioMetricsDailyRepository repository) {
        this.repository = repository;
    }

    public List<PortfolioMetricsDaily> findByPortfolioId(UUID portfolioId) {
        return repository.findByPortfolioIdOrderByDateDesc(portfolioId);
    }

    public List<PortfolioMetricsDaily> findByPortfolioIdAndDateRange(UUID portfolioId, LocalDate start, LocalDate end) {
        return repository.findByPortfolioIdAndDateBetween(portfolioId, start, end);
    }

    public Optional<PortfolioMetricsDaily> findByPortfolioIdAndDate(UUID portfolioId, LocalDate date) {
        return repository.findByPortfolioIdAndDate(portfolioId, date);
    }

    public PortfolioMetricsDaily save(PortfolioMetricsDaily metrics) {
        return repository.save(metrics);
    }

    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}

