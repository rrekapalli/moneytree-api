package com.moneytree.strategy.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Entity representing strategy performance metrics tracked over time.
 * Stores comprehensive performance indicators including returns, risk metrics,
 * and trade statistics.
 */
@Entity
@Table(name = "strategy_metrics", uniqueConstraints = {
    @UniqueConstraint(name = "strategy_metrics_strategy_date_uk", columnNames = {"strategy_id", "metric_date"})
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class StrategyMetrics {

    @Id
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "strategy_id", nullable = false, foreignKey = @ForeignKey(name = "strategy_metrics_strategy_id_fkey"))
    @JsonIgnore
    private Strategy strategy;

    @Column(name = "metric_date", nullable = false)
    private LocalDate metricDate;

    @Column(name = "total_return", precision = 10, scale = 4)
    private BigDecimal totalReturn;

    @Column(name = "cagr", precision = 10, scale = 4)
    private BigDecimal cagr;

    @Column(name = "sharpe_ratio", precision = 10, scale = 4)
    private BigDecimal sharpeRatio;

    @Column(name = "sortino_ratio", precision = 10, scale = 4)
    private BigDecimal sortinoRatio;

    @Column(name = "max_drawdown", precision = 10, scale = 4)
    private BigDecimal maxDrawdown;

    @Column(name = "win_rate", precision = 5, scale = 4)
    private BigDecimal winRate;

    @Column(name = "total_trades")
    private Integer totalTrades;

    @Column(name = "profit_factor", precision = 10, scale = 4)
    private BigDecimal profitFactor;

    @Column(name = "avg_win", precision = 15, scale = 2)
    private BigDecimal avgWin;

    @Column(name = "avg_loss", precision = 15, scale = 2)
    private BigDecimal avgLoss;

    @Column(name = "avg_holding_days", precision = 10, scale = 2)
    private BigDecimal avgHoldingDays;

    @Column(name = "max_consecutive_wins")
    private Integer maxConsecutiveWins;

    @Column(name = "max_consecutive_losses")
    private Integer maxConsecutiveLosses;

    @Column(name = "expectancy", precision = 15, scale = 2)
    private BigDecimal expectancy;

    @Column(name = "calmar_ratio", precision = 10, scale = 4)
    private BigDecimal calmarRatio;

    @Column(name = "recovery_factor", precision = 10, scale = 4)
    private BigDecimal recoveryFactor;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

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

    public LocalDate getMetricDate() {
        return metricDate;
    }

    public void setMetricDate(LocalDate metricDate) {
        this.metricDate = metricDate;
    }

    public BigDecimal getTotalReturn() {
        return totalReturn;
    }

    public void setTotalReturn(BigDecimal totalReturn) {
        this.totalReturn = totalReturn;
    }

    public BigDecimal getCagr() {
        return cagr;
    }

    public void setCagr(BigDecimal cagr) {
        this.cagr = cagr;
    }

    public BigDecimal getSharpeRatio() {
        return sharpeRatio;
    }

    public void setSharpeRatio(BigDecimal sharpeRatio) {
        this.sharpeRatio = sharpeRatio;
    }

    public BigDecimal getSortinoRatio() {
        return sortinoRatio;
    }

    public void setSortinoRatio(BigDecimal sortinoRatio) {
        this.sortinoRatio = sortinoRatio;
    }

    public BigDecimal getMaxDrawdown() {
        return maxDrawdown;
    }

    public void setMaxDrawdown(BigDecimal maxDrawdown) {
        this.maxDrawdown = maxDrawdown;
    }

    public BigDecimal getWinRate() {
        return winRate;
    }

    public void setWinRate(BigDecimal winRate) {
        this.winRate = winRate;
    }

    public Integer getTotalTrades() {
        return totalTrades;
    }

    public void setTotalTrades(Integer totalTrades) {
        this.totalTrades = totalTrades;
    }

    public BigDecimal getProfitFactor() {
        return profitFactor;
    }

    public void setProfitFactor(BigDecimal profitFactor) {
        this.profitFactor = profitFactor;
    }

    public BigDecimal getAvgWin() {
        return avgWin;
    }

    public void setAvgWin(BigDecimal avgWin) {
        this.avgWin = avgWin;
    }

    public BigDecimal getAvgLoss() {
        return avgLoss;
    }

    public void setAvgLoss(BigDecimal avgLoss) {
        this.avgLoss = avgLoss;
    }

    public BigDecimal getAvgHoldingDays() {
        return avgHoldingDays;
    }

    public void setAvgHoldingDays(BigDecimal avgHoldingDays) {
        this.avgHoldingDays = avgHoldingDays;
    }

    public Integer getMaxConsecutiveWins() {
        return maxConsecutiveWins;
    }

    public void setMaxConsecutiveWins(Integer maxConsecutiveWins) {
        this.maxConsecutiveWins = maxConsecutiveWins;
    }

    public Integer getMaxConsecutiveLosses() {
        return maxConsecutiveLosses;
    }

    public void setMaxConsecutiveLosses(Integer maxConsecutiveLosses) {
        this.maxConsecutiveLosses = maxConsecutiveLosses;
    }

    public BigDecimal getExpectancy() {
        return expectancy;
    }

    public void setExpectancy(BigDecimal expectancy) {
        this.expectancy = expectancy;
    }

    public BigDecimal getCalmarRatio() {
        return calmarRatio;
    }

    public void setCalmarRatio(BigDecimal calmarRatio) {
        this.calmarRatio = calmarRatio;
    }

    public BigDecimal getRecoveryFactor() {
        return recoveryFactor;
    }

    public void setRecoveryFactor(BigDecimal recoveryFactor) {
        this.recoveryFactor = recoveryFactor;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
