package com.moneytree.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Request payload for querying stocks with filters.
 */
public class StockFilterRequest {

    @JsonProperty("exchange")
    private String exchange;

    @JsonProperty("segment")
    private String segment;

    @JsonProperty("instrumentType")
    private String instrumentType;

    public String getExchange() {
        return exchange;
    }

    public void setExchange(String exchange) {
        this.exchange = exchange;
    }

    public String getSegment() {
        return segment;
    }

    public void setSegment(String segment) {
        this.segment = segment;
    }

    public String getInstrumentType() {
        return instrumentType;
    }

    public void setInstrumentType(String instrumentType) {
        this.instrumentType = instrumentType;
    }
}

