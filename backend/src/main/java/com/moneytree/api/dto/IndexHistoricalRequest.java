package com.moneytree.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;

/**
 * Request payload for fetching index historical data.
 */
public class IndexHistoricalRequest {

    @JsonProperty("indexName")
    @NotBlank(message = "indexName is required")
    private String indexName;

    @JsonProperty("days")
    private Integer days;

    public String getIndexName() {
        return indexName;
    }

    public void setIndexName(String indexName) {
        this.indexName = indexName;
    }

    public Integer getDays() {
        return days;
    }

    public void setDays(Integer days) {
        this.days = days;
    }
}

