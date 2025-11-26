package com.moneytree.api;

import com.moneytree.portfolio.PortfolioMetricsDailyService;
import com.moneytree.portfolio.entity.PortfolioMetricsDaily;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/portfolio/{portfolioId}/metrics-daily")
public class PortfolioMetricsDailyController {

    private final PortfolioMetricsDailyService service;

    public PortfolioMetricsDailyController(PortfolioMetricsDailyService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<PortfolioMetricsDaily>> listMetrics(
            @PathVariable Long portfolioId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        if (startDate != null && endDate != null) {
            return ResponseEntity.ok(service.findByPortfolioIdAndDateRange(portfolioId, startDate, endDate));
        }
        return ResponseEntity.ok(service.findByPortfolioId(portfolioId));
    }

    @GetMapping("/{date}")
    public ResponseEntity<PortfolioMetricsDaily> getMetrics(
            @PathVariable Long portfolioId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return service.findByPortfolioIdAndDate(portfolioId, date)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PortfolioMetricsDaily> createMetrics(@PathVariable Long portfolioId, @RequestBody PortfolioMetricsDaily metrics) {
        return ResponseEntity.ok(service.save(metrics));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMetrics(@PathVariable Long portfolioId, @PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

