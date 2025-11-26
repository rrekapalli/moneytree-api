package com.moneytree.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * Central place for environment-driven configuration checks.
 *
 * This can be extended to validate that all required env variables are present.
 */
@Configuration
public class EnvironmentConfig implements InitializingBean {

    private static final Logger log = LoggerFactory.getLogger(EnvironmentConfig.class);

    @Value("${KITE_API_KEY:}")
    private String kiteApiKey;

    @Value("${KITE_API_SECRET:}")
    private String kiteApiSecret;

    @Value("${KITE_ACCESS_TOKEN:}")
    private String kiteAccessToken;

    @Override
    public void afterPropertiesSet() {
        if (kiteApiKey.isEmpty() || kiteApiSecret.isEmpty() || kiteAccessToken.isEmpty()) {
            log.warn("Kite API credentials are not fully configured; market data calls may fail.");
        } else {
            log.info("Kite API credentials detected via environment configuration.");
        }
    }
}


