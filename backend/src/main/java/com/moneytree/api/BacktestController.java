package com.moneytree.api;

import com.moneytree.backtest.BacktestService;
import com.moneytree.backtest.entity.BacktestRun;
import com.moneytree.backtest.entity.BacktestTrade;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/backtests")
public class BacktestController {

    private final BacktestService backtestService;

    public BacktestController(BacktestService backtestService) {
        this.backtestService = backtestService;
    }

    @GetMapping
    public ResponseEntity<List<BacktestRun>> listBacktests() {
        return ResponseEntity.ok(backtestService.listBacktests());
    }

    @GetMapping("/{runId}")
    public ResponseEntity<BacktestRun> getBacktestRun(@PathVariable UUID runId) {
        return backtestService.getBacktestRun(runId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{runId}/trades")
    public ResponseEntity<List<BacktestTrade>> getBacktestTrades(@PathVariable UUID runId) {
        return ResponseEntity.ok(backtestService.getBacktestTrades(runId));
    }

    @PostMapping
    public ResponseEntity<BacktestRun> createBacktestRun(@RequestBody BacktestRun backtestRun) {
        return ResponseEntity.ok(backtestService.createBacktestRun(backtestRun));
    }

    @PutMapping("/{runId}")
    public ResponseEntity<BacktestRun> updateBacktestRun(@PathVariable UUID runId, @RequestBody BacktestRun backtestRun) {
        backtestRun.setRunId(runId);
        return ResponseEntity.ok(backtestService.updateBacktestRun(backtestRun));
    }

    @DeleteMapping("/{runId}")
    public ResponseEntity<Void> deleteBacktestRun(@PathVariable UUID runId) {
        backtestService.deleteBacktestRun(runId);
        return ResponseEntity.noContent().build();
    }
}


