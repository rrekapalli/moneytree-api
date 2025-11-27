import { GridsterConfig, GridType, DisplayGrid } from 'angular-gridster2';
import { IWidget } from '../entities/IWidget';
import { IFilterValues } from '../entities/IFilterValues';
// import { PdfExportOptions } from '../services/pdf-export.service';

/**
 * Abstract base class for Dashboard Container builders
 * Provides common functionality for all dashboard container types
 */
export abstract class DashboardContainerBuilder<T extends GridsterConfig = GridsterConfig> {
  protected containerConfig: Partial<T>;
  protected widgets: IWidget[] = [];
  protected filterValues: IFilterValues[] = [];
  protected dashboardId: string = '';
  protected isEditMode: boolean = false;
  protected chartHeight: number = 300;
  protected defaultChartHeight: number = 400;

  protected constructor() {
    this.containerConfig = this.getDefaultConfig();
  }

  /**
   * Abstract method to be implemented by subclasses
   * Should return default configuration for the specific container type
   */
  protected abstract getDefaultConfig(): Partial<T>;

  /**
   * Set the grid type for the dashboard
   */
  setGridType(gridType: GridType): this {
    this.containerConfig.gridType = gridType;
    return this;
  }

  /**
   * Set the display grid configuration
   */
  setDisplayGrid(displayGrid: DisplayGrid): this {
    this.containerConfig.displayGrid = displayGrid;
    return this;
  }

  /**
   * Set outer margin
   */
  setOuterMargin(outerMargin: boolean): this {
    this.containerConfig.outerMargin = outerMargin;
    return this;
  }

  /**
   * Set draggable configuration
   */
  setDraggable(enabled: boolean, options?: any): this {
    this.containerConfig.draggable = { enabled, ...options };
    return this;
  }

  /**
   * Set resizable configuration
   */
  setResizable(enabled: boolean, options?: any): this {
    this.containerConfig.resizable = { enabled, ...options };
    return this;
  }

  /**
   * Set maximum columns
   */
  setMaxCols(maxCols: number): this {
    this.containerConfig.maxCols = maxCols;
    return this;
  }

  /**
   * Set minimum columns
   */
  setMinCols(minCols: number): this {
    this.containerConfig.minCols = minCols;
    return this;
  }

  /**
   * Set maximum rows
   */
  setMaxRows(maxRows: number): this {
    this.containerConfig.maxRows = maxRows;
    return this;
  }

  /**
   * Set minimum rows
   */
  setMinRows(minRows: number): this {
    this.containerConfig.minRows = minRows;
    return this;
  }

  /**
   * Set fixed column width
   */
  setFixedColWidth(width: number): this {
    this.containerConfig.fixedColWidth = width;
    return this;
  }

  /**
   * Set fixed row height
   */
  setFixedRowHeight(height: number): this {
    this.containerConfig.fixedRowHeight = height;
    return this;
  }

  /**
   * Set empty cell configuration
   */
  setEmptyCellConfig(config: {
    enableEmptyCellClick?: boolean;
    enableEmptyCellContextMenu?: boolean;
    enableEmptyCellDrop?: boolean;
    enableEmptyCellDrag?: boolean;
    emptyCellDragMaxCols?: number;
    emptyCellDragMaxRows?: number;
  }): this {
    Object.assign(this.containerConfig, config);
    return this;
  }

  /**
   * Set ignore margin in row
   */
  setIgnoreMarginInRow(ignore: boolean): this {
    this.containerConfig.ignoreMarginInRow = ignore;
    return this;
  }

  /**
   * Set mobile breakpoint
   */
  setMobileBreakpoint(breakpoint: number): this {
    this.containerConfig.mobileBreakpoint = breakpoint;
    return this;
  }

  /**
   * Set widgets for the dashboard
   */
  setWidgets(widgets: IWidget[]): this {
    this.widgets = widgets;
    return this;
  }

  /**
   * Add a single widget to the dashboard
   */
  addWidget(widget: IWidget): this {
    this.widgets.push(widget);
    return this;
  }

  /**
   * Set filter values
   */
  setFilterValues(filterValues: IFilterValues[]): this {
    this.filterValues = filterValues;
    return this;
  }

  /**
   * Set dashboard ID
   */
  setDashboardId(dashboardId: string): this {
    this.dashboardId = dashboardId;
    return this;
  }

  /**
   * Set edit mode
   */
  setEditMode(isEditMode: boolean): this {
    this.isEditMode = isEditMode;
    return this;
  }

  /**
   * Set chart height
   */
  setChartHeight(height: number): this {
    this.chartHeight = height;
    return this;
  }

  /**
   * Set default chart height
   */
  setDefaultChartHeight(height: number): this {
    this.defaultChartHeight = height;
    return this;
  }

  /**
   * Set custom configuration options
   */
  setCustomConfig(config: Partial<T>): this {
    this.containerConfig = { ...this.containerConfig, ...config };
    return this;
  }

  /**
   * Set item resize callback
   */
  setItemResizeCallback(callback: (item: any, itemComponent: any) => void): this {
    this.containerConfig.itemResizeCallback = callback;
    return this;
  }

  /**
   * Set item change callback
   */
  setItemChangeCallback(callback: (item: any, itemComponent: any) => void): this {
    this.containerConfig.itemChangeCallback = callback;
    return this;
  }

  /**
   * Set the filter visualization configuration for the dashboard
   * @param config Filter visualization configuration
   * @returns The builder instance for method chaining
   */
  setFilterVisualization(config: {
    enableHighlighting?: boolean;
    defaultFilteredOpacity?: number;
    defaultHighlightedOpacity?: number;
    defaultHighlightColor?: string;
    defaultFilteredColor?: string;
  }): this {
    (this as any).filterVisualization = config;
    return this;
  }

  /**
   * Enable highlighting mode for filters
   * @param enabled Whether to enable highlighting mode
   * @param options Optional styling options
   * @returns The builder instance for method chaining
   */
  enableFilterHighlighting(
    enabled: boolean = true, 
    options?: {
      filteredOpacity?: number;
      highlightedOpacity?: number;
      highlightColor?: string;
      filteredColor?: string;
    }
  ): this {
    const config = {
      enableHighlighting: enabled,
      defaultFilteredOpacity: options?.filteredOpacity || 0.3,
      defaultHighlightedOpacity: options?.highlightedOpacity || 1.0,
      defaultHighlightColor: options?.highlightColor || '#ff6b6b',
      defaultFilteredColor: options?.filteredColor || '#cccccc'
    };
    
    return this.setFilterVisualization(config);
  }

  /**
   * Build the dashboard container configuration
   */
  build(): DashboardConfig {
    return {
      config: this.containerConfig as T,
      widgets: this.widgets,
      filterValues: this.filterValues,
      dashboardId: this.dashboardId,
      isEditMode: this.isEditMode,
      chartHeight: this.chartHeight,
      defaultChartHeight: this.defaultChartHeight,
      // exportToPdf: this.exportToPdf.bind(this)
    };
  }

  /**
   * Get the current configuration
   */
  getConfig(): Partial<T> {
    return this.containerConfig;
  }

  /**
   * Get the current widgets
   */
  getWidgets(): IWidget[] {
    return this.widgets;
  }

  /**
   * Get the current filter values
   */
  getFilterValues(): IFilterValues[] {
    return this.filterValues;
  }

  /**
   * Static method to create a new builder instance
   */
  static create<T extends GridsterConfig = GridsterConfig>(): DashboardContainerBuilder<T> {
    return new (this as any)();
  }

  /**
   * Static method to update configuration on an existing dashboard
   */
  static updateConfig(config: GridsterConfig, updates: Partial<GridsterConfig>): GridsterConfig {
    return { ...config, ...updates };
  }

  /**
   * Static method to calculate chart height based on grid dimensions
   */
  static calculateChartHeight(
    cols: number, 
    rows: number, 
    flag: boolean = false, 
    baseHeight: number = 400
  ): number {
    const baseContainerHeight = baseHeight;
    const aspectRatio = cols / rows;
    const area = cols * rows;
    const zoomAdjustment = Math.log(area) / Math.log(2);
    const marginReduction = 0.95;
    
    let heightAdjustment = aspectRatio < 1 
      ? 1 / aspectRatio
      : 1;

    if(flag) {
      heightAdjustment = heightAdjustment * aspectRatio;
    }
    
    return Math.round(baseContainerHeight * heightAdjustment * marginReduction);
  }

  /**
   * Static method to calculate map center based on grid dimensions
   */
  static calculateMapCenter(cols: number, rows: number): number[] {
    const baseLongitude = -95;
    const baseLatitude = 38;
    const aspectRatio = cols / rows;
    const longitudeAdjustment = (aspectRatio > 1) ? (aspectRatio - 1) * 5 : 0;
    const latitudeAdjustment = (aspectRatio < 1) ? ((1 / aspectRatio) - 1) * 2 : 0;
  
    return [
      baseLongitude + longitudeAdjustment,
      baseLatitude + latitudeAdjustment
    ];
  }

  /**
   * Static method to calculate map zoom based on grid dimensions
   */
  static calculateMapZoom(cols: number, rows: number): number {
    const baseZoom = 4.0;
    const area = cols * rows;
    const zoomAdjustment = Math.log(area) / Math.log(2);
    const aspectRatio = cols / rows;
    const aspectAdjustment = Math.abs(1 - aspectRatio) * 0.5;

    return baseZoom - (zoomAdjustment * 0.1) - aspectAdjustment;
  }

  // exportToPdf(options?: PdfExportOptions): Promise<void> {
  //   // This is a placeholder - the actual implementation will be provided by the component
  //   return Promise.reject(new Error('Export to PDF method must be implemented by the dashboard component'));
  // }
}

/**
 * Interface for the complete dashboard container configuration
 */
export interface DashboardConfig {
  config: GridsterConfig;
  widgets: IWidget[];
  filterValues: IFilterValues[];
  dashboardId: string;
  isEditMode: boolean;
  chartHeight: number;
  defaultChartHeight: number;
  // exportToPdf?: (options?: PdfExportOptions) => Promise<void>;
  
  /** Global filter visualization configuration for the entire dashboard */
  filterVisualization?: {
    /** Whether to enable highlighting mode globally for all widgets */
    enableHighlighting?: boolean;
    /** Default opacity for filtered-out (greyed) data (0-1) */
    defaultFilteredOpacity?: number;
    /** Default opacity for highlighted (selected) data (0-1) */
    defaultHighlightedOpacity?: number;
    /** Default color overlay for highlighted data */
    defaultHighlightColor?: string;
    /** Default color overlay for filtered data */
    defaultFilteredColor?: string;
  };
} 