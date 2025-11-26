package com.moneytree.api;

import com.moneytree.screener.ScreenerVersionService;
import com.moneytree.screener.entity.ScreenerVersion;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/screeners/{screenerId}/versions")
@Tag(name = "Screener Versions", description = "Versioned screener definitions")
public class ScreenerVersionController {

    private final ScreenerVersionService service;

    public ScreenerVersionController(ScreenerVersionService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ScreenerVersion>> listVersions(@PathVariable UUID screenerId) {
        return ResponseEntity.ok(service.findByScreenerId(screenerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScreenerVersion> getVersion(@PathVariable UUID screenerId, @PathVariable UUID id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/version/{versionNumber}")
    public ResponseEntity<ScreenerVersion> getVersionByNumber(@PathVariable UUID screenerId, @PathVariable Integer versionNumber) {
        return service.findByScreenerIdAndVersionNumber(screenerId, versionNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ScreenerVersion> createVersion(@PathVariable UUID screenerId, @RequestBody ScreenerVersion version) {
        return ResponseEntity.ok(service.save(version));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ScreenerVersion> updateVersion(@PathVariable UUID screenerId, @PathVariable UUID id, @RequestBody ScreenerVersion version) {
        version.setScreenerVersionId(id);
        return ResponseEntity.ok(service.save(version));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVersion(@PathVariable UUID screenerId, @PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

