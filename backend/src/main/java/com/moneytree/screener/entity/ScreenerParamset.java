package com.moneytree.screener.entity;

import com.moneytree.user.entity.User;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;

@Entity
@Table(name = "screener_paramset", uniqueConstraints = {
    @UniqueConstraint(name = "screener_paramset_screener_version_id_name_key", columnNames = {"screener_version_id", "name"})
})
public class ScreenerParamset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "paramset_id")
    private Long paramsetId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screener_version_id", nullable = false, foreignKey = @ForeignKey(name = "screener_paramset_screener_version_id_fkey"))
    private ScreenerVersion screenerVersion;

    @Column(nullable = false, columnDefinition = "text")
    private String name;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "params_json", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> paramsJson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = false, foreignKey = @ForeignKey(name = "screener_paramset_created_by_user_id_fkey"))
    private User createdByUser;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    // Getters and setters
    public Long getParamsetId() { return paramsetId; }
    public void setParamsetId(Long paramsetId) { this.paramsetId = paramsetId; }
    public ScreenerVersion getScreenerVersion() { return screenerVersion; }
    public void setScreenerVersion(ScreenerVersion screenerVersion) { this.screenerVersion = screenerVersion; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Map<String, Object> getParamsJson() { return paramsJson; }
    public void setParamsJson(Map<String, Object> paramsJson) { this.paramsJson = paramsJson; }
    public User getCreatedByUser() { return createdByUser; }
    public void setCreatedByUser(User createdByUser) { this.createdByUser = createdByUser; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

