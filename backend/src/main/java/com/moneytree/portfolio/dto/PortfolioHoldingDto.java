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
    
    // Additional fields from portfolio_holdings_summary
    private LocalDateTime entryDate;
    private BigDecimal openPrincipal;
    private BigDecimal takeProfit;
    private BigDecimal stopLoss;
    private BigDecimal lastPositionValue;
    private BigDecimal lastEquity;
    private Long totalTrades;
    private Long winningTrades;
    private Long losingTrades;

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

    public LocalDateTime getEntryDate() {
        return entryDate;
    }

    public void setEntryDate(LocalDateTime entryDate) {
        this.entryDate = entryDate;
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

    public BigDecimal getLastPositionValue() {
        return lastPositionValue;
    }

    public void setLastPositionValue(BigDecimal lastPositionValue) {
        this.lastPositionValue = lastPositionValue;
    }

    public BigDecimal getLastEquity() {
        return lastEquity;
    }

    public void setLastEquity(BigDecimal lastEquity) {
        this.lastEquity = lastEquity;
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
}
