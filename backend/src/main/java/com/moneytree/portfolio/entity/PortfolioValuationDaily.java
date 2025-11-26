package com.moneytree.portfolio.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "portfolio_valuation_daily", uniqueConstraints = {
    @UniqueConstraint(name = "portfolio_valuation_daily_uk", columnNames = {"portfolio_id", "date"})
})
public class PortfolioValuationDaily {

    @Id
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false, foreignKey = @ForeignKey(name = "portfolio_valuation_daily_portfolio_id_fkey"))
    private Portfolio portfolio;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "total_market_value", nullable = false, precision = 20, scale = 6)
    private BigDecimal totalMarketValue = BigDecimal.ZERO;

    @Column(name = "total_cost_basis", nullable = false, precision = 20, scale = 6)
    private BigDecimal totalCostBasis = BigDecimal.ZERO;

    @Column(name = "cash_balance", nullable = false, precision = 20, scale = 6)
    private BigDecimal cashBalance = BigDecimal.ZERO;

    @Column(name = "net_invested", nullable = false, precision = 20, scale = 6)
    private BigDecimal netInvested = BigDecimal.ZERO;

    @Column(name = "pnl_daily", nullable = false, precision = 20, scale = 6)
    private BigDecimal pnlDaily = BigDecimal.ZERO;

    @Column(name = "pnl_total", nullable = false, precision = 20, scale = 6)
    private BigDecimal pnlTotal = BigDecimal.ZERO;

    @Column(name = "return_daily_pct", precision = 12, scale = 6)
    private BigDecimal returnDailyPct;

    @Column(name = "return_cumulative_pct", precision = 12, scale = 6)
    private BigDecimal returnCumulativePct;

    @Column(name = "twr_daily_pct", precision = 12, scale = 6)
    private BigDecimal twrDailyPct;

    @Column(name = "twr_cumulative_pct", precision = 12, scale = 6)
    private BigDecimal twrCumulativePct;

    @Column(name = "mwr_cumulative_pct", precision = 12, scale = 6)
    private BigDecimal mwrCumulativePct;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Portfolio getPortfolio() { return portfolio; }
    public void setPortfolio(Portfolio portfolio) { this.portfolio = portfolio; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public BigDecimal getTotalMarketValue() { return totalMarketValue; }
    public void setTotalMarketValue(BigDecimal totalMarketValue) { this.totalMarketValue = totalMarketValue; }
    public BigDecimal getTotalCostBasis() { return totalCostBasis; }
    public void setTotalCostBasis(BigDecimal totalCostBasis) { this.totalCostBasis = totalCostBasis; }
    public BigDecimal getCashBalance() { return cashBalance; }
    public void setCashBalance(BigDecimal cashBalance) { this.cashBalance = cashBalance; }
    public BigDecimal getNetInvested() { return netInvested; }
    public void setNetInvested(BigDecimal netInvested) { this.netInvested = netInvested; }
    public BigDecimal getPnlDaily() { return pnlDaily; }
    public void setPnlDaily(BigDecimal pnlDaily) { this.pnlDaily = pnlDaily; }
    public BigDecimal getPnlTotal() { return pnlTotal; }
    public void setPnlTotal(BigDecimal pnlTotal) { this.pnlTotal = pnlTotal; }
    public BigDecimal getReturnDailyPct() { return returnDailyPct; }
    public void setReturnDailyPct(BigDecimal returnDailyPct) { this.returnDailyPct = returnDailyPct; }
    public BigDecimal getReturnCumulativePct() { return returnCumulativePct; }
    public void setReturnCumulativePct(BigDecimal returnCumulativePct) { this.returnCumulativePct = returnCumulativePct; }
    public BigDecimal getTwrDailyPct() { return twrDailyPct; }
    public void setTwrDailyPct(BigDecimal twrDailyPct) { this.twrDailyPct = twrDailyPct; }
    public BigDecimal getTwrCumulativePct() { return twrCumulativePct; }
    public void setTwrCumulativePct(BigDecimal twrCumulativePct) { this.twrCumulativePct = twrCumulativePct; }
    public BigDecimal getMwrCumulativePct() { return mwrCumulativePct; }
    public void setMwrCumulativePct(BigDecimal mwrCumulativePct) { this.mwrCumulativePct = mwrCumulativePct; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

