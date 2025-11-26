package com.moneytree.backtest.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "backtest_trades")
public class BacktestTrade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "trade_id")
    private Integer tradeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "run_id", nullable = false, foreignKey = @ForeignKey(name = "backtest_trades_run_id_fkey"))
    private BacktestRun run;

    @Column(name = "trade_date", nullable = false)
    private LocalDate tradeDate;

    @Column(name = "trade_type", nullable = false, columnDefinition = "text")
    private String tradeType;

    @Column(name = "entry_price", precision = 15, scale = 4)
    private BigDecimal entryPrice;

    @Column(name = "exit_price", precision = 15, scale = 4)
    private BigDecimal exitPrice;

    @Column(precision = 15, scale = 6)
    private BigDecimal shares;

    @Column(precision = 15, scale = 2)
    private BigDecimal principal;

    @Column(precision = 15, scale = 2)
    private BigDecimal profit;

    @Column(name = "profit_pct", precision = 10, scale = 4)
    private BigDecimal profitPct;

    @Column(name = "kept_shares", precision = 15, scale = 6)
    private BigDecimal keptShares;

    @Column(name = "holding_days")
    private Integer holdingDays;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    // Getters and setters
    public Integer getTradeId() {
        return tradeId;
    }

    public void setTradeId(Integer tradeId) {
        this.tradeId = tradeId;
    }

    public BacktestRun getRun() {
        return run;
    }

    public void setRun(BacktestRun run) {
        this.run = run;
    }

    public LocalDate getTradeDate() {
        return tradeDate;
    }

    public void setTradeDate(LocalDate tradeDate) {
        this.tradeDate = tradeDate;
    }

    public String getTradeType() {
        return tradeType;
    }

    public void setTradeType(String tradeType) {
        this.tradeType = tradeType;
    }

    public BigDecimal getEntryPrice() {
        return entryPrice;
    }

    public void setEntryPrice(BigDecimal entryPrice) {
        this.entryPrice = entryPrice;
    }

    public BigDecimal getExitPrice() {
        return exitPrice;
    }

    public void setExitPrice(BigDecimal exitPrice) {
        this.exitPrice = exitPrice;
    }

    public BigDecimal getShares() {
        return shares;
    }

    public void setShares(BigDecimal shares) {
        this.shares = shares;
    }

    public BigDecimal getPrincipal() {
        return principal;
    }

    public void setPrincipal(BigDecimal principal) {
        this.principal = principal;
    }

    public BigDecimal getProfit() {
        return profit;
    }

    public void setProfit(BigDecimal profit) {
        this.profit = profit;
    }

    public BigDecimal getProfitPct() {
        return profitPct;
    }

    public void setProfitPct(BigDecimal profitPct) {
        this.profitPct = profitPct;
    }

    public BigDecimal getKeptShares() {
        return keptShares;
    }

    public void setKeptShares(BigDecimal keptShares) {
        this.keptShares = keptShares;
    }

    public Integer getHoldingDays() {
        return holdingDays;
    }

    public void setHoldingDays(Integer holdingDays) {
        this.holdingDays = holdingDays;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

