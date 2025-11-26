package com.moneytree.screener.entity;

import java.io.Serializable;
import java.util.Objects;

public class ScreenerStarId implements Serializable {
    private Long screenerId;
    private Long userId;

    public ScreenerStarId() {
    }

    public ScreenerStarId(Long screenerId, Long userId) {
        this.screenerId = screenerId;
        this.userId = userId;
    }

    public Long getScreenerId() { return screenerId; }
    public void setScreenerId(Long screenerId) { this.screenerId = screenerId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

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

