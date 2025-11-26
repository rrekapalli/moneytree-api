package com.moneytree.api;

import com.moneytree.screener.ScreenerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/screeners")
public class ScreenerController {

    private final ScreenerService screenerService;

    public ScreenerController(ScreenerService screenerService) {
        this.screenerService = screenerService;
    }

    @GetMapping
    public ResponseEntity<?> listScreeners() {
        return ResponseEntity.ok(screenerService.listScreeners());
    }
}


