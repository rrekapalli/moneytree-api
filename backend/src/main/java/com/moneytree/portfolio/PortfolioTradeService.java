package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.PortfolioTrade;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PortfolioTradeService {

    private static final Logger log = LoggerFactory.getLogger(PortfolioTradeService.class);
    private final PortfolioTradeRepository repository;

    public PortfolioTradeService(PortfolioTradeRepository repository) {
        this.repository = repository;
    }

    public List<PortfolioTrade> findByPortfolioId(Long portfolioId) {
        return repository.findByPortfolioIdOrderByEntryDateDesc(portfolioId);
    }

    public List<PortfolioTrade> findByPortfolioIdAndSymbol(Long portfolioId, String symbol) {
        return repository.findByPortfolioIdAndSymbol(portfolioId, symbol);
    }

    public List<PortfolioTrade> findByPortfolioIdAndDateRange(Long portfolioId, Instant start, Instant end) {
        return repository.findByPortfolioIdAndEntryDateBetween(portfolioId, start, end);
    }

    public Optional<PortfolioTrade> findById(Integer id) {
        return repository.findById(id);
    }

    public PortfolioTrade save(PortfolioTrade trade) {
        return repository.save(trade);
    }

    public void deleteById(Integer id) {
        repository.deleteById(id);
    }
}

