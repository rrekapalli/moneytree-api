package com.moneytree.api;

import com.moneytree.portfolio.OpenPositionService;
import com.moneytree.portfolio.entity.OpenPosition;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolio/{portfolioId}/open-positions")
public class OpenPositionController {

    private final OpenPositionService service;

    public OpenPositionController(OpenPositionService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<OpenPosition>> listOpenPositions(@PathVariable Long portfolioId) {
        return ResponseEntity.ok(service.findByPortfolioId(portfolioId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OpenPosition> getOpenPosition(@PathVariable Long portfolioId, @PathVariable Integer id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/symbol/{symbol}")
    public ResponseEntity<OpenPosition> getOpenPositionBySymbol(@PathVariable Long portfolioId, @PathVariable String symbol) {
        return service.findByPortfolioIdAndSymbol(portfolioId, symbol)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<OpenPosition> createOpenPosition(@PathVariable Long portfolioId, @RequestBody OpenPosition position) {
        return ResponseEntity.ok(service.save(position));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OpenPosition> updateOpenPosition(@PathVariable Long portfolioId, @PathVariable Integer id, @RequestBody OpenPosition position) {
        position.setPositionId(id);
        return ResponseEntity.ok(service.save(position));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOpenPosition(@PathVariable Long portfolioId, @PathVariable Integer id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/symbol/{symbol}")
    public ResponseEntity<Void> deleteOpenPositionBySymbol(@PathVariable Long portfolioId, @PathVariable String symbol) {
        service.deleteByPortfolioIdAndSymbol(portfolioId, symbol);
        return ResponseEntity.noContent().build();
    }
}

