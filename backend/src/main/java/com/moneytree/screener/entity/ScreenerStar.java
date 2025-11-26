package com.moneytree.screener.entity;

import com.moneytree.user.entity.User;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "screener_star")
@IdClass(ScreenerStarId.class)
public class ScreenerStar {

    @Id
    @Column(name = "screener_id", nullable = false, columnDefinition = "uuid")
    private UUID screenerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screener_id", nullable = false, insertable = false, updatable = false, foreignKey = @ForeignKey(name = "screener_star_screener_id_fkey"))
    private Screener screener;

    @Id
    @Column(name = "user_id", nullable = false, columnDefinition = "uuid")
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, insertable = false, updatable = false, foreignKey = @ForeignKey(name = "screener_star_user_id_fkey"))
    private User user;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "modified_by")
    private Long modifiedBy;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    // Getters and setters
    public UUID getScreenerId() { return screenerId; }
    public void setScreenerId(UUID screenerId) { this.screenerId = screenerId; }
    public Screener getScreener() { return screener; }
    public void setScreener(Screener screener) { this.screener = screener; if (screener != null) this.screenerId = screener.getScreenerId(); }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; if (user != null) this.userId = user.getId(); }
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

