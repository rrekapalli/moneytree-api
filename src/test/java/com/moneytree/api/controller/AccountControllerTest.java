package com.moneytree.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneytree.api.dto.AccountDTO;
import com.moneytree.api.model.Account;
import com.moneytree.api.service.AccountService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AccountController.class)
class AccountControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AccountService accountService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void getAllAccounts_ShouldReturnAccounts() throws Exception {
        Account account1 = new Account("Checking", new BigDecimal("1000.00"), "CHECKING");
        account1.setId(1L);
        Account account2 = new Account("Savings", new BigDecimal("5000.00"), "SAVINGS");
        account2.setId(2L);

        when(accountService.getAllAccounts()).thenReturn(Arrays.asList(account1, account2));

        mockMvc.perform(get("/api/accounts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Checking"))
                .andExpect(jsonPath("$[1].name").value("Savings"));
    }

    @Test
    void getAccountById_WhenExists_ShouldReturnAccount() throws Exception {
        Account account = new Account("Checking", new BigDecimal("1000.00"), "CHECKING");
        account.setId(1L);

        when(accountService.getAccountById(1L)).thenReturn(Optional.of(account));

        mockMvc.perform(get("/api/accounts/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Checking"))
                .andExpect(jsonPath("$.balance").value(1000.00));
    }

    @Test
    void getAccountById_WhenNotExists_ShouldReturnNotFound() throws Exception {
        when(accountService.getAccountById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/accounts/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void createAccount_ShouldReturnCreatedAccount() throws Exception {
        AccountDTO accountDTO = new AccountDTO(null, "New Account", new BigDecimal("500.00"), "CHECKING");
        
        Account savedAccount = new Account("New Account", new BigDecimal("500.00"), "CHECKING");
        savedAccount.setId(1L);

        when(accountService.createAccount(any(Account.class))).thenReturn(savedAccount);

        mockMvc.perform(post("/api/accounts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(accountDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("New Account"));
    }

    @Test
    void updateAccount_WhenExists_ShouldReturnUpdatedAccount() throws Exception {
        AccountDTO accountDTO = new AccountDTO(null, "Updated Account", new BigDecimal("2000.00"), "SAVINGS");
        
        Account updatedAccount = new Account("Updated Account", new BigDecimal("2000.00"), "SAVINGS");
        updatedAccount.setId(1L);

        when(accountService.updateAccount(eq(1L), any(Account.class))).thenReturn(Optional.of(updatedAccount));

        mockMvc.perform(put("/api/accounts/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(accountDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Account"));
    }

    @Test
    void deleteAccount_WhenExists_ShouldReturnNoContent() throws Exception {
        when(accountService.deleteAccount(1L)).thenReturn(true);

        mockMvc.perform(delete("/api/accounts/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteAccount_WhenNotExists_ShouldReturnNotFound() throws Exception {
        when(accountService.deleteAccount(999L)).thenReturn(false);

        mockMvc.perform(delete("/api/accounts/999"))
                .andExpect(status().isNotFound());
    }
}
