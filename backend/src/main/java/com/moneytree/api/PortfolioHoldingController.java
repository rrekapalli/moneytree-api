package com.moneytree.api;

import com.moneytree.portfolio.PortfolioHoldingService;
import com.moneytree.portfolio.entity.PortfolioHolding;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/portfolio/{portfolioId}/holdings")
@Tag(name = "Portfolio Holdings", description = "Portfolio holdings management")
public class PortfolioHoldingController {

    private final PortfolioHoldingService service;

    public PortfolioHoldingController(PortfolioHoldingService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<PortfolioHolding>> listHoldings(@PathVariable UUID portfolioId) {
        return ResponseEntity.ok(service.findByPortfolioId(portfolioId));
    }

    @GetMapping("/{symbol}")
    public ResponseEntity<PortfolioHolding> getHolding(@PathVariable UUID portfolioId, @PathVariable String symbol) {
        return service.findByPortfolioIdAndSymbol(portfolioId, symbol)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PortfolioHolding> createHolding(@PathVariable UUID portfolioId, @RequestBody PortfolioHolding holding) {
        return ResponseEntity.ok(service.save(holding));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PortfolioHolding> updateHolding(@PathVariable UUID portfolioId, @PathVariable UUID id, @RequestBody PortfolioHolding holding) {
        holding.setId(id);
        return ResponseEntity.ok(service.save(holding));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHolding(@PathVariable UUID portfolioId, @PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

