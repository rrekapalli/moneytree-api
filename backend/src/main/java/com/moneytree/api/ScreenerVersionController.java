package com.moneytree.api;

import com.moneytree.screener.ScreenerVersionService;
import com.moneytree.screener.entity.ScreenerVersion;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/screeners/{screenerId}/versions")
public class ScreenerVersionController {

    private final ScreenerVersionService service;

    public ScreenerVersionController(ScreenerVersionService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ScreenerVersion>> listVersions(@PathVariable Long screenerId) {
        return ResponseEntity.ok(service.findByScreenerId(screenerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScreenerVersion> getVersion(@PathVariable Long screenerId, @PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/version/{versionNumber}")
    public ResponseEntity<ScreenerVersion> getVersionByNumber(@PathVariable Long screenerId, @PathVariable Integer versionNumber) {
        return service.findByScreenerIdAndVersionNumber(screenerId, versionNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ScreenerVersion> createVersion(@PathVariable Long screenerId, @RequestBody ScreenerVersion version) {
        return ResponseEntity.ok(service.save(version));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ScreenerVersion> updateVersion(@PathVariable Long screenerId, @PathVariable Long id, @RequestBody ScreenerVersion version) {
        version.setScreenerVersionId(id);
        return ResponseEntity.ok(service.save(version));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVersion(@PathVariable Long screenerId, @PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

