package com.moneytree.portfolio.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "portfolio_trades")
public class PortfolioTrade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "trade_id")
    private Integer tradeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false, foreignKey = @ForeignKey(name = "portfolio_trades_portfolio_id_fkey"))
    private Portfolio portfolio;

    @Column(nullable = false, columnDefinition = "text")
    private String symbol;

    @Column(name = "entry_date", nullable = false)
    private Instant entryDate;

    @Column(name = "entry_price", nullable = false, precision = 15, scale = 4)
    private BigDecimal entryPrice;

    @Column(name = "exit_date", nullable = false)
    private Instant exitDate;

    @Column(name = "exit_price", nullable = false, precision = 15, scale = 4)
    private BigDecimal exitPrice;

    @Column(nullable = false, precision = 15, scale = 6)
    private BigDecimal quantity;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal principal;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal profit;

    @Column(name = "profit_pct", nullable = false, precision = 10, scale = 4)
    private BigDecimal profitPct;

    @Column(name = "exit_type", nullable = false, columnDefinition = "text")
    private String exitType; // TP (take profit) or SL (stop loss)

    @Column(name = "kept_shares", precision = 15, scale = 6)
    private BigDecimal keptShares = BigDecimal.ZERO;

    @Column(name = "kept_cash", precision = 15, scale = 2)
    private BigDecimal keptCash = BigDecimal.ZERO;

    @Column(name = "holding_days", nullable = false)
    private Integer holdingDays;

    @Column(name = "order_id_entry", columnDefinition = "text")
    private String orderIdEntry;

    @Column(name = "order_id_exit", columnDefinition = "text")
    private String orderIdExit;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    // Getters and setters
    public Integer getTradeId() { return tradeId; }
    public void setTradeId(Integer tradeId) { this.tradeId = tradeId; }
    public Portfolio getPortfolio() { return portfolio; }
    public void setPortfolio(Portfolio portfolio) { this.portfolio = portfolio; }
    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
    public Instant getEntryDate() { return entryDate; }
    public void setEntryDate(Instant entryDate) { this.entryDate = entryDate; }
    public BigDecimal getEntryPrice() { return entryPrice; }
    public void setEntryPrice(BigDecimal entryPrice) { this.entryPrice = entryPrice; }
    public Instant getExitDate() { return exitDate; }
    public void setExitDate(Instant exitDate) { this.exitDate = exitDate; }
    public BigDecimal getExitPrice() { return exitPrice; }
    public void setExitPrice(BigDecimal exitPrice) { this.exitPrice = exitPrice; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public BigDecimal getPrincipal() { return principal; }
    public void setPrincipal(BigDecimal principal) { this.principal = principal; }
    public BigDecimal getProfit() { return profit; }
    public void setProfit(BigDecimal profit) { this.profit = profit; }
    public BigDecimal getProfitPct() { return profitPct; }
    public void setProfitPct(BigDecimal profitPct) { this.profitPct = profitPct; }
    public String getExitType() { return exitType; }
    public void setExitType(String exitType) { this.exitType = exitType; }
    public BigDecimal getKeptShares() { return keptShares; }
    public void setKeptShares(BigDecimal keptShares) { this.keptShares = keptShares; }
    public BigDecimal getKeptCash() { return keptCash; }
    public void setKeptCash(BigDecimal keptCash) { this.keptCash = keptCash; }
    public Integer getHoldingDays() { return holdingDays; }
    public void setHoldingDays(Integer holdingDays) { this.holdingDays = holdingDays; }
    public String getOrderIdEntry() { return orderIdEntry; }
    public void setOrderIdEntry(String orderIdEntry) { this.orderIdEntry = orderIdEntry; }
    public String getOrderIdExit() { return orderIdExit; }
    public void setOrderIdExit(String orderIdExit) { this.orderIdExit = orderIdExit; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

