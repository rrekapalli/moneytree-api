package com.moneytree.portfolio.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "portfolio_benchmarks", uniqueConstraints = {
    @UniqueConstraint(name = "portfolio_benchmarks_pkey", columnNames = {"portfolio_id", "index_name"})
})
@IdClass(PortfolioBenchmarkId.class)
public class PortfolioBenchmark {

    @Id
    @Column(name = "portfolio_id", nullable = false, columnDefinition = "uuid")
    private UUID portfolioId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false, insertable = false, updatable = false, foreignKey = @ForeignKey(name = "portfolio_benchmarks_portfolio_id_fkey"))
    private Portfolio portfolio;

    @Id
    @Column(name = "index_name", nullable = false, length = 200)
    private String indexName;

    @Column(name = "weight_pct", nullable = false, precision = 10, scale = 6)
    private BigDecimal weightPct = BigDecimal.ONE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    // Getters and setters
    public UUID getPortfolioId() {
        return portfolioId;
    }

    public void setPortfolioId(UUID portfolioId) {
        this.portfolioId = portfolioId;
    }

    public Portfolio getPortfolio() {
        return portfolio;
    }

    public void setPortfolio(Portfolio portfolio) {
        this.portfolio = portfolio;
        if (portfolio != null) {
            this.portfolioId = portfolio.getId();
        }
    }

    public String getIndexName() {
        return indexName;
    }

    public void setIndexName(String indexName) {
        this.indexName = indexName;
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

