package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.Portfolio;
import com.moneytree.portfolio.entity.PortfolioConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class PortfolioConfigService {

    private static final Logger log = LoggerFactory.getLogger(PortfolioConfigService.class);

    private final PortfolioConfigRepository portfolioConfigRepository;
    private final PortfolioRepository portfolioRepository;

    public PortfolioConfigService(PortfolioConfigRepository portfolioConfigRepository, 
                                  PortfolioRepository portfolioRepository) {
        this.portfolioConfigRepository = portfolioConfigRepository;
        this.portfolioRepository = portfolioRepository;
    }

    public Optional<PortfolioConfig> getPortfolioConfig(UUID portfolioId) {
        log.info("getPortfolioConfig portfolioId={}", portfolioId);
        return portfolioConfigRepository.findById(portfolioId);
    }

    public PortfolioConfig createPortfolioConfig(UUID portfolioId, PortfolioConfig config) {
        log.info("createPortfolioConfig portfolioId={}", portfolioId);
        
        // Verify portfolio exists
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new IllegalArgumentException("Portfolio not found: " + portfolioId));
        
        config.setPortfolioId(portfolioId);
        config.setPortfolio(portfolio);
        config.setCreatedAt(Instant.now());
        config.setUpdatedAt(Instant.now());
        
        return portfolioConfigRepository.save(config);
    }

    public Optional<PortfolioConfig> updatePortfolioConfig(UUID portfolioId, PortfolioConfig config) {
        log.info("updatePortfolioConfig portfolioId={}", portfolioId);
        
        if (!portfolioConfigRepository.existsById(portfolioId)) {
            return Optional.empty();
        }
        
        config.setPortfolioId(portfolioId);
        config.setUpdatedAt(Instant.now());
        
        return Optional.of(portfolioConfigRepository.save(config));
    }

    public boolean deletePortfolioConfig(UUID portfolioId) {
        log.info("deletePortfolioConfig portfolioId={}", portfolioId);
        
        if (!portfolioConfigRepository.existsById(portfolioId)) {
            return false;
        }
        
        portfolioConfigRepository.deleteById(portfolioId);
        return true;
    }
}
