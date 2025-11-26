package com.moneytree.screener.entity;

import com.moneytree.user.entity.User;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;

@Entity
@Table(name = "screener_run")
public class ScreenerRun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "screener_run_id")
    private Long screenerRunId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screener_id", nullable = false, foreignKey = @ForeignKey(name = "screener_run_screener_id_fkey"))
    private Screener screener;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screener_version_id", nullable = false, foreignKey = @ForeignKey(name = "screener_run_screener_version_id_fkey"))
    private ScreenerVersion screenerVersion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "triggered_by_user_id", foreignKey = @ForeignKey(name = "screener_run_triggered_by_user_id_fkey"))
    private User triggeredByUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paramset_id", foreignKey = @ForeignKey(name = "screener_run_paramset_id_fkey"))
    private ScreenerParamset paramset;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "params_json", columnDefinition = "jsonb")
    private Map<String, Object> paramsJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "universe_snapshot", columnDefinition = "jsonb")
    private Map<String, Object> universeSnapshot;

    @Column(name = "run_for_trading_day")
    private LocalDate runForTradingDay;

    @Column(name = "started_at", nullable = false, updatable = false)
    private Instant startedAt = Instant.now();

    @Column(name = "finished_at")
    private Instant finishedAt;

    @Column(nullable = false, columnDefinition = "text")
    private String status = "running";

    @Column(name = "error_message", columnDefinition = "text")
    private String errorMessage;

    @Column(name = "total_candidates")
    private Integer totalCandidates;

    @Column(name = "total_matches")
    private Integer totalMatches;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    // Getters and setters
    public Long getScreenerRunId() { return screenerRunId; }
    public void setScreenerRunId(Long screenerRunId) { this.screenerRunId = screenerRunId; }
    public Screener getScreener() { return screener; }
    public void setScreener(Screener screener) { this.screener = screener; }
    public ScreenerVersion getScreenerVersion() { return screenerVersion; }
    public void setScreenerVersion(ScreenerVersion screenerVersion) { this.screenerVersion = screenerVersion; }
    public User getTriggeredByUser() { return triggeredByUser; }
    public void setTriggeredByUser(User triggeredByUser) { this.triggeredByUser = triggeredByUser; }
    public ScreenerParamset getParamset() { return paramset; }
    public void setParamset(ScreenerParamset paramset) { this.paramset = paramset; }
    public Map<String, Object> getParamsJson() { return paramsJson; }
    public void setParamsJson(Map<String, Object> paramsJson) { this.paramsJson = paramsJson; }
    public Map<String, Object> getUniverseSnapshot() { return universeSnapshot; }
    public void setUniverseSnapshot(Map<String, Object> universeSnapshot) { this.universeSnapshot = universeSnapshot; }
    public LocalDate getRunForTradingDay() { return runForTradingDay; }
    public void setRunForTradingDay(LocalDate runForTradingDay) { this.runForTradingDay = runForTradingDay; }
    public Instant getStartedAt() { return startedAt; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }
    public Instant getFinishedAt() { return finishedAt; }
    public void setFinishedAt(Instant finishedAt) { this.finishedAt = finishedAt; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public Integer getTotalCandidates() { return totalCandidates; }
    public void setTotalCandidates(Integer totalCandidates) { this.totalCandidates = totalCandidates; }
    public Integer getTotalMatches() { return totalMatches; }
    public void setTotalMatches(Integer totalMatches) { this.totalMatches = totalMatches; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}

