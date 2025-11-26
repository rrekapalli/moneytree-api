package com.moneytree.signal.entity;

import com.moneytree.portfolio.entity.Portfolio;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

@Entity
@Table(name = "signals")
public class Signal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "signal_id")
    private Integer signalId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false, foreignKey = @ForeignKey(name = "signals_portfolio_id_fkey"))
    private Portfolio portfolio;

    @Column(nullable = false, columnDefinition = "text")
    private String symbol;

    @Column(nullable = false)
    private Instant timestamp;

    @Column(name = "signal_type", nullable = false, columnDefinition = "text")
    private String signalType; // 'ENTRY' or 'EXIT'

    @Column(nullable = false, precision = 15, scale = 4)
    private BigDecimal price;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "conditions_met", columnDefinition = "jsonb")
    private Map<String, Object> conditionsMet;

    @Column(nullable = false)
    private Boolean executed = false;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    // Getters and setters
    public Integer getSignalId() {
        return signalId;
    }

    public void setSignalId(Integer signalId) {
        this.signalId = signalId;
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

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public String getSignalType() {
        return signalType;
    }

    public void setSignalType(String signalType) {
        this.signalType = signalType;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Map<String, Object> getConditionsMet() {
        return conditionsMet;
    }

    public void setConditionsMet(Map<String, Object> conditionsMet) {
        this.conditionsMet = conditionsMet;
    }

    public Boolean getExecuted() {
        return executed;
    }

    public void setExecuted(Boolean executed) {
        this.executed = executed;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

