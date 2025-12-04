package com.moneytree.strategy;

import com.moneytree.strategy.entity.Strategy;
import com.moneytree.strategy.entity.StrategyConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

/**
 * Service for strategy configuration management.
 * Handles CRUD operations and validation for strategy configurations.
 */
@Service
@Transactional
public class StrategyConfigService {

    private static final Logger log = LoggerFactory.getLogger(StrategyConfigService.class);

    private final StrategyConfigRepository strategyConfigRepository;
    private final StrategyRepository strategyRepository;

    public StrategyConfigService(StrategyConfigRepository strategyConfigRepository, 
                                  StrategyRepository strategyRepository) {
        this.strategyConfigRepository = strategyConfigRepository;
        this.strategyRepository = strategyRepository;
    }

    /**
     * Get configuration for a strategy.
     * 
     * @param strategyId the strategy ID
     * @return Optional containing the configuration if found
     */
    public Optional<StrategyConfig> getConfig(UUID strategyId) {
        log.info("getConfig strategyId={}", strategyId);
        return strategyConfigRepository.findByStrategyId(strategyId);
    }

    /**
     * Create or update strategy configuration.
     * Validates all configuration fields before saving.
     * 
     * @param strategyId the strategy ID
     * @param config the configuration to save
     * @return the saved configuration
     * @throws IllegalArgumentException if validation fails
     */
    public StrategyConfig saveConfig(UUID strategyId, StrategyConfig config) {
        log.info("saveConfig strategyId={}", strategyId);
        
        // Verify strategy exists
        Strategy strategy = strategyRepository.findById(strategyId)
                .orElseThrow(() -> new IllegalArgumentException("Strategy not found with ID: " + strategyId));
        
        // Validate configuration
        validateConfiguration(config);
        
        // Check if configuration already exists
        Optional<StrategyConfig> existingOpt = strategyConfigRepository.findByStrategyId(strategyId);
        
        StrategyConfig configToSave;
        if (existingOpt.isPresent()) {
            // Update existing configuration
            configToSave = existingOpt.get();
            configToSave.setUniverseDefinition(config.getUniverseDefinition());
            configToSave.setAllocations(config.getAllocations());
            configToSave.setEntryConditions(config.getEntryConditions());
            configToSave.setExitConditions(config.getExitConditions());
            configToSave.setRiskParameters(config.getRiskParameters());
        } else {
            // Create new configuration
            configToSave = config;
            if (configToSave.getId() == null) {
                configToSave.setId(UUID.randomUUID());
            }
            configToSave.setStrategy(strategy);
            configToSave.setCreatedAt(Instant.now());
        }
        
        configToSave.setUpdatedAt(Instant.now());
        return strategyConfigRepository.save(configToSave);
    }

    /**
     * Validate strategy configuration.
     * Checks universe definition, allocations, entry/exit conditions, and risk parameters.
     * 
     * @param config the configuration to validate
     * @throws IllegalArgumentException if validation fails
     */
    public void validateConfiguration(StrategyConfig config) {
        log.debug("validateConfiguration");
        
        if (config == null) {
            throw new IllegalArgumentException("Configuration cannot be null");
        }
        
        // Validate universe definition
        validateUniverseDefinition(config.getUniverseDefinition());
        
        // Validate allocations
        validateAllocations(config.getAllocations());
        
        // Validate entry conditions
        validateConditions(config.getEntryConditions(), "Entry");
        
        // Validate exit conditions
        validateConditions(config.getExitConditions(), "Exit");
        
        // Validate risk parameters
        validateRiskParameters(config.getRiskParameters());
    }

    /**
     * Validate universe definition.
     * Must have a type and at least one selection criterion.
     * 
     * @param universeDefinition the universe definition to validate
     * @throws IllegalArgumentException if validation fails
     */
    private void validateUniverseDefinition(Map<String, Object> universeDefinition) {
        if (universeDefinition == null || universeDefinition.isEmpty()) {
            throw new IllegalArgumentException("Universe definition is required");
        }
        
        String type = (String) universeDefinition.get("type");
        if (type == null || type.isEmpty()) {
            throw new IllegalArgumentException("Universe type is required");
        }
        
        if (!type.equals("INDEX") && !type.equals("SECTOR") && !type.equals("CUSTOM")) {
            throw new IllegalArgumentException("Universe type must be INDEX, SECTOR, or CUSTOM");
        }
        
        // Check that at least one selection criterion is provided
        @SuppressWarnings("unchecked")
        List<String> indices = (List<String>) universeDefinition.get("indices");
        @SuppressWarnings("unchecked")
        List<String> sectors = (List<String>) universeDefinition.get("sectors");
        @SuppressWarnings("unchecked")
        List<String> symbols = (List<String>) universeDefinition.get("symbols");
        
        if ((indices == null || indices.isEmpty()) && 
            (sectors == null || sectors.isEmpty()) && 
            (symbols == null || symbols.isEmpty())) {
            throw new IllegalArgumentException("At least one universe selection criterion (indices, sectors, or symbols) is required");
        }
    }

    /**
     * Validate allocation rules.
     * Checks position sizing method and percentage ranges.
     * 
     * @param allocations the allocations to validate
     * @throws IllegalArgumentException if validation fails
     */
    private void validateAllocations(Map<String, Object> allocations) {
        if (allocations == null || allocations.isEmpty()) {
            throw new IllegalArgumentException("Allocations are required");
        }
        
        String positionSizingMethod = (String) allocations.get("positionSizingMethod");
        if (positionSizingMethod == null || positionSizingMethod.isEmpty()) {
            throw new IllegalArgumentException("Position sizing method is required");
        }
        
        if (!positionSizingMethod.equals("EQUAL_WEIGHT") && 
            !positionSizingMethod.equals("RISK_PARITY") && 
            !positionSizingMethod.equals("CUSTOM")) {
            throw new IllegalArgumentException("Position sizing method must be EQUAL_WEIGHT, RISK_PARITY, or CUSTOM");
        }
        
        // Validate percentage fields
        validatePercentage(allocations, "maxPositionSize", 0, 100);
        validatePercentage(allocations, "maxPortfolioAllocation", 0, 100);
        validatePercentage(allocations, "cashReserve", 0, 100);
    }

    /**
     * Validate trading conditions (entry or exit).
     * Must have at least one condition.
     * 
     * @param conditions the conditions to validate
     * @param conditionType the type of condition (Entry or Exit) for error messages
     * @throws IllegalArgumentException if validation fails
     */
    @SuppressWarnings("unchecked")
    private void validateConditions(Map<String, Object> conditions, String conditionType) {
        if (conditions == null || conditions.isEmpty()) {
            throw new IllegalArgumentException(conditionType + " conditions are required");
        }
        
        List<Map<String, Object>> conditionList = (List<Map<String, Object>>) conditions.get("conditions");
        if (conditionList == null || conditionList.isEmpty()) {
            throw new IllegalArgumentException("At least one " + conditionType.toLowerCase() + " condition is required");
        }
        
        // Validate each condition
        for (Map<String, Object> condition : conditionList) {
            String type = (String) condition.get("type");
            if (type == null || type.isEmpty()) {
                throw new IllegalArgumentException(conditionType + " condition type is required");
            }
            
            if (!type.equals("TECHNICAL") && !type.equals("PRICE") && 
                !type.equals("VOLUME") && !type.equals("CUSTOM")) {
                throw new IllegalArgumentException(conditionType + " condition type must be TECHNICAL, PRICE, VOLUME, or CUSTOM");
            }
            
            String operator = (String) condition.get("operator");
            if (operator == null || operator.isEmpty()) {
                throw new IllegalArgumentException(conditionType + " condition operator is required");
            }
            
            if (!operator.equals("GT") && !operator.equals("LT") && !operator.equals("EQ") && 
                !operator.equals("CROSS_ABOVE") && !operator.equals("CROSS_BELOW")) {
                throw new IllegalArgumentException(conditionType + " condition operator must be GT, LT, EQ, CROSS_ABOVE, or CROSS_BELOW");
            }
            
            Object value = condition.get("value");
            if (value == null) {
                throw new IllegalArgumentException(conditionType + " condition value is required");
            }
        }
    }

    /**
     * Validate risk parameters.
     * Checks percentage ranges for stop-loss, take-profit, etc.
     * 
     * @param riskParameters the risk parameters to validate
     * @throws IllegalArgumentException if validation fails
     */
    private void validateRiskParameters(Map<String, Object> riskParameters) {
        if (riskParameters == null || riskParameters.isEmpty()) {
            throw new IllegalArgumentException("Risk parameters are required");
        }
        
        // Validate optional percentage fields
        validateOptionalPercentage(riskParameters, "stopLossPercent", 0, 100);
        validateOptionalPercentage(riskParameters, "takeProfitPercent", 0, 1000);
        validateOptionalPercentage(riskParameters, "trailingStopPercent", 0, 100);
        validateOptionalPercentage(riskParameters, "maxDrawdownPercent", 0, 100);
        
        // Validate optional maxDailyLoss
        if (riskParameters.containsKey("maxDailyLoss")) {
            Object maxDailyLoss = riskParameters.get("maxDailyLoss");
            if (maxDailyLoss != null) {
                double value = getDoubleValue(maxDailyLoss);
                if (value < 0) {
                    throw new IllegalArgumentException("maxDailyLoss must be non-negative");
                }
            }
        }
    }

    /**
     * Validate a percentage field.
     * 
     * @param map the map containing the field
     * @param fieldName the field name
     * @param min minimum allowed value
     * @param max maximum allowed value
     * @throws IllegalArgumentException if validation fails
     */
    private void validatePercentage(Map<String, Object> map, String fieldName, double min, double max) {
        Object value = map.get(fieldName);
        if (value == null) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
        
        double doubleValue = getDoubleValue(value);
        if (doubleValue < min || doubleValue > max) {
            throw new IllegalArgumentException(fieldName + " must be between " + min + " and " + max);
        }
    }

    /**
     * Validate an optional percentage field.
     * 
     * @param map the map containing the field
     * @param fieldName the field name
     * @param min minimum allowed value
     * @param max maximum allowed value
     * @throws IllegalArgumentException if validation fails
     */
    private void validateOptionalPercentage(Map<String, Object> map, String fieldName, double min, double max) {
        if (map.containsKey(fieldName)) {
            Object value = map.get(fieldName);
            if (value != null) {
                double doubleValue = getDoubleValue(value);
                if (doubleValue < min || doubleValue > max) {
                    throw new IllegalArgumentException(fieldName + " must be between " + min + " and " + max);
                }
            }
        }
    }

    /**
     * Convert an object to a double value.
     * Handles Integer, Long, Double, and String types.
     * 
     * @param value the value to convert
     * @return the double value
     * @throws IllegalArgumentException if conversion fails
     */
    private double getDoubleValue(Object value) {
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        } else if (value instanceof String) {
            try {
                return Double.parseDouble((String) value);
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("Invalid number format: " + value);
            }
        }
        throw new IllegalArgumentException("Invalid value type: " + value.getClass().getName());
    }

    /**
     * Delete configuration for a strategy.
     * 
     * @param strategyId the strategy ID
     * @return true if deleted, false if not found
     */
    public boolean deleteConfig(UUID strategyId) {
        log.info("deleteConfig strategyId={}", strategyId);
        Optional<StrategyConfig> config = strategyConfigRepository.findByStrategyId(strategyId);
        if (config.isPresent()) {
            strategyConfigRepository.delete(config.get());
            return true;
        }
        return false;
    }
}
