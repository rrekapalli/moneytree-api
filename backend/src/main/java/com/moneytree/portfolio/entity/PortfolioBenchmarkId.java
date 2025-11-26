package com.moneytree.portfolio.entity;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class PortfolioBenchmarkId implements Serializable {
    private UUID portfolioId;
    private String indexName;

    public PortfolioBenchmarkId() {
    }

    public PortfolioBenchmarkId(UUID portfolioId, String indexName) {
        this.portfolioId = portfolioId;
        this.indexName = indexName;
    }

    public UUID getPortfolioId() {
        return portfolioId;
    }

    public void setPortfolioId(UUID portfolioId) {
        this.portfolioId = portfolioId;
    }

    public String getIndexName() {
        return indexName;
    }

    public void setIndexName(String indexName) {
        this.indexName = indexName;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PortfolioBenchmarkId that = (PortfolioBenchmarkId) o;
        return Objects.equals(portfolioId, that.portfolioId) && Objects.equals(indexName, that.indexName);
    }

    @Override
    public int hashCode() {
        return Objects.hash(portfolioId, indexName);
    }
}

