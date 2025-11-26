package com.moneytree.marketdata.kite.model;

public class Instrument {

    private Long id;
    private String kiteInstrumentToken;
    private String symbol;
    private String exchange;
    private String instrumentType;
    private Double tickSize;
    private Integer lotSize;
    private boolean active;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getKiteInstrumentToken() {
        return kiteInstrumentToken;
    }

    public void setKiteInstrumentToken(String kiteInstrumentToken) {
        this.kiteInstrumentToken = kiteInstrumentToken;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
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

    public Double getTickSize() {
        return tickSize;
    }

    public void setTickSize(Double tickSize) {
        this.tickSize = tickSize;
    }

    public Integer getLotSize() {
        return lotSize;
    }

    public void setLotSize(Integer lotSize) {
        this.lotSize = lotSize;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}


