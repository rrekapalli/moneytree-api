package com.moneytree.api;

import com.moneytree.screener.ScreenerAlertService;
import com.moneytree.screener.entity.ScreenerAlert;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/screeners/{screenerId}/alerts")
@Tag(name = "Screener Alerts", description = "Screener alert configuration and management")
public class ScreenerAlertController {

    private final ScreenerAlertService service;

    public ScreenerAlertController(ScreenerAlertService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ScreenerAlert>> listAlerts(@PathVariable Long screenerId) {
        return ResponseEntity.ok(service.findByScreenerId(screenerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScreenerAlert> getAlert(@PathVariable Long screenerId, @PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ScreenerAlert> createAlert(@PathVariable Long screenerId, @RequestBody ScreenerAlert alert) {
        return ResponseEntity.ok(service.save(alert));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlert(@PathVariable Long screenerId, @PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

