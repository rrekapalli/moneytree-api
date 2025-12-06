/**
 * Filter options containing available values for each filter dropdown
 */
export interface FilterOptions {
  exchanges: string[];
  indices: string[];
  segments: string[];
}

/**
 * User-selected filter values for filtering instruments
 */
export interface InstrumentFilter {
  exchange?: string;
  index?: string;
  segment?: string;
}

/**
 * Instrument data transfer object matching backend response
 */
export interface InstrumentDto {
  instrumentToken: string;
  tradingsymbol: string;
  name: string;
  segment: string;
  exchange: string;
  instrumentType: string;
  lastPrice: number;
  lotSize: number;
  tickSize: number;
}
