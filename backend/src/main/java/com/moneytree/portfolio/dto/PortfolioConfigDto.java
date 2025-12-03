package com.moneytree.portfolio.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * DTO for Portfolio Configuration
 */
public class PortfolioConfigDto {
    
    private UUID portfolioId;
    
    // Trading Configuration
    private String tradingMode;
    private Integer signalCheckInterval;
    private Integer lookbackDays;
    
    // Historical Cache Configuration
    private Boolean historicalCacheEnabled;
    private Integer historicalCacheLookbackDays;
    private String historicalCacheExchange;
    private String historicalCacheInstrumentType;
    private String historicalCacheCandleInterval;
    private Integer historicalCacheTtlSeconds;
    
    // Redis Configuration
    private Boolean redisEnabled;
    private String redisHost;
    private Integer redisPort;
    private String redisPassword;
    private Integer redisDb;
    private String redisKeyPrefix;
    
    // Additional Trading Settings
    private Boolean enableConditionalLogging;
    private Integer cacheDurationSeconds;
    private String exchange;
    private String candleInterval;
    
    // Entry Conditions
    private Boolean entryBbLower;
    private BigDecimal entryRsiThreshold;
    private Boolean entryMacdTurnPositive;
    private Boolean entryVolumeAboveAvg;
    private Integer entryFallbackSmaPeriod;
    private BigDecimal entryFallbackAtrMultiplier;
    
    // Exit Conditions
    private BigDecimal exitTakeProfitPct;
    private BigDecimal exitStopLossAtrMult;
    private Boolean exitAllowTpExitsOnly;
    
    // Custom JSON
    private Map<String, Object> customJson;
    
    // Timestamps
    private Instant createdAt;
    private Instant updatedAt;

    // Getters and Setters
    public UUID getPortfolioId() {
        return portfolioId;
    }

    public void setPortfolioId(UUID portfolioId) {
        this.portfolioId = portfolioId;
    }

    public String getTradingMode() {
        return tradingMode;
    }

    public void setTradingMode(String tradingMode) {
        this.tradingMode = tradingMode;
    }

    public Integer getSignalCheckInterval() {
        return signalCheckInterval;
    }

    public void setSignalCheckInterval(Integer signalCheckInterval) {
        this.signalCheckInterval = signalCheckInterval;
    }

    public Integer getLookbackDays() {
        return lookbackDays;
    }

    public void setLookbackDays(Integer lookbackDays) {
        this.lookbackDays = lookbackDays;
    }

    public Boolean getHistoricalCacheEnabled() {
        return historicalCacheEnabled;
    }

    public void setHistoricalCacheEnabled(Boolean historicalCacheEnabled) {
        this.historicalCacheEnabled = historicalCacheEnabled;
    }

    public Integer getHistoricalCacheLookbackDays() {
        return historicalCacheLookbackDays;
    }

    public void setHistoricalCacheLookbackDays(Integer historicalCacheLookbackDays) {
        this.historicalCacheLookbackDays = historicalCacheLookbackDays;
    }

    public String getHistoricalCacheExchange() {
        return historicalCacheExchange;
    }

    public void setHistoricalCacheExchange(String historicalCacheExchange) {
        this.historicalCacheExchange = historicalCacheExchange;
    }

    public String getHistoricalCacheInstrumentType() {
        return historicalCacheInstrumentType;
    }

    public void setHistoricalCacheInstrumentType(String historicalCacheInstrumentType) {
        this.historicalCacheInstrumentType = historicalCacheInstrumentType;
    }

    public String getHistoricalCacheCandleInterval() {
        return historicalCacheCandleInterval;
    }

    public void setHistoricalCacheCandleInterval(String historicalCacheCandleInterval) {
        this.historicalCacheCandleInterval = historicalCacheCandleInterval;
    }

    public Integer getHistoricalCacheTtlSeconds() {
        return historicalCacheTtlSeconds;
    }

    public void setHistoricalCacheTtlSeconds(Integer historicalCacheTtlSeconds) {
        this.historicalCacheTtlSeconds = historicalCacheTtlSeconds;
    }

    public Boolean getRedisEnabled() {
        return redisEnabled;
    }

    public void setRedisEnabled(Boolean redisEnabled) {
        this.redisEnabled = redisEnabled;
    }

    public String getRedisHost() {
        return redisHost;
    }

    public void setRedisHost(String redisHost) {
        this.redisHost = redisHost;
    }

    public Integer getRedisPort() {
        return redisPort;
    }

    public void setRedisPort(Integer redisPort) {
        this.redisPort = redisPort;
    }

    public String getRedisPassword() {
        return redisPassword;
    }

    public void setRedisPassword(String redisPassword) {
        this.redisPassword = redisPassword;
    }

    public Integer getRedisDb() {
        return redisDb;
    }

    public void setRedisDb(Integer redisDb) {
        this.redisDb = redisDb;
    }

    public String getRedisKeyPrefix() {
        return redisKeyPrefix;
    }

    public void setRedisKeyPrefix(String redisKeyPrefix) {
        this.redisKeyPrefix = redisKeyPrefix;
    }

    public Boolean getEnableConditionalLogging() {
        return enableConditionalLogging;
    }

    public void setEnableConditionalLogging(Boolean enableConditionalLogging) {
        this.enableConditionalLogging = enableConditionalLogging;
    }

    public Integer getCacheDurationSeconds() {
        return cacheDurationSeconds;
    }

    public void setCacheDurationSeconds(Integer cacheDurationSeconds) {
        this.cacheDurationSeconds = cacheDurationSeconds;
    }

    public String getExchange() {
        return exchange;
    }

    public void setExchange(String exchange) {
        this.exchange = exchange;
    }

    public String getCandleInterval() {
        return candleInterval;
    }

    public void setCandleInterval(String candleInterval) {
        this.candleInterval = candleInterval;
    }

    public Boolean getEntryBbLower() {
        return entryBbLower;
    }

    public void setEntryBbLower(Boolean entryBbLower) {
        this.entryBbLower = entryBbLower;
    }

    public BigDecimal getEntryRsiThreshold() {
        return entryRsiThreshold;
    }

    public void setEntryRsiThreshold(BigDecimal entryRsiThreshold) {
        this.entryRsiThreshold = entryRsiThreshold;
    }

    public Boolean getEntryMacdTurnPositive() {
        return entryMacdTurnPositive;
    }

    public void setEntryMacdTurnPositive(Boolean entryMacdTurnPositive) {
        this.entryMacdTurnPositive = entryMacdTurnPositive;
    }

    public Boolean getEntryVolumeAboveAvg() {
        return entryVolumeAboveAvg;
    }

    public void setEntryVolumeAboveAvg(Boolean entryVolumeAboveAvg) {
        this.entryVolumeAboveAvg = entryVolumeAboveAvg;
    }

    public Integer getEntryFallbackSmaPeriod() {
        return entryFallbackSmaPeriod;
    }

    public void setEntryFallbackSmaPeriod(Integer entryFallbackSmaPeriod) {
        this.entryFallbackSmaPeriod = entryFallbackSmaPeriod;
    }

    public BigDecimal getEntryFallbackAtrMultiplier() {
        return entryFallbackAtrMultiplier;
    }

    public void setEntryFallbackAtrMultiplier(BigDecimal entryFallbackAtrMultiplier) {
        this.entryFallbackAtrMultiplier = entryFallbackAtrMultiplier;
    }

    public BigDecimal getExitTakeProfitPct() {
        return exitTakeProfitPct;
    }

    public void setExitTakeProfitPct(BigDecimal exitTakeProfitPct) {
        this.exitTakeProfitPct = exitTakeProfitPct;
    }

    public BigDecimal getExitStopLossAtrMult() {
        return exitStopLossAtrMult;
    }

    public void setExitStopLossAtrMult(BigDecimal exitStopLossAtrMult) {
        this.exitStopLossAtrMult = exitStopLossAtrMult;
    }

    public Boolean getExitAllowTpExitsOnly() {
        return exitAllowTpExitsOnly;
    }

    public void setExitAllowTpExitsOnly(Boolean exitAllowTpExitsOnly) {
        this.exitAllowTpExitsOnly = exitAllowTpExitsOnly;
    }

    public Map<String, Object> getCustomJson() {
        return customJson;
    }

    public void setCustomJson(Map<String, Object> customJson) {
        this.customJson = customJson;
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
}
