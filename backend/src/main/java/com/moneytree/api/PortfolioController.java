package com.moneytree.api;

import com.moneytree.portfolio.PortfolioService;
import com.moneytree.portfolio.entity.Portfolio;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/portfolio")
@Tag(name = "Portfolio", description = "Portfolio management operations")
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping
    @Operation(summary = "List all portfolios", description = "Retrieve a list of all active portfolios")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved portfolios")
    public ResponseEntity<List<Portfolio>> listPortfolios() {
        return ResponseEntity.ok(portfolioService.listPortfolios());
    }

    @PostMapping(consumes = "application/json")
    @Operation(summary = "Create a new portfolio", description = "Create a new portfolio with the provided details")
    @ApiResponse(responseCode = "200", description = "Portfolio created successfully")
    public ResponseEntity<Portfolio> createPortfolio(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Portfolio details", required = true)
            @RequestBody Portfolio portfolio) {
        return ResponseEntity.ok(portfolioService.createPortfolio(portfolio));
    }

    @GetMapping("/{id:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}}")
    @Operation(summary = "Get portfolio by ID", description = "Retrieve a specific portfolio by its ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Portfolio found"),
        @ApiResponse(responseCode = "404", description = "Portfolio not found")
    })
    public ResponseEntity<Portfolio> getPortfolio(
            @Parameter(description = "Portfolio ID", required = true) @PathVariable UUID id) {
        return portfolioService.getPortfolio(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}}")
    @Operation(summary = "Update portfolio", description = "Update an existing portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Portfolio updated successfully"),
        @ApiResponse(responseCode = "404", description = "Portfolio not found")
    })
    public ResponseEntity<Portfolio> updatePortfolio(
            @Parameter(description = "Portfolio ID", required = true) @PathVariable UUID id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Updated portfolio details", required = true)
            @RequestBody Portfolio portfolio) {
        portfolio.setId(id);
        return ResponseEntity.ok(portfolioService.updatePortfolio(portfolio));
    }

    @DeleteMapping("/{id:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}}")
    @Operation(summary = "Delete portfolio", description = "Delete a portfolio by its ID")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Portfolio deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Portfolio not found")
    })
    public ResponseEntity<Void> deletePortfolio(
            @Parameter(description = "Portfolio ID", required = true) @PathVariable UUID id) {
        portfolioService.deletePortfolio(id);
        return ResponseEntity.noContent().build();
    }
}


