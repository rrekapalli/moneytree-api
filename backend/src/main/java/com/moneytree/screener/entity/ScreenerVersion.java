package com.moneytree.screener.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;

@Entity
@Table(name = "screener_version", uniqueConstraints = {
    @UniqueConstraint(name = "screener_version_screener_id_version_number_key", columnNames = {"screener_id", "version_number"})
})
public class ScreenerVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "screener_version_id")
    private Long screenerVersionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screener_id", nullable = false, foreignKey = @ForeignKey(name = "screener_version_screener_id_fkey"))
    private Screener screener;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @Column(nullable = false, columnDefinition = "text")
    private String status = "active";

    @Column(nullable = false, columnDefinition = "text")
    private String engine = "sql";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "dsl_json", columnDefinition = "jsonb")
    private Map<String, Object> dslJson;

    @Column(name = "compiled_sql", columnDefinition = "text")
    private String compiledSql;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "params_schema_json", columnDefinition = "jsonb")
    private Map<String, Object> paramsSchemaJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    // Getters and setters
    public Long getScreenerVersionId() { return screenerVersionId; }
    public void setScreenerVersionId(Long screenerVersionId) { this.screenerVersionId = screenerVersionId; }
    public Screener getScreener() { return screener; }
    public void setScreener(Screener screener) { this.screener = screener; }
    public Integer getVersionNumber() { return versionNumber; }
    public void setVersionNumber(Integer versionNumber) { this.versionNumber = versionNumber; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getEngine() { return engine; }
    public void setEngine(String engine) { this.engine = engine; }
    public Map<String, Object> getDslJson() { return dslJson; }
    public void setDslJson(Map<String, Object> dslJson) { this.dslJson = dslJson; }
    public String getCompiledSql() { return compiledSql; }
    public void setCompiledSql(String compiledSql) { this.compiledSql = compiledSql; }
    public Map<String, Object> getParamsSchemaJson() { return paramsSchemaJson; }
    public void setParamsSchemaJson(Map<String, Object> paramsSchemaJson) { this.paramsSchemaJson = paramsSchemaJson; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

