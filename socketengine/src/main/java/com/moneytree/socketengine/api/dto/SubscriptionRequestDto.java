package com.moneytree.socketengine.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Data Transfer Object for WebSocket subscription requests from clients.
 * Used to subscribe or unsubscribe to specific instrument symbols.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class SubscriptionRequestDto {
    
    /**
     * Action to perform: "SUBSCRIBE" or "UNSUBSCRIBE"
     */
    @NotBlank(message = "Action is required")
    @Pattern(regexp = "SUBSCRIBE|UNSUBSCRIBE", message = "Action must be SUBSCRIBE or UNSUBSCRIBE")
    private String action;
    
    /**
     * Instrument type: "INDEX" or "STOCK"
     */
    @NotBlank(message = "Type is required")
    @Pattern(regexp = "INDEX|STOCK", message = "Type must be INDEX or STOCK")
    private String type;
    
    /**
     * List of trading symbols to subscribe/unsubscribe
     * Example: ["NIFTY 50", "BANKNIFTY"] or ["RELIANCE", "INFY"]
     */
    @NotEmpty(message = "Symbols list cannot be empty")
    private List<String> symbols;
}
