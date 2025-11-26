package com.moneytree.screener.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "screener_functions", uniqueConstraints = {
    @UniqueConstraint(name = "uk_axevkmo1qxkd3s6k3uf67omq0", columnNames = {"function_name"})
})
public class ScreenerFunction {

    @Id
    @Column(name = "function_id", columnDefinition = "uuid")
    private UUID functionId;

    @Column(length = 100)
    private String category;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "display_name", nullable = false, length = 200)
    private String displayName;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> examples;

    @Column(name = "function_name", nullable = false, length = 100)
    private String functionName;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "return_type", nullable = false, length = 50)
    private String returnType;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "sql_template", nullable = false, columnDefinition = "text")
    private String sqlTemplate;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    // Getters and setters
    public UUID getFunctionId() { return functionId; }
    public void setFunctionId(UUID functionId) { this.functionId = functionId; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public Map<String, Object> getExamples() { return examples; }
    public void setExamples(Map<String, Object> examples) { this.examples = examples; }
    public String getFunctionName() { return functionName; }
    public void setFunctionName(String functionName) { this.functionName = functionName; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public String getReturnType() { return returnType; }
    public void setReturnType(String returnType) { this.returnType = returnType; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    public String getSqlTemplate() { return sqlTemplate; }
    public void setSqlTemplate(String sqlTemplate) { this.sqlTemplate = sqlTemplate; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}

