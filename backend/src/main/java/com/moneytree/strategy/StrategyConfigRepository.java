package com.moneytree.strategy;

import com.moneytree.strategy.entity.StrategyConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for StrategyConfig entity.
 * Provides methods to query strategy configurations.
 */
@Repository
public interface StrategyConfigRepository extends JpaRepository<StrategyConfig, UUID> {

    /**
     * Find strategy configuration by strategy ID.
     * 
     * @param strategyId the strategy ID
     * @return Optional containing the configuration if found
     */
    @Query("SELECT sc FROM StrategyConfig sc WHERE sc.strategy.id = ?1")
    Optional<StrategyConfig> findByStrategyId(UUID strategyId);

    /**
     * Check if a configuration exists for a strategy.
     * 
     * @param strategyId the strategy ID
     * @return true if configuration exists
     */
    @Query("SELECT CASE WHEN COUNT(sc) > 0 THEN true ELSE false END FROM StrategyConfig sc WHERE sc.strategy.id = ?1")
    boolean existsByStrategyId(UUID strategyId);

    /**
     * Delete configuration by strategy ID.
     * 
     * @param strategyId the strategy ID
     */
    @Query("DELETE FROM StrategyConfig sc WHERE sc.strategy.id = ?1")
    void deleteByStrategyId(UUID strategyId);
}
