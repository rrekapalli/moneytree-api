package com.moneytree.api;

import com.moneytree.portfolio.PortfolioStockMetricsDailyService;
import com.moneytree.portfolio.entity.PortfolioStockMetricsDaily;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/portfolio/{portfolioId}/stock-metrics-daily")
@Tag(name = "Portfolio Stock Metrics Daily", description = "Stock-level daily performance metrics")
public class PortfolioStockMetricsDailyController {

    private final PortfolioStockMetricsDailyService service;

    public PortfolioStockMetricsDailyController(PortfolioStockMetricsDailyService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<PortfolioStockMetricsDaily>> listMetrics(
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
    public ResponseEntity<PortfolioStockMetricsDaily> getMetrics(
            @PathVariable UUID portfolioId,
            @PathVariable String symbol,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return service.findByPortfolioIdAndSymbolAndDate(portfolioId, symbol, date)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PortfolioStockMetricsDaily> createMetrics(@PathVariable UUID portfolioId, @RequestBody PortfolioStockMetricsDaily metrics) {
        return ResponseEntity.ok(service.save(metrics));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMetrics(@PathVariable UUID portfolioId, @PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

