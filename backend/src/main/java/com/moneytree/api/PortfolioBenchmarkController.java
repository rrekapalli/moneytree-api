package com.moneytree.api;

import com.moneytree.portfolio.PortfolioBenchmarkService;
import com.moneytree.portfolio.entity.PortfolioBenchmark;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolio/{portfolioId}/benchmarks")
@Tag(name = "Portfolio Benchmarks", description = "Portfolio benchmark index management")
public class PortfolioBenchmarkController {

    private final PortfolioBenchmarkService service;

    public PortfolioBenchmarkController(PortfolioBenchmarkService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<PortfolioBenchmark>> listBenchmarks(@PathVariable Long portfolioId) {
        return ResponseEntity.ok(service.findByPortfolioId(portfolioId));
    }

    @GetMapping("/{indexName}")
    public ResponseEntity<PortfolioBenchmark> getBenchmark(@PathVariable Long portfolioId, @PathVariable String indexName) {
        return service.findById(portfolioId, indexName)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PortfolioBenchmark> createBenchmark(@PathVariable Long portfolioId, @RequestBody PortfolioBenchmark benchmark) {
        return ResponseEntity.ok(service.save(benchmark));
    }

    @DeleteMapping("/{indexName}")
    public ResponseEntity<Void> deleteBenchmark(@PathVariable Long portfolioId, @PathVariable String indexName) {
        service.deleteById(portfolioId, indexName);
        return ResponseEntity.noContent().build();
    }
}

