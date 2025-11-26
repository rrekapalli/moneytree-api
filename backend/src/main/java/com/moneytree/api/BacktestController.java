package com.moneytree.api;

import com.moneytree.backtest.BacktestService;
import com.moneytree.backtest.entity.BacktestRun;
import com.moneytree.backtest.entity.BacktestTrade;
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
@RequestMapping("/api/backtests")
@Tag(name = "Backtest", description = "Backtest management and analysis operations")
public class BacktestController {

    private final BacktestService backtestService;

    public BacktestController(BacktestService backtestService) {
        this.backtestService = backtestService;
    }

    @GetMapping
    @Operation(summary = "List all backtest runs", description = "Retrieve a list of all backtest runs ordered by creation date")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved backtest runs")
    public ResponseEntity<List<BacktestRun>> listBacktests() {
        return ResponseEntity.ok(backtestService.listBacktests());
    }

    @GetMapping("/{runId}")
    @Operation(summary = "Get backtest run by ID", description = "Retrieve a specific backtest run by its UUID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Backtest run found"),
        @ApiResponse(responseCode = "404", description = "Backtest run not found")
    })
    public ResponseEntity<BacktestRun> getBacktestRun(
            @Parameter(description = "Backtest run UUID", required = true) @PathVariable UUID runId) {
        return backtestService.getBacktestRun(runId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{runId}/trades")
    @Operation(summary = "Get trades for a backtest run", description = "Retrieve all trades associated with a specific backtest run")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved trades")
    public ResponseEntity<List<BacktestTrade>> getBacktestTrades(
            @Parameter(description = "Backtest run UUID", required = true) @PathVariable UUID runId) {
        return ResponseEntity.ok(backtestService.getBacktestTrades(runId));
    }

    @PostMapping
    @Operation(summary = "Create a new backtest run", description = "Create a new backtest run with the provided configuration")
    @ApiResponse(responseCode = "200", description = "Backtest run created successfully")
    public ResponseEntity<BacktestRun> createBacktestRun(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Backtest run configuration", required = true)
            @RequestBody BacktestRun backtestRun) {
        return ResponseEntity.ok(backtestService.createBacktestRun(backtestRun));
    }

    @PutMapping("/{runId}")
    @Operation(summary = "Update backtest run", description = "Update an existing backtest run")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Backtest run updated successfully"),
        @ApiResponse(responseCode = "404", description = "Backtest run not found")
    })
    public ResponseEntity<BacktestRun> updateBacktestRun(
            @Parameter(description = "Backtest run UUID", required = true) @PathVariable UUID runId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Updated backtest run details", required = true)
            @RequestBody BacktestRun backtestRun) {
        backtestRun.setRunId(runId);
        return ResponseEntity.ok(backtestService.updateBacktestRun(backtestRun));
    }

    @DeleteMapping("/{runId}")
    @Operation(summary = "Delete backtest run", description = "Delete a backtest run by its UUID")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Backtest run deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Backtest run not found")
    })
    public ResponseEntity<Void> deleteBacktestRun(
            @Parameter(description = "Backtest run UUID", required = true) @PathVariable UUID runId) {
        backtestService.deleteBacktestRun(runId);
        return ResponseEntity.noContent().build();
    }
}


