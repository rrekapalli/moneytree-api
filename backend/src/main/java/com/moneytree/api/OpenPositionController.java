package com.moneytree.api;

import com.moneytree.portfolio.OpenPositionService;
import com.moneytree.portfolio.entity.OpenPosition;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/portfolio/{portfolioId}/open-positions")
@Tag(name = "Open Positions", description = "Open trading position management operations")
public class OpenPositionController {

    private final OpenPositionService service;

    public OpenPositionController(OpenPositionService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "List open positions", description = "Retrieve all open positions for a portfolio")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved open positions")
    public ResponseEntity<List<OpenPosition>> listOpenPositions(
            @Parameter(description = "Portfolio ID", required = true) @PathVariable UUID portfolioId) {
        return ResponseEntity.ok(service.findByPortfolioId(portfolioId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get open position by ID", description = "Retrieve a specific open position by its ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Position found"),
        @ApiResponse(responseCode = "404", description = "Position not found")
    })
    public ResponseEntity<OpenPosition> getOpenPosition(
            @Parameter(description = "Portfolio ID", required = true) @PathVariable UUID portfolioId,
            @Parameter(description = "Position ID", required = true) @PathVariable UUID id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/symbol/{symbol}")
    @Operation(summary = "Get open position by symbol", description = "Retrieve an open position by trading symbol")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Position found"),
        @ApiResponse(responseCode = "404", description = "Position not found")
    })
    public ResponseEntity<OpenPosition> getOpenPositionBySymbol(
            @Parameter(description = "Portfolio ID", required = true) @PathVariable UUID portfolioId,
            @Parameter(description = "Trading symbol", required = true, example = "RELIANCE") @PathVariable String symbol) {
        return service.findByPortfolioIdAndSymbol(portfolioId, symbol)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<OpenPosition> createOpenPosition(@PathVariable UUID portfolioId, @RequestBody OpenPosition position) {
        return ResponseEntity.ok(service.save(position));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OpenPosition> updateOpenPosition(@PathVariable UUID portfolioId, @PathVariable UUID id, @RequestBody OpenPosition position) {
        position.setPositionId(id);
        return ResponseEntity.ok(service.save(position));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOpenPosition(@PathVariable UUID portfolioId, @PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/symbol/{symbol}")
    public ResponseEntity<Void> deleteOpenPositionBySymbol(@PathVariable UUID portfolioId, @PathVariable String symbol) {
        service.deleteByPortfolioIdAndSymbol(portfolioId, symbol);
        return ResponseEntity.noContent().build();
    }
}

