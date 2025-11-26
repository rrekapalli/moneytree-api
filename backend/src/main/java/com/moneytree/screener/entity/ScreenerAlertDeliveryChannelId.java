package com.moneytree.screener.entity;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class ScreenerAlertDeliveryChannelId implements Serializable {
    private UUID alertId;
    private String deliveryChannel;

    public ScreenerAlertDeliveryChannelId() {
    }

    public ScreenerAlertDeliveryChannelId(UUID alertId, String deliveryChannel) {
        this.alertId = alertId;
        this.deliveryChannel = deliveryChannel;
    }

    public UUID getAlertId() { return alertId; }
    public void setAlertId(UUID alertId) { this.alertId = alertId; }
    public String getDeliveryChannel() { return deliveryChannel; }
    public void setDeliveryChannel(String deliveryChannel) { this.deliveryChannel = deliveryChannel; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ScreenerAlertDeliveryChannelId that = (ScreenerAlertDeliveryChannelId) o;
        return Objects.equals(alertId, that.alertId) && Objects.equals(deliveryChannel, that.deliveryChannel);
    }

    @Override
    public int hashCode() {
        return Objects.hash(alertId, deliveryChannel);
    }
}

