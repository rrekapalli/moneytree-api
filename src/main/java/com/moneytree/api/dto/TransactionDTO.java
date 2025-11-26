package com.moneytree.api.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TransactionDTO {

    private Long id;

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    private String description;

    private String transactionType;

    private String category;

    @NotNull(message = "Account ID is required")
    private Long accountId;

    private LocalDateTime transactionDate;

    public TransactionDTO() {
    }

    public TransactionDTO(Long id, BigDecimal amount, String description, String transactionType, 
                          String category, Long accountId, LocalDateTime transactionDate) {
        this.id = id;
        this.amount = amount;
        this.description = description;
        this.transactionType = transactionType;
        this.category = category;
        this.accountId = accountId;
        this.transactionDate = transactionDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDateTime transactionDate) {
        this.transactionDate = transactionDate;
    }
}
