package com.moneytree.screener.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "screener_result")
@IdClass(ScreenerResultId.class)
public class ScreenerResult {

    @Id
    @Column(name = "screener_run_id", nullable = false, columnDefinition = "uuid")
    private UUID screenerRunId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screener_run_id", nullable = false, insertable = false, updatable = false, foreignKey = @ForeignKey(name = "screener_result_screener_run_id_fkey"))
    private ScreenerRun screenerRun;

    @Id
    @Column(nullable = false, columnDefinition = "text")
    private String symbol;

    @Column(nullable = false)
    private Boolean matched;

    @Column(name = "score_0_1", precision = 6, scale = 4)
    private BigDecimal score0_1;

    @Column(name = "rank_in_run")
    private Integer rankInRun;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metrics_json", columnDefinition = "jsonb")
    private Map<String, Object> metricsJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "reason_json", columnDefinition = "jsonb")
    private Map<String, Object> reasonJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "modified_by")
    private Long modifiedBy;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    // Getters and setters
    public UUID getScreenerRunId() { return screenerRunId; }
    public void setScreenerRunId(UUID screenerRunId) { this.screenerRunId = screenerRunId; }
    public ScreenerRun getScreenerRun() { return screenerRun; }
    public void setScreenerRun(ScreenerRun screenerRun) { this.screenerRun = screenerRun; if (screenerRun != null) this.screenerRunId = screenerRun.getScreenerRunId(); }
    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
    public Boolean getMatched() { return matched; }
    public void setMatched(Boolean matched) { this.matched = matched; }
    public BigDecimal getScore0_1() { return score0_1; }
    public void setScore0_1(BigDecimal score0_1) { this.score0_1 = score0_1; }
    public Integer getRankInRun() { return rankInRun; }
    public void setRankInRun(Integer rankInRun) { this.rankInRun = rankInRun; }
    public Map<String, Object> getMetricsJson() { return metricsJson; }
    public void setMetricsJson(Map<String, Object> metricsJson) { this.metricsJson = metricsJson; }
    public Map<String, Object> getReasonJson() { return reasonJson; }
    public void setReasonJson(Map<String, Object> reasonJson) { this.reasonJson = reasonJson; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }
    public Long getModifiedBy() { return modifiedBy; }
    public void setModifiedBy(Long modifiedBy) { this.modifiedBy = modifiedBy; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}

