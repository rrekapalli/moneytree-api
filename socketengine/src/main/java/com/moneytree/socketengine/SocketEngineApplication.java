package com.moneytree.socketengine;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main application class for the SocketEngine module.
 * This is a standalone Spring Boot application that handles real-time market data streaming.
 */
@SpringBootApplication
@EnableAsync
@EnableScheduling
@ConfigurationPropertiesScan
public class SocketEngineApplication {

    public static void main(String[] args) {
        SpringApplication.run(SocketEngineApplication.class, args);
    }
}
