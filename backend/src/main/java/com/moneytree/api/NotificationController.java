package com.moneytree.api;

import com.moneytree.notification.NotificationService;
import com.moneytree.notification.dto.NotificationDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name = "Notifications", description = "Real-time notification operations")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @Operation(summary = "Get current notifications", description = "Generate and retrieve current system notifications")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved notifications")
    public ResponseEntity<List<NotificationDto>> getCurrentNotifications() {
        return ResponseEntity.ok(notificationService.getCurrentNotifications());
    }

    @GetMapping("/system-status")
    @Operation(summary = "Get system status notifications", description = "Get notifications about system health and status")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved system status")
    public ResponseEntity<List<NotificationDto>> getSystemStatusNotifications() {
        return ResponseEntity.ok(notificationService.getSystemStatusNotifications());
    }

    @GetMapping("/market-alerts")
    @Operation(summary = "Get market alert notifications", description = "Get current market-related notifications")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved market alerts")
    public ResponseEntity<List<NotificationDto>> getMarketAlerts() {
        return ResponseEntity.ok(notificationService.getMarketAlerts());
    }
}