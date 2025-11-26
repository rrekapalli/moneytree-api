package com.moneytree.api;

import com.moneytree.screener.ScreenerService;
import com.moneytree.screener.entity.Screener;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/screeners")
public class ScreenerController {

    private final ScreenerService screenerService;

    public ScreenerController(ScreenerService screenerService) {
        this.screenerService = screenerService;
    }

    @GetMapping
    public ResponseEntity<List<Screener>> listScreeners() {
        return ResponseEntity.ok(screenerService.listScreeners());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Screener> getScreener(@PathVariable Long id) {
        return screenerService.getScreener(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Screener> createScreener(@RequestBody Screener screener) {
        return ResponseEntity.ok(screenerService.createScreener(screener));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Screener> updateScreener(@PathVariable Long id, @RequestBody Screener screener) {
        screener.setScreenerId(id);
        return ResponseEntity.ok(screenerService.updateScreener(screener));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteScreener(@PathVariable Long id) {
        screenerService.deleteScreener(id);
        return ResponseEntity.noContent().build();
    }
}


