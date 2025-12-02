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
        dto.setLastUpdated(LocalDateTime.now());
        
        // Additional fields from summary
        dto.setEntryDate(summary.getEntryDate());
        dto.setOpenPrincipal(summary.getOpenPrincipal());
        dto.setTakeProfit(summary.getTakeProfit());
        dto.setStopLoss(summary.getStopLoss());
        dto.setLastPositionValue(summary.getLastPositionValue());
        dto.setLastEquity(summary.getLastEquity());
        dto.setTotalTrades(summary.getTotalTrades());
        dto.setWinningTrades(summary.getWinningTrades());
        dto.setLosingTrades(summary.getLosingTrades());

        return dto;
    }
}
