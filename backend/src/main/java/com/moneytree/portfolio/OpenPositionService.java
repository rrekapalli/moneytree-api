package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.OpenPosition;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class OpenPositionService {

    private static final Logger log = LoggerFactory.getLogger(OpenPositionService.class);
    private final OpenPositionRepository repository;

    public OpenPositionService(OpenPositionRepository repository) {
        this.repository = repository;
    }

    public List<OpenPosition> findByPortfolioId(UUID portfolioId) {
        return repository.findByPortfolioIdOrderByEntryDateDesc(portfolioId);
    }

    public Optional<OpenPosition> findByPortfolioIdAndSymbol(UUID portfolioId, String symbol) {
        return repository.findByPortfolioIdAndSymbol(portfolioId, symbol);
    }

    public List<OpenPosition> findBySymbol(String symbol) {
        return repository.findBySymbol(symbol);
    }

    public Optional<OpenPosition> findById(UUID id) {
        return repository.findById(id);
    }

    public OpenPosition save(OpenPosition position) {
        return repository.save(position);
    }

    public void deleteById(UUID id) {
        repository.deleteById(id);
    }

    public void deleteByPortfolioIdAndSymbol(UUID portfolioId, String symbol) {
        repository.findByPortfolioIdAndSymbol(portfolioId, symbol)
                .ifPresent(repository::delete);
    }
}

