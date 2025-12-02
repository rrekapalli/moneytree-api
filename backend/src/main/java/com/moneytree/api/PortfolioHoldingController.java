package com.moneytree.api;

import com.moneytree.portfolio.PortfolioHoldingService;
import com.moneytree.portfolio.dto.PortfolioHoldingDto;
import com.moneytree.portfolio.entity.PortfolioHolding;
import com.moneytree.portfolio.entity.PortfolioHoldingSummary;
import com.moneytree.portfolio.mapper.PortfolioHoldingMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/portfolio/{portfolioId}/holdings")
@Tag(name = "Portfolio Holdings", description = "Portfolio holdings management")
public class PortfolioHoldingController {

    private final PortfolioHoldingService service;

    public PortfolioHoldingController(PortfolioHoldingService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Get portfolio holdings summary", 
               description = "Returns comprehensive holdings summary from portfolio_holdings_summary view including open positions, metrics, and trade statistics")
    public ResponseEntity<List<PortfolioHoldingDto>> listHoldings(@PathVariable UUID portfolioId) {
        List<PortfolioHoldingSummary> summaries = service.findSummaryByPortfolioId(portfolioId);
        List<PortfolioHoldingDto> dtos = summaries.stream()
                .map(PortfolioHoldingMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
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

    @PatchMapping("/{symbol}")
    @Operation(summary = "Update holding by symbol", 
               description = "Updates quantity, avgCost, takeProfit, and stopLoss for a specific holding")
    public ResponseEntity<Void> updateHoldingBySymbol(
            @PathVariable UUID portfolioId, 
            @PathVariable String symbol, 
            @RequestBody com.moneytree.portfolio.dto.PortfolioHoldingUpdateRequest request) {
        service.updateHolding(portfolioId, symbol, request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHolding(@PathVariable UUID portfolioId, @PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

