package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.Portfolio;
import com.moneytree.user.UserRepository;
import com.moneytree.user.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for portfolio CRUD operations using Spring Data JPA.
 */
@Service
@Transactional
public class PortfolioService {

    private static final Logger log = LoggerFactory.getLogger(PortfolioService.class);

    private final PortfolioRepository portfolioRepository;
    private final UserRepository userRepository;

    public PortfolioService(PortfolioRepository portfolioRepository, UserRepository userRepository) {
        this.portfolioRepository = portfolioRepository;
        this.userRepository = userRepository;
    }

    public List<Portfolio> listPortfolios() {
        log.info("listPortfolios called");
        return portfolioRepository.findAllActiveOrderByCreatedAtDesc();
    }

    public List<Portfolio> listPortfoliosByUser(UUID userId) {
        log.info("listPortfoliosByUser userId={}", userId);
        return portfolioRepository.findByUserId(userId);
    }

    public Optional<Portfolio> getPortfolio(UUID id) {
        log.info("getPortfolio id={}", id);
        return portfolioRepository.findById(id);
    }

    public Portfolio createPortfolio(Portfolio portfolio) {
        log.info("createPortfolio name={}", portfolio.getName());
        
        // Generate UUID if not set
        if (portfolio.getId() == null) {
            portfolio.setId(UUID.randomUUID());
        }
        
        // If user is not set, find or create a default user
        if (portfolio.getUser() == null) {
            User defaultUser = userRepository.findFirstByOrderByCreatedAtAsc()
                    .orElseGet(() -> {
                        // Create a default test user if none exists
                        User newUser = new User();
                        newUser.setId(UUID.randomUUID());
                        newUser.setEmail("test@moneytree.com");
                        newUser.setProvider("test");
                        newUser.setProviderUserId("test-user");
                        newUser.setIsEnabled(true);
                        newUser.setCreatedAt(Instant.now());
                        return userRepository.save(newUser);
                    });
            portfolio.setUser(defaultUser);
        }
        
        return portfolioRepository.save(portfolio);
    }

    public Optional<Portfolio> updatePortfolio(Portfolio portfolio) {
        log.info("updatePortfolio id={}", portfolio.getId());
        if (!portfolioRepository.existsById(portfolio.getId())) {
            return Optional.empty();
        }
        return Optional.of(portfolioRepository.save(portfolio));
    }

    public boolean deletePortfolio(UUID id) {
        log.info("deletePortfolio id={}", id);
        if (!portfolioRepository.existsById(id)) {
            return false;
        }
        portfolioRepository.deleteById(id);
        return true;
    }
}


