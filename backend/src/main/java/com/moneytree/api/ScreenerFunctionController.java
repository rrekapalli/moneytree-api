package com.moneytree.api;

import com.moneytree.screener.ScreenerFunctionService;
import com.moneytree.screener.entity.ScreenerFunction;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/screener-functions")
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
    public ResponseEntity<ScreenerFunction> getFunction(@PathVariable Long id) {
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
    public ResponseEntity<ScreenerFunction> updateFunction(@PathVariable Long id, @RequestBody ScreenerFunction function) {
        function.setFunctionId(id);
        return ResponseEntity.ok(service.save(function));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFunction(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

