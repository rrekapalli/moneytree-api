package com.moneytree.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Request DTO for Kite history endpoint.
 */
public class HistoryRequest {
    
    @JsonProperty("tradingsymbol")
    private String tradingsymbol;
    
    @JsonProperty("instrumenttoken")
    private String instrumenttoken;
    
    @JsonProperty("exchange")
    private String exchange;
    
    @JsonProperty("interval")
    private String interval;
    
    @JsonProperty("from")
    private String from;
    
    @JsonProperty("to")
    private String to;

    // Getters and setters
    public String getTradingsymbol() {
        return tradingsymbol;
    }

    public void setTradingsymbol(String tradingsymbol) {
        this.tradingsymbol = tradingsymbol;
    }

    public String getInstrumenttoken() {
        return instrumenttoken;
    }

    public void setInstrumenttoken(String instrumenttoken) {
        this.instrumenttoken = instrumenttoken;
    }

    public String getExchange() {
        return exchange;
    }

    public void setExchange(String exchange) {
        this.exchange = exchange;
    }

    public String getInterval() {
        return interval;
    }

    public void setInterval(String interval) {
        this.interval = interval;
    }

    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }
}

