package com.moneytree.api;

import com.moneytree.signal.SignalService;
import com.moneytree.signal.entity.Signal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/signals")
@Tag(name = "Signal", description = "Trading signal management operations")
public class SignalController {

    private final SignalService signalService;

    public SignalController(SignalService signalService) {
        this.signalService = signalService;
    }

    @GetMapping
    @Operation(summary = "List all signals", description = "Retrieve a list of all trading signals")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved signals")
    public ResponseEntity<List<Signal>> listSignals() {
        return ResponseEntity.ok(signalService.listSignals());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get signal by ID", description = "Retrieve a specific signal by its ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Signal found"),
        @ApiResponse(responseCode = "404", description = "Signal not found")
    })
    public ResponseEntity<Signal> getSignal(
            @Parameter(description = "Signal ID", required = true) @PathVariable Integer id) {
        return signalService.getSignal(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/portfolio/{portfolioId}")
    @Operation(summary = "List signals by portfolio", description = "Retrieve all signals for a specific portfolio, ordered by timestamp")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved signals")
    public ResponseEntity<List<Signal>> listSignalsByPortfolio(
            @Parameter(description = "Portfolio ID", required = true) @PathVariable Long portfolioId) {
        return ResponseEntity.ok(signalService.listSignalsByPortfolio(portfolioId));
    }

    @GetMapping("/portfolio/{portfolioId}/pending")
    @Operation(summary = "List pending signals", description = "Retrieve all pending (non-executed) signals for a specific portfolio")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved pending signals")
    public ResponseEntity<List<Signal>> listPendingSignals(
            @Parameter(description = "Portfolio ID", required = true) @PathVariable Long portfolioId) {
        return ResponseEntity.ok(signalService.listPendingSignals(portfolioId));
    }

    @PostMapping
    @Operation(summary = "Create a new signal", description = "Create a new trading signal")
    @ApiResponse(responseCode = "200", description = "Signal created successfully")
    public ResponseEntity<Signal> createSignal(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Signal details", required = true)
            @RequestBody Signal signal) {
        return ResponseEntity.ok(signalService.createSignal(signal));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update signal", description = "Update an existing signal")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Signal updated successfully"),
        @ApiResponse(responseCode = "404", description = "Signal not found")
    })
    public ResponseEntity<Signal> updateSignal(
            @Parameter(description = "Signal ID", required = true) @PathVariable Integer id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "Updated signal details", required = true)
            @RequestBody Signal signal) {
        signal.setSignalId(id);
        return ResponseEntity.ok(signalService.updateSignal(signal));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete signal", description = "Delete a signal by its ID")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Signal deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Signal not found")
    })
    public ResponseEntity<Void> deleteSignal(
            @Parameter(description = "Signal ID", required = true) @PathVariable Integer id) {
        signalService.deleteSignal(id);
        return ResponseEntity.noContent().build();
    }
}


