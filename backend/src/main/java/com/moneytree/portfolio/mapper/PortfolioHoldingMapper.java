package com.moneytree.portfolio.mapper;

import com.moneytree.portfolio.dto.PortfolioHoldingDto;
import com.moneytree.portfolio.entity.PortfolioHoldingSummary;

import java.time.LocalDateTime;

/**
 * Mapper to convert PortfolioHoldingSummary entity to PortfolioHoldingDto.
 */
public class PortfolioHoldingMapper {

    /**
     * Convert PortfolioHoldingSummary to PortfolioHoldingDto.
     * Maps openQuantity -> quantity, entryPrice -> avgCost, realizedProfit -> realizedPnl
     */
    public static PortfolioHoldingDto toDto(PortfolioHoldingSummary summary) {
        if (summary == null) {
            return null;
        }

        PortfolioHoldingDto dto = new PortfolioHoldingDto();
        dto.setPortfolioId(summary.getPortfolioId() != null ? summary.getPortfolioId().toString() : null);
        dto.setSymbol(summary.getSymbol());
        dto.setQuantity(summary.getOpenQuantity());
        dto.setAvgCost(summary.getEntryPrice());
        dto.setRealizedPnl(summary.getRealizedProfit());
        dto.setLastUpdated(LocalDateTime.now()); // Use current time as lastUpdated

        return dto;
    }
}
