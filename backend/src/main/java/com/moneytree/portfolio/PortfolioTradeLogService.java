package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.PortfolioTradeLog;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class PortfolioTradeLogService {

    private static final Logger log = LoggerFactory.getLogger(PortfolioTradeLogService.class);
    private final PortfolioTradeLogRepository repository;

    public PortfolioTradeLogService(PortfolioTradeLogRepository repository) {
        this.repository = repository;
    }

    public List<PortfolioTradeLog> findByPortfolioId(UUID portfolioId) {
        return repository.findByPortfolioIdOrderByCycleTimestampDesc(portfolioId);
    }

    public List<PortfolioTradeLog> findByPortfolioIdAndSymbol(UUID portfolioId, String symbol) {
        return repository.findByPortfolioIdAndSymbol(portfolioId, symbol);
    }

    public List<PortfolioTradeLog> findByPortfolioIdAndTimeRange(UUID portfolioId, Instant start, Instant end) {
        return repository.findByPortfolioIdAndCycleTimestampBetween(portfolioId, start, end);
    }

    public Optional<PortfolioTradeLog> findById(UUID id) {
        return repository.findById(id);
    }

    public PortfolioTradeLog save(PortfolioTradeLog tradeLog) {
        return repository.save(tradeLog);
    }

    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}

