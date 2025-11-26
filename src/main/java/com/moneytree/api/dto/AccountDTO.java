package com.moneytree.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class AccountDTO {

    private Long id;

    @NotBlank(message = "Account name is required")
    private String name;

    @NotNull(message = "Balance is required")
    private BigDecimal balance;

    private String accountType;

    public AccountDTO() {
    }

    public AccountDTO(Long id, String name, BigDecimal balance, String accountType) {
        this.id = id;
        this.name = name;
        this.balance = balance;
        this.accountType = accountType;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }
}
