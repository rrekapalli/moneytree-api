package com.moneytree.api;

import com.moneytree.portfolio.PortfolioTradeLogService;
import com.moneytree.portfolio.entity.PortfolioTradeLog;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/portfolio/{portfolioId}/trade-logs")
@Tag(name = "Portfolio Trade Logs", description = "Trade evaluation and cycle logging")
public class PortfolioTradeLogController {

    private final PortfolioTradeLogService service;

    public PortfolioTradeLogController(PortfolioTradeLogService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<PortfolioTradeLog>> listTradeLogs(
            @PathVariable UUID portfolioId,
            @RequestParam(required = false) String symbol) {
        if (symbol != null) {
            return ResponseEntity.ok(service.findByPortfolioIdAndSymbol(portfolioId, symbol));
        }
        return ResponseEntity.ok(service.findByPortfolioId(portfolioId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PortfolioTradeLog> getTradeLog(@PathVariable UUID portfolioId, @PathVariable UUID id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PortfolioTradeLog> createTradeLog(@PathVariable UUID portfolioId, @RequestBody PortfolioTradeLog tradeLog) {
        return ResponseEntity.ok(service.save(tradeLog));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTradeLog(@PathVariable UUID portfolioId, @PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

