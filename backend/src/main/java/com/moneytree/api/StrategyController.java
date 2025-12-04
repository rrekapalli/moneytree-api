package com.moneytree.api;

import com.moneytree.strategy.StrategyConfigService;
import com.moneytree.strategy.StrategyMetricsService;
import com.moneytree.strategy.StrategyService;
import com.moneytree.strategy.entity.Strategy;
import com.moneytree.strategy.entity.StrategyConfig;
import com.moneytree.strategy.entity.StrategyMetrics;
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
@RequestMapping("/api/strategies")
@Tag(name = "Strategy", description = "Strategy management operations")
public class StrategyController {

    private final StrategyService strategyService;
    private final StrategyConfigService strategyConfigService;
    private final StrategyMetricsService strategyMetricsService;

    public StrategyController(StrategyService strategyService, 
                            StrategyConfigService strategyConfigService,
                            StrategyMetricsService strategyMetricsService) {
        this.strategyService = strategyService;
        this.strategyConfigService = strategyConfigService;
        this.strategyMetricsService = strategyMetricsService;
    }

    @GetMapping
    @Operation(summary = "List all strategies for user", description = "Retrieve a list of all strategies for the authenticated user")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved strategies")
    public ResponseEntity<List<Strategy>> listStrategies(
            @Parameter(description = "User ID (optional, defaults to first user for testing)")
            @RequestParam(required = false) UUID userId) {
        
        if (userId != null) {
            return ResponseEntity.ok(strategyService.listStrategiesByUser(userId));
        } else {
            // For testing purposes, return all active strategies
            return ResponseEntity.ok(strategyService.listActiveStrategies());
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get strategy by ID", description = "Retrieve a specific strategy by its ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Strategy found"),
        @ApiResponse(responseCode = "404", description = "Strategy not found")
    })
    public ResponseEntity<Strategy> getStrategy(
            @Parameter(description = "Strategy ID", required = true) @PathVariable UUID id) {
        return strategyService.getStrategy(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(value = "", consumes = "application/json", produces = "application/json")
    @Operation(summary = "Create a new strategy", description = "Create a new strategy with the provided details")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Strategy created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request or validation error")
    })
    public ResponseEntity<?> createStrategy(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Strategy details", required = true)
            @RequestBody Strategy strategy) {
        try {
            Strategy created = strategyService.createStrategy(strategy);
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update strategy", description = "Update an existing strategy")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Strategy updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request or validation error"),
        @ApiResponse(responseCode = "404", description = "Strategy not found")
    })
    public ResponseEntity<?> updateStrategy(
            @Parameter(description = "Strategy ID", required = true) @PathVariable UUID id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Updated strategy details", required = true)
            @RequestBody Strategy strategy) {
        try {
            strategy.setId(id);
            return strategyService.updateStrategy(strategy)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete strategy", description = "Delete a strategy by its ID")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Strategy deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Strategy not found")
    })
    public ResponseEntity<Void> deleteStrategy(
            @Parameter(description = "Strategy ID", required = true) @PathVariable UUID id) {
        if (strategyService.deleteStrategy(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // ========== Strategy Configuration Endpoints ==========

    @GetMapping("/{id}/config")
    @Operation(summary = "Get strategy configuration", description = "Retrieve the configuration for a specific strategy")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Configuration found"),
        @ApiResponse(responseCode = "404", description = "Configuration not found")
    })
    public ResponseEntity<StrategyConfig> getStrategyConfig(
            @Parameter(description = "Strategy ID", required = true) @PathVariable UUID id) {
        return strategyConfigService.getConfig(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/config")
    @Operation(summary = "Update strategy configuration", description = "Create or update the configuration for a strategy")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Configuration updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid configuration or validation error"),
        @ApiResponse(responseCode = "404", description = "Strategy not found")
    })
    public ResponseEntity<?> updateStrategyConfig(
            @Parameter(description = "Strategy ID", required = true) @PathVariable UUID id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Strategy configuration", required = true)
            @RequestBody StrategyConfig config) {
        try {
            StrategyConfig saved = strategyConfigService.saveConfig(id, config);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/validate-config")
    @Operation(summary = "Validate strategy configuration", description = "Validate a strategy configuration without saving it")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Configuration is valid"),
        @ApiResponse(responseCode = "400", description = "Configuration validation failed")
    })
    public ResponseEntity<?> validateStrategyConfig(
            @Parameter(description = "Strategy ID", required = true) @PathVariable UUID id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Strategy configuration to validate", required = true)
            @RequestBody StrategyConfig config) {
        try {
            strategyConfigService.validateConfiguration(config);
            return ResponseEntity.ok().body("{\"valid\": true, \"message\": \"Configuration is valid\"}");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("{\"valid\": false, \"message\": \"" + e.getMessage() + "\"}");
        }
    }

    // ========== Strategy Metrics Endpoints ==========

    @GetMapping("/{id}/metrics")
    @Operation(summary = "Get latest strategy metrics", description = "Retrieve the most recent performance metrics for a strategy")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Metrics found"),
        @ApiResponse(responseCode = "404", description = "Metrics not found")
    })
    public ResponseEntity<StrategyMetrics> getLatestMetrics(
            @Parameter(description = "Strategy ID", required = true) @PathVariable UUID id) {
        return strategyMetricsService.getLatestMetrics(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/metrics/history")
    @Operation(summary = "Get strategy metrics history", description = "Retrieve historical performance metrics for a strategy")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved metrics history")
    public ResponseEntity<List<StrategyMetrics>> getMetricsHistory(
            @Parameter(description = "Strategy ID", required = true) @PathVariable UUID id) {
        List<StrategyMetrics> history = strategyMetricsService.getMetricsHistory(id);
        return ResponseEntity.ok(history);
    }
}
