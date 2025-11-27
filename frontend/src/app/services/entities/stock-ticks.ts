/**
 * Interface representing Stock Ticks data.
 * Based on the Java StockTicksDto from com.moneyplant.stock.dtos.StockTicksDto
 */

/**
 * Interface for Advance data within Stock Ticks
 */
export interface AdvanceDto {
    declines?: string;
    advances?: string;
    unchanged?: string;
}

/**
 * Interface for Quote Pre-Open Status within Meta data
 */
export interface QuotePreOpenStatusDto {
    equityTime?: string;
    preOpenTime?: string;
    quotePreOpenFlag?: boolean;
}

/**
 * Interface for Meta data within Stock Data
 */
export interface MetaDto {
    symbol?: string;
    companyName?: string;
    industry?: string;
    activeSeries?: string[];
    debtSeries?: string[];
    isFNOSec?: boolean;
    isCASec?: boolean;
    isSLBSec?: boolean;
    isDebtSec?: boolean;
    isSuspended?: boolean;
    tempSuspendedSeries?: string[];
    isETFSec?: boolean;
    isDelisted?: boolean;
    isin?: string;
    slbIsin?: string;
    listingDate?: string;
    isMunicipalBond?: boolean;
    isHybridSymbol?: boolean;
    quotepreopenstatus?: QuotePreOpenStatusDto;
}

/**
 * Interface for individual Stock Data within Stock Ticks
 */
export interface StockDataDto {
    priority?: number;
    symbol?: string;
    identifier?: string;
    series?: string;
    openPrice?: number;
    dayHigh?: number;
    dayLow?: number;
    lastPrice?: number;
    previousClose?: number;
    priceChange?: number;
    percentChange?: number;
    ffmc?: number;
    yearHigh?: number;
    yearLow?: number;
    totalTradedVolume?: number;
    stockIndClosePrice?: number;
    totalTradedValue?: number;
    lastUpdateTime?: string;
    nearWeekHigh?: number;
    nearWeekLow?: number;
    percentChange365d?: number;
    date365dAgo?: string;
    chart365dPath?: string;
    date30dAgo?: string;
    percentChange30d?: number;
    chart30dPath?: string;
    chartTodayPath?: string;
    companyName?: string;
    industry?: string;
    isFnoSec?: boolean;
    isCaSec?: boolean;
    isSlbSec?: boolean;
    isDebtSec?: boolean;
    isSuspended?: boolean;
    isEtfSec?: boolean;
    isDelisted?: boolean;
    isin?: string;
    slbIsin?: string;
    listingDate?: string;
    isMunicipalBond?: boolean;
    isHybridSymbol?: boolean;
    equityTime?: string;
    preOpenTime?: string;
    quotePreOpenFlag?: boolean;
    createdAt?: string;
    updatedAt?: string;
    // Additional fields from nse_equity_master table
    basicIndustry?: string;
    pdSectorInd?: string;
    macro?: string;
    sector?: string;
    meta?: MetaDto;
}

/**
 * Interface for Metadata within Stock Ticks
 */
export interface MetadataDto {
    indexName?: string;
    open?: number;
    high?: number;
    low?: number;
    previousClose?: number;
    last?: number;
    percChange?: number;
    change?: number;
    timeVal?: string;
    yearHigh?: number;
    yearLow?: number;
    indicativeClose?: number;
    totalTradedVolume?: number;
    totalTradedValue?: number;
    ffmcSum?: number;
}

/**
 * Interface for Market Status within Stock Ticks
 */
export interface MarketStatusDto {
    market?: string;
    marketStatus?: string;
    tradeDate?: string;
    index?: string;
    last?: number;
    variation?: number;
    percentChange?: number;
    marketStatusMessage?: string;
}

/**
 * Main interface for Stock Ticks data
 */
export interface StockTicksDto {
    name?: string;
    advance?: AdvanceDto;
    timestamp?: string;
    data?: StockDataDto[];
    metadata?: MetadataDto;
    marketStatus?: MarketStatusDto;
    date30dAgo?: string;
    date365dAgo?: string;
}

/**
 * Interface for Stock Ticks response (ensures all required fields are present)
 */
export interface StockTicksResponseDto extends StockTicksDto {
    name: string;
    timestamp: string;
    data: StockDataDto[];
    metadata: MetadataDto;
    marketStatus: MarketStatusDto;
}