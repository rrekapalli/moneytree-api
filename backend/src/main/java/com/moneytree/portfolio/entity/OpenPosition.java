package com.moneytree.portfolio.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "open_positions", uniqueConstraints = {
    @UniqueConstraint(name = "open_positions_portfolio_id_symbol_key", columnNames = {"portfolio_id", "symbol"})
})
public class OpenPosition {

    @Id
    @Column(name = "position_id", columnDefinition = "uuid")
    private UUID positionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false, foreignKey = @ForeignKey(name = "open_positions_portfolio_id_fkey"))
    private Portfolio portfolio;

    @Column(nullable = false, columnDefinition = "text")
    private String symbol;

    @Column(name = "entry_date", nullable = false)
    private Instant entryDate;

    @Column(name = "entry_price", nullable = false, precision = 15, scale = 4)
    private BigDecimal entryPrice;

    @Column(nullable = false, precision = 15, scale = 6)
    private BigDecimal quantity;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal principal;

    @Column(name = "take_profit", nullable = false, precision = 15, scale = 4)
    private BigDecimal takeProfit;

    @Column(name = "stop_loss", nullable = false, precision = 15, scale = 4)
    private BigDecimal stopLoss;

    @Column(name = "order_id", columnDefinition = "text")
    private String orderId;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    // Getters and setters
    public UUID getPositionId() { return positionId; }
    public void setPositionId(UUID positionId) { this.positionId = positionId; }
    public Portfolio getPortfolio() { return portfolio; }
    public void setPortfolio(Portfolio portfolio) { this.portfolio = portfolio; }
    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
    public Instant getEntryDate() { return entryDate; }
    public void setEntryDate(Instant entryDate) { this.entryDate = entryDate; }
    public BigDecimal getEntryPrice() { return entryPrice; }
    public void setEntryPrice(BigDecimal entryPrice) { this.entryPrice = entryPrice; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public BigDecimal getPrincipal() { return principal; }
    public void setPrincipal(BigDecimal principal) { this.principal = principal; }
    public BigDecimal getTakeProfit() { return takeProfit; }
    public void setTakeProfit(BigDecimal takeProfit) { this.takeProfit = takeProfit; }
    public BigDecimal getStopLoss() { return stopLoss; }
    public void setStopLoss(BigDecimal stopLoss) { this.stopLoss = stopLoss; }
    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}

