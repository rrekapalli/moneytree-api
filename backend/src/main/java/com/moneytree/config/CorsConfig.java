package com.moneytree.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

/**
 * CORS configuration for REST API endpoints.
 * Allows frontend applications to make cross-origin requests to the backend API.
 */
@Configuration
public class CorsConfig {
    
    private static final Logger log = LoggerFactory.getLogger(CorsConfig.class);
    
    @Value("${cors.allowed-origins:http://localhost:4200,http://moneytree.tailce422e.ts.net,https://moneytree.tailce422e.ts.net}")
    private String allowedOrigins;
    
    @Value("${cors.allowed-methods:GET,POST,PUT,DELETE,OPTIONS,PATCH}")
    private String allowedMethods;
    
    @Value("${cors.allowed-headers:*}")
    private String allowedHeaders;
    
    @Value("${cors.allow-credentials:true}")
    private boolean allowCredentials;
    
    @Value("${cors.max-age:3600}")
    private long maxAge;
    
    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilterRegistration() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Parse allowed origins (comma-separated) and trim whitespace
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
            .map(String::trim)
            .toList();
        config.setAllowedOrigins(origins);
        
        // Parse allowed methods
        List<String> methods = Arrays.stream(allowedMethods.split(","))
            .map(String::trim)
            .toList();
        config.setAllowedMethods(methods);
        
        // Parse allowed headers
        if ("*".equals(allowedHeaders)) {
            config.addAllowedHeader("*");
        } else {
            List<String> headers = Arrays.stream(allowedHeaders.split(","))
                .map(String::trim)
                .toList();
            config.setAllowedHeaders(headers);
        }
        
        config.setAllowCredentials(allowCredentials);
        config.setMaxAge(maxAge); // Cache preflight response
        
        // Apply CORS configuration to all API endpoints
        source.registerCorsConfiguration("/api/**", config);
        source.registerCorsConfiguration("/oauth2/**", config);
        source.registerCorsConfiguration("/actuator/**", config);
        source.registerCorsConfiguration("/swagger-ui.html", config);
        source.registerCorsConfiguration("/v3/api-docs/**", config);
        
        // Log CORS configuration for debugging
        log.info("CORS Configuration initialized:");
        log.info("  Allowed Origins: {}", origins);
        log.info("  Allowed Methods: {}", methods);
        log.info("  Allow Credentials: {}", allowCredentials);
        
        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));
        // Set highest priority to ensure CORS filter runs before security filters
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return bean;
    }
}
