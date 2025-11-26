package com.moneytree.screener.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "screener_alert_delivery_channels")
@IdClass(ScreenerAlertDeliveryChannelId.class)
public class ScreenerAlertDeliveryChannel {

    @Id
    @Column(name = "alert_id", nullable = false, columnDefinition = "uuid")
    private UUID alertId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alert_id", nullable = false, insertable = false, updatable = false, foreignKey = @ForeignKey(name = "fk43npt3486b9ujqxr6i5ftnek3"))
    private ScreenerAlert alert;

    @Id
    @Column(name = "delivery_channel", length = 255)
    private String deliveryChannel;

    // Getters and setters
    public UUID getAlertId() { return alertId; }
    public void setAlertId(UUID alertId) { this.alertId = alertId; }
    public ScreenerAlert getAlert() { return alert; }
    public void setAlert(ScreenerAlert alert) { this.alert = alert; if (alert != null) this.alertId = alert.getAlertId(); }
    public String getDeliveryChannel() { return deliveryChannel; }
    public void setDeliveryChannel(String deliveryChannel) { this.deliveryChannel = deliveryChannel; }
}

