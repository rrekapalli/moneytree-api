/**
 * Interface representing a Stock with comprehensive market data.
 * Updated to match the actual API response structure with nested objects.
 */
export interface Stock {
    id?: string;
    name?: string;
    symbol: string; // Required for compatibility with other components
    companyName?: string;
    industry?: string;
    pdSectorInd?: string;
    
    // Nested tickDetails object for market data
    tickDetails?: {
        symbol?: string;
        date?: string;
        open?: number;
        high?: number;
        low?: number;
        close?: number;
        volume?: number;
        totalTradedValue?: number;
        totalTrades?: number;
        deliveryQuantity?: number;
        deliveryPercentage?: number;
        vwap?: number;
        previousClose?: number;
        series?: string;
    };
    
    // Nested stockDetails object for company information
    stockDetails?: {
        symbol?: string;
        companyName?: string;
        industry?: string;
        pdSectorInd?: string;
        isin?: string;
        series?: string;
        status?: string;
        listingDate?: string;
        isFnoSec?: string;
        isEtfSec?: string;
        isSuspended?: string;
        pdSectorPe?: number;
        pdSymbolPe?: number;
    };
}