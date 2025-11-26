package com.moneytree.portfolio.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "pending_orders", uniqueConstraints = {
    @UniqueConstraint(name = "pending_orders_portfolio_id_symbol_order_type_key", columnNames = {"portfolio_id", "symbol", "order_type"})
})
public class PendingOrder {

    @Id
    @Column(name = "pending_order_id", columnDefinition = "uuid")
    private UUID pendingOrderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false, foreignKey = @ForeignKey(name = "pending_orders_portfolio_id_fkey"))
    private Portfolio portfolio;

    @Column(nullable = false, columnDefinition = "text")
    private String symbol;

    @Column(name = "order_id", nullable = false, columnDefinition = "text")
    private String orderId;

    @Column(name = "order_type", nullable = false, length = 10)
    private String orderType; // BUY or SELL

    @Column(name = "total_quantity", nullable = false)
    private Integer totalQuantity;

    @Column(name = "filled_quantity", nullable = false)
    private Integer filledQuantity = 0;

    @Column(name = "remaining_quantity", nullable = false)
    private Integer remainingQuantity;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "condition_values", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> conditionValues;

    @Column(name = "order_timestamp", nullable = false)
    private Instant orderTimestamp;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    // Getters and setters
    public UUID getPendingOrderId() { return pendingOrderId; }
    public void setPendingOrderId(UUID pendingOrderId) { this.pendingOrderId = pendingOrderId; }
    public Portfolio getPortfolio() { return portfolio; }
    public void setPortfolio(Portfolio portfolio) { this.portfolio = portfolio; }
    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
    public String getOrderType() { return orderType; }
    public void setOrderType(String orderType) { this.orderType = orderType; }
    public Integer getTotalQuantity() { return totalQuantity; }
    public void setTotalQuantity(Integer totalQuantity) { this.totalQuantity = totalQuantity; }
    public Integer getFilledQuantity() { return filledQuantity; }
    public void setFilledQuantity(Integer filledQuantity) { this.filledQuantity = filledQuantity; }
    public Integer getRemainingQuantity() { return remainingQuantity; }
    public void setRemainingQuantity(Integer remainingQuantity) { this.remainingQuantity = remainingQuantity; }
    public Map<String, Object> getConditionValues() { return conditionValues; }
    public void setConditionValues(Map<String, Object> conditionValues) { this.conditionValues = conditionValues; }
    public Instant getOrderTimestamp() { return orderTimestamp; }
    public void setOrderTimestamp(Instant orderTimestamp) { this.orderTimestamp = orderTimestamp; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}

