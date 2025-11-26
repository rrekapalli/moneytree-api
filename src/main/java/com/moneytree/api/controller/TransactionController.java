package com.moneytree.api.controller;

import com.moneytree.api.dto.TransactionDTO;
import com.moneytree.api.model.Account;
import com.moneytree.api.model.Transaction;
import com.moneytree.api.service.AccountService;
import com.moneytree.api.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;
    private final AccountService accountService;

    public TransactionController(TransactionService transactionService, AccountService accountService) {
        this.transactionService = transactionService;
        this.accountService = accountService;
    }

    @GetMapping
    public ResponseEntity<List<TransactionDTO>> getAllTransactions() {
        List<TransactionDTO> transactions = transactionService.getAllTransactions().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionDTO> getTransactionById(@PathVariable Long id) {
        return transactionService.getTransactionById(id)
                .map(transaction -> ResponseEntity.ok(convertToDTO(transaction)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<TransactionDTO> createTransaction(@Valid @RequestBody TransactionDTO transactionDTO) {
        Optional<Account> accountOpt = accountService.getAccountById(transactionDTO.getAccountId());
        if (accountOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Transaction transaction = convertToEntity(transactionDTO, accountOpt.get());
        Transaction created = transactionService.createTransaction(transaction);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionDTO> updateTransaction(@PathVariable Long id, @Valid @RequestBody TransactionDTO transactionDTO) {
        Optional<Account> accountOpt = accountService.getAccountById(transactionDTO.getAccountId());
        if (accountOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Transaction transaction = convertToEntity(transactionDTO, accountOpt.get());
        return transactionService.updateTransaction(id, transaction)
                .map(updated -> ResponseEntity.ok(convertToDTO(updated)))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        if (transactionService.deleteTransaction(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<TransactionDTO>> getTransactionsByAccount(@PathVariable Long accountId) {
        List<TransactionDTO> transactions = transactionService.getTransactionsByAccountId(accountId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/type/{transactionType}")
    public ResponseEntity<List<TransactionDTO>> getTransactionsByType(@PathVariable String transactionType) {
        List<TransactionDTO> transactions = transactionService.getTransactionsByType(transactionType).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<TransactionDTO>> getTransactionsByCategory(@PathVariable String category) {
        List<TransactionDTO> transactions = transactionService.getTransactionsByCategory(category).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/daterange")
    public ResponseEntity<List<TransactionDTO>> getTransactionsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<TransactionDTO> transactions = transactionService.getTransactionsByDateRange(start, end).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(transactions);
    }

    private TransactionDTO convertToDTO(Transaction transaction) {
        return new TransactionDTO(
                transaction.getId(),
                transaction.getAmount(),
                transaction.getDescription(),
                transaction.getTransactionType(),
                transaction.getCategory(),
                transaction.getAccount().getId(),
                transaction.getTransactionDate()
        );
    }

    private Transaction convertToEntity(TransactionDTO dto, Account account) {
        Transaction transaction = new Transaction();
        transaction.setAmount(dto.getAmount());
        transaction.setDescription(dto.getDescription());
        transaction.setTransactionType(dto.getTransactionType());
        transaction.setCategory(dto.getCategory());
        transaction.setAccount(account);
        transaction.setTransactionDate(dto.getTransactionDate());
        return transaction;
    }
}
