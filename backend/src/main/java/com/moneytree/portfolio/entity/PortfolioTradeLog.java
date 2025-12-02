package com.moneytree.portfolio.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "portfolio_trade_logs")
public class PortfolioTradeLog {

    @Id
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false, foreignKey = @ForeignKey(name = "fk_portfolio"))
    @JsonIgnore
    private Portfolio portfolio;

    @Column(name = "cycle_timestamp", nullable = false)
    private Instant cycleTimestamp;

    @Column(nullable = false, length = 20)
    private String symbol;

    @Column(name = "evaluation_type", nullable = false, length = 10)
    private String evaluationType;

    @Column(name = "current_price", precision = 12, scale = 2)
    private BigDecimal currentPrice;

    @Column(name = "current_rsi", precision = 5, scale = 2)
    private BigDecimal currentRsi;

    @Column(name = "current_volume")
    private Long currentVolume;

    @Column(name = "evaluation_result", length = 50)
    private String evaluationResult;

    @Column(name = "conditions_met")
    private Integer conditionsMet;

    @Column(name = "total_conditions")
    private Integer totalConditions;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "condition_details", columnDefinition = "jsonb")
    private Map<String, Object> conditionDetails;

    @Column(name = "position_entry_price", precision = 12, scale = 2)
    private BigDecimal positionEntryPrice;

    @Column(name = "position_quantity")
    private Integer positionQuantity;

    @Column(name = "position_unrealized_pnl", precision = 12, scale = 2)
    private BigDecimal positionUnrealizedPnl;

    @Column(name = "position_hold_duration_minutes")
    private Integer positionHoldDurationMinutes;

    @Column(name = "take_profit_price", precision = 12, scale = 2)
    private BigDecimal takeProfitPrice;

    @Column(name = "stop_loss_price", precision = 12, scale = 2)
    private BigDecimal stopLossPrice;

    @Column(name = "tp_distance_pct", precision = 5, scale = 2)
    private BigDecimal tpDistancePct;

    @Column(name = "sl_distance_pct", precision = 5, scale = 2)
    private BigDecimal slDistancePct;

    @Column(name = "intraday_high", precision = 12, scale = 2)
    private BigDecimal intradayHigh;

    @Column(name = "intraday_low", precision = 12, scale = 2)
    private BigDecimal intradayLow;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    // Getters and setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Portfolio getPortfolio() { return portfolio; }
    public void setPortfolio(Portfolio portfolio) { this.portfolio = portfolio; }
    public Instant getCycleTimestamp() { return cycleTimestamp; }
    public void setCycleTimestamp(Instant cycleTimestamp) { this.cycleTimestamp = cycleTimestamp; }
    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
    public String getEvaluationType() { return evaluationType; }
    public void setEvaluationType(String evaluationType) { this.evaluationType = evaluationType; }
    public BigDecimal getCurrentPrice() { return currentPrice; }
    public void setCurrentPrice(BigDecimal currentPrice) { this.currentPrice = currentPrice; }
    public BigDecimal getCurrentRsi() { return currentRsi; }
    public void setCurrentRsi(BigDecimal currentRsi) { this.currentRsi = currentRsi; }
    public Long getCurrentVolume() { return currentVolume; }
    public void setCurrentVolume(Long currentVolume) { this.currentVolume = currentVolume; }
    public String getEvaluationResult() { return evaluationResult; }
    public void setEvaluationResult(String evaluationResult) { this.evaluationResult = evaluationResult; }
    public Integer getConditionsMet() { return conditionsMet; }
    public void setConditionsMet(Integer conditionsMet) { this.conditionsMet = conditionsMet; }
    public Integer getTotalConditions() { return totalConditions; }
    public void setTotalConditions(Integer totalConditions) { this.totalConditions = totalConditions; }
    public Map<String, Object> getConditionDetails() { return conditionDetails; }
    public void setConditionDetails(Map<String, Object> conditionDetails) { this.conditionDetails = conditionDetails; }
    public BigDecimal getPositionEntryPrice() { return positionEntryPrice; }
    public void setPositionEntryPrice(BigDecimal positionEntryPrice) { this.positionEntryPrice = positionEntryPrice; }
    public Integer getPositionQuantity() { return positionQuantity; }
    public void setPositionQuantity(Integer positionQuantity) { this.positionQuantity = positionQuantity; }
    public BigDecimal getPositionUnrealizedPnl() { return positionUnrealizedPnl; }
    public void setPositionUnrealizedPnl(BigDecimal positionUnrealizedPnl) { this.positionUnrealizedPnl = positionUnrealizedPnl; }
    public Integer getPositionHoldDurationMinutes() { return positionHoldDurationMinutes; }
    public void setPositionHoldDurationMinutes(Integer positionHoldDurationMinutes) { this.positionHoldDurationMinutes = positionHoldDurationMinutes; }
    public BigDecimal getTakeProfitPrice() { return takeProfitPrice; }
    public void setTakeProfitPrice(BigDecimal takeProfitPrice) { this.takeProfitPrice = takeProfitPrice; }
    public BigDecimal getStopLossPrice() { return stopLossPrice; }
    public void setStopLossPrice(BigDecimal stopLossPrice) { this.stopLossPrice = stopLossPrice; }
    public BigDecimal getTpDistancePct() { return tpDistancePct; }
    public void setTpDistancePct(BigDecimal tpDistancePct) { this.tpDistancePct = tpDistancePct; }
    public BigDecimal getSlDistancePct() { return slDistancePct; }
    public void setSlDistancePct(BigDecimal slDistancePct) { this.slDistancePct = slDistancePct; }
    public BigDecimal getIntradayHigh() { return intradayHigh; }
    public void setIntradayHigh(BigDecimal intradayHigh) { this.intradayHigh = intradayHigh; }
    public BigDecimal getIntradayLow() { return intradayLow; }
    public void setIntradayLow(BigDecimal intradayLow) { this.intradayLow = intradayLow; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

