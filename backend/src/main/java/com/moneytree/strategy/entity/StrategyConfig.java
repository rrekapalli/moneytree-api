package com.moneytree.strategy.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Entity representing strategy configuration with JSONB fields.
 * Stores universe definition, allocations, entry/exit conditions, and risk parameters.
 */
@Entity
@Table(name = "strategy_config", uniqueConstraints = {
    @UniqueConstraint(name = "strategy_config_strategy_uk", columnNames = {"strategy_id"})
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class StrategyConfig {

    @Id
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "strategy_id", nullable = false, foreignKey = @ForeignKey(name = "strategy_config_strategy_id_fkey"))
    @JsonIgnore
    private Strategy strategy;

    @Column(name = "universe_definition", nullable = false, columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> universeDefinition;

    @Column(name = "allocations", nullable = false, columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> allocations;

    @Column(name = "entry_conditions", nullable = false, columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> entryConditions;

    @Column(name = "exit_conditions", nullable = false, columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> exitConditions;

    @Column(name = "risk_parameters", nullable = false, columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> riskParameters;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    // Getters and setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Strategy getStrategy() {
        return strategy;
    }

    public void setStrategy(Strategy strategy) {
        this.strategy = strategy;
    }

    public Map<String, Object> getUniverseDefinition() {
        return universeDefinition;
    }

    public void setUniverseDefinition(Map<String, Object> universeDefinition) {
        this.universeDefinition = universeDefinition;
    }

    public Map<String, Object> getAllocations() {
        return allocations;
    }

    public void setAllocations(Map<String, Object> allocations) {
        this.allocations = allocations;
    }

    public Map<String, Object> getEntryConditions() {
        return entryConditions;
    }

    public void setEntryConditions(Map<String, Object> entryConditions) {
        this.entryConditions = entryConditions;
    }

    public Map<String, Object> getExitConditions() {
        return exitConditions;
    }

    public void setExitConditions(Map<String, Object> exitConditions) {
        this.exitConditions = exitConditions;
    }

    public Map<String, Object> getRiskParameters() {
        return riskParameters;
    }

    public void setRiskParameters(Map<String, Object> riskParameters) {
        this.riskParameters = riskParameters;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
