package com.moneytree.screener.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;

@Entity
@Table(name = "screener_alert")
public class ScreenerAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "alert_id")
    private Long alertId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screener_id", nullable = false, foreignKey = @ForeignKey(name = "screener_alert_screener_id_fkey"))
    private Screener screener;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "condition_json", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> conditionJson;

    @Column(name = "delivery_channels", nullable = false, columnDefinition = "_text")
    private String[] deliveryChannels = {"inapp"};

    @Column(name = "is_enabled", nullable = false)
    private Boolean isEnabled = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    // Getters and setters
    public Long getAlertId() { return alertId; }
    public void setAlertId(Long alertId) { this.alertId = alertId; }
    public Screener getScreener() { return screener; }
    public void setScreener(Screener screener) { this.screener = screener; }
    public Map<String, Object> getConditionJson() { return conditionJson; }
    public void setConditionJson(Map<String, Object> conditionJson) { this.conditionJson = conditionJson; }
    public String[] getDeliveryChannels() { return deliveryChannels; }
    public void setDeliveryChannels(String[] deliveryChannels) { this.deliveryChannels = deliveryChannels; }
    public Boolean getIsEnabled() { return isEnabled; }
    public void setIsEnabled(Boolean isEnabled) { this.isEnabled = isEnabled; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

