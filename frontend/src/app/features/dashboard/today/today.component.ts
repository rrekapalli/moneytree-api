import { Component, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ScrollPanelModule } from 'primeng/scrollpanel';

// Import echarts core module and components
import * as echarts from 'echarts/core';
// Import bar, line, pie, and other chart components
import {
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  GaugeChart,
  HeatmapChart,
  MapChart,
  TreemapChart,
  SunburstChart,
  SankeyChart,
  CandlestickChart
} from 'echarts/charts';
// Import tooltip, title, legend, and other components
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  VisualMapComponent,
  PolarComponent,
  DataZoomComponent,
  BrushComponent,
  ToolboxComponent
} from 'echarts/components';
// Import renderer
import {
  CanvasRenderer
} from 'echarts/renderers';

// Register the required components
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  VisualMapComponent,
  PolarComponent,
  DataZoomComponent,
  BrushComponent,
  ToolboxComponent,
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  GaugeChart,
  HeatmapChart,
  MapChart,
  TreemapChart,
  SunburstChart,
  SankeyChart,
  CandlestickChart,
  CanvasRenderer
]);

// Register built-in maps and custom maps
import { DensityMapBuilder } from '@dashboards/public-api';

// Register the world map with ECharts
// We'll use a dynamic import to load the world map data
import('echarts-map-collection/custom/world.json').then((worldMapData) => {
  DensityMapBuilder.registerMap('world', worldMapData.default || worldMapData);
}).catch((error) => {
  // Handle world map loading error silently
});

// Import dashboard modules and chart builders
import { 
  IWidget,
  DashboardContainerComponent,
  DashboardHeaderComponent,
  // Fluent API
  StandardDashboardBuilder,
  ExcelExportService,
  FilterService,
  // Enhanced Chart Builders
  ApacheEchartBuilder,
  PieChartBuilder,
  AreaChartBuilder,
  TreemapChartBuilder,
  SankeyChartBuilder,
  // Other builders and utilities
  BarChartBuilder,
  ScatterChartBuilder,
  GaugeChartBuilder,
  HeatmapChartBuilder,
  PolarChartBuilder,
  CandlestickChartBuilder,
  SunburstChartBuilder
} from '@dashboards/public-api';

// Import only essential widget creation functions and data
import {
  createFilterWidget,
  createMetricTiles,
  // Dashboard data
  INITIAL_DASHBOARD_DATA
} from './widgets';

// Import base dashboard component
import { BaseDashboardComponent } from '@dashboards/public-api';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';

// Define the specific data structure for this dashboard
export interface DashboardDataRow {
  id: string;
  assetCategory: string;
  month: string;
  market: string;
  totalValue: number;
  riskValue?: number;
  returnValue?: number;
  description?: string;
}

@Component({
  selector: 'app-today',
  standalone: true,
  imports: [
    CommonModule, 
    CardModule,
    ButtonModule,
    TagModule,
    DividerModule,
    MessageModule,
    TooltipModule,
     ScrollPanelModule,
    // Dashboard components
    DashboardContainerComponent,
    DashboardHeaderComponent
  ],
  templateUrl: './today.component.html',
  styleUrls: ['./today.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TodayComponent extends BaseDashboardComponent<DashboardDataRow> {
  // Shared dashboard data - Flat structure (implements abstract property)
  protected dashboardData: DashboardDataRow[] = [...INITIAL_DASHBOARD_DATA];
  protected readonly initialDashboardData: DashboardDataRow[] = INITIAL_DASHBOARD_DATA;
  
  @ViewChild('dashboardContainerComponent', { static: false }) override dashboardContainerComponent!: any;

  constructor(
    cdr: ChangeDetectorRef,
    excelExportService: ExcelExportService,
    filterService: FilterService
  ) {
    super(cdr, excelExportService, filterService);
  }

  // Implement abstract methods from BaseDashboardComponent
  protected onChildInit(): void {
    // Register world map for density map charts
    import('echarts-map-collection/custom/world.json').then((worldMapData) => {
      DensityMapBuilder.registerMap('world', worldMapData.default || worldMapData);
    }).catch((error) => {
      // Handle world map loading error silently
    });
  }

  protected onChildDestroy(): void {
    // Child-specific cleanup if needed
  }





  /**
   * Create metric tiles with filtered data
   */
  protected createMetricTiles(data: DashboardDataRow[]): IWidget[] {
    return createMetricTiles(data);
  }

  /**
   * Initialize dashboard config using the Enhanced Chart Builders
   */
  protected initializeDashboardConfig(): void {
    // Create widgets using enhanced chart builders
    
    // Asset Allocation Pie Chart with financial display
    const pieAssetAllocation = PieChartBuilder.create()
      .setData([]) // Data will be populated later
      .setHeader('Asset Allocation')
      .setPosition({ x: 9, y: 11, cols: 4, rows: 8 })
      .setDonutStyle('40%', '70%')
      .setFinancialDisplay('USD', 'en-US')
      .setPredefinedPalette('finance')
      .setFilterColumn('assetCategory')
      .build();

    // Monthly Income vs Expenses Bar Chart
    const barMonthlyIncomeVsExpenses = BarChartBuilder.create()
      .setData([]) // Data will be populated later
      .setHeader('Monthly Income vs Expenses')
      .setPosition({ x: 0, y: 13, cols: 8, rows: 8 })
      .setCurrencyFormatter('USD', 'en-US')
      .setPredefinedPalette('business')
      .setTooltip('axis', '{b}: {c}')
      .build();

    // Portfolio Performance Area Chart
    const linePortfolioPerformance = AreaChartBuilder.create()
      .setData([]) // Data will be populated later
      .setHeader('Portfolio Performance')
      .setPosition({ x: 6, y: 0, cols: 6, rows: 8 })
      .setFinancialTrend('USD', 'en-US')
      .setPredefinedPalette('finance')
      .build();

    // Risk vs Return Scatter Chart
    const scatterRiskVsReturn = ScatterChartBuilder.create()
      .setData([]) // Data will be populated later
      .setHeader('Risk vs Return Analysis')
      .setPosition({ x: 0, y: 21, cols: 6, rows: 8 })
      .setTooltip('item', '{b}: Risk {c[0]}%, Return {c[1]}%')
      .setPredefinedPalette('modern')
      .build();

    // Savings Goal Gauge
    const gaugeSavingsGoal = GaugeChartBuilder.create()
      .setData([]) // Data will be populated later
      .setHeader('Savings Goal Progress')
      .setPosition({ x: 6, y: 21, cols: 3, rows: 4 })
      .setPercentageFormatter(0)
      .build();

    // Spending Heatmap
    const heatmapSpending = HeatmapChartBuilder.create()
      .setData([]) // Data will be populated later
      .setHeader('Weekly Spending Heatmap')
      .setPosition({ x: 9, y: 21, cols: 3, rows: 8 })
      .setCurrencyFormatter('USD', 'en-US')
      .build();

    // Investment Distribution Map (using density map builder)
    const densityMapInvestment = DensityMapBuilder.create()
      .setData([]) // Data will be populated later
      .setHeader('Investment Distribution by Region')
      .setPosition({ x: 0, y: 3, cols: 8, rows: 8 })
      .setCurrencyFormatter('USD', 'en-US')
      .build();

    // Revenue Trend Area Chart
    const areaChart = AreaChartBuilder.create()
      .setData([]) // Data will be populated later
      .setHeader('Revenue Trend')
      .setPosition({ x: 12, y: 0, cols: 6, rows: 8 })
      .setFinancialTrend('USD', 'en-US')
      .build();

    // Performance Metrics Polar Chart
    const polarChart = PolarChartBuilder.create()
      .setData([]) // Data will be populated later
      .setHeader('Performance Metrics')
      .setPosition({ x: 9, y: 15, cols: 4, rows: 8 })
      .setPercentageFormatter(1)
      .build();

    // Financial Overview Stacked Area
    const stackedAreaChart = AreaChartBuilder.create()
      .setData([]) // Data will be populated later
      .setHeader('Financial Overview')
      .setPosition({ x: 0, y: 29, cols: 8, rows: 4 })
      .setFinancialTrend('USD', 'en-US')
      .setStack('total')
      .build();

    // Portfolio Distribution Treemap
    const treemapChart = TreemapChartBuilder.create()
      .setData([]) // Data will be populated later
      .setHeader('Portfolio Distribution')
      .setPosition({ x: 0, y: 8, cols: 6, rows: 8 })
      .setPortfolioConfiguration()
      .setFinancialDisplay('USD', 'en-US')
      .build();

    // Monthly Expenses Treemap
    const expenseTreemap = TreemapChartBuilder.create()
      .setData([]) // Data will be populated later
      .setHeader('Monthly Expenses')
      .setPosition({ x: 6, y: 8, cols: 6, rows: 8 })
      .setExpenseConfiguration()
      .setFinancialDisplay('USD', 'en-US')
      .build();

    // Organizational Structure Sunburst
    const sunburstChart = SunburstChartBuilder.create()
      .setData([]) // Data will be populated later
      .setHeader('Organizational Structure')
      .setPosition({ x: 12, y: 8, cols: 6, rows: 8 })
      .build();

    // Financial Flow Sankey
    const sankeyChart = SankeyChartBuilder.create()
      .setData({ nodes: [], links: [] }) // Data will be populated later
      .setHeader('Financial Flow')
      .setPosition({ x: 0, y: 33, cols: 8, rows: 8 })
      .setFinancialFlow()
      .setCurrencyDisplay('USD', 'en-US')
      .build();

    // Investment Flow Sankey
    const investmentFlowSankey = SankeyChartBuilder.create()
      .setData({ nodes: [], links: [] }) // Data will be populated later
      .setHeader('Investment Flow')
      .setPosition({ x: 8, y: 33, cols: 8, rows: 8 })
      .setInvestmentFlow()
      .setCurrencyDisplay('USD', 'en-US')
      .build();

    // Budget Allocation Sankey
    const budgetAllocationSankey = SankeyChartBuilder.create()
      .setData({ nodes: [], links: [] }) // Data will be populated later
      .setHeader('Budget Allocation')
      .setPosition({ x: 16, y: 33, cols: 8, rows: 8 })
      .setBudgetAllocation()
      .setCurrencyDisplay('USD', 'en-US')
      .build();

    // Stock Price Candlestick
    const candlestickChart = CandlestickChartBuilder.create()
      .setData([]) // Data will be populated later
      .setHeader('Stock Price Analysis')
      .setPosition({ x: 12, y: 16, cols: 6, rows: 8 })
      .setCurrencyFormatter('USD', 'en-US')
      .build();

    const filterWidget = createFilterWidget();
    const metricTiles = createMetricTiles(INITIAL_DASHBOARD_DATA);

    // Position metric tiles at row 0 (top of dashboard)
    // Metric tiles are already positioned at y: 0 in the createMetricTiles function

    // Position filter widget at row 1 (below metric tiles)
    filterWidget.position = { x: 0, y: 2, cols: 12, rows: 1 };

    // Position other widgets starting from row 2 (below filter)
    densityMapInvestment.position = { x: 0, y: 3, cols: 8, rows: 8 };
    pieAssetAllocation.position = { x: 9, y: 11, cols: 4, rows: 8 };
    polarChart.position = { x: 9, y: 15, cols: 4, rows: 8 };
    barMonthlyIncomeVsExpenses.position = { x: 0, y: 13, cols: 8, rows: 8 };

    // Use the Fluent API to build the dashboard config with filter highlighting enabled
    this.dashboardConfig = StandardDashboardBuilder.createStandard()
      .setDashboardId('today-dashboard')
      // Enable filter highlighting mode with custom styling
      .enableFilterHighlighting(true, {
        filteredOpacity: 0.25,
        highlightedOpacity: 1.0,
        highlightColor: '#ff6b6b',
        filteredColor: '#e0e0e0'
      })
      .setWidgets([
        // Metric tiles at the top (row 0)
        ...metricTiles,
        // Filter widget below tiles (row 1)
        filterWidget,
        // Core financial widgets
        pieAssetAllocation,
        barMonthlyIncomeVsExpenses,
        linePortfolioPerformance,
        scatterRiskVsReturn,
        gaugeSavingsGoal,
        heatmapSpending,
        densityMapInvestment,
        areaChart,
        polarChart,
        stackedAreaChart,
        treemapChart,
        expenseTreemap,
        sunburstChart,
        sankeyChart,
        investmentFlowSankey,
        budgetAllocationSankey,
        candlestickChart
      ])
      .setEditMode(false)
      .build();

    // Populate widgets with initial data
    this.populateWidgetsWithInitialData();
  }

  /**
   * Populate all widgets with initial data from the shared dataset
   * Enhanced version for tab-based components
   */
  protected override populateWidgetsWithInitialData(): void {
    if (!this.dashboardConfig?.widgets) {
      return;
    }

    // Find all echart widgets and populate them with initial data
    const echartWidgets = this.dashboardConfig.widgets.filter(widget => 
      widget.config?.component === 'echart'
    );

    echartWidgets.forEach(widget => {
      const widgetTitle = widget.config?.header?.title;
      
      // Try to get data by widget title first
      let initialData = null;
      if (widgetTitle) {
        initialData = this.getFilteredDataForWidget(widgetTitle);
      }
      
      // If no data found by title, try to detect chart type and provide appropriate data
      if (!initialData) {
        initialData = this.getSummarizedDataByWidget(widgetTitle);
      }
      
      if (initialData) {
        this.updateEchartWidget(widget, initialData);
      }
    });

    // Populate metric tiles with initial data
    this.updateMetricTilesWithFilters([]);

    // Trigger change detection to ensure widgets are updated
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  /**
   * Get data for widget based on chart type detection
   */
  protected override getSummarizedDataByWidget(widgetTitle: string | undefined): any {
    const widget = this.dashboardConfig.widgets.find(widget =>
        widget.config?.header?.title === widgetTitle
    );

    if(!widget)
    {
      return null;
    }

    const chartOptions = widget.config?.options as any;

    if (!chartOptions?.series?.[0]) {
      return null;
    }
    
    const seriesType = chartOptions.series[0].type;
    const mapType = chartOptions.series[0].map;
    
    // Detect chart type and provide appropriate data
    switch (seriesType) {
      case 'map':
        // This is a density/choropleth map - provide investment distribution data
        return this.groupByAndSum(this.dashboardData, 'market', 'totalValue');
        
      case 'pie':
        // This is a pie chart - provide asset allocation data
        return this.groupByAndSum(this.dashboardData, 'assetCategory', 'totalValue');
        
      case 'bar':
        // This is a bar chart - provide monthly data
        return this.groupByAndSum(this.dashboardData, 'month', 'totalValue');
        
      case 'line':
        // This is a line chart - provide portfolio performance data
        return this.groupByAndSum(this.dashboardData, 'month', 'totalValue');
        
      case 'scatter':
        // This is a scatter chart - provide risk vs return data
        const riskReturnData = this.dashboardData.filter(row => row.riskValue !== undefined && row.returnValue !== undefined);
        const groupedRiskReturn = riskReturnData.reduce((acc, row) => {
          if (!acc[row.assetCategory]) {
            acc[row.assetCategory] = {
              name: row.assetCategory,
              value: [row.riskValue!, row.returnValue!]
            };
          }
          return acc;
        }, {} as Record<string, any>);
        return Object.values(groupedRiskReturn);
        
      case 'heatmap':
        // This is a heatmap - provide heatmap data
        return this.createHeatmapData(this.dashboardData);
        
      case 'gauge':
        // This is a gauge chart - provide simple numeric data
        const totalValue = this.dashboardData.reduce((sum, row) => sum + row.totalValue, 0);
        return [{ name: 'Progress', value: Math.min(totalValue / 10, 100) }]; // Scale to percentage
        
      case 'treemap':
        // This is a treemap - provide treemap data
        return this.createTreemapData(this.dashboardData);
        
      case 'sunburst':
        // This is a sunburst chart - provide sunburst data
        return this.createSunburstData(this.dashboardData);
        
      case 'sankey':
        // This is a sankey diagram - provide default sankey data
        return {
          nodes: [
            { name: 'Income' }, { name: 'Expenses' }, { name: 'Savings' }
          ],
          links: [
            { source: 'Income', target: 'Expenses', value: 70 },
            { source: 'Income', target: 'Savings', value: 30 }
          ]
        };
        
      // case 'candlestick':
      //   // This is a candlestick chart - provide sample OHLC data
      //   // Sample OHLC data based on totalValue from dashboard data
      //   const stockData = [];
      //   const dateLabels = [];
      //   const sortedData = this.dashboardData.sort((a, b) => a.month.localeCompare(b.month));
      //   
      //   for (let i = 0; i < Math.min(sortedData.length, 15); i++) {
      //     const baseValue = sortedData[i].totalValue;
      //     // Generate realistic OHLC data: [open, close, low, high]
      //     const open = baseValue + (Math.random() - 0.5) * 10;
      //     const close = open + (Math.random() - 0.5) * 15;
      //     const low = Math.min(open, close) - Math.random() * 5;
      //     const high = Math.max(open, close) + Math.random() * 5;
      //     
      //     stockData.push([open, close, low, high]);
      //     dateLabels.push(`2024-01-${String(i + 1).padStart(2, '0')}`);
      //   }
      //   
      //   return { data: stockData, xAxisData: dateLabels };
        
      default:
        return null;
    }
  }

  /**
   * Get filtered data for a specific widget using enhanced chart builder transformation methods
   */
  protected getFilteredDataForWidget(widgetTitle: string, data?: DashboardDataRow[]): any {
    const sourceData = data || this.dashboardData;

    switch (widgetTitle) {
      case 'Asset Allocation':
        // Use enhanced data transformation for pie chart
        return PieChartBuilder.transformData(sourceData, {
          valueField: 'totalValue',
          nameField: 'assetCategory',
          sortBy: 'value'
        });
        
      case 'Monthly Income vs Expenses':
        // Group by month and sum totalValue (for all asset categories)
        return this.groupByAndSum(sourceData, 'month', 'totalValue');
        
      case 'Portfolio Performance':
        // Use AreaChartBuilder's transformation method
        const portfolioResult = AreaChartBuilder.transformToAreaData(sourceData, {
          valueField: 'totalValue',
          nameField: 'month',
          xAxisField: 'month'
        });
        return portfolioResult.data;
        
      case 'Risk vs Return Analysis':
        // Filter rows that have both risk and return values, group by assetCategory
        const riskReturnData = sourceData.filter(row => row.riskValue !== undefined && row.returnValue !== undefined);
        // Group by assetCategory and take the first occurrence for each category
        const groupedRiskReturn = riskReturnData.reduce((acc, row) => {
          if (!acc[row.assetCategory]) {
            acc[row.assetCategory] = {
              name: row.assetCategory,
              value: [row.riskValue!, row.returnValue!]
            };
          }
          return acc;
        }, {} as Record<string, any>);
        return Object.values(groupedRiskReturn);
        
      case 'Investment Distribution by Region':
        // Group by market (country) and sum totalValue for map visualization
        const investmentData = this.groupByAndSum(sourceData, 'market', 'totalValue');
        return investmentData;
        
      case 'Weekly Spending Heatmap':
        // Create heatmap data from the dashboard data
        // Group by month and assetCategory to create a heatmap
        const heatmapData = this.createHeatmapData(sourceData);
        return heatmapData;
        
      case 'Revenue Trend':
        // Group by month and sum totalValue for area chart
        const revenueData = this.groupByAndSum(sourceData, 'month', 'totalValue');
        return revenueData;
        
      case 'Performance Monitoring':
        // Use all data points for large-scale area chart
        const performanceData = sourceData.map(row => ({
          name: `${row.month}-${row.assetCategory}`,
          value: row.totalValue
        }));
        return performanceData;
        
      case 'Performance Metrics':
        // Create polar chart data from asset categories
        const polarData = this.createPolarData(sourceData);
        return polarData;
        
      case 'Financial Performance':
        // Create multi-series polar data
        const multiPolarData = this.createMultiSeriesPolarData(sourceData);
        return multiPolarData;
        
      case 'Business Metrics':
        // Create radar-style polar data
        const radarData = this.createRadarData(sourceData);
        return radarData;
        
      case 'Market Conditions':
        // Create multi-series data for market trends
        const marketData = this.createMarketTrendData(sourceData);
        return marketData;
        
      case 'Portfolio Distribution':
        // Use TreemapChartBuilder's transformation method
        return TreemapChartBuilder.transformToTreemapData(sourceData, {
          valueField: 'totalValue',
          nameField: 'market',
          childrenField: 'assetCategory'
        });
        
      case 'Monthly Expenses':
        // Use TreemapChartBuilder's transformation method for expenses
        return TreemapChartBuilder.transformToTreemapData(sourceData, {
          valueField: 'totalValue',
          nameField: 'assetCategory',
          childrenField: 'month'
        });
        
      case 'Financial Overview Treemap':
        // Create large-scale treemap data
        const largeTreemapData = this.createLargeTreemapData(sourceData);
        return largeTreemapData;
        
      case 'Organizational Structure':
        // Create sunburst data from asset categories
        const sunburstData = this.createSunburstData(sourceData);
        return sunburstData;
        
      case 'Financial Overview Sunburst':
        // Create large-scale sunburst data
        const largeSunburstData = this.createLargeSunburstData(sourceData);
        return largeSunburstData;
        
      case 'Financial Flow':
      case 'Investment Flow':
      case 'Budget Allocation':
        // Use SankeyChartBuilder's transformation method
        return SankeyChartBuilder.transformToSankeyData(sourceData, {
          sourceField: 'assetCategory',
          targetField: 'market',
          valueField: 'totalValue',
          aggregateBy: 'sum'
        });
        
      case 'Test Filter Widget':
        // Group by assetCategory and sum totalValue (same as Asset Allocation)
        const testData = this.groupByAndSum(sourceData, 'assetCategory', 'totalValue');
        return testData;
        
      default:
        return null;
    }
  }

  /**
   * Enhanced data update method using chart builder transformation methods
   */
  protected updateWidgetWithEnhancedData(widget: IWidget, sourceData: DashboardDataRow[]): void {
    const widgetTitle = widget.config?.header?.title;
    if (!widgetTitle) return;

    // Get transformed data using the new approach
    const transformedData = this.getFilteredDataForWidget(widgetTitle, sourceData);
    if (!transformedData) return;

    // Use enhanced update methods with retry mechanism
    // Check if this is an ECharts widget
    if (widget.config?.component !== 'echart') {
      this.updateEchartWidget(widget, transformedData);
      return;
    }

    const chartOptions = widget.config.options as any;
    const chartType = chartOptions?.series?.[0]?.type;
    
    switch (chartType) {
      case 'pie':
        PieChartBuilder.updateData(widget, transformedData, { maxAttempts: 5, baseDelay: 200 });
        break;
      case 'line':
        if (chartOptions?.series?.[0]?.areaStyle) {
          // This is an area chart
          AreaChartBuilder.updateData(widget, transformedData, { maxAttempts: 5, baseDelay: 200 });
        }
        break;
      case 'treemap':
        TreemapChartBuilder.updateData(widget, transformedData, { maxAttempts: 5, baseDelay: 200 });
        break;
      case 'sankey':
        SankeyChartBuilder.updateData(widget, transformedData, { maxAttempts: 5, baseDelay: 200 });
        break;
      default:
        // Fall back to the base update method
        this.updateEchartWidget(widget, transformedData);
        break;
    }
  }

  /**
   * Enhanced filtering method that applies filters and updates all widgets
   */
  protected applyEnhancedFilters(filters: any[]): void {
    if (!this.dashboardConfig?.widgets) return;

    // Apply filters to base data
    let filteredData = this.dashboardData;
    
    if (filters && filters.length > 0) {
      // Use the enhanced filtering from the base chart builder
      const dataFilters = filters.map(filter => ({
        property: filter.filterColumn || 'assetCategory',
        operator: 'equals' as const,
        value: filter.value
      }));
      
      filteredData = ApacheEchartBuilder.applyFilters(this.dashboardData, dataFilters);
    }

    // Update all chart widgets with filtered data
    const chartWidgets = this.dashboardConfig.widgets.filter(widget => 
      widget.config?.component === 'echart'
    );

    chartWidgets.forEach(widget => {
      this.updateWidgetWithEnhancedData(widget, filteredData);
    });

    // Update metric tiles
    this.updateMetricTilesWithFilters(filters);

    // Trigger change detection
    setTimeout(() => this.cdr.detectChanges(), 100);
  }



  // Helper methods specific to this component's data transformations

  /**
   * Helper method to create polar chart data
   */
  private createPolarData(data: DashboardDataRow[]): number[] {
    // Group by asset category and sum totalValue
    const groupedData = data.reduce((acc, row) => {
      if (!acc[row.assetCategory]) {
        acc[row.assetCategory] = 0;
      }
      acc[row.assetCategory] += row.totalValue;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.values(groupedData);
  }

  /**
   * Helper method to create multi-series polar data
   */
  private createMultiSeriesPolarData(data: DashboardDataRow[]): Array<{ name: string; data: number[] }> {
    // Create multiple series based on markets
    const markets = [...new Set(data.map(row => row.market))];
    const categories = [...new Set(data.map(row => row.assetCategory))];
    
    return markets.map(market => {
      const marketData = data.filter(row => row.market === market);
      const dataByCategory = categories.map(category => {
        const categoryData = marketData.find(row => row.assetCategory === category);
        return categoryData ? categoryData.totalValue : 0;
      });
      
      return {
        name: market,
        data: dataByCategory
      };
    });
  }

  /**
   * Helper method to create radar data
   */
  private createRadarData(data: DashboardDataRow[]): number[] {
    // Create radar data from asset categories
    const categories = [...new Set(data.map(row => row.assetCategory))];
    return categories.map(category => {
      const categoryData = data.filter(row => row.assetCategory === category);
      return categoryData.reduce((sum, row) => sum + row.totalValue, 0);
    });
  }

  /**
   * Helper method to create market trend data
   */
  private createMarketTrendData(data: DashboardDataRow[]): Array<{ name: string; data: number[] }> {
    // Create market trend series
    const months = [...new Set(data.map(row => row.month))];
    const markets = [...new Set(data.map(row => row.market))];
    
    return markets.map(market => {
      const marketData = data.filter(row => row.market === market);
      const dataByMonth = months.map(month => {
        const monthData = marketData.find(row => row.month === month);
        return monthData ? monthData.totalValue : 0;
      });
      
      return {
        name: market,
        data: dataByMonth
      };
    });
  }

  /**
   * Helper method to create treemap data
   */
  protected createTreemapData(data: DashboardDataRow[]): Array<{ name: string; value: number; children?: Array<{ name: string; value: number }> }> {
    // Group by market and asset category
    const markets = [...new Set(data.map(row => row.market))];
    
    return markets.map(market => {
      const marketData = data.filter(row => row.market === market);
      const categories = [...new Set(marketData.map(row => row.assetCategory))];
      
      const children = categories.map(category => {
        const categoryData = marketData.filter(row => row.assetCategory === category);
        const value = categoryData.reduce((sum, row) => sum + row.totalValue, 0);
        return { name: category, value };
      });
      
      const totalValue = children.reduce((sum, child) => sum + child.value, 0);
      
      return {
        name: market,
        value: totalValue,
        children
      };
    });
  }

  /**
   * Helper method to create expense treemap data
   */
  private createExpenseTreemapData(data: DashboardDataRow[]): Array<{ name: string; value: number; children?: Array<{ name: string; value: number }> }> {
    // Create expense categories from asset categories
    const categories = [...new Set(data.map(row => row.assetCategory))];
    
    return categories.map(category => {
      const categoryData = data.filter(row => row.assetCategory === category);
      const markets = [...new Set(categoryData.map(row => row.market))];
      
      const children = markets.map(market => {
        const marketData = categoryData.filter(row => row.market === market);
        const value = marketData.reduce((sum, row) => sum + row.totalValue, 0);
        return { name: market, value };
      });
      
      const totalValue = children.reduce((sum, child) => sum + child.value, 0);
      
      return {
        name: category,
        value: totalValue,
        children
      };
    });
  }

  /**
   * Helper method to create large treemap data
   */
  private createLargeTreemapData(data: DashboardDataRow[]): Array<{ name: string; value: number; children?: Array<{ name: string; value: number; children?: Array<{ name: string; value: number }> }> }> {
    // Create hierarchical data structure
    const markets = [...new Set(data.map(row => row.market))];
    
    return markets.map(market => {
      const marketData = data.filter(row => row.market === market);
      const categories = [...new Set(marketData.map(row => row.assetCategory))];
      
      const categoryChildren = categories.map(category => {
        const categoryData = marketData.filter(row => row.assetCategory === category);
        const months = [...new Set(categoryData.map(row => row.month))];
        
        const monthChildren = months.map(month => {
          const monthData = categoryData.find(row => row.month === month);
          return { name: month, value: monthData ? monthData.totalValue : 0 };
        });
        
        const categoryValue = monthChildren.reduce((sum, child) => sum + child.value, 0);
        
        return {
          name: category,
          value: categoryValue,
          children: monthChildren
        };
      });
      
      const marketValue = categoryChildren.reduce((sum, child) => sum + child.value, 0);
      
      return {
        name: market,
        value: marketValue,
        children: categoryChildren
      };
    });
  }

  /**
   * Helper method to create sunburst data
   */
  protected createSunburstData(data: DashboardDataRow[]): Array<{ name: string; value?: number; children?: Array<{ name: string; value: number }> }> {
    // Create hierarchical sunburst data
    const markets = [...new Set(data.map(row => row.market))];
    
    return markets.map(market => {
      const marketData = data.filter(row => row.market === market);
      const categories = [...new Set(marketData.map(row => row.assetCategory))];
      
      const children = categories.map(category => {
        const categoryData = marketData.filter(row => row.assetCategory === category);
        const value = categoryData.reduce((sum, row) => sum + row.totalValue, 0);
        return { name: category, value };
      });
      
      return {
        name: market,
        children
      };
    });
  }

  /**
   * Helper method to create large sunburst data
   */
  private createLargeSunburstData(data: DashboardDataRow[]): Array<{ name: string; value?: number; children?: Array<{ name: string; value?: number; children?: Array<{ name: string; value: number }> }> }> {
    // Create more detailed hierarchical sunburst data
    const markets = [...new Set(data.map(row => row.market))];
    
    return markets.map(market => {
      const marketData = data.filter(row => row.market === market);
      const categories = [...new Set(marketData.map(row => row.assetCategory))];
      
      const categoryChildren = categories.map(category => {
        const categoryData = marketData.filter(row => row.assetCategory === category);
        const months = [...new Set(categoryData.map(row => row.month))];
        
        const monthChildren = months.map(month => {
          const monthData = categoryData.find(row => row.month === month);
          return { name: month, value: monthData ? monthData.totalValue : 0 };
        });
        
        return {
          name: category,
          children: monthChildren
        };
      });
      
      return {
        name: market,
        children: categoryChildren
      };
    });
  }

  /**
   * Create heatmap data from dashboard data
   */
  protected  createHeatmapData(
    data: DashboardDataRow[], 
    xField: string = 'assetCategory', 
    yField: string = 'month', 
    valueField: string = 'totalValue'
  ): { value: [number, number, number]; name: string; }[] {
    // Create a simple heatmap using asset categories (x-axis) and months (y-axis)
    const xCategories = [...new Set(data.map(row => row[xField as keyof DashboardDataRow]))];
    const yCategories = [...new Set(data.map(row => row[yField as keyof DashboardDataRow]))].sort();
    
    const heatmapData: { value: [number, number, number]; name: string; }[] = [];
    
    xCategories.forEach((xCategory, xIndex) => {
      yCategories.forEach((yCategory, yIndex) => {
        const filteredData = data.filter(row => 
          row[xField as keyof DashboardDataRow] === xCategory && 
          row[yField as keyof DashboardDataRow] === yCategory
        );
        
        const value = filteredData.reduce((sum, row) => 
          sum + Number(row[valueField as keyof DashboardDataRow]), 0
        );
        
        if (value > 0) {
          heatmapData.push({
            value: [xIndex, yIndex, value],
            name: `${xCategory}-${yCategory}`
          });
        }
      });
    });
    
    return heatmapData;
  }
}