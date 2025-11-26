package com.moneytree.api;

import com.moneytree.portfolio.PortfolioCashFlowService;
import com.moneytree.portfolio.entity.PortfolioCashFlow;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/portfolio/{portfolioId}/cash-flows")
public class PortfolioCashFlowController {

    private final PortfolioCashFlowService service;

    public PortfolioCashFlowController(PortfolioCashFlowService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<PortfolioCashFlow>> listCashFlows(
            @PathVariable Long portfolioId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        if (startDate != null && endDate != null) {
            return ResponseEntity.ok(service.findByPortfolioIdAndDateRange(portfolioId, startDate, endDate));
        }
        return ResponseEntity.ok(service.findByPortfolioId(portfolioId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PortfolioCashFlow> getCashFlow(@PathVariable Long portfolioId, @PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PortfolioCashFlow> createCashFlow(@PathVariable Long portfolioId, @RequestBody PortfolioCashFlow cashFlow) {
        return ResponseEntity.ok(service.save(cashFlow));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCashFlow(@PathVariable Long portfolioId, @PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

