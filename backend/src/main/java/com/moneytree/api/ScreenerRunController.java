package com.moneytree.api;

import com.moneytree.screener.ScreenerRunService;
import com.moneytree.screener.entity.ScreenerRun;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/screeners/{screenerId}/runs")
public class ScreenerRunController {

    private final ScreenerRunService service;

    public ScreenerRunController(ScreenerRunService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ScreenerRun>> listRuns(
            @PathVariable Long screenerId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate tradingDay) {
        if (status != null) {
            return ResponseEntity.ok(service.findByStatus(status));
        }
        if (tradingDay != null) {
            return ResponseEntity.ok(service.findByRunForTradingDay(tradingDay));
        }
        return ResponseEntity.ok(service.findByScreenerId(screenerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScreenerRun> getRun(@PathVariable Long screenerId, @PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ScreenerRun> createRun(@PathVariable Long screenerId, @RequestBody ScreenerRun run) {
        return ResponseEntity.ok(service.save(run));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ScreenerRun> updateRun(@PathVariable Long screenerId, @PathVariable Long id, @RequestBody ScreenerRun run) {
        run.setScreenerRunId(id);
        return ResponseEntity.ok(service.save(run));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRun(@PathVariable Long screenerId, @PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

