package com.moneytree.api.service;

import com.moneytree.api.model.Account;
import com.moneytree.api.model.Transaction;
import com.moneytree.api.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountService accountService;

    public TransactionService(TransactionRepository transactionRepository, AccountService accountService) {
        this.transactionRepository = transactionRepository;
        this.accountService = accountService;
    }

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    public Optional<Transaction> getTransactionById(Long id) {
        return transactionRepository.findById(id);
    }

    public Transaction createTransaction(Transaction transaction) {
        Transaction saved = transactionRepository.save(transaction);

        BigDecimal amount = transaction.getAmount();
        if ("EXPENSE".equalsIgnoreCase(transaction.getTransactionType())) {
            amount = amount.negate();
        }
        accountService.updateBalance(transaction.getAccount().getId(), amount);

        return saved;
    }

    public Optional<Transaction> updateTransaction(Long id, Transaction transactionDetails) {
        return transactionRepository.findById(id)
                .map(transaction -> {
                    transaction.setAmount(transactionDetails.getAmount());
                    transaction.setDescription(transactionDetails.getDescription());
                    transaction.setTransactionType(transactionDetails.getTransactionType());
                    transaction.setCategory(transactionDetails.getCategory());
                    transaction.setTransactionDate(transactionDetails.getTransactionDate());
                    return transactionRepository.save(transaction);
                });
    }

    public boolean deleteTransaction(Long id) {
        return transactionRepository.findById(id)
                .map(transaction -> {
                    transactionRepository.delete(transaction);
                    return true;
                })
                .orElse(false);
    }

    public List<Transaction> getTransactionsByAccountId(Long accountId) {
        return transactionRepository.findByAccountId(accountId);
    }

    public List<Transaction> getTransactionsByType(String transactionType) {
        return transactionRepository.findByTransactionType(transactionType);
    }

    public List<Transaction> getTransactionsByCategory(String category) {
        return transactionRepository.findByCategory(category);
    }

    public List<Transaction> getTransactionsByDateRange(LocalDateTime start, LocalDateTime end) {
        return transactionRepository.findByTransactionDateBetween(start, end);
    }

    public List<Transaction> getTransactionsByAccountAndDateRange(Long accountId, LocalDateTime start, LocalDateTime end) {
        return transactionRepository.findByAccountIdAndTransactionDateBetween(accountId, start, end);
    }
}
