package com.moneytree.notification.dto;

import com.moneytree.notification.entity.NotificationType;
import java.time.LocalDateTime;

public class NotificationDto {
    private String id;
    private String title;
    private String message;
    private NotificationType type;
    private boolean isRead;
    private LocalDateTime timestamp;
    private String link;

    // Constructors
    public NotificationDto() {
        this.timestamp = LocalDateTime.now();
        this.isRead = false;
    }

    public NotificationDto(String id, String title, String message, NotificationType type) {
        this();
        this.id = id;
        this.title = title;
        this.message = message;
        this.type = type;
    }

    public NotificationDto(String id, String title, String message, NotificationType type, String link) {
        this(id, title, message, type);
        this.link = link;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }
}