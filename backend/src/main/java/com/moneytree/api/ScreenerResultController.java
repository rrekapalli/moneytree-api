package com.moneytree.api;

import com.moneytree.screener.ScreenerResultService;
import com.moneytree.screener.entity.ScreenerResult;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/screener-runs/{screenerRunId}/results")
@Tag(name = "Screener Results", description = "Results from screener execution runs")
public class ScreenerResultController {

    private final ScreenerResultService service;

    public ScreenerResultController(ScreenerResultService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ScreenerResult>> listResults(
            @PathVariable UUID screenerRunId,
            @RequestParam(required = false) Boolean matched,
            @RequestParam(required = false, defaultValue = "rank") String sortBy) {
        if (matched != null) {
            return ResponseEntity.ok(service.findByScreenerRunIdAndMatched(screenerRunId, matched));
        }
        if ("score".equals(sortBy)) {
            return ResponseEntity.ok(service.findByScreenerRunIdOrderByScore(screenerRunId));
        }
        return ResponseEntity.ok(service.findByScreenerRunId(screenerRunId));
    }

    @GetMapping("/{symbol}")
    public ResponseEntity<ScreenerResult> getResult(@PathVariable UUID screenerRunId, @PathVariable String symbol) {
        return service.findById(screenerRunId, symbol)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ScreenerResult> createResult(@PathVariable UUID screenerRunId, @RequestBody ScreenerResult result) {
        return ResponseEntity.ok(service.save(result));
    }

    @DeleteMapping("/{symbol}")
    public ResponseEntity<Void> deleteResult(@PathVariable UUID screenerRunId, @PathVariable String symbol) {
        service.deleteById(screenerRunId, symbol);
        return ResponseEntity.noContent().build();
    }
}

