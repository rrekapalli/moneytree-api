package com.moneytree.portfolio.dto;

import java.math.BigDecimal;

/**
 * DTO for updating portfolio holdings.
 */
public class PortfolioHoldingUpdateRequest {
    private BigDecimal quantity;
    private BigDecimal avgCost;
    private BigDecimal takeProfit;
    private BigDecimal stopLoss;

    public PortfolioHoldingUpdateRequest() {
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
}
