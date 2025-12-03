package com.moneytree.api;

import com.moneytree.portfolio.PortfolioConfigService;
import com.moneytree.portfolio.PortfolioService;
import com.moneytree.portfolio.entity.Portfolio;
import com.moneytree.portfolio.entity.PortfolioConfig;
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
    private final PortfolioConfigService portfolioConfigService;

    public PortfolioController(PortfolioService portfolioService, 
                               PortfolioConfigService portfolioConfigService) {
        this.portfolioService = portfolioService;
        this.portfolioConfigService = portfolioConfigService;
    }

    @GetMapping
    @Operation(summary = "List all portfolios", description = "Retrieve a list of all active portfolios")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved portfolios")
    public ResponseEntity<List<Portfolio>> listPortfolios() {
        return ResponseEntity.ok(portfolioService.listPortfolios());
    }

    @PostMapping(value = "", consumes = "application/json", produces = "application/json")
    @Operation(summary = "Create a new portfolio", description = "Create a new portfolio with the provided details")
    @ApiResponse(responseCode = "200", description = "Portfolio created successfully")
    public ResponseEntity<Portfolio> createPortfolio(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Portfolio details", required = true)
            @RequestBody Portfolio portfolio) {
        return ResponseEntity.ok(portfolioService.createPortfolio(portfolio));
    }

    @GetMapping("/{id}")
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

    @PutMapping("/{id}")
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
        return portfolioService.updatePortfolio(portfolio)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete portfolio", description = "Delete a portfolio by its ID")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Portfolio deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Portfolio not found")
    })
    public ResponseEntity<Void> deletePortfolio(
            @Parameter(description = "Portfolio ID", required = true) @PathVariable UUID id) {
        if (portfolioService.deletePortfolio(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Portfolio Config Endpoints
    
    @GetMapping("/{id}/config")
    @Operation(summary = "Get portfolio configuration", description = "Retrieve configuration for a specific portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Configuration found"),
        @ApiResponse(responseCode = "404", description = "Configuration not found")
    })
    public ResponseEntity<PortfolioConfig> getPortfolioConfig(
            @Parameter(description = "Portfolio ID", required = true) @PathVariable UUID id) {
        return portfolioConfigService.getPortfolioConfig(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/config")
    @Operation(summary = "Create portfolio configuration", description = "Create configuration for a specific portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Configuration created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request")
    })
    public ResponseEntity<PortfolioConfig> createPortfolioConfig(
            @Parameter(description = "Portfolio ID", required = true) @PathVariable UUID id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Portfolio configuration details", required = true)
            @RequestBody PortfolioConfig config) {
        try {
            return ResponseEntity.ok(portfolioConfigService.createPortfolioConfig(id, config));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/config")
    @Operation(summary = "Update portfolio configuration", description = "Update configuration for a specific portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Configuration updated successfully"),
        @ApiResponse(responseCode = "404", description = "Configuration not found")
    })
    public ResponseEntity<PortfolioConfig> updatePortfolioConfig(
            @Parameter(description = "Portfolio ID", required = true) @PathVariable UUID id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Updated configuration details", required = true)
            @RequestBody PortfolioConfig config) {
        return portfolioConfigService.updatePortfolioConfig(id, config)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}/config")
    @Operation(summary = "Delete portfolio configuration", description = "Delete configuration for a specific portfolio")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Configuration deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Configuration not found")
    })
    public ResponseEntity<Void> deletePortfolioConfig(
            @Parameter(description = "Portfolio ID", required = true) @PathVariable UUID id) {
        if (portfolioConfigService.deletePortfolioConfig(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}


