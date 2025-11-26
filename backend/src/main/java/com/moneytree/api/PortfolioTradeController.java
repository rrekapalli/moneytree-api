package com.moneytree.api;

import com.moneytree.portfolio.PortfolioTradeService;
import com.moneytree.portfolio.entity.PortfolioTrade;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/portfolio/{portfolioId}/trades")
@Tag(name = "Portfolio Trades", description = "Completed trade records for portfolio analysis")
public class PortfolioTradeController {

    private final PortfolioTradeService service;

    public PortfolioTradeController(PortfolioTradeService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<PortfolioTrade>> listTrades(
            @PathVariable UUID portfolioId,
            @RequestParam(required = false) String symbol) {
        if (symbol != null) {
            return ResponseEntity.ok(service.findByPortfolioIdAndSymbol(portfolioId, symbol));
        }
        return ResponseEntity.ok(service.findByPortfolioId(portfolioId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PortfolioTrade> getTrade(@PathVariable UUID portfolioId, @PathVariable UUID id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PortfolioTrade> createTrade(@PathVariable UUID portfolioId, @RequestBody PortfolioTrade trade) {
        return ResponseEntity.ok(service.save(trade));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PortfolioTrade> updateTrade(@PathVariable UUID portfolioId, @PathVariable UUID id, @RequestBody PortfolioTrade trade) {
        trade.setTradeId(id);
        return ResponseEntity.ok(service.save(trade));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrade(@PathVariable UUID portfolioId, @PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

