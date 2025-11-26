package com.moneytree.portfolio.entity;

import com.moneytree.user.entity.User;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "portfolios", uniqueConstraints = {
    @UniqueConstraint(name = "portfolios_user_name_uk", columnNames = {"user_id", "name"})
})
public class Portfolio {

    @Id
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "portfolios_user_id_fkey"))
    private User user;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "base_currency", length = 10)
    private String baseCurrency = "INR";

    @Column(name = "inception_date")
    private LocalDate inceptionDate;

    @Column(name = "risk_profile", length = 50)
    private String riskProfile;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "target_allocation")
    private Map<String, Object> targetAllocation;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @Column(name = "initial_capital", precision = 15, scale = 2)
    private BigDecimal initialCapital;

    @Column(name = "current_cash", precision = 15, scale = 2)
    private BigDecimal currentCash;

    @Column(name = "trading_mode", length = 20)
    private String tradingMode; // 'paper' or 'live'

    @Column(name = "strategy_name", length = 100)
    private String strategyName;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "strategy_params")
    private Map<String, Object> strategyParams;

    @Column(name = "kite_api_key", columnDefinition = "text")
    private String kiteApiKey;

    @Column(name = "kite_api_secret", columnDefinition = "text")
    private String kiteApiSecret;

    @Column(name = "last_signal_check")
    private Instant lastSignalCheck;

    // Getters and setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getBaseCurrency() {
        return baseCurrency;
    }

    public void setBaseCurrency(String baseCurrency) {
        this.baseCurrency = baseCurrency;
    }

    public LocalDate getInceptionDate() {
        return inceptionDate;
    }

    public void setInceptionDate(LocalDate inceptionDate) {
        this.inceptionDate = inceptionDate;
    }

    public String getRiskProfile() {
        return riskProfile;
    }

    public void setRiskProfile(String riskProfile) {
        this.riskProfile = riskProfile;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Map<String, Object> getTargetAllocation() {
        return targetAllocation;
    }

    public void setTargetAllocation(Map<String, Object> targetAllocation) {
        this.targetAllocation = targetAllocation;
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

    public BigDecimal getInitialCapital() {
        return initialCapital;
    }

    public void setInitialCapital(BigDecimal initialCapital) {
        this.initialCapital = initialCapital;
    }

    public BigDecimal getCurrentCash() {
        return currentCash;
    }

    public void setCurrentCash(BigDecimal currentCash) {
        this.currentCash = currentCash;
    }

    public String getTradingMode() {
        return tradingMode;
    }

    public void setTradingMode(String tradingMode) {
        this.tradingMode = tradingMode;
    }

    public String getStrategyName() {
        return strategyName;
    }

    public void setStrategyName(String strategyName) {
        this.strategyName = strategyName;
    }

    public Map<String, Object> getStrategyParams() {
        return strategyParams;
    }

    public void setStrategyParams(Map<String, Object> strategyParams) {
        this.strategyParams = strategyParams;
    }

    public String getKiteApiKey() {
        return kiteApiKey;
    }

    public void setKiteApiKey(String kiteApiKey) {
        this.kiteApiKey = kiteApiKey;
    }

    public String getKiteApiSecret() {
        return kiteApiSecret;
    }

    public void setKiteApiSecret(String kiteApiSecret) {
        this.kiteApiSecret = kiteApiSecret;
    }

    public Instant getLastSignalCheck() {
        return lastSignalCheck;
    }

    public void setLastSignalCheck(Instant lastSignalCheck) {
        this.lastSignalCheck = lastSignalCheck;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}

