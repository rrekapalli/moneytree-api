package com.moneytree.screener.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;

@Entity
@Table(name = "screener_function_params")
public class ScreenerFunctionParam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "param_id")
    private Long paramId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "function_id", nullable = false, foreignKey = @ForeignKey(name = "fkh5k1r7ucggleg6sio0toji0ma"))
    private ScreenerFunction function;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "data_type", nullable = false, length = 50)
    private String dataType;

    @Column(name = "default_value", length = 500)
    private String defaultValue;

    @Column(name = "display_name", nullable = false, length = 200)
    private String displayName;

    @Column(name = "example_value", length = 500)
    private String exampleValue;

    @Column(name = "help_text", columnDefinition = "text")
    private String helpText;

    @Column(name = "is_required", nullable = false)
    private Boolean isRequired = false;

    @Column(name = "param_name", nullable = false, length = 100)
    private String paramName;

    @Column(name = "param_order", nullable = false)
    private Integer paramOrder;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "validation_rules", columnDefinition = "jsonb")
    private Map<String, Object> validationRules;

    // Getters and setters
    public Long getParamId() { return paramId; }
    public void setParamId(Long paramId) { this.paramId = paramId; }
    public ScreenerFunction getFunction() { return function; }
    public void setFunction(ScreenerFunction function) { this.function = function; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public String getDataType() { return dataType; }
    public void setDataType(String dataType) { this.dataType = dataType; }
    public String getDefaultValue() { return defaultValue; }
    public void setDefaultValue(String defaultValue) { this.defaultValue = defaultValue; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public String getExampleValue() { return exampleValue; }
    public void setExampleValue(String exampleValue) { this.exampleValue = exampleValue; }
    public String getHelpText() { return helpText; }
    public void setHelpText(String helpText) { this.helpText = helpText; }
    public Boolean getIsRequired() { return isRequired; }
    public void setIsRequired(Boolean isRequired) { this.isRequired = isRequired; }
    public String getParamName() { return paramName; }
    public void setParamName(String paramName) { this.paramName = paramName; }
    public Integer getParamOrder() { return paramOrder; }
    public void setParamOrder(Integer paramOrder) { this.paramOrder = paramOrder; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public Map<String, Object> getValidationRules() { return validationRules; }
    public void setValidationRules(Map<String, Object> validationRules) { this.validationRules = validationRules; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}

