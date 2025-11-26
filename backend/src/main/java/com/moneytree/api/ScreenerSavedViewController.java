package com.moneytree.api;

import com.moneytree.screener.ScreenerSavedViewService;
import com.moneytree.screener.entity.ScreenerSavedView;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/screeners/{screenerId}/saved-views")
@Tag(name = "Screener Saved Views", description = "User-saved screener view preferences")
public class ScreenerSavedViewController {

    private final ScreenerSavedViewService service;

    public ScreenerSavedViewController(ScreenerSavedViewService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ScreenerSavedView>> listSavedViews(@PathVariable UUID screenerId) {
        return ResponseEntity.ok(service.findByScreenerId(screenerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScreenerSavedView> getSavedView(@PathVariable UUID screenerId, @PathVariable UUID id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ScreenerSavedView> createSavedView(@PathVariable UUID screenerId, @RequestBody ScreenerSavedView savedView) {
        return ResponseEntity.ok(service.save(savedView));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ScreenerSavedView> updateSavedView(@PathVariable UUID screenerId, @PathVariable UUID id, @RequestBody ScreenerSavedView savedView) {
        savedView.setSavedViewId(id);
        return ResponseEntity.ok(service.save(savedView));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSavedView(@PathVariable UUID screenerId, @PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

