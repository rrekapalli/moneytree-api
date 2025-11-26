package com.moneytree.api;

import com.moneytree.screener.ScreenerFunctionParamService;
import com.moneytree.screener.entity.ScreenerFunctionParam;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/screener-functions/{functionId}/params")
public class ScreenerFunctionParamController {

    private final ScreenerFunctionParamService service;

    public ScreenerFunctionParamController(ScreenerFunctionParamService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ScreenerFunctionParam>> listParams(@PathVariable Long functionId) {
        return ResponseEntity.ok(service.findByFunctionId(functionId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScreenerFunctionParam> getParam(@PathVariable Long functionId, @PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ScreenerFunctionParam> createParam(@PathVariable Long functionId, @RequestBody ScreenerFunctionParam param) {
        return ResponseEntity.ok(service.save(param));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteParam(@PathVariable Long functionId, @PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

