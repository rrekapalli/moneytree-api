package com.moneytree.notification;

import com.moneytree.notification.dto.NotificationDto;
import com.moneytree.notification.entity.NotificationType;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    /**
     * Generate current system notifications based on real-time conditions
     */
    public List<NotificationDto> getCurrentNotifications() {
        List<NotificationDto> notifications = new ArrayList<>();
        
        // Add system status notifications
        notifications.addAll(getSystemStatusNotifications());
        
        // Add market alerts
        notifications.addAll(getMarketAlerts());
        
        // Add welcome message for demo
        notifications.add(new NotificationDto(
            UUID.randomUUID().toString(),
            "Welcome to MoneyTree",
            "Your financial dashboard is ready to use",
            NotificationType.INFO,
            "/dashboard"
        ));
        
        return notifications;
    }

    /**
     * Generate system status notifications
     */
    public List<NotificationDto> getSystemStatusNotifications() {
        List<NotificationDto> notifications = new ArrayList<>();
        
        // Check system health (simplified for demo)
        notifications.add(new NotificationDto(
            UUID.randomUUID().toString(),
            "System Status",
            "All systems operational",
            NotificationType.SUCCESS
        ));
        
        // Add maintenance notification if needed
        LocalDateTime now = LocalDateTime.now();
        if (now.getHour() >= 2 && now.getHour() <= 4) {
            notifications.add(new NotificationDto(
                UUID.randomUUID().toString(),
                "Maintenance Window",
                "System maintenance in progress. Some features may be limited.",
                NotificationType.WARNING
            ));
        }
        
        return notifications;
    }

    /**
     * Generate market alert notifications
     */
    public List<NotificationDto> getMarketAlerts() {
        List<NotificationDto> notifications = new ArrayList<>();
        
        // Market hours check (simplified)
        LocalDateTime now = LocalDateTime.now();
        int hour = now.getHour();
        
        if (hour >= 9 && hour <= 15) {
            notifications.add(new NotificationDto(
                UUID.randomUUID().toString(),
                "Market Open",
                "Indian markets are currently open for trading",
                NotificationType.INFO,
                "/market-data"
            ));
        } else {
            notifications.add(new NotificationDto(
                UUID.randomUUID().toString(),
                "Market Closed",
                "Indian markets are currently closed",
                NotificationType.INFO,
                "/market-data"
            ));
        }
        
        // Add sample market alert
        notifications.add(new NotificationDto(
            UUID.randomUUID().toString(),
            "Market Update",
            "NIFTY 50 showing strong momentum today",
            NotificationType.SUCCESS,
            "/indices"
        ));
        
        return notifications;
    }
}