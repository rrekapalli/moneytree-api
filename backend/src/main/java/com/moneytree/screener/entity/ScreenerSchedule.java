package com.moneytree.screener.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "screener_schedule")
public class ScreenerSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_id")
    private Long scheduleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screener_id", nullable = false, foreignKey = @ForeignKey(name = "screener_schedule_screener_id_fkey"))
    private Screener screener;

    @Column(name = "cron_expr", nullable = false, columnDefinition = "text")
    private String cronExpr;

    @Column(nullable = false, columnDefinition = "text")
    private String timezone = "Asia/Kolkata";

    @Column(name = "is_enabled", nullable = false)
    private Boolean isEnabled = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    // Getters and setters
    public Long getScheduleId() { return scheduleId; }
    public void setScheduleId(Long scheduleId) { this.scheduleId = scheduleId; }
    public Screener getScreener() { return screener; }
    public void setScreener(Screener screener) { this.screener = screener; }
    public String getCronExpr() { return cronExpr; }
    public void setCronExpr(String cronExpr) { this.cronExpr = cronExpr; }
    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }
    public Boolean getIsEnabled() { return isEnabled; }
    public void setIsEnabled(Boolean isEnabled) { this.isEnabled = isEnabled; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

