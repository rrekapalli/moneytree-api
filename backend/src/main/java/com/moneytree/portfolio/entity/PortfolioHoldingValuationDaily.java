package com.moneytree.portfolio.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "portfolio_holding_valuation_daily", uniqueConstraints = {
    @UniqueConstraint(name = "portfolio_holding_valuation_daily_uk", columnNames = {"portfolio_id", "symbol", "date"})
})
public class PortfolioHoldingValuationDaily {

    @Id
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false, foreignKey = @ForeignKey(name = "portfolio_holding_valuation_daily_portfolio_id_fkey"))
    private Portfolio portfolio;

    @Column(nullable = false, columnDefinition = "text")
    private String symbol;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, precision = 20, scale = 6)
    private BigDecimal quantity = BigDecimal.ZERO;

    @Column(name = "market_price", nullable = false, precision = 20, scale = 6)
    private BigDecimal marketPrice = BigDecimal.ZERO;

    @Column(name = "market_value", nullable = false, precision = 20, scale = 6)
    private BigDecimal marketValue = BigDecimal.ZERO;

    @Column(name = "cost_basis", nullable = false, precision = 20, scale = 6)
    private BigDecimal costBasis = BigDecimal.ZERO;

    @Column(name = "pnl_daily", nullable = false, precision = 20, scale = 6)
    private BigDecimal pnlDaily = BigDecimal.ZERO;

    @Column(name = "pnl_total", nullable = false, precision = 20, scale = 6)
    private BigDecimal pnlTotal = BigDecimal.ZERO;

    @Column(name = "weight_pct", precision = 10, scale = 6)
    private BigDecimal weightPct;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    // Getters and setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Portfolio getPortfolio() {
        return portfolio;
    }

    public void setPortfolio(Portfolio portfolio) {
        this.portfolio = portfolio;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getMarketPrice() {
        return marketPrice;
    }

    public void setMarketPrice(BigDecimal marketPrice) {
        this.marketPrice = marketPrice;
    }

    public BigDecimal getMarketValue() {
        return marketValue;
    }

    public void setMarketValue(BigDecimal marketValue) {
        this.marketValue = marketValue;
    }

    public BigDecimal getCostBasis() {
        return costBasis;
    }

    public void setCostBasis(BigDecimal costBasis) {
        this.costBasis = costBasis;
    }

    public BigDecimal getPnlDaily() {
        return pnlDaily;
    }

    public void setPnlDaily(BigDecimal pnlDaily) {
        this.pnlDaily = pnlDaily;
    }

    public BigDecimal getPnlTotal() {
        return pnlTotal;
    }

    public void setPnlTotal(BigDecimal pnlTotal) {
        this.pnlTotal = pnlTotal;
    }

    public BigDecimal getWeightPct() {
        return weightPct;
    }

    public void setWeightPct(BigDecimal weightPct) {
        this.weightPct = weightPct;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

