/**
 * Interface representing an Index entity.
 * Based on the Java Index entity from com.moneyplant.core.entities.Index
 */
export interface Index {
    id?: string;
    keyCategory?: string;
    indexName?: string;
    indexSymbol?: string;
    lastPrice?: number;
    variation?: number;
    percentChange?: number;
    openPrice?: number;
    highPrice?: number;
    lowPrice?: number;
    previousClose?: number;
    yearHigh?: number;
    yearLow?: number;
    indicativeClose?: number;
    peRatio?: number;
    pbRatio?: number;
    dividendYield?: number;
    declines?: number;
    advances?: number;
    unchanged?: number;
    percentChange365d?: number;
    date365dAgo?: string;
    chart365dPath?: string;
    date30dAgo?: string;
    percentChange30d?: number;
    chart30dPath?: string;
    chartTodayPath?: string;
    previousDay?: number;
    oneWeekAgo?: number;
    oneMonthAgo?: number;
    oneYearAgo?: number;
    createdAt?: string; // ISO date string representation of Instant
    updatedAt?: string; // ISO date string representation of Instant
}

/**
 * Interface for creating a new Index (without id and timestamps)
 */
export interface IndexCreateDto {
    keyCategory?: string;
    indexName?: string;
    indexSymbol?: string;
    lastPrice?: number;
    variation?: number;
    percentChange?: number;
    openPrice?: number;
    highPrice?: number;
    lowPrice?: number;
    previousClose?: number;
    yearHigh?: number;
    yearLow?: number;
    indicativeClose?: number;
    peRatio?: number;
    pbRatio?: number;
    dividendYield?: number;
    declines?: number;
    advances?: number;
    unchanged?: number;
    percentChange365d?: number;
    date365dAgo?: string;
    chart365dPath?: string;
    date30dAgo?: string;
    percentChange30d?: number;
    chart30dPath?: string;
    chartTodayPath?: string;
    previousDay?: number;
    oneWeekAgo?: number;
    oneMonthAgo?: number;
    oneYearAgo?: number;
}

/**
 * Interface for Index response (same as Index but ensures all fields are present)
 */
export interface IndexResponseDto extends Index {
    id: string;
    createdAt: string;
    updatedAt: string;
}