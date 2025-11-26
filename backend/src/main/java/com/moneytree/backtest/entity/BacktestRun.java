package com.moneytree.backtest.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "backtest_runs")
public class BacktestRun {

    @Id
    @Column(name = "run_id", columnDefinition = "uuid")
    private UUID runId;

    @Column(name = "strategy_name", nullable = false, columnDefinition = "text")
    private String strategyName;

    @Column(nullable = false, columnDefinition = "text")
    private String symbol;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "initial_capital", nullable = false, precision = 15, scale = 2)
    private BigDecimal initialCapital;

    @Column(name = "final_equity", precision = 15, scale = 2)
    private BigDecimal finalEquity;

    @Column(name = "final_cash", precision = 15, scale = 2)
    private BigDecimal finalCash;

    @Column(name = "accumulated_shares", precision = 15, scale = 6)
    private BigDecimal accumulatedShares;

    @Column(name = "total_return_pct", precision = 10, scale = 4)
    private BigDecimal totalReturnPct;

    @Column(name = "max_drawdown_pct", precision = 10, scale = 4)
    private BigDecimal maxDrawdownPct;

    @Column(name = "total_trades")
    private Integer totalTrades;

    @Column(name = "winning_trades")
    private Integer winningTrades;

    @Column(name = "losing_trades")
    private Integer losingTrades;

    @Column(name = "hit_ratio", precision = 5, scale = 4)
    private BigDecimal hitRatio;

    @Column(name = "avg_profit_per_trade", precision = 15, scale = 2)
    private BigDecimal avgProfitPerTrade;

    @Column(name = "avg_holding_days", precision = 10, scale = 2)
    private BigDecimal avgHoldingDays;

    @Column(name = "sharpe_ratio", precision = 10, scale = 4)
    private BigDecimal sharpeRatio;

    @Column(name = "sortino_ratio", precision = 10, scale = 4)
    private BigDecimal sortinoRatio;

    @Column(name = "calmar_ratio", precision = 10, scale = 4)
    private BigDecimal calmarRatio;

    @Column(precision = 10, scale = 4)
    private BigDecimal cagr;

    @Column(precision = 10, scale = 4)
    private BigDecimal irr;

    @Column(name = "total_return", precision = 15, scale = 2)
    private BigDecimal totalReturn;

    @Column(name = "max_consecutive_losses")
    private Integer maxConsecutiveLosses;

    @Column(name = "max_consecutive_wins")
    private Integer maxConsecutiveWins;

    @Column(name = "avg_win", precision = 15, scale = 2)
    private BigDecimal avgWin;

    @Column(name = "avg_loss", precision = 15, scale = 2)
    private BigDecimal avgLoss;

    @Column(name = "profit_factor", precision = 10, scale = 4)
    private BigDecimal profitFactor;

    @Column(name = "max_drawdown_value", precision = 15, scale = 2)
    private BigDecimal maxDrawdownValue;

    @Column(name = "avg_drawdown_pct", precision = 10, scale = 4)
    private BigDecimal avgDrawdownPct;

    @Column(name = "recovery_factor", precision = 10, scale = 4)
    private BigDecimal recoveryFactor;

    @Column(name = "win_rate", precision = 5, scale = 4)
    private BigDecimal winRate;

    @Column(precision = 15, scale = 2)
    private BigDecimal expectancy;

    @Column(name = "total_days")
    private Integer totalDays;

    @Column(name = "trading_days")
    private Integer tradingDays;

    @Column(name = "simulation_bars")
    private Integer simulationBars;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> parameters;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    @Column(columnDefinition = "text")
    private String notes;

    @Column(precision = 10, scale = 4)
    private BigDecimal xirr;

    // Getters and setters
    public UUID getRunId() {
        return runId;
    }

    public void setRunId(UUID runId) {
        this.runId = runId;
    }

    public String getStrategyName() {
        return strategyName;
    }

    public void setStrategyName(String strategyName) {
        this.strategyName = strategyName;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public BigDecimal getInitialCapital() {
        return initialCapital;
    }

    public void setInitialCapital(BigDecimal initialCapital) {
        this.initialCapital = initialCapital;
    }

    public BigDecimal getFinalEquity() {
        return finalEquity;
    }

    public void setFinalEquity(BigDecimal finalEquity) {
        this.finalEquity = finalEquity;
    }

    public BigDecimal getFinalCash() {
        return finalCash;
    }

    public void setFinalCash(BigDecimal finalCash) {
        this.finalCash = finalCash;
    }

    public BigDecimal getAccumulatedShares() {
        return accumulatedShares;
    }

    public void setAccumulatedShares(BigDecimal accumulatedShares) {
        this.accumulatedShares = accumulatedShares;
    }

    public BigDecimal getTotalReturnPct() {
        return totalReturnPct;
    }

    public void setTotalReturnPct(BigDecimal totalReturnPct) {
        this.totalReturnPct = totalReturnPct;
    }

    public BigDecimal getMaxDrawdownPct() {
        return maxDrawdownPct;
    }

    public void setMaxDrawdownPct(BigDecimal maxDrawdownPct) {
        this.maxDrawdownPct = maxDrawdownPct;
    }

    public Integer getTotalTrades() {
        return totalTrades;
    }

    public void setTotalTrades(Integer totalTrades) {
        this.totalTrades = totalTrades;
    }

    public Integer getWinningTrades() {
        return winningTrades;
    }

    public void setWinningTrades(Integer winningTrades) {
        this.winningTrades = winningTrades;
    }

    public Integer getLosingTrades() {
        return losingTrades;
    }

    public void setLosingTrades(Integer losingTrades) {
        this.losingTrades = losingTrades;
    }

    public BigDecimal getHitRatio() {
        return hitRatio;
    }

    public void setHitRatio(BigDecimal hitRatio) {
        this.hitRatio = hitRatio;
    }

    public BigDecimal getAvgProfitPerTrade() {
        return avgProfitPerTrade;
    }

    public void setAvgProfitPerTrade(BigDecimal avgProfitPerTrade) {
        this.avgProfitPerTrade = avgProfitPerTrade;
    }

    public BigDecimal getAvgHoldingDays() {
        return avgHoldingDays;
    }

    public void setAvgHoldingDays(BigDecimal avgHoldingDays) {
        this.avgHoldingDays = avgHoldingDays;
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

    public BigDecimal getCalmarRatio() {
        return calmarRatio;
    }

    public void setCalmarRatio(BigDecimal calmarRatio) {
        this.calmarRatio = calmarRatio;
    }

    public BigDecimal getCagr() {
        return cagr;
    }

    public void setCagr(BigDecimal cagr) {
        this.cagr = cagr;
    }

    public BigDecimal getIrr() {
        return irr;
    }

    public void setIrr(BigDecimal irr) {
        this.irr = irr;
    }

    public BigDecimal getTotalReturn() {
        return totalReturn;
    }

    public void setTotalReturn(BigDecimal totalReturn) {
        this.totalReturn = totalReturn;
    }

    public Integer getMaxConsecutiveLosses() {
        return maxConsecutiveLosses;
    }

    public void setMaxConsecutiveLosses(Integer maxConsecutiveLosses) {
        this.maxConsecutiveLosses = maxConsecutiveLosses;
    }

    public Integer getMaxConsecutiveWins() {
        return maxConsecutiveWins;
    }

    public void setMaxConsecutiveWins(Integer maxConsecutiveWins) {
        this.maxConsecutiveWins = maxConsecutiveWins;
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

    public BigDecimal getProfitFactor() {
        return profitFactor;
    }

    public void setProfitFactor(BigDecimal profitFactor) {
        this.profitFactor = profitFactor;
    }

    public BigDecimal getMaxDrawdownValue() {
        return maxDrawdownValue;
    }

    public void setMaxDrawdownValue(BigDecimal maxDrawdownValue) {
        this.maxDrawdownValue = maxDrawdownValue;
    }

    public BigDecimal getAvgDrawdownPct() {
        return avgDrawdownPct;
    }

    public void setAvgDrawdownPct(BigDecimal avgDrawdownPct) {
        this.avgDrawdownPct = avgDrawdownPct;
    }

    public BigDecimal getRecoveryFactor() {
        return recoveryFactor;
    }

    public void setRecoveryFactor(BigDecimal recoveryFactor) {
        this.recoveryFactor = recoveryFactor;
    }

    public BigDecimal getWinRate() {
        return winRate;
    }

    public void setWinRate(BigDecimal winRate) {
        this.winRate = winRate;
    }

    public BigDecimal getExpectancy() {
        return expectancy;
    }

    public void setExpectancy(BigDecimal expectancy) {
        this.expectancy = expectancy;
    }

    public Integer getTotalDays() {
        return totalDays;
    }

    public void setTotalDays(Integer totalDays) {
        this.totalDays = totalDays;
    }

    public Integer getTradingDays() {
        return tradingDays;
    }

    public void setTradingDays(Integer tradingDays) {
        this.tradingDays = tradingDays;
    }

    public Integer getSimulationBars() {
        return simulationBars;
    }

    public void setSimulationBars(Integer simulationBars) {
        this.simulationBars = simulationBars;
    }

    public Map<String, Object> getParameters() {
        return parameters;
    }

    public void setParameters(Map<String, Object> parameters) {
        this.parameters = parameters;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public BigDecimal getXirr() {
        return xirr;
    }

    public void setXirr(BigDecimal xirr) {
        this.xirr = xirr;
    }
}

