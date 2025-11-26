package com.moneytree.api;

import com.moneytree.screener.ScreenerFunctionService;
import com.moneytree.screener.entity.ScreenerFunction;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/screener-functions")
@Tag(name = "Screener Functions", description = "Screener function library management")
public class ScreenerFunctionController {

    private final ScreenerFunctionService service;

    public ScreenerFunctionController(ScreenerFunctionService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ScreenerFunction>> listFunctions(@RequestParam(required = false) String category) {
        if (category != null) {
            return ResponseEntity.ok(service.findByCategory(category));
        }
        return ResponseEntity.ok(service.findAllActive());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScreenerFunction> getFunction(@PathVariable UUID id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/name/{functionName}")
    public ResponseEntity<ScreenerFunction> getFunctionByName(@PathVariable String functionName) {
        return service.findByFunctionName(functionName)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ScreenerFunction> createFunction(@RequestBody ScreenerFunction function) {
        return ResponseEntity.ok(service.save(function));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ScreenerFunction> updateFunction(@PathVariable UUID id, @RequestBody ScreenerFunction function) {
        function.setFunctionId(id);
        return ResponseEntity.ok(service.save(function));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFunction(@PathVariable UUID id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

