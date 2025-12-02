package com.moneytree.portfolio.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Immutable;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

/**
 * Entity representing the portfolio_holdings_summary database view.
 * This view combines open positions, latest stock metrics, and realized trade stats
 * to provide a comprehensive summary of holdings per symbol.
 */
@Entity
@Immutable
@Table(name = "portfolio_holdings_summary")
@IdClass(PortfolioHoldingSummary.PortfolioHoldingSummaryId.class)
public class PortfolioHoldingSummary {

    @Id
    @Column(name = "portfolio_id")
    private UUID portfolioId;

    @Id
    @Column(name = "symbol", nullable = false)
    private String symbol;

    @Column(name = "entry_date")
    private LocalDateTime entryDate;

    @Column(name = "entry_price", precision = 20, scale = 6)
    private BigDecimal entryPrice;

    @Column(name = "open_quantity", precision = 20, scale = 6)
    private BigDecimal openQuantity;

    @Column(name = "open_principal", precision = 20, scale = 6)
    private BigDecimal openPrincipal;

    @Column(name = "take_profit", precision = 20, scale = 6)
    private BigDecimal takeProfit;

    @Column(name = "stop_loss", precision = 20, scale = 6)
    private BigDecimal stopLoss;

    @Column(name = "accumulated_shares", precision = 20, scale = 6)
    private BigDecimal accumulatedShares;

    @Column(name = "accumulated_shares_value", precision = 20, scale = 6)
    private BigDecimal accumulatedSharesValue;

    @Column(name = "last_position_value", precision = 20, scale = 6)
    private BigDecimal lastPositionValue;

    @Column(name = "last_allocated_cash", precision = 20, scale = 6)
    private BigDecimal lastAllocatedCash;

    @Column(name = "last_equity", precision = 20, scale = 6)
    private BigDecimal lastEquity;

    @Column(name = "realized_profit", precision = 20, scale = 6)
    private BigDecimal realizedProfit;

    @Column(name = "total_trades")
    private Long totalTrades;

    @Column(name = "winning_trades")
    private Long winningTrades;

    @Column(name = "losing_trades")
    private Long losingTrades;

    @Column(name = "total_kept_shares", precision = 20, scale = 6)
    private BigDecimal totalKeptShares;

    @Column(name = "total_kept_cash", precision = 20, scale = 6)
    private BigDecimal totalKeptCash;

    @Column(name = "total_principal_deployed", precision = 20, scale = 6)
    private BigDecimal totalPrincipalDeployed;

    // Getters and setters
    public UUID getPortfolioId() {
        return portfolioId;
    }

    public void setPortfolioId(UUID portfolioId) {
        this.portfolioId = portfolioId;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public LocalDateTime getEntryDate() {
        return entryDate;
    }

    public void setEntryDate(LocalDateTime entryDate) {
        this.entryDate = entryDate;
    }

    public BigDecimal getEntryPrice() {
        return entryPrice;
    }

    public void setEntryPrice(BigDecimal entryPrice) {
        this.entryPrice = entryPrice;
    }

    public BigDecimal getOpenQuantity() {
        return openQuantity;
    }

    public void setOpenQuantity(BigDecimal openQuantity) {
        this.openQuantity = openQuantity;
    }

    public BigDecimal getOpenPrincipal() {
        return openPrincipal;
    }

    public void setOpenPrincipal(BigDecimal openPrincipal) {
        this.openPrincipal = openPrincipal;
    }

    public BigDecimal getTakeProfit() {
        return takeProfit;
    }

    public void setTakeProfit(BigDecimal takeProfit) {
        this.takeProfit = takeProfit;
    }

    public BigDecimal getStopLoss() {
        return stopLoss;
    }

    public void setStopLoss(BigDecimal stopLoss) {
        this.stopLoss = stopLoss;
    }

    public BigDecimal getAccumulatedShares() {
        return accumulatedShares;
    }

    public void setAccumulatedShares(BigDecimal accumulatedShares) {
        this.accumulatedShares = accumulatedShares;
    }

    public BigDecimal getAccumulatedSharesValue() {
        return accumulatedSharesValue;
    }

    public void setAccumulatedSharesValue(BigDecimal accumulatedSharesValue) {
        this.accumulatedSharesValue = accumulatedSharesValue;
    }

    public BigDecimal getLastPositionValue() {
        return lastPositionValue;
    }

    public void setLastPositionValue(BigDecimal lastPositionValue) {
        this.lastPositionValue = lastPositionValue;
    }

    public BigDecimal getLastAllocatedCash() {
        return lastAllocatedCash;
    }

    public void setLastAllocatedCash(BigDecimal lastAllocatedCash) {
        this.lastAllocatedCash = lastAllocatedCash;
    }

    public BigDecimal getLastEquity() {
        return lastEquity;
    }

    public void setLastEquity(BigDecimal lastEquity) {
        this.lastEquity = lastEquity;
    }

    public BigDecimal getRealizedProfit() {
        return realizedProfit;
    }

    public void setRealizedProfit(BigDecimal realizedProfit) {
        this.realizedProfit = realizedProfit;
    }

    public Long getTotalTrades() {
        return totalTrades;
    }

    public void setTotalTrades(Long totalTrades) {
        this.totalTrades = totalTrades;
    }

    public Long getWinningTrades() {
        return winningTrades;
    }

    public void setWinningTrades(Long winningTrades) {
        this.winningTrades = winningTrades;
    }

    public Long getLosingTrades() {
        return losingTrades;
    }

    public void setLosingTrades(Long losingTrades) {
        this.losingTrades = losingTrades;
    }

    public BigDecimal getTotalKeptShares() {
        return totalKeptShares;
    }

    public void setTotalKeptShares(BigDecimal totalKeptShares) {
        this.totalKeptShares = totalKeptShares;
    }

    public BigDecimal getTotalKeptCash() {
        return totalKeptCash;
    }

    public void setTotalKeptCash(BigDecimal totalKeptCash) {
        this.totalKeptCash = totalKeptCash;
    }

    public BigDecimal getTotalPrincipalDeployed() {
        return totalPrincipalDeployed;
    }

    public void setTotalPrincipalDeployed(BigDecimal totalPrincipalDeployed) {
        this.totalPrincipalDeployed = totalPrincipalDeployed;
    }

    /**
     * Composite primary key class for PortfolioHoldingSummary
     */
    public static class PortfolioHoldingSummaryId implements Serializable {
        private UUID portfolioId;
        private String symbol;

        public PortfolioHoldingSummaryId() {
        }

        public PortfolioHoldingSummaryId(UUID portfolioId, String symbol) {
            this.portfolioId = portfolioId;
            this.symbol = symbol;
        }

        public UUID getPortfolioId() {
            return portfolioId;
        }

        public void setPortfolioId(UUID portfolioId) {
            this.portfolioId = portfolioId;
        }

        public String getSymbol() {
            return symbol;
        }

        public void setSymbol(String symbol) {
            this.symbol = symbol;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            PortfolioHoldingSummaryId that = (PortfolioHoldingSummaryId) o;
            return Objects.equals(portfolioId, that.portfolioId) && Objects.equals(symbol, that.symbol);
        }

        @Override
        public int hashCode() {
            return Objects.hash(portfolioId, symbol);
        }
    }
}
