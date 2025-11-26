package com.moneytree.marketdata.kite.model;

import java.time.Instant;

public class Quote {

    private Long instrumentId;
    private Double lastTradedPrice;
    private Long lastTradedQuantity;
    private Double bidPrice;
    private Long bidQuantity;
    private Double askPrice;
    private Long askQuantity;
    private Instant timestamp;

    public Long getInstrumentId() {
        return instrumentId;
    }

    public void setInstrumentId(Long instrumentId) {
        this.instrumentId = instrumentId;
    }

    public Double getLastTradedPrice() {
        return lastTradedPrice;
    }

    public void setLastTradedPrice(Double lastTradedPrice) {
        this.lastTradedPrice = lastTradedPrice;
    }

    public Long getLastTradedQuantity() {
        return lastTradedQuantity;
    }

    public void setLastTradedQuantity(Long lastTradedQuantity) {
        this.lastTradedQuantity = lastTradedQuantity;
    }

    public Double getBidPrice() {
        return bidPrice;
    }

    public void setBidPrice(Double bidPrice) {
        this.bidPrice = bidPrice;
    }

    public Long getBidQuantity() {
        return bidQuantity;
    }

    public void setBidQuantity(Long bidQuantity) {
        this.bidQuantity = bidQuantity;
    }

    public Double getAskPrice() {
        return askPrice;
    }

    public void setAskPrice(Double askPrice) {
        this.askPrice = askPrice;
    }

    public Long getAskQuantity() {
        return askQuantity;
    }

    public void setAskQuantity(Long askQuantity) {
        this.askQuantity = askQuantity;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}


