package com.moneytree.screener.entity;

import com.moneytree.user.entity.User;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "screener")
public class Screener {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "screener_id")
    private Long screenerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_user_id", nullable = false, foreignKey = @ForeignKey(name = "screener_owner_user_id_fkey"))
    private User owner;

    @Column(nullable = false, columnDefinition = "text")
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "is_public", nullable = false)
    private Boolean isPublic = false;

    @Column(name = "default_universe", columnDefinition = "text")
    private String defaultUniverse;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    // Getters and setters
    public Long getScreenerId() {
        return screenerId;
    }

    public void setScreenerId(Long screenerId) {
        this.screenerId = screenerId;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsPublic() {
        return isPublic;
    }

    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }

    public String getDefaultUniverse() {
        return defaultUniverse;
    }

    public void setDefaultUniverse(String defaultUniverse) {
        this.defaultUniverse = defaultUniverse;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}

