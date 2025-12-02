package com.moneytree.portfolio;

import com.moneytree.portfolio.dto.PortfolioHoldingUpdateRequest;
import com.moneytree.portfolio.entity.OpenPosition;
import com.moneytree.portfolio.entity.PortfolioHolding;
import com.moneytree.portfolio.entity.PortfolioHoldingSummary;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class PortfolioHoldingService {

    private static final Logger log = LoggerFactory.getLogger(PortfolioHoldingService.class);
    private final PortfolioHoldingRepository repository;
    private final PortfolioHoldingSummaryRepository summaryRepository;
    private final OpenPositionRepository openPositionRepository;

    public PortfolioHoldingService(PortfolioHoldingRepository repository, 
                                   PortfolioHoldingSummaryRepository summaryRepository,
                                   OpenPositionRepository openPositionRepository) {
        this.repository = repository;
        this.summaryRepository = summaryRepository;
        this.openPositionRepository = openPositionRepository;
    }

    public List<PortfolioHolding> findByPortfolioId(UUID portfolioId) {
        return repository.findByPortfolio_Id(portfolioId);
    }

    public List<PortfolioHoldingSummary> findSummaryByPortfolioId(UUID portfolioId) {
        return summaryRepository.findByPortfolioId(portfolioId.toString());
    }

    public Optional<PortfolioHolding> findByPortfolioIdAndSymbol(UUID portfolioId, String symbol) {
        return repository.findByPortfolio_IdAndSymbol(portfolioId, symbol);
    }

    public PortfolioHolding save(PortfolioHolding holding) {
        return repository.save(holding);
    }

    public void deleteById(UUID id) {
        repository.deleteById(id);
    }

    public void updateHolding(UUID portfolioId, String symbol, PortfolioHoldingUpdateRequest request) {
        // Update portfolio_holdings table
        Optional<PortfolioHolding> holdingOpt = repository.findByPortfolio_IdAndSymbol(portfolioId, symbol);
        if (holdingOpt.isPresent()) {
            PortfolioHolding holding = holdingOpt.get();
            if (request.getQuantity() != null) {
                holding.setQuantity(request.getQuantity());
            }
            if (request.getAvgCost() != null) {
                holding.setAvgCost(request.getAvgCost());
            }
            repository.save(holding);
            log.info("Updated portfolio_holdings for portfolio {} symbol {}", portfolioId, symbol);
        }

        // Update open_positions table for takeProfit/stopLoss
        Optional<OpenPosition> positionOpt = openPositionRepository.findByPortfolioIdAndSymbol(portfolioId, symbol);
        if (positionOpt.isPresent()) {
            OpenPosition position = positionOpt.get();
            if (request.getTakeProfit() != null) {
                position.setTakeProfit(request.getTakeProfit());
            }
            if (request.getStopLoss() != null) {
                position.setStopLoss(request.getStopLoss());
            }
            openPositionRepository.save(position);
            log.info("Updated open_positions for portfolio {} symbol {}", portfolioId, symbol);
        }
    }
}

