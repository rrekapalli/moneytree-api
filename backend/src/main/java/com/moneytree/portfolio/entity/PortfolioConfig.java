package com.moneytree.portfolio.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "portfolio_config")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class PortfolioConfig {

    @Id
    @Column(name = "portfolio_id", columnDefinition = "uuid")
    private UUID portfolioId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "portfolio_id", foreignKey = @ForeignKey(name = "portfolio_config_portfolio_id_fkey"))
    @JsonIgnore
    private Portfolio portfolio;

    // Trading Configuration
    @Column(name = "trading_mode", nullable = false, length = 20)
    private String tradingMode = "paper";

    @Column(name = "signal_check_interval", nullable = false)
    private Integer signalCheckInterval = 60;

    @Column(name = "lookback_days", nullable = false)
    private Integer lookbackDays = 60;

    // Historical Cache Configuration
    @Column(name = "historical_cache_enabled", nullable = false)
    private Boolean historicalCacheEnabled = true;

    @Column(name = "historical_cache_lookback_days", nullable = false)
    private Integer historicalCacheLookbackDays = 365;

    @Column(name = "historical_cache_exchange", nullable = false, length = 10)
    private String historicalCacheExchange = "NSE";

    @Column(name = "historical_cache_instrument_type", nullable = false, length = 10)
    private String historicalCacheInstrumentType = "EQ";

    @Column(name = "historical_cache_candle_interval", nullable = false, length = 20)
    private String historicalCacheCandleInterval = "day";

    @Column(name = "historical_cache_ttl_seconds", nullable = false)
    private Integer historicalCacheTtlSeconds = 57600;

    // Redis Configuration
    @Column(name = "redis_enabled", nullable = false)
    private Boolean redisEnabled = true;

    @Column(name = "redis_host", nullable = false, length = 255)
    private String redisHost = "localhost";

    @Column(name = "redis_port", nullable = false)
    private Integer redisPort = 6379;

    @Column(name = "redis_password", length = 255)
    private String redisPassword;

    @Column(name = "redis_db", nullable = false)
    private Integer redisDb = 0;

    @Column(name = "redis_key_prefix", nullable = false, length = 100)
    private String redisKeyPrefix = "kite_trader:";

    // Additional Trading Settings
    @Column(name = "enable_conditional_logging", nullable = false)
    private Boolean enableConditionalLogging = true;

    @Column(name = "cache_duration_seconds", nullable = false)
    private Integer cacheDurationSeconds = 60;

    @Column(name = "exchange", nullable = false, length = 10)
    private String exchange = "NSE";

    @Column(name = "candle_interval", nullable = false, length = 20)
    private String candleInterval = "day";

    // Entry Conditions
    @Column(name = "entry_bb_lower", nullable = false)
    private Boolean entryBbLower = true;

    @Column(name = "entry_rsi_threshold", nullable = false, precision = 5, scale = 2)
    private BigDecimal entryRsiThreshold = new BigDecimal("35.00");

    @Column(name = "entry_macd_turn_positive", nullable = false)
    private Boolean entryMacdTurnPositive = true;

    @Column(name = "entry_volume_above_avg", nullable = false)
    private Boolean entryVolumeAboveAvg = true;

    @Column(name = "entry_fallback_sma_period", nullable = false)
    private Integer entryFallbackSmaPeriod = 10;

    @Column(name = "entry_fallback_atr_multiplier", nullable = false, precision = 5, scale = 2)
    private BigDecimal entryFallbackAtrMultiplier = new BigDecimal("1.00");

    // Exit Conditions
    @Column(name = "exit_take_profit_pct", nullable = false, precision = 6, scale = 4)
    private BigDecimal exitTakeProfitPct = new BigDecimal("0.0300");

    @Column(name = "exit_stop_loss_atr_mult", nullable = false, precision = 6, scale = 4)
    private BigDecimal exitStopLossAtrMult = new BigDecimal("1.5000");

    @Column(name = "exit_allow_tp_exits_only", nullable = false)
    private Boolean exitAllowTpExitsOnly = true;

    // Custom JSON
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "custom_json")
    private Map<String, Object> customJson;

    // Timestamps
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    // Getters and Setters
    public UUID getPortfolioId() {
        return portfolioId;
    }

    public void setPortfolioId(UUID portfolioId) {
        this.portfolioId = portfolioId;
    }

    public Portfolio getPortfolio() {
        return portfolio;
    }

    public void setPortfolio(Portfolio portfolio) {
        this.portfolio = portfolio;
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

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
