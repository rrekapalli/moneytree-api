package com.moneytree.api;

import com.moneytree.portfolio.PortfolioTransactionService;
import com.moneytree.portfolio.entity.PortfolioTransaction;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/portfolio/{portfolioId}/transactions")
public class PortfolioTransactionController {

    private final PortfolioTransactionService service;

    public PortfolioTransactionController(PortfolioTransactionService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<PortfolioTransaction>> listTransactions(
            @PathVariable Long portfolioId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        if (startDate != null && endDate != null) {
            return ResponseEntity.ok(service.findByPortfolioIdAndDateRange(portfolioId, startDate, endDate));
        }
        return ResponseEntity.ok(service.findByPortfolioId(portfolioId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PortfolioTransaction> getTransaction(@PathVariable Long portfolioId, @PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PortfolioTransaction> createTransaction(@PathVariable Long portfolioId, @RequestBody PortfolioTransaction transaction) {
        return ResponseEntity.ok(service.save(transaction));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long portfolioId, @PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

