package com.moneytree.api;

import com.moneytree.screener.ScreenerFunctionParamService;
import com.moneytree.screener.entity.ScreenerFunctionParam;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/screener-functions/{functionId}/params")
@Tag(name = "Screener Function Parameters", description = "Screener function parameter definitions")
public class ScreenerFunctionParamController {

    private final ScreenerFunctionParamService service;

    public ScreenerFunctionParamController(ScreenerFunctionParamService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ScreenerFunctionParam>> listParams(@PathVariable UUID functionId) {
        return ResponseEntity.ok(service.findByFunctionId(functionId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScreenerFunctionParam> getParam(@PathVariable UUID functionId, @PathVariable UUID id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ScreenerFunctionParam> createParam(@PathVariable UUID functionId, @RequestBody ScreenerFunctionParam param) {
        return ResponseEntity.ok(service.save(param));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteParam(@PathVariable UUID functionId, @PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

