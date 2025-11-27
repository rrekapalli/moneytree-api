import { PortfolioDto } from '../../services/entities/portfolio.entities';

// Extended interface for portfolio with performance metrics
export interface PortfolioWithMetrics extends PortfolioDto {
  totalReturn?: number;
  benchmarkReturn?: number;
  outperformance?: number;
  stockCount?: number;
  rebalanceEvents?: number;
  lastRebalance?: string;
  performanceData?: {
    portfolio: number[];
    benchmark: number[];
    labels: string[];
  };
}
