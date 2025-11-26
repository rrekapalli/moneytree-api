package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.PortfolioBenchmark;
import com.moneytree.portfolio.entity.PortfolioBenchmarkId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PortfolioBenchmarkService {

    private static final Logger log = LoggerFactory.getLogger(PortfolioBenchmarkService.class);
    private final PortfolioBenchmarkRepository repository;

    public PortfolioBenchmarkService(PortfolioBenchmarkRepository repository) {
        this.repository = repository;
    }

    public List<PortfolioBenchmark> findByPortfolioId(Long portfolioId) {
        return repository.findByPortfolioId(portfolioId);
    }

    public Optional<PortfolioBenchmark> findById(Long portfolioId, String indexName) {
        return repository.findById(new PortfolioBenchmarkId(portfolioId, indexName));
    }

    public PortfolioBenchmark save(PortfolioBenchmark benchmark) {
        return repository.save(benchmark);
    }

    public void deleteById(Long portfolioId, String indexName) {
        repository.deleteById(new PortfolioBenchmarkId(portfolioId, indexName));
    }
}

