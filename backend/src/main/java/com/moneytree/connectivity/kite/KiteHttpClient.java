package com.moneytree.connectivity.kite;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * Thin wrapper around WebClient for calling Zerodha Kite REST APIs.
 *
 * This class is intentionally minimal; higher-level services should define
 * semantic methods for specific endpoints.
 */
@Component
public class KiteHttpClient {

    private static final Logger log = LoggerFactory.getLogger(KiteHttpClient.class);

    private final RestTemplate restTemplate;
    private final KiteConfig config;

    public KiteHttpClient(KiteConfig config) {
        this.config = config;
        this.restTemplate = new RestTemplate();
    }

    public String get(String pathAndQuery) {
        log.debug("KiteHttpClient GET {}", pathAndQuery);
        String url = config.getBaseUrl() + pathAndQuery;
        HttpHeaders headers = new HttpHeaders();
        if (config.getAccessToken() != null && !config.getAccessToken().isEmpty()) {
            headers.setBearerAuth(config.getAccessToken());
        }
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
        return response.getBody();
    }
}


