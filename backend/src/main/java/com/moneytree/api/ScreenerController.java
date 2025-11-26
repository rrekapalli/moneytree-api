package com.moneytree.api;

import com.moneytree.screener.ScreenerService;
import com.moneytree.screener.entity.Screener;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/screeners")
@Tag(name = "Screener", description = "Screener management operations")
public class ScreenerController {

    private final ScreenerService screenerService;

    public ScreenerController(ScreenerService screenerService) {
        this.screenerService = screenerService;
    }

    @GetMapping
    @Operation(summary = "List all public screeners", description = "Retrieve a list of all public screeners")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved screeners")
    public ResponseEntity<List<Screener>> listScreeners() {
        return ResponseEntity.ok(screenerService.listScreeners());
    }

    @PostMapping(consumes = "application/json")
    @Operation(summary = "Create a new screener", description = "Create a new screener with the provided details")
    @ApiResponse(responseCode = "200", description = "Screener created successfully")
    public ResponseEntity<Screener> createScreener(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Screener details", required = true)
            @RequestBody Screener screener) {
        return ResponseEntity.ok(screenerService.createScreener(screener));
    }

    @GetMapping("/{id:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}}")
    @Operation(summary = "Get screener by ID", description = "Retrieve a specific screener by its ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Screener found"),
        @ApiResponse(responseCode = "404", description = "Screener not found")
    })
    public ResponseEntity<Screener> getScreener(
            @Parameter(description = "Screener ID", required = true) @PathVariable UUID id) {
        return screenerService.getScreener(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}}")
    @Operation(summary = "Update screener", description = "Update an existing screener")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Screener updated successfully"),
        @ApiResponse(responseCode = "404", description = "Screener not found")
    })
    public ResponseEntity<Screener> updateScreener(
            @Parameter(description = "Screener ID", required = true) @PathVariable UUID id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Updated screener details", required = true)
            @RequestBody Screener screener) {
        screener.setScreenerId(id);
        return ResponseEntity.ok(screenerService.updateScreener(screener));
    }

    @DeleteMapping("/{id:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}}")
    @Operation(summary = "Delete screener", description = "Delete a screener by its ID")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Screener deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Screener not found")
    })
    public ResponseEntity<Void> deleteScreener(
            @Parameter(description = "Screener ID", required = true) @PathVariable UUID id) {
        screenerService.deleteScreener(id);
        return ResponseEntity.noContent().build();
    }
}


