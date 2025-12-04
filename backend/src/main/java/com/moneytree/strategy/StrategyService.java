package com.moneytree.strategy;

import com.moneytree.strategy.entity.Strategy;
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
 * Service for strategy CRUD operations using Spring Data JPA.
 */
@Service
@Transactional
public class StrategyService {

    private static final Logger log = LoggerFactory.getLogger(StrategyService.class);

    private final StrategyRepository strategyRepository;
    private final UserRepository userRepository;

    public StrategyService(StrategyRepository strategyRepository, UserRepository userRepository) {
        this.strategyRepository = strategyRepository;
        this.userRepository = userRepository;
    }

    /**
     * List all strategies for a specific user.
     * 
     * @param userId the user ID
     * @return list of strategies ordered by updated_at descending
     */
    public List<Strategy> listStrategiesByUser(UUID userId) {
        log.info("listStrategiesByUser userId={}", userId);
        return strategyRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    }

    /**
     * List all active strategies.
     * 
     * @return list of active strategies ordered by updated_at descending
     */
    public List<Strategy> listActiveStrategies() {
        log.info("listActiveStrategies called");
        return strategyRepository.findAllActiveOrderByUpdatedAtDesc();
    }

    /**
     * Get a strategy by ID.
     * 
     * @param id the strategy ID
     * @return Optional containing the strategy if found
     */
    public Optional<Strategy> getStrategy(UUID id) {
        log.info("getStrategy id={}", id);
        return strategyRepository.findById(id);
    }

    /**
     * Create a new strategy.
     * Validates that:
     * - Name is not empty
     * - Risk profile is valid (if provided)
     * - User exists
     * - Strategy name is unique for the user
     * 
     * @param strategy the strategy to create
     * @return the created strategy
     * @throws IllegalArgumentException if validation fails
     */
    public Strategy createStrategy(Strategy strategy) {
        log.info("createStrategy name={}", strategy.getName());
        
        // Validate name
        if (strategy.getName() == null || strategy.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Strategy name is required");
        }
        
        // Validate risk profile if provided
        if (strategy.getRiskProfile() != null && !strategy.getRiskProfile().isEmpty()) {
            if (!isValidRiskProfile(strategy.getRiskProfile())) {
                throw new IllegalArgumentException("Invalid risk profile. Must be CONSERVATIVE, MODERATE, or AGGRESSIVE");
            }
        }
        
        // Generate UUID if not set
        if (strategy.getId() == null) {
            strategy.setId(UUID.randomUUID());
        }
        
        // If user is not set, find or create a default user
        if (strategy.getUser() == null) {
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
            strategy.setUser(defaultUser);
        }
        
        // Check for duplicate name for this user
        Optional<Strategy> existing = strategyRepository.findByUserIdAndName(
            strategy.getUser().getId(), 
            strategy.getName()
        );
        if (existing.isPresent()) {
            throw new IllegalArgumentException("A strategy with this name already exists for this user");
        }
        
        // Set default values
        if (strategy.getIsActive() == null) {
            strategy.setIsActive(false);
        }
        
        return strategyRepository.save(strategy);
    }

    /**
     * Update an existing strategy.
     * Validates that:
     * - Strategy exists
     * - Name is not empty (if changed)
     * - Risk profile is valid (if changed)
     * - New name is unique for the user (if changed)
     * 
     * @param strategy the strategy with updated fields
     * @return Optional containing the updated strategy if successful
     * @throws IllegalArgumentException if validation fails
     */
    public Optional<Strategy> updateStrategy(Strategy strategy) {
        log.info("updateStrategy id={}", strategy.getId());
        
        // Fetch existing strategy to preserve user relationship
        Optional<Strategy> existingOpt = strategyRepository.findById(strategy.getId());
        if (existingOpt.isEmpty()) {
            return Optional.empty();
        }
        
        Strategy existing = existingOpt.get();
        
        // Validate name if changed
        if (strategy.getName() != null && !strategy.getName().equals(existing.getName())) {
            if (strategy.getName().trim().isEmpty()) {
                throw new IllegalArgumentException("Strategy name cannot be empty");
            }
            
            // Check for duplicate name for this user
            Optional<Strategy> duplicate = strategyRepository.findByUserIdAndName(
                existing.getUser().getId(), 
                strategy.getName()
            );
            if (duplicate.isPresent() && !duplicate.get().getId().equals(strategy.getId())) {
                throw new IllegalArgumentException("A strategy with this name already exists for this user");
            }
        }
        
        // Validate risk profile if changed
        if (strategy.getRiskProfile() != null && !strategy.getRiskProfile().isEmpty()) {
            if (!isValidRiskProfile(strategy.getRiskProfile())) {
                throw new IllegalArgumentException("Invalid risk profile. Must be CONSERVATIVE, MODERATE, or AGGRESSIVE");
            }
        }
        
        // Update only the fields that should be updatable, preserve user
        if (strategy.getName() != null) {
            existing.setName(strategy.getName());
        }
        if (strategy.getDescription() != null) {
            existing.setDescription(strategy.getDescription());
        }
        if (strategy.getRiskProfile() != null) {
            existing.setRiskProfile(strategy.getRiskProfile());
        }
        if (strategy.getIsActive() != null) {
            existing.setIsActive(strategy.getIsActive());
        }
        
        return Optional.of(strategyRepository.save(existing));
    }

    /**
     * Delete a strategy.
     * Uses cascade delete to remove associated configuration and metrics.
     * 
     * @param id the strategy ID
     * @return true if deleted, false if not found
     */
    public boolean deleteStrategy(UUID id) {
        log.info("deleteStrategy id={}", id);
        if (!strategyRepository.existsById(id)) {
            return false;
        }
        strategyRepository.deleteById(id);
        return true;
    }

    /**
     * Validate risk profile value.
     * 
     * @param riskProfile the risk profile to validate
     * @return true if valid
     */
    private boolean isValidRiskProfile(String riskProfile) {
        return riskProfile.equals("CONSERVATIVE") || 
               riskProfile.equals("MODERATE") || 
               riskProfile.equals("AGGRESSIVE");
    }
}
