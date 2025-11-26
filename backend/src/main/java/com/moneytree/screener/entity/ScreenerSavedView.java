package com.moneytree.screener.entity;

import com.moneytree.user.entity.User;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;

@Entity
@Table(name = "screener_saved_view", uniqueConstraints = {
    @UniqueConstraint(name = "screener_saved_view_screener_id_user_id_name_key", columnNames = {"screener_id", "user_id", "name"})
})
public class ScreenerSavedView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "saved_view_id")
    private Long savedViewId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screener_id", nullable = false, foreignKey = @ForeignKey(name = "screener_saved_view_screener_id_fkey"))
    private Screener screener;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "screener_saved_view_user_id_fkey"))
    private User user;

    @Column(nullable = false, columnDefinition = "text")
    private String name;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "table_prefs", columnDefinition = "jsonb")
    private Map<String, Object> tablePrefs;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    // Getters and setters
    public Long getSavedViewId() { return savedViewId; }
    public void setSavedViewId(Long savedViewId) { this.savedViewId = savedViewId; }
    public Screener getScreener() { return screener; }
    public void setScreener(Screener screener) { this.screener = screener; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Map<String, Object> getTablePrefs() { return tablePrefs; }
    public void setTablePrefs(Map<String, Object> tablePrefs) { this.tablePrefs = tablePrefs; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}

