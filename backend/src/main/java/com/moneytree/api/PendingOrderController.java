package com.moneytree.api;

import com.moneytree.portfolio.PendingOrderService;
import com.moneytree.portfolio.entity.PendingOrder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolio/{portfolioId}/pending-orders")
public class PendingOrderController {

    private final PendingOrderService service;

    public PendingOrderController(PendingOrderService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<PendingOrder>> listPendingOrders(
            @PathVariable Long portfolioId,
            @RequestParam(required = false) String orderType,
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

