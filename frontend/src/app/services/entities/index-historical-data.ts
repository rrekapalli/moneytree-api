/**
 * Interface representing index historical data.
 * Based on the Java IndexHistoricalDataDto from com.moneyplant.index.dtos.IndexHistoricalDataDto
 */
export interface IndexHistoricalData {
    indexName: string;
    date: string; // ISO date string representation of LocalDate
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
} 