package com.moneytree.portfolio.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for portfolio holdings to be returned to the frontend.
 * Maps from PortfolioHoldingSummary entity.
 */
public class PortfolioHoldingDto {
    private String portfolioId;
    private String symbol;
    private BigDecimal quantity;
    private BigDecimal avgCost;
    private BigDecimal realizedPnl;
    private LocalDateTime lastUpdated;

    // Constructors
    public PortfolioHoldingDto() {
    }

    public PortfolioHoldingDto(String portfolioId, String symbol, BigDecimal quantity, 
                               BigDecimal avgCost, BigDecimal realizedPnl, LocalDateTime lastUpdated) {
        this.portfolioId = portfolioId;
        this.symbol = symbol;
        this.quantity = quantity;
        this.avgCost = avgCost;
        this.realizedPnl = realizedPnl;
        this.lastUpdated = lastUpdated;
    }

    // Getters and Setters
    public String getPortfolioId() {
        return portfolioId;
    }

    public void setPortfolioId(String portfolioId) {
        this.portfolioId = portfolioId;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getAvgCost() {
        return avgCost;
    }

    public void setAvgCost(BigDecimal avgCost) {
        this.avgCost = avgCost;
    }

    public BigDecimal getRealizedPnl() {
        return realizedPnl;
    }

    public void setRealizedPnl(BigDecimal realizedPnl) {
        this.realizedPnl = realizedPnl;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
