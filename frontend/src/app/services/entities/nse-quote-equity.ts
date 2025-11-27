/**
 * Interface representing an NSE equity quote.
 */
export interface NseQuoteEquity {
    symbol: string;
    apiResponse: Record<string, any>; // Map<String, Object> in Java becomes Record<string, any> in TypeScript
    quoteDate: string; // ISO date string representation of LocalDate
}