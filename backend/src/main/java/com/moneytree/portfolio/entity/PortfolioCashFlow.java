package com.moneytree.portfolio.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "portfolio_cash_flows")
public class PortfolioCashFlow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false, foreignKey = @ForeignKey(name = "portfolio_cash_flows_portfolio_id_fkey"))
    private Portfolio portfolio;

    @Column(name = "flow_date", nullable = false)
    private LocalDate flowDate;

    @Column(nullable = false, precision = 20, scale = 6)
    private BigDecimal amount;

    @Column(name = "flow_type", nullable = false, length = 20)
    private String flowType; // DEPOSIT, WITHDRAWAL, DIVIDEND, INTEREST, FEES, TAX

    @Column(name = "reference_txn_id")
    private Long referenceTxnId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    // Getters and setters
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

    public LocalDate getFlowDate() {
        return flowDate;
    }

    public void setFlowDate(LocalDate flowDate) {
        this.flowDate = flowDate;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getFlowType() {
        return flowType;
    }

    public void setFlowType(String flowType) {
        this.flowType = flowType;
    }

    public Long getReferenceTxnId() {
        return referenceTxnId;
    }

    public void setReferenceTxnId(Long referenceTxnId) {
        this.referenceTxnId = referenceTxnId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

