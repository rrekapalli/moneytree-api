package com.moneytree.api;

import com.moneytree.backtest.BacktestService;
import com.moneytree.backtest.entity.BacktestRun;
import com.moneytree.backtest.entity.BacktestTrade;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/strategies")
@Tag(name = "Strategy", description = "Strategy management operations")
public class StrategyController {

    private final StrategyService strategyService;
    private final StrategyConfigService strategyConfigService;
    private final StrategyMetricsService strategyMetricsService;
    private final BacktestService backtestService;

    public StrategyController(StrategyService strategyService, 
                            StrategyConfigService strategyConfigService,
                            StrategyMetricsService strategyMetricsService,
                            BacktestService backtestService) {
        this.strategyService = strategyService;
        this.strategyConfigService = strategyConfigService;
        this.strategyMetricsService = strategyMetricsService;
        this.backtestService = backtestService;
    }

    @GetMapping
    @Operation(summary = "List all strategies for user", description = "Retrieve a list of all strategies for the authenticated user")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved strategies")
    public ResponseEntity<List<Strategy>> listStrategies(
            @Parameter(description = "User ID (optional, defaults to all strategies for testing)")
            @RequestParam(required = false) UUID userId) {
        
        if (userId != null) {
            return ResponseEntity.ok(strategyService.listStrategiesByUser(userId));
        } else {
            // For testing purposes, return all strategies (both active and inactive)
            return ResponseEntity.ok(strategyService.listAllStrategies());
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

    // ========== Backtest Endpoints ==========

    @PostMapping("/{id}/backtest")
    @Operation(summary = "Trigger backtest execution", description = "Initiate a backtest run for a strategy with specified parameters")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Backtest initiated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid backtest parameters or validation error"),
        @ApiResponse(responseCode = "404", description = "Strategy not found")
    })
    public ResponseEntity<?> triggerBacktest(
            @Parameter(description = "Strategy ID", required = true) @PathVariable UUID id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Backtest parameters", required = true)
            @RequestBody Map<String, Object> params) {
        try {
            // Extract parameters from request body
            LocalDate startDate = LocalDate.parse((String) params.get("startDate"));
            LocalDate endDate = LocalDate.parse((String) params.get("endDate"));
            BigDecimal initialCapital = new BigDecimal(params.get("initialCapital").toString());
            String symbol = params.containsKey("symbol") ? (String) params.get("symbol") : null;
            
            BacktestRun run = backtestService.triggerBacktest(id, startDate, endDate, initialCapital, symbol);
            return ResponseEntity.ok(run);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid backtest parameters: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/backtests")
    @Operation(summary = "List all backtests for strategy", description = "Retrieve all backtest runs for a specific strategy")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Successfully retrieved backtests"),
        @ApiResponse(responseCode = "400", description = "Strategy not found")
    })
    public ResponseEntity<?> getBacktestsByStrategy(
            @Parameter(description = "Strategy ID", required = true) @PathVariable UUID id) {
        try {
            List<BacktestRun> backtests = backtestService.getBacktestsByStrategy(id);
            return ResponseEntity.ok(backtests);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/backtests/{runId}")
    @Operation(summary = "Get backtest run details", description = "Retrieve detailed information about a specific backtest run")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Backtest run found"),
        @ApiResponse(responseCode = "404", description = "Backtest run not found")
    })
    public ResponseEntity<BacktestRun> getBacktestRun(
            @Parameter(description = "Backtest run ID", required = true) @PathVariable UUID runId) {
        return backtestService.getBacktestRun(runId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/backtests/{runId}/trades")
    @Operation(summary = "Get backtest trades", description = "Retrieve all trades for a specific backtest run")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved backtest trades")
    public ResponseEntity<List<BacktestTrade>> getBacktestTrades(
            @Parameter(description = "Backtest run ID", required = true) @PathVariable UUID runId) {
        List<BacktestTrade> trades = backtestService.getBacktestTrades(runId);
        return ResponseEntity.ok(trades);
    }
}
