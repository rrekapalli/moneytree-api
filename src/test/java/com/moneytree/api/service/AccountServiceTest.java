package com.moneytree.api.service;

import com.moneytree.api.model.Account;
import com.moneytree.api.repository.AccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @InjectMocks
    private AccountService accountService;

    private Account testAccount;

    @BeforeEach
    void setUp() {
        testAccount = new Account("Test Account", new BigDecimal("1000.00"), "CHECKING");
        testAccount.setId(1L);
    }

    @Test
    void getAllAccounts_ShouldReturnAllAccounts() {
        Account account2 = new Account("Account 2", new BigDecimal("2000.00"), "SAVINGS");
        account2.setId(2L);

        when(accountRepository.findAll()).thenReturn(Arrays.asList(testAccount, account2));

        List<Account> accounts = accountService.getAllAccounts();

        assertThat(accounts).hasSize(2);
        verify(accountRepository, times(1)).findAll();
    }

    @Test
    void getAccountById_WhenExists_ShouldReturnAccount() {
        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));

        Optional<Account> result = accountService.getAccountById(1L);

        assertThat(result).isPresent();
        assertThat(result.get().getName()).isEqualTo("Test Account");
    }

    @Test
    void getAccountById_WhenNotExists_ShouldReturnEmpty() {
        when(accountRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<Account> result = accountService.getAccountById(999L);

        assertThat(result).isEmpty();
    }

    @Test
    void createAccount_ShouldSaveAndReturnAccount() {
        when(accountRepository.save(any(Account.class))).thenReturn(testAccount);

        Account result = accountService.createAccount(testAccount);

        assertThat(result.getName()).isEqualTo("Test Account");
        verify(accountRepository, times(1)).save(testAccount);
    }

    @Test
    void updateAccount_WhenExists_ShouldUpdateAndReturnAccount() {
        Account updatedDetails = new Account("Updated Name", new BigDecimal("2000.00"), "SAVINGS");
        
        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));
        when(accountRepository.save(any(Account.class))).thenReturn(testAccount);

        Optional<Account> result = accountService.updateAccount(1L, updatedDetails);

        assertThat(result).isPresent();
        verify(accountRepository, times(1)).save(any(Account.class));
    }

    @Test
    void updateAccount_WhenNotExists_ShouldReturnEmpty() {
        when(accountRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<Account> result = accountService.updateAccount(999L, testAccount);

        assertThat(result).isEmpty();
    }

    @Test
    void deleteAccount_WhenExists_ShouldReturnTrue() {
        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));

        boolean result = accountService.deleteAccount(1L);

        assertThat(result).isTrue();
        verify(accountRepository, times(1)).delete(testAccount);
    }

    @Test
    void deleteAccount_WhenNotExists_ShouldReturnFalse() {
        when(accountRepository.findById(999L)).thenReturn(Optional.empty());

        boolean result = accountService.deleteAccount(999L);

        assertThat(result).isFalse();
    }

    @Test
    void updateBalance_ShouldAddAmountToBalance() {
        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));
        when(accountRepository.save(any(Account.class))).thenReturn(testAccount);

        Optional<Account> result = accountService.updateBalance(1L, new BigDecimal("500.00"));

        assertThat(result).isPresent();
        verify(accountRepository, times(1)).save(any(Account.class));
    }
}
