package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.OpenPosition;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class OpenPositionService {

    private static final Logger log = LoggerFactory.getLogger(OpenPositionService.class);
    private final OpenPositionRepository repository;

    public OpenPositionService(OpenPositionRepository repository) {
        this.repository = repository;
    }

    public List<OpenPosition> findByPortfolioId(Long portfolioId) {
        return repository.findByPortfolioIdOrderByEntryDateDesc(portfolioId);
    }

    public Optional<OpenPosition> findByPortfolioIdAndSymbol(Long portfolioId, String symbol) {
        return repository.findByPortfolioIdAndSymbol(portfolioId, symbol);
    }

    public List<OpenPosition> findBySymbol(String symbol) {
        return repository.findBySymbol(symbol);
    }

    public Optional<OpenPosition> findById(Integer id) {
        return repository.findById(id);
    }

    public OpenPosition save(OpenPosition position) {
        return repository.save(position);
    }

    public void deleteById(Integer id) {
        repository.deleteById(id);
    }

    public void deleteByPortfolioIdAndSymbol(Long portfolioId, String symbol) {
        repository.findByPortfolioIdAndSymbol(portfolioId, symbol)
                .ifPresent(repository::delete);
    }
}

