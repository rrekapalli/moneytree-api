package com.moneytree.screener.entity;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class ScreenerStarId implements Serializable {
    private UUID screenerId;
    private UUID userId;

    public ScreenerStarId() {
    }

    public ScreenerStarId(UUID screenerId, UUID userId) {
        this.screenerId = screenerId;
        this.userId = userId;
    }

    public UUID getScreenerId() { return screenerId; }
    public void setScreenerId(UUID screenerId) { this.screenerId = screenerId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ScreenerStarId that = (ScreenerStarId) o;
        return Objects.equals(screenerId, that.screenerId) && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(screenerId, userId);
    }
}

