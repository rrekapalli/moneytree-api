package com.moneytree.api;

import com.moneytree.backtest.BacktestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/backtests")
public class BacktestController {

    private final BacktestService backtestService;

    public BacktestController(BacktestService backtestService) {
        this.backtestService = backtestService;
    }

    @GetMapping
    public ResponseEntity<?> listBacktests() {
        return ResponseEntity.ok(backtestService.listBacktests());
    }
}


