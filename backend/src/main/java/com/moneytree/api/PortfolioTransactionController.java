package com.moneytree.api;

import com.moneytree.portfolio.PortfolioTransactionService;
import com.moneytree.portfolio.entity.PortfolioTransaction;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/portfolio/{portfolioId}/transactions")
@Tag(name = "Portfolio Transactions", description = "Portfolio transaction management operations")
public class PortfolioTransactionController {

    private final PortfolioTransactionService service;

    public PortfolioTransactionController(PortfolioTransactionService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "List portfolio transactions", description = "Retrieve all transactions for a portfolio, optionally filtered by date range")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved transactions")
    public ResponseEntity<List<PortfolioTransaction>> listTransactions(
            @Parameter(description = "Portfolio ID", required = true) @PathVariable Long portfolioId,
            @Parameter(description = "Start date (ISO format)", example = "2024-01-01")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date (ISO format)", example = "2024-12-31")
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

