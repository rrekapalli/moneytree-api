package com.moneytree.portfolio.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "portfolio_stock_metrics_daily", uniqueConstraints = {
    @UniqueConstraint(name = "portfolio_stock_metrics_daily_portfolio_id_symbol_date_key", columnNames = {"portfolio_id", "symbol", "date"})
})
public class PortfolioStockMetricsDaily {

    @Id
    @Column(name = "metric_id", columnDefinition = "uuid")
    private UUID metricId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false, foreignKey = @ForeignKey(name = "portfolio_stock_metrics_daily_portfolio_id_fkey"))
    private Portfolio portfolio;

    @Column(nullable = false, columnDefinition = "text")
    private String symbol;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal equity;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal cash;

    @Column(name = "position_value", nullable = false, precision = 15, scale = 2)
    private BigDecimal positionValue;

    @Column(name = "accumulated_shares", nullable = false, precision = 15, scale = 6)
    private BigDecimal accumulatedShares;

    @Column(name = "accumulated_shares_value", nullable = false, precision = 15, scale = 2)
    private BigDecimal accumulatedSharesValue;

    @Column(name = "peak_equity", precision = 15, scale = 2)
    private BigDecimal peakEquity;

    @Column(name = "drawdown_value", precision = 15, scale = 2)
    private BigDecimal drawdownValue;

    @Column(name = "drawdown_pct", precision = 10, scale = 4)
    private BigDecimal drawdownPct;

    @Column(name = "total_return", precision = 15, scale = 2)
    private BigDecimal totalReturn;

    @Column(name = "total_return_pct", precision = 10, scale = 4)
    private BigDecimal totalReturnPct;

    @Column(precision = 10, scale = 4)
    private BigDecimal cagr;

    @Column(precision = 10, scale = 4)
    private BigDecimal irr;

    @Column(name = "sharpe_ratio", precision = 10, scale = 4)
    private BigDecimal sharpeRatio;

    @Column(name = "sortino_ratio", precision = 10, scale = 4)
    private BigDecimal sortinoRatio;

    @Column(name = "calmar_ratio", precision = 10, scale = 4)
    private BigDecimal calmarRatio;

    @Column(name = "max_drawdown_pct", precision = 10, scale = 4)
    private BigDecimal maxDrawdownPct;

    @Column(name = "max_drawdown_value", precision = 15, scale = 2)
    private BigDecimal maxDrawdownValue;

    @Column(name = "avg_drawdown_pct", precision = 10, scale = 4)
    private BigDecimal avgDrawdownPct;

    @Column(name = "total_trades")
    private Integer totalTrades;

    @Column(name = "winning_trades")
    private Integer winningTrades;

    @Column(name = "losing_trades")
    private Integer losingTrades;

    @Column(name = "win_rate", precision = 5, scale = 4)
    private BigDecimal winRate;

    @Column(name = "avg_win", precision = 15, scale = 2)
    private BigDecimal avgWin;

    @Column(name = "avg_loss", precision = 15, scale = 2)
    private BigDecimal avgLoss;

    @Column(name = "profit_factor", precision = 10, scale = 4)
    private BigDecimal profitFactor;

    @Column(precision = 15, scale = 2)
    private BigDecimal expectancy;

    @Column(name = "max_consecutive_wins")
    private Integer maxConsecutiveWins;

    @Column(name = "max_consecutive_losses")
    private Integer maxConsecutiveLosses;

    @Column(name = "avg_holding_days", precision = 10, scale = 2)
    private BigDecimal avgHoldingDays;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    // Getters and setters
    public UUID getMetricId() { return metricId; }
    public void setMetricId(UUID metricId) { this.metricId = metricId; }
    public Portfolio getPortfolio() { return portfolio; }
    public void setPortfolio(Portfolio portfolio) { this.portfolio = portfolio; }
    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public BigDecimal getEquity() { return equity; }
    public void setEquity(BigDecimal equity) { this.equity = equity; }
    public BigDecimal getCash() { return cash; }
    public void setCash(BigDecimal cash) { this.cash = cash; }
    public BigDecimal getPositionValue() { return positionValue; }
    public void setPositionValue(BigDecimal positionValue) { this.positionValue = positionValue; }
    public BigDecimal getAccumulatedShares() { return accumulatedShares; }
    public void setAccumulatedShares(BigDecimal accumulatedShares) { this.accumulatedShares = accumulatedShares; }
    public BigDecimal getAccumulatedSharesValue() { return accumulatedSharesValue; }
    public void setAccumulatedSharesValue(BigDecimal accumulatedSharesValue) { this.accumulatedSharesValue = accumulatedSharesValue; }
    public BigDecimal getPeakEquity() { return peakEquity; }
    public void setPeakEquity(BigDecimal peakEquity) { this.peakEquity = peakEquity; }
    public BigDecimal getDrawdownValue() { return drawdownValue; }
    public void setDrawdownValue(BigDecimal drawdownValue) { this.drawdownValue = drawdownValue; }
    public BigDecimal getDrawdownPct() { return drawdownPct; }
    public void setDrawdownPct(BigDecimal drawdownPct) { this.drawdownPct = drawdownPct; }
    public BigDecimal getTotalReturn() { return totalReturn; }
    public void setTotalReturn(BigDecimal totalReturn) { this.totalReturn = totalReturn; }
    public BigDecimal getTotalReturnPct() { return totalReturnPct; }
    public void setTotalReturnPct(BigDecimal totalReturnPct) { this.totalReturnPct = totalReturnPct; }
    public BigDecimal getCagr() { return cagr; }
    public void setCagr(BigDecimal cagr) { this.cagr = cagr; }
    public BigDecimal getIrr() { return irr; }
    public void setIrr(BigDecimal irr) { this.irr = irr; }
    public BigDecimal getSharpeRatio() { return sharpeRatio; }
    public void setSharpeRatio(BigDecimal sharpeRatio) { this.sharpeRatio = sharpeRatio; }
    public BigDecimal getSortinoRatio() { return sortinoRatio; }
    public void setSortinoRatio(BigDecimal sortinoRatio) { this.sortinoRatio = sortinoRatio; }
    public BigDecimal getCalmarRatio() { return calmarRatio; }
    public void setCalmarRatio(BigDecimal calmarRatio) { this.calmarRatio = calmarRatio; }
    public BigDecimal getMaxDrawdownPct() { return maxDrawdownPct; }
    public void setMaxDrawdownPct(BigDecimal maxDrawdownPct) { this.maxDrawdownPct = maxDrawdownPct; }
    public BigDecimal getMaxDrawdownValue() { return maxDrawdownValue; }
    public void setMaxDrawdownValue(BigDecimal maxDrawdownValue) { this.maxDrawdownValue = maxDrawdownValue; }
    public BigDecimal getAvgDrawdownPct() { return avgDrawdownPct; }
    public void setAvgDrawdownPct(BigDecimal avgDrawdownPct) { this.avgDrawdownPct = avgDrawdownPct; }
    public Integer getTotalTrades() { return totalTrades; }
    public void setTotalTrades(Integer totalTrades) { this.totalTrades = totalTrades; }
    public Integer getWinningTrades() { return winningTrades; }
    public void setWinningTrades(Integer winningTrades) { this.winningTrades = winningTrades; }
    public Integer getLosingTrades() { return losingTrades; }
    public void setLosingTrades(Integer losingTrades) { this.losingTrades = losingTrades; }
    public BigDecimal getWinRate() { return winRate; }
    public void setWinRate(BigDecimal winRate) { this.winRate = winRate; }
    public BigDecimal getAvgWin() { return avgWin; }
    public void setAvgWin(BigDecimal avgWin) { this.avgWin = avgWin; }
    public BigDecimal getAvgLoss() { return avgLoss; }
    public void setAvgLoss(BigDecimal avgLoss) { this.avgLoss = avgLoss; }
    public BigDecimal getProfitFactor() { return profitFactor; }
    public void setProfitFactor(BigDecimal profitFactor) { this.profitFactor = profitFactor; }
    public BigDecimal getExpectancy() { return expectancy; }
    public void setExpectancy(BigDecimal expectancy) { this.expectancy = expectancy; }
    public Integer getMaxConsecutiveWins() { return maxConsecutiveWins; }
    public void setMaxConsecutiveWins(Integer maxConsecutiveWins) { this.maxConsecutiveWins = maxConsecutiveWins; }
    public Integer getMaxConsecutiveLosses() { return maxConsecutiveLosses; }
    public void setMaxConsecutiveLosses(Integer maxConsecutiveLosses) { this.maxConsecutiveLosses = maxConsecutiveLosses; }
    public BigDecimal getAvgHoldingDays() { return avgHoldingDays; }
    public void setAvgHoldingDays(BigDecimal avgHoldingDays) { this.avgHoldingDays = avgHoldingDays; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

