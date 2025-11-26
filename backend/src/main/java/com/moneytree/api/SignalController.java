package com.moneytree.api;

import com.moneytree.signal.SignalService;
import com.moneytree.signal.entity.Signal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/signals")
public class SignalController {

    private final SignalService signalService;

    public SignalController(SignalService signalService) {
        this.signalService = signalService;
    }

    @GetMapping
    public ResponseEntity<List<Signal>> listSignals() {
        return ResponseEntity.ok(signalService.listSignals());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Signal> getSignal(@PathVariable Integer id) {
        return signalService.getSignal(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/portfolio/{portfolioId}")
    public ResponseEntity<List<Signal>> listSignalsByPortfolio(@PathVariable Long portfolioId) {
        return ResponseEntity.ok(signalService.listSignalsByPortfolio(portfolioId));
    }

    @GetMapping("/portfolio/{portfolioId}/pending")
    public ResponseEntity<List<Signal>> listPendingSignals(@PathVariable Long portfolioId) {
        return ResponseEntity.ok(signalService.listPendingSignals(portfolioId));
    }

    @PostMapping
    public ResponseEntity<Signal> createSignal(@RequestBody Signal signal) {
        return ResponseEntity.ok(signalService.createSignal(signal));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Signal> updateSignal(@PathVariable Integer id, @RequestBody Signal signal) {
        signal.setSignalId(id);
        return ResponseEntity.ok(signalService.updateSignal(signal));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSignal(@PathVariable Integer id) {
        signalService.deleteSignal(id);
        return ResponseEntity.noContent().build();
    }
}


