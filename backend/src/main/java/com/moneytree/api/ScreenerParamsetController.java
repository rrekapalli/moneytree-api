package com.moneytree.api;

import com.moneytree.screener.ScreenerParamsetService;
import com.moneytree.screener.entity.ScreenerParamset;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/screener-versions/{screenerVersionId}/paramsets")
@Tag(name = "Screener Paramsets", description = "Parameter sets for screener versions")
public class ScreenerParamsetController {

    private final ScreenerParamsetService service;

    public ScreenerParamsetController(ScreenerParamsetService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ScreenerParamset>> listParamsets(@PathVariable UUID screenerVersionId) {
        return ResponseEntity.ok(service.findByScreenerVersionId(screenerVersionId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScreenerParamset> getParamset(@PathVariable UUID screenerVersionId, @PathVariable UUID id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<ScreenerParamset> getParamsetByName(@PathVariable UUID screenerVersionId, @PathVariable String name) {
        return service.findByScreenerVersionIdAndName(screenerVersionId, name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ScreenerParamset> createParamset(@PathVariable UUID screenerVersionId, @RequestBody ScreenerParamset paramset) {
        return ResponseEntity.ok(service.save(paramset));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ScreenerParamset> updateParamset(@PathVariable UUID screenerVersionId, @PathVariable UUID id, @RequestBody ScreenerParamset paramset) {
        paramset.setParamsetId(id);
        return ResponseEntity.ok(service.save(paramset));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteParamset(@PathVariable UUID screenerVersionId, @PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

