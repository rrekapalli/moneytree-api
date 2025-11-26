package com.moneytree.portfolio.entity;

import java.io.Serializable;
import java.util.Objects;

public class PortfolioBenchmarkId implements Serializable {
    private Long portfolioId;
    private String indexName;

    public PortfolioBenchmarkId() {
    }

    public PortfolioBenchmarkId(Long portfolioId, String indexName) {
        this.portfolioId = portfolioId;
        this.indexName = indexName;
    }

    public Long getPortfolioId() {
        return portfolioId;
    }

    public void setPortfolioId(Long portfolioId) {
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

