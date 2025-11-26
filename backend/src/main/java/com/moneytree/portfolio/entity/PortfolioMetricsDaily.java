package com.moneytree.portfolio.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "portfolio_metrics_daily", uniqueConstraints = {
    @UniqueConstraint(name = "portfolio_metrics_daily_uk", columnNames = {"portfolio_id", "date"})
})
public class PortfolioMetricsDaily {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false, foreignKey = @ForeignKey(name = "portfolio_metrics_daily_portfolio_id_fkey"))
    private Portfolio portfolio;

    @Column(nullable = false)
    private LocalDate date;

    @Column(precision = 20, scale = 8)
    private BigDecimal nav;

    @Column(name = "twr_daily_pct", precision = 12, scale = 6)
    private BigDecimal twrDailyPct;

    @Column(name = "twr_cumulative_pct", precision = 12, scale = 6)
    private BigDecimal twrCumulativePct;

    @Column(name = "mwr_cumulative_pct", precision = 12, scale = 6)
    private BigDecimal mwrCumulativePct;

    @Column(name = "irr_to_date_pct", precision = 12, scale = 6)
    private BigDecimal irrToDatePct;

    @Column(name = "irr_annualized_pct", precision = 12, scale = 6)
    private BigDecimal irrAnnualizedPct;

    @Column(name = "xirr_to_date_pct", precision = 12, scale = 6)
    private BigDecimal xirrToDatePct;

    @Column(name = "xirr_annualized_pct", precision = 12, scale = 6)
    private BigDecimal xirrAnnualizedPct;

    @Column(name = "cagr_pct", precision = 12, scale = 6)
    private BigDecimal cagrPct;

    @Column(name = "ytd_return_pct", precision = 12, scale = 6)
    private BigDecimal ytdReturnPct;

    @Column(name = "return_1m_pct", precision = 12, scale = 6)
    private BigDecimal return1mPct;

    @Column(name = "return_3m_pct", precision = 12, scale = 6)
    private BigDecimal return3mPct;

    @Column(name = "return_6m_pct", precision = 12, scale = 6)
    private BigDecimal return6mPct;

    @Column(name = "return_1y_pct", precision = 12, scale = 6)
    private BigDecimal return1yPct;

    @Column(name = "return_3y_annualized_pct", precision = 12, scale = 6)
    private BigDecimal return3yAnnualizedPct;

    @Column(name = "return_5y_annualized_pct", precision = 12, scale = 6)
    private BigDecimal return5yAnnualizedPct;

    @Column(name = "drawdown_pct", precision = 12, scale = 6)
    private BigDecimal drawdownPct;

    @Column(name = "max_drawdown_pct", precision = 12, scale = 6)
    private BigDecimal maxDrawdownPct;

    @Column(name = "volatility_30d_pct", precision = 12, scale = 6)
    private BigDecimal volatility30dPct;

    @Column(name = "volatility_90d_pct", precision = 12, scale = 6)
    private BigDecimal volatility90dPct;

    @Column(name = "downside_deviation_30d_pct", precision = 12, scale = 6)
    private BigDecimal downsideDeviation30dPct;

    @Column(name = "sharpe_30d", precision = 14, scale = 6)
    private BigDecimal sharpe30d;

    @Column(name = "sortino_30d", precision = 14, scale = 6)
    private BigDecimal sortino30d;

    @Column(name = "calmar_1y", precision = 14, scale = 6)
    private BigDecimal calmar1y;

    @Column(name = "treynor_30d", precision = 14, scale = 6)
    private BigDecimal treynor30d;

    @Column(name = "beta_30d", precision = 14, scale = 6)
    private BigDecimal beta30d;

    @Column(name = "alpha_30d", precision = 14, scale = 6)
    private BigDecimal alpha30d;

    @Column(name = "tracking_error_30d", precision = 14, scale = 6)
    private BigDecimal trackingError30d;

    @Column(name = "information_ratio_30d", precision = 14, scale = 6)
    private BigDecimal informationRatio30d;

    @Column(name = "var_95_30d", precision = 20, scale = 6)
    private BigDecimal var95_30d;

    @Column(name = "cvar_95_30d", precision = 20, scale = 6)
    private BigDecimal cvar95_30d;

    @Column(name = "upside_capture_1y", precision = 12, scale = 6)
    private BigDecimal upsideCapture1y;

    @Column(name = "downside_capture_1y", precision = 12, scale = 6)
    private BigDecimal downsideCapture1y;

    @Column(name = "active_return_30d_pct", precision = 12, scale = 6)
    private BigDecimal activeReturn30dPct;

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

    @Column(name = "total_equity", precision = 15, scale = 2)
    private BigDecimal totalEquity;

    @Column(name = "cash_balance", precision = 15, scale = 2)
    private BigDecimal cashBalance;

    @Column(name = "position_value", precision = 15, scale = 2)
    private BigDecimal positionValue;

    @Column(name = "accumulated_shares_value", precision = 15, scale = 2)
    private BigDecimal accumulatedSharesValue;

    @Column(name = "peak_equity", precision = 15, scale = 2)
    private BigDecimal peakEquity;

    @Column(name = "drawdown_value", precision = 15, scale = 2)
    private BigDecimal drawdownValue;

    @Column(name = "total_return", precision = 15, scale = 2)
    private BigDecimal totalReturn;

    @Column(name = "total_return_pct", precision = 10, scale = 4)
    private BigDecimal totalReturnPct;

    @Column(name = "max_drawdown_value", precision = 15, scale = 2)
    private BigDecimal maxDrawdownValue;

    @Column(name = "avg_drawdown_pct", precision = 10, scale = 4)
    private BigDecimal avgDrawdownPct;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    // Getters and setters - abbreviated for brevity, but all fields need getters/setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Portfolio getPortfolio() {
        return portfolio;
    }

    public void setPortfolio(Portfolio portfolio) {
        this.portfolio = portfolio;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    // Add getters/setters for all other fields following the same pattern
    public BigDecimal getNav() { return nav; }
    public void setNav(BigDecimal nav) { this.nav = nav; }
    public BigDecimal getTwrDailyPct() { return twrDailyPct; }
    public void setTwrDailyPct(BigDecimal twrDailyPct) { this.twrDailyPct = twrDailyPct; }
    public BigDecimal getTwrCumulativePct() { return twrCumulativePct; }
    public void setTwrCumulativePct(BigDecimal twrCumulativePct) { this.twrCumulativePct = twrCumulativePct; }
    public BigDecimal getMwrCumulativePct() { return mwrCumulativePct; }
    public void setMwrCumulativePct(BigDecimal mwrCumulativePct) { this.mwrCumulativePct = mwrCumulativePct; }
    public BigDecimal getIrrToDatePct() { return irrToDatePct; }
    public void setIrrToDatePct(BigDecimal irrToDatePct) { this.irrToDatePct = irrToDatePct; }
    public BigDecimal getIrrAnnualizedPct() { return irrAnnualizedPct; }
    public void setIrrAnnualizedPct(BigDecimal irrAnnualizedPct) { this.irrAnnualizedPct = irrAnnualizedPct; }
    public BigDecimal getXirrToDatePct() { return xirrToDatePct; }
    public void setXirrToDatePct(BigDecimal xirrToDatePct) { this.xirrToDatePct = xirrToDatePct; }
    public BigDecimal getXirrAnnualizedPct() { return xirrAnnualizedPct; }
    public void setXirrAnnualizedPct(BigDecimal xirrAnnualizedPct) { this.xirrAnnualizedPct = xirrAnnualizedPct; }
    public BigDecimal getCagrPct() { return cagrPct; }
    public void setCagrPct(BigDecimal cagrPct) { this.cagrPct = cagrPct; }
    public BigDecimal getYtdReturnPct() { return ytdReturnPct; }
    public void setYtdReturnPct(BigDecimal ytdReturnPct) { this.ytdReturnPct = ytdReturnPct; }
    public BigDecimal getReturn1mPct() { return return1mPct; }
    public void setReturn1mPct(BigDecimal return1mPct) { this.return1mPct = return1mPct; }
    public BigDecimal getReturn3mPct() { return return3mPct; }
    public void setReturn3mPct(BigDecimal return3mPct) { this.return3mPct = return3mPct; }
    public BigDecimal getReturn6mPct() { return return6mPct; }
    public void setReturn6mPct(BigDecimal return6mPct) { this.return6mPct = return6mPct; }
    public BigDecimal getReturn1yPct() { return return1yPct; }
    public void setReturn1yPct(BigDecimal return1yPct) { this.return1yPct = return1yPct; }
    public BigDecimal getReturn3yAnnualizedPct() { return return3yAnnualizedPct; }
    public void setReturn3yAnnualizedPct(BigDecimal return3yAnnualizedPct) { this.return3yAnnualizedPct = return3yAnnualizedPct; }
    public BigDecimal getReturn5yAnnualizedPct() { return return5yAnnualizedPct; }
    public void setReturn5yAnnualizedPct(BigDecimal return5yAnnualizedPct) { this.return5yAnnualizedPct = return5yAnnualizedPct; }
    public BigDecimal getDrawdownPct() { return drawdownPct; }
    public void setDrawdownPct(BigDecimal drawdownPct) { this.drawdownPct = drawdownPct; }
    public BigDecimal getMaxDrawdownPct() { return maxDrawdownPct; }
    public void setMaxDrawdownPct(BigDecimal maxDrawdownPct) { this.maxDrawdownPct = maxDrawdownPct; }
    public BigDecimal getVolatility30dPct() { return volatility30dPct; }
    public void setVolatility30dPct(BigDecimal volatility30dPct) { this.volatility30dPct = volatility30dPct; }
    public BigDecimal getVolatility90dPct() { return volatility90dPct; }
    public void setVolatility90dPct(BigDecimal volatility90dPct) { this.volatility90dPct = volatility90dPct; }
    public BigDecimal getDownsideDeviation30dPct() { return downsideDeviation30dPct; }
    public void setDownsideDeviation30dPct(BigDecimal downsideDeviation30dPct) { this.downsideDeviation30dPct = downsideDeviation30dPct; }
    public BigDecimal getSharpe30d() { return sharpe30d; }
    public void setSharpe30d(BigDecimal sharpe30d) { this.sharpe30d = sharpe30d; }
    public BigDecimal getSortino30d() { return sortino30d; }
    public void setSortino30d(BigDecimal sortino30d) { this.sortino30d = sortino30d; }
    public BigDecimal getCalmar1y() { return calmar1y; }
    public void setCalmar1y(BigDecimal calmar1y) { this.calmar1y = calmar1y; }
    public BigDecimal getTreynor30d() { return treynor30d; }
    public void setTreynor30d(BigDecimal treynor30d) { this.treynor30d = treynor30d; }
    public BigDecimal getBeta30d() { return beta30d; }
    public void setBeta30d(BigDecimal beta30d) { this.beta30d = beta30d; }
    public BigDecimal getAlpha30d() { return alpha30d; }
    public void setAlpha30d(BigDecimal alpha30d) { this.alpha30d = alpha30d; }
    public BigDecimal getTrackingError30d() { return trackingError30d; }
    public void setTrackingError30d(BigDecimal trackingError30d) { this.trackingError30d = trackingError30d; }
    public BigDecimal getInformationRatio30d() { return informationRatio30d; }
    public void setInformationRatio30d(BigDecimal informationRatio30d) { this.informationRatio30d = informationRatio30d; }
    public BigDecimal getVar95_30d() { return var95_30d; }
    public void setVar95_30d(BigDecimal var95_30d) { this.var95_30d = var95_30d; }
    public BigDecimal getCvar95_30d() { return cvar95_30d; }
    public void setCvar95_30d(BigDecimal cvar95_30d) { this.cvar95_30d = cvar95_30d; }
    public BigDecimal getUpsideCapture1y() { return upsideCapture1y; }
    public void setUpsideCapture1y(BigDecimal upsideCapture1y) { this.upsideCapture1y = upsideCapture1y; }
    public BigDecimal getDownsideCapture1y() { return downsideCapture1y; }
    public void setDownsideCapture1y(BigDecimal downsideCapture1y) { this.downsideCapture1y = downsideCapture1y; }
    public BigDecimal getActiveReturn30dPct() { return activeReturn30dPct; }
    public void setActiveReturn30dPct(BigDecimal activeReturn30dPct) { this.activeReturn30dPct = activeReturn30dPct; }
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
    public BigDecimal getTotalEquity() { return totalEquity; }
    public void setTotalEquity(BigDecimal totalEquity) { this.totalEquity = totalEquity; }
    public BigDecimal getCashBalance() { return cashBalance; }
    public void setCashBalance(BigDecimal cashBalance) { this.cashBalance = cashBalance; }
    public BigDecimal getPositionValue() { return positionValue; }
    public void setPositionValue(BigDecimal positionValue) { this.positionValue = positionValue; }
    public BigDecimal getAccumulatedSharesValue() { return accumulatedSharesValue; }
    public void setAccumulatedSharesValue(BigDecimal accumulatedSharesValue) { this.accumulatedSharesValue = accumulatedSharesValue; }
    public BigDecimal getPeakEquity() { return peakEquity; }
    public void setPeakEquity(BigDecimal peakEquity) { this.peakEquity = peakEquity; }
    public BigDecimal getDrawdownValue() { return drawdownValue; }
    public void setDrawdownValue(BigDecimal drawdownValue) { this.drawdownValue = drawdownValue; }
    public BigDecimal getTotalReturn() { return totalReturn; }
    public void setTotalReturn(BigDecimal totalReturn) { this.totalReturn = totalReturn; }
    public BigDecimal getTotalReturnPct() { return totalReturnPct; }
    public void setTotalReturnPct(BigDecimal totalReturnPct) { this.totalReturnPct = totalReturnPct; }
    public BigDecimal getMaxDrawdownValue() { return maxDrawdownValue; }
    public void setMaxDrawdownValue(BigDecimal maxDrawdownValue) { this.maxDrawdownValue = maxDrawdownValue; }
    public BigDecimal getAvgDrawdownPct() { return avgDrawdownPct; }
    public void setAvgDrawdownPct(BigDecimal avgDrawdownPct) { this.avgDrawdownPct = avgDrawdownPct; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

