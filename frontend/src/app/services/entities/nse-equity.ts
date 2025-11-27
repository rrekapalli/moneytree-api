/**
 * Interface representing an NSE (National Stock Exchange) equity.
 */
export interface NseEquity {
    symbol: string;
    nameOfCompany: string;
    series: string;
    dateOfListing: string; // ISO date string representation of Timestamp
    paidUpValue: number;
    marketLot: number;
    isinNumber: string;
    faceValue: number;
}