package com.moneytree.api;

import com.moneytree.portfolio.PendingOrderService;
import com.moneytree.portfolio.entity.PendingOrder;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolio/{portfolioId}/pending-orders")
@Tag(name = "Pending Orders", description = "Pending order management operations with partial fill support")
public class PendingOrderController {

    private final PendingOrderService service;

    public PendingOrderController(PendingOrderService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "List pending orders", description = "Retrieve all pending orders for a portfolio, with optional filtering")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved pending orders")
    public ResponseEntity<List<PendingOrder>> listPendingOrders(
            @Parameter(description = "Portfolio ID", required = true) @PathVariable Long portfolioId,
            @Parameter(description = "Filter by order type (BUY or SELL)", example = "BUY")
            @RequestParam(required = false) String orderType,
            @Parameter(description = "Show only active orders (remaining quantity > 0)", example = "true")
            @RequestParam(required = false, defaultValue = "false") Boolean activeOnly) {
        if (Boolean.TRUE.equals(activeOnly)) {
            return ResponseEntity.ok(service.findActiveByPortfolioId(portfolioId));
        }
        if (orderType != null) {
            return ResponseEntity.ok(service.findByPortfolioIdAndOrderType(portfolioId, orderType));
        }
        return ResponseEntity.ok(service.findByPortfolioId(portfolioId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PendingOrder> getPendingOrder(@PathVariable Long portfolioId, @PathVariable Integer id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/order-id/{orderId}")
    public ResponseEntity<PendingOrder> getPendingOrderByOrderId(@PathVariable Long portfolioId, @PathVariable String orderId) {
        return service.findByOrderId(orderId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PendingOrder> createPendingOrder(@PathVariable Long portfolioId, @RequestBody PendingOrder order) {
        return ResponseEntity.ok(service.save(order));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PendingOrder> updatePendingOrder(@PathVariable Long portfolioId, @PathVariable Integer id, @RequestBody PendingOrder order) {
        order.setPendingOrderId(id);
        return ResponseEntity.ok(service.save(order));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePendingOrder(@PathVariable Long portfolioId, @PathVariable Integer id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

