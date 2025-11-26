package com.moneytree.api.service;

import com.moneytree.api.model.Account;
import com.moneytree.api.repository.AccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AccountService {

    private final AccountRepository accountRepository;

    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    public Optional<Account> getAccountById(Long id) {
        return accountRepository.findById(id);
    }

    public Account createAccount(Account account) {
        return accountRepository.save(account);
    }

    public Optional<Account> updateAccount(Long id, Account accountDetails) {
        return accountRepository.findById(id)
                .map(account -> {
                    account.setName(accountDetails.getName());
                    account.setBalance(accountDetails.getBalance());
                    account.setAccountType(accountDetails.getAccountType());
                    return accountRepository.save(account);
                });
    }

    public boolean deleteAccount(Long id) {
        return accountRepository.findById(id)
                .map(account -> {
                    accountRepository.delete(account);
                    return true;
                })
                .orElse(false);
    }

    public List<Account> getAccountsByType(String accountType) {
        return accountRepository.findByAccountType(accountType);
    }

    public Optional<Account> updateBalance(Long id, BigDecimal amount) {
        return accountRepository.findById(id)
                .map(account -> {
                    account.setBalance(account.getBalance().add(amount));
                    return accountRepository.save(account);
                });
    }
}
