package com.moneytree.api;

import com.moneytree.portfolio.PortfolioHoldingValuationDailyService;
import com.moneytree.portfolio.entity.PortfolioHoldingValuationDaily;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/portfolio/{portfolioId}/holding-valuations")
@Tag(name = "Portfolio Holding Valuations", description = "Daily holding-level valuation and PnL metrics")
public class PortfolioHoldingValuationDailyController {

    private final PortfolioHoldingValuationDailyService service;

    public PortfolioHoldingValuationDailyController(PortfolioHoldingValuationDailyService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<PortfolioHoldingValuationDaily>> listValuations(
            @PathVariable UUID portfolioId,
            @RequestParam(required = false) String symbol,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        if (symbol != null) {
            return ResponseEntity.ok(service.findByPortfolioIdAndSymbol(portfolioId, symbol));
        }
        if (startDate != null && endDate != null) {
            return ResponseEntity.ok(service.findByPortfolioIdAndDateRange(portfolioId, startDate, endDate));
        }
        return ResponseEntity.ok(service.findByPortfolioId(portfolioId));
    }

    @GetMapping("/{symbol}/{date}")
    public ResponseEntity<PortfolioHoldingValuationDaily> getValuation(
            @PathVariable UUID portfolioId,
            @PathVariable String symbol,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return service.findByPortfolioIdAndSymbolAndDate(portfolioId, symbol, date)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PortfolioHoldingValuationDaily> createValuation(@PathVariable UUID portfolioId, @RequestBody PortfolioHoldingValuationDaily valuation) {
        return ResponseEntity.ok(service.save(valuation));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteValuation(@PathVariable UUID portfolioId, @PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

