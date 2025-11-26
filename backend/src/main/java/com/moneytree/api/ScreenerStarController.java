package com.moneytree.api;

import com.moneytree.screener.ScreenerStarService;
import com.moneytree.screener.entity.ScreenerStar;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/screeners/{screenerId}/stars")
@Tag(name = "Screener Stars", description = "User favorites/stars for screeners")
public class ScreenerStarController {

    private final ScreenerStarService service;

    public ScreenerStarController(ScreenerStarService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ScreenerStar>> listStars(@PathVariable UUID screenerId) {
        return ResponseEntity.ok(service.findByScreenerId(screenerId));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ScreenerStar> getStar(@PathVariable UUID screenerId, @PathVariable UUID userId) {
        return service.findById(screenerId, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ScreenerStar> createStar(@PathVariable UUID screenerId, @RequestBody ScreenerStar star) {
        return ResponseEntity.ok(service.save(star));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteStar(@PathVariable UUID screenerId, @PathVariable UUID userId) {
        service.deleteById(screenerId, userId);
        return ResponseEntity.noContent().build();
    }
}

