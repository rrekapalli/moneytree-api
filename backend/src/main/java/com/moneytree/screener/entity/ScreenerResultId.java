package com.moneytree.screener.entity;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class ScreenerResultId implements Serializable {
    private UUID screenerRunId;
    private String symbol;

    public ScreenerResultId() {
    }

    public ScreenerResultId(UUID screenerRunId, String symbol) {
        this.screenerRunId = screenerRunId;
        this.symbol = symbol;
    }

    public UUID getScreenerRunId() { return screenerRunId; }
    public void setScreenerRunId(UUID screenerRunId) { this.screenerRunId = screenerRunId; }
    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ScreenerResultId that = (ScreenerResultId) o;
        return Objects.equals(screenerRunId, that.screenerRunId) && Objects.equals(symbol, that.symbol);
    }

    @Override
    public int hashCode() {
        return Objects.hash(screenerRunId, symbol);
    }
}

