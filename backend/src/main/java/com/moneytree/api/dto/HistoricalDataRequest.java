package com.moneytree.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

/**
 * Request payload for fetching historical data for any instrument (stocks, indices, etc.).
 */
public class HistoricalDataRequest {

    @JsonProperty("tradingsymbol")
    @NotBlank(message = "tradingsymbol is required")
    private String tradingsymbol;

    @JsonProperty("exchange")
    private String exchange; // Optional, defaults to NSE if not provided

    @JsonProperty("days")
    private Integer days;

    @JsonProperty("start_date")
    private LocalDate startDate;

    @JsonProperty("end_date")
    private LocalDate endDate;

    public String getTradingsymbol() {
        return tradingsymbol;
    }

    public void setTradingsymbol(String tradingsymbol) {
        this.tradingsymbol = tradingsymbol;
    }

    public String getExchange() {
        return exchange;
    }

    public void setExchange(String exchange) {
        this.exchange = exchange;
    }

    public Integer getDays() {
        return days;
    }

    public void setDays(Integer days) {
        this.days = days;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
}

