/**
 * Interface representing an NSE (National Stock Exchange) equity instrument.
 */
export interface NseEquityInstrument {
    tradingsymbol: string;
    instrumentToken: number;
    exchangeToken: string;
    name: string;
    lastPrice: number;
    expiry: string;
    strike: number;
    tickSize: number;
    lotSize: number;
    instrumentType: string;
    segment: string;
    exchange: string;
}