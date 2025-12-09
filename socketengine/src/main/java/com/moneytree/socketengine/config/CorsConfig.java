package com.moneytree.socketengine.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

/**
 * CORS configuration for REST API endpoints.
 * Allows frontend applications to make cross-origin requests to the socketengine API.
 */
@Configuration
public class CorsConfig {
    
    @Value("${socketengine.cors.allowed-origins:http://localhost:4200}")
    private String allowedOrigins;
    
    @Value("${socketengine.cors.allowed-methods:GET,POST,PUT,DELETE,OPTIONS}")
    private String allowedMethods;
    
    @Value("${socketengine.cors.allowed-headers:*}")
    private String allowedHeaders;
    
    @Value("${socketengine.cors.allow-credentials:true}")
    private boolean allowCredentials;
    
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Parse allowed origins
        List<String> origins = Arrays.asList(allowedOrigins.split(","));
        config.setAllowedOrigins(origins);
        
        // Parse allowed methods
        List<String> methods = Arrays.asList(allowedMethods.split(","));
        config.setAllowedMethods(methods);
        
        // Parse allowed headers
        if ("*".equals(allowedHeaders)) {
            config.addAllowedHeader("*");
        } else {
            List<String> headers = Arrays.asList(allowedHeaders.split(","));
            config.setAllowedHeaders(headers);
        }
        
        config.setAllowCredentials(allowCredentials);
        config.setMaxAge(3600L); // Cache preflight response for 1 hour
        
        // Apply CORS configuration only to REST API paths, not WebSocket paths
        // WebSocket/SockJS endpoints handle CORS internally
        source.registerCorsConfiguration("/api/**", config);
        source.registerCorsConfiguration("/actuator/**", config);
        
        return new CorsFilter(source);
    }
}
