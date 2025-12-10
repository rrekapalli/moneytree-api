package com.moneytree.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI moneyTreeOpenAPI() {
        Server localServer = new Server();
        localServer.setUrl("http://localhost:8080");
        localServer.setDescription("Local development server");

        Server productionServer = new Server();
        productionServer.setUrl("https://backend.tailce422e.ts.net:8080");
        productionServer.setDescription("Production server (Tailscale)");

        Contact contact = new Contact();
        contact.setName("MoneyTree API Support");
        contact.setEmail("support@moneytree.com");

        License license = new License()
                .name("Proprietary")
                .url("https://moneytree.com/license");

        Info info = new Info()
                .title("MoneyTree Trading API")
                .version("1.0.0")
                .description("""
                        MoneyTree High-Frequency Trading API
                        
                        This API provides endpoints for:
                        - Portfolio management and trading operations
                        - Market data access (Kite-based)
                        - Screener functionality and execution
                        - Backtest management and analysis
                        - Trading signals and order management
                        
                        **Note**: This is a high-frequency trading system. All endpoints are optimized for performance.
                        """)
                .contact(contact)
                .license(license);

        return new OpenAPI()
                .info(info)
                .servers(List.of(localServer, productionServer));
    }
}

