package com.moneytree.api;

import com.moneytree.screener.ScreenerStarService;
import com.moneytree.screener.entity.ScreenerStar;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/screeners/{screenerId}/stars")
public class ScreenerStarController {

    private final ScreenerStarService service;

    public ScreenerStarController(ScreenerStarService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ScreenerStar>> listStars(@PathVariable Long screenerId) {
        return ResponseEntity.ok(service.findByScreenerId(screenerId));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ScreenerStar> getStar(@PathVariable Long screenerId, @PathVariable Long userId) {
        return service.findById(screenerId, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ScreenerStar> createStar(@PathVariable Long screenerId, @RequestBody ScreenerStar star) {
        return ResponseEntity.ok(service.save(star));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteStar(@PathVariable Long screenerId, @PathVariable Long userId) {
        service.deleteById(screenerId, userId);
        return ResponseEntity.noContent().build();
    }
}

