package com.moneytree.socketengine.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Configuration properties for the SocketEngine module.
 * All sensitive configuration should be externalized via environment variables.
 */
@Data
@Validated
@ConfigurationProperties(prefix = "socketengine")
public class SocketEngineProperties {

    @Valid
    @NotNull
    private Kite kite = new Kite();

    @Valid
    @NotNull
    private Persistence persistence = new Persistence();

    @Valid
    @NotNull
    private WebSocket webSocket = new WebSocket();

    /**
     * Kite API configuration
     */
    @Data
    public static class Kite {
        /**
         * Kite WebSocket URL
         */
        @NotBlank
        private String websocketUrl = "wss://ws.kite.trade";

        /**
         * Kite API key
         */
        @NotBlank
        private String apiKey;

        /**
         * Kite API secret
         */
        @NotBlank
        private String apiSecret;

        /**
         * Kite access token
         */
        @NotBlank
        private String accessToken;
    }

    /**
     * Persistence configuration
     */
    @Data
    public static class Persistence {
        /**
         * Batch size for JDBC batch inserts
         */
        @Positive
        private int batchSize = 1000;

        /**
         * Maximum buffer size before alerting (number of ticks)
         */
        @Positive
        private int maxBufferSize = 100000;

        /**
         * Batch persistence interval in minutes
         */
        @Positive
        private int batchIntervalMinutes = 15;
    }

    /**
     * WebSocket configuration
     */
    @Data
    public static class WebSocket {
        /**
         * Maximum number of concurrent WebSocket sessions
         */
        @Positive
        private int maxSessions = 1000;

        /**
         * WebSocket message size limit in bytes
         */
        @Positive
        private int maxMessageSize = 65536; // 64KB

        /**
         * Allowed origins for CORS (comma-separated)
         */
        private String allowedOrigins = "*";
    }
}
