package com.moneytree.socketengine;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main application class for the SocketEngine module.
 * This is a standalone Spring Boot application that handles real-time market data streaming.
 * 
 * <p>Features proper shutdown handling to ensure Kite WebSocket connections are closed
 * gracefully when the application is terminated (including Ctrl+C).
 */
@SpringBootApplication
@EnableAsync
@EnableScheduling
@ConfigurationPropertiesScan
@Slf4j
public class SocketEngineApplication {

    public static void main(String[] args) {
        // Configure Spring Boot for graceful shutdown
        System.setProperty("spring.lifecycle.timeout-per-shutdown-phase", "30s");
        
        ConfigurableApplicationContext context = SpringApplication.run(SocketEngineApplication.class, args);
        
        // Add JVM shutdown hook to ensure proper cleanup on Ctrl+C or SIGTERM
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            log.warn("🚨 SHUTDOWN HOOK TRIGGERED - initiating graceful shutdown");
            log.warn("🔍 Shutdown reason: JVM termination signal received (Ctrl+C, SIGTERM, etc.)");
            try {
                log.warn("🏭 Closing Spring context to trigger @PreDestroy methods...");
                // Close Spring context gracefully - this will call all @PreDestroy methods
                context.close();
                log.warn("✅ Spring context CLOSED successfully - all @PreDestroy methods executed");
            } catch (Exception e) {
                log.error("❌ ERROR during graceful shutdown", e);
            }
            log.warn("🏁 SHUTDOWN HOOK COMPLETED");
        }, "socketengine-shutdown-hook"));
        
        log.info("SocketEngine application started successfully");
        log.info("Press Ctrl+C to shutdown gracefully");
    }
}
