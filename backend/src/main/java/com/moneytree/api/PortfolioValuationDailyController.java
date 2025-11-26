package com.moneytree.api;

import com.moneytree.portfolio.PortfolioValuationDailyService;
import com.moneytree.portfolio.entity.PortfolioValuationDaily;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/portfolio/{portfolioId}/valuations-daily")
public class PortfolioValuationDailyController {

    private final PortfolioValuationDailyService service;

    public PortfolioValuationDailyController(PortfolioValuationDailyService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<PortfolioValuationDaily>> listValuations(
            @PathVariable Long portfolioId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        if (startDate != null && endDate != null) {
            return ResponseEntity.ok(service.findByPortfolioIdAndDateRange(portfolioId, startDate, endDate));
        }
        return ResponseEntity.ok(service.findByPortfolioId(portfolioId));
    }

    @GetMapping("/{date}")
    public ResponseEntity<PortfolioValuationDaily> getValuation(
            @PathVariable Long portfolioId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return service.findByPortfolioIdAndDate(portfolioId, date)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PortfolioValuationDaily> createValuation(@PathVariable Long portfolioId, @RequestBody PortfolioValuationDaily valuation) {
        return ResponseEntity.ok(service.save(valuation));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteValuation(@PathVariable Long portfolioId, @PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

