package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.PortfolioMetricsDaily;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PortfolioMetricsDailyService {

    private static final Logger log = LoggerFactory.getLogger(PortfolioMetricsDailyService.class);
    private final PortfolioMetricsDailyRepository repository;

    public PortfolioMetricsDailyService(PortfolioMetricsDailyRepository repository) {
        this.repository = repository;
    }

    public List<PortfolioMetricsDaily> findByPortfolioId(Long portfolioId) {
        return repository.findByPortfolioIdOrderByDateDesc(portfolioId);
    }

    public List<PortfolioMetricsDaily> findByPortfolioIdAndDateRange(Long portfolioId, LocalDate start, LocalDate end) {
        return repository.findByPortfolioIdAndDateBetween(portfolioId, start, end);
    }

    public Optional<PortfolioMetricsDaily> findByPortfolioIdAndDate(Long portfolioId, LocalDate date) {
        return repository.findByPortfolioIdAndDate(portfolioId, date);
    }

    public PortfolioMetricsDaily save(PortfolioMetricsDaily metrics) {
        return repository.save(metrics);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}

