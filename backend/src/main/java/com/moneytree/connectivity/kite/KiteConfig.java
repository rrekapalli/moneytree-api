package com.moneytree.connectivity.kite;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "kite")
public class KiteConfig {

    /**
     * API key issued by Zerodha for this application.
     */
    private String apiKey;

    /**
     * API secret associated with the API key.
     */
    private String apiSecret;

    /**
     * Access token used for authenticated requests.
     */
    private String accessToken;

    /**
     * Base URL for the Kite API (e.g. https://api.kite.trade).
     */
    private String baseUrl;

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getApiSecret() {
        return apiSecret;
    }

    public void setApiSecret(String apiSecret) {
        this.apiSecret = apiSecret;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }
}


