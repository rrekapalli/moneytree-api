/**
 * Interface representing the composite key for NSE historical data.
 */
export interface NseEquityHistoricDataId {
    symbol: string;
    date: string; // ISO date string representation of LocalDate
}