package com.moneytree.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO for instrument data to be returned to the frontend.
 * Contains essential instrument information from kite_instrument_master table.
 */
public class InstrumentDto {

    @JsonProperty("instrumentToken")
    private String instrumentToken;

    @JsonProperty("tradingsymbol")
    private String tradingsymbol;

    @JsonProperty("name")
    private String name;

    @JsonProperty("segment")
    private String segment;

    @JsonProperty("exchange")
    private String exchange;

    @JsonProperty("instrumentType")
    private String instrumentType;

    @JsonProperty("lastPrice")
    private Double lastPrice;

    @JsonProperty("lotSize")
    private Integer lotSize;

    @JsonProperty("tickSize")
    private Double tickSize;

    // Default constructor
    public InstrumentDto() {
    }

    // Full constructor
    public InstrumentDto(String instrumentToken, String tradingsymbol, String name, 
                        String segment, String exchange, String instrumentType, 
                        Double lastPrice, Integer lotSize, Double tickSize) {
        this.instrumentToken = instrumentToken;
        this.tradingsymbol = tradingsymbol;
        this.name = name;
        this.segment = segment;
        this.exchange = exchange;
        this.instrumentType = instrumentType;
        this.lastPrice = lastPrice;
        this.lotSize = lotSize;
        this.tickSize = tickSize;
    }

    // Getters and Setters
    public String getInstrumentToken() {
        return instrumentToken;
    }

    public void setInstrumentToken(String instrumentToken) {
        this.instrumentToken = instrumentToken;
    }

    public String getTradingsymbol() {
        return tradingsymbol;
    }

    public void setTradingsymbol(String tradingsymbol) {
        this.tradingsymbol = tradingsymbol;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSegment() {
        return segment;
    }

    public void setSegment(String segment) {
        this.segment = segment;
    }

    public String getExchange() {
        return exchange;
    }

    public void setExchange(String exchange) {
        this.exchange = exchange;
    }

    public String getInstrumentType() {
        return instrumentType;
    }

    public void setInstrumentType(String instrumentType) {
        this.instrumentType = instrumentType;
    }

    public Double getLastPrice() {
        return lastPrice;
    }

    public void setLastPrice(Double lastPrice) {
        this.lastPrice = lastPrice;
    }

    public Integer getLotSize() {
        return lotSize;
    }

    public void setLotSize(Integer lotSize) {
        this.lotSize = lotSize;
    }

    public Double getTickSize() {
        return tickSize;
    }

    public void setTickSize(Double tickSize) {
        this.tickSize = tickSize;
    }
}
