import { GridsterConfig, GridType, DisplayGrid } from 'angular-gridster2';
import { DashboardContainerBuilder, DashboardConfig } from './dashboard-container-builder';
import { 
  DESKTOP_GRID_SETTINGS, 
  MOBILE_GRID_SETTINGS, 
  TABLET_GRID_SETTINGS, 
  LARGE_DESKTOP_GRID_SETTINGS,
  LAYOUT_PRESETS,
  SCREEN_BREAKPOINTS,
  getGridSettingsForScreenSize
} from './dashboard-constants';

/**
 * Standard Dashboard Container Builder
 * Provides a concrete implementation for standard dashboard containers
 */
export class StandardDashboardBuilder extends DashboardContainerBuilder<GridsterConfig> {
  
  /**
   * Get default configuration for standard dashboard
   */
  protected getDefaultConfig(): Partial<GridsterConfig> {
    return {
      gridType: GridType.VerticalFixed,
      displayGrid: DisplayGrid.None,
      outerMargin: true,
      draggable: {
        enabled: false,
      },
      resizable: {
        enabled: false,
      },
      maxCols: DESKTOP_GRID_SETTINGS.MAX_COLS,
      minCols: DESKTOP_GRID_SETTINGS.MIN_COLS,
      maxRows: DESKTOP_GRID_SETTINGS.MAX_ROWS,
      minRows: DESKTOP_GRID_SETTINGS.MIN_ROWS,
      fixedColWidth: DESKTOP_GRID_SETTINGS.FIXED_COL_WIDTH,
      fixedRowHeight: DESKTOP_GRID_SETTINGS.FIXED_ROW_HEIGHT,
      enableEmptyCellClick: false,
      enableEmptyCellContextMenu: false,
      enableEmptyCellDrop: false,
      enableEmptyCellDrag: false,
      emptyCellDragMaxCols: 50,
      emptyCellDragMaxRows: 50,
      ignoreMarginInRow: false,
      mobileBreakpoint: DESKTOP_GRID_SETTINGS.MOBILE_BREAKPOINT,
    };
  }

  /**
   * Enable edit mode with draggable and resizable widgets
   */
  enableEditMode(): this {
    return this
      .setDraggable(true)
      .setResizable(true)
      .setEditMode(true)
      .setDisplayGrid(DisplayGrid.Always);
  }

  /**
   * Disable edit mode (view-only)
   */
  disableEditMode(): this {
    return this
      .setDraggable(false)
      .setResizable(false)
      .setEditMode(false)
      .setDisplayGrid(DisplayGrid.None);
  }

  /**
   * Set responsive configuration
   */
  setResponsive(breakpoint: number = DESKTOP_GRID_SETTINGS.MOBILE_BREAKPOINT): this {
    return this.setMobileBreakpoint(breakpoint);
  }

  /**
   * Set compact layout (smaller margins and spacing)
   */
  setCompactLayout(): this {
    return this
      .setOuterMargin(LAYOUT_PRESETS.COMPACT.OUTER_MARGIN)
      .setFixedColWidth(LAYOUT_PRESETS.COMPACT.FIXED_COL_WIDTH)
      .setFixedRowHeight(LAYOUT_PRESETS.COMPACT.FIXED_ROW_HEIGHT);
  }

  /**
   * Set spacious layout (larger margins and spacing)
   */
  setSpaciousLayout(): this {
    return this
      .setOuterMargin(LAYOUT_PRESETS.SPACIOUS.OUTER_MARGIN)
      .setFixedColWidth(LAYOUT_PRESETS.SPACIOUS.FIXED_COL_WIDTH)
      .setFixedRowHeight(LAYOUT_PRESETS.SPACIOUS.FIXED_ROW_HEIGHT);
  }

  /**
   * Set grid layout with visible grid lines
   */
  setGridLayout(): this {
    return this.setDisplayGrid(DisplayGrid.Always);
  }

  /**
   * Set fluid layout (responsive columns)
   */
  setFluidLayout(): this {
    return this
      .setGridType(GridType.VerticalFixed)
      .setMaxCols(24)
      .setMinCols(1);
  }

  /**
   * Set fixed layout (non-responsive)
   */
  setFixedLayout(): this {
    return this
      .setGridType(GridType.Fit)
      .setMaxCols(DESKTOP_GRID_SETTINGS.MAX_COLS)
      .setMinCols(DESKTOP_GRID_SETTINGS.MAX_COLS);
  }

  /**
   * Configure for mobile devices
   */
  setMobileOptimized(): this {
    const settings = MOBILE_GRID_SETTINGS;
    return this
      .setMobileBreakpoint(settings.MOBILE_BREAKPOINT)
      .setMaxCols(settings.MAX_COLS)
      .setFixedColWidth(settings.FIXED_COL_WIDTH)
      .setFixedRowHeight(settings.FIXED_ROW_HEIGHT);
  }

  /**
   * Configure for tablet devices
   */
  setTabletOptimized(): this {
    const settings = TABLET_GRID_SETTINGS;
    return this
      .setMobileBreakpoint(settings.MOBILE_BREAKPOINT)
      .setMaxCols(settings.MAX_COLS)
      .setFixedColWidth(settings.FIXED_COL_WIDTH)
      .setFixedRowHeight(settings.FIXED_ROW_HEIGHT);
  }

  /**
   * Configure for desktop devices
   */
  setDesktopOptimized(): this {
    const settings = DESKTOP_GRID_SETTINGS;
    return this
      .setMaxCols(settings.MAX_COLS)
      .setFixedColWidth(settings.FIXED_COL_WIDTH)
      .setFixedRowHeight(settings.FIXED_ROW_HEIGHT)
      .setMobileBreakpoint(SCREEN_BREAKPOINTS.DESKTOP);
  }

  /**
   * Configure for large desktop devices
   */
  setLargeDesktopOptimized(): this {
    const settings = LARGE_DESKTOP_GRID_SETTINGS;
    return this
      .setMaxCols(settings.MAX_COLS)
      .setFixedColWidth(settings.FIXED_COL_WIDTH)
      .setFixedRowHeight(settings.FIXED_ROW_HEIGHT)
      .setMobileBreakpoint(settings.MOBILE_BREAKPOINT);
  }

  /**
   * Set custom grid dimensions
   */
  setGridDimensions(cols: number, rows: number): this {
    return this
      .setMaxCols(cols)
      .setMinCols(cols)
      .setMaxRows(rows);
  }

  /**
   * Enable empty cell interactions
   */
  enableEmptyCellInteractions(): this {
    return this
      .setEmptyCellConfig({
        enableEmptyCellClick: true,
        enableEmptyCellContextMenu: true,
        enableEmptyCellDrop: true,
        enableEmptyCellDrag: true
      });
  }

  /**
   * Disable empty cell interactions
   */
  disableEmptyCellInteractions(): this {
    return this
      .setEmptyCellConfig({
        enableEmptyCellClick: false,
        enableEmptyCellContextMenu: false,
        enableEmptyCellDrop: false,
        enableEmptyCellDrag: false
      });
  }

  /**
   * Set custom item size constraints
   */
  setItemSizeConstraints(
    minCols: number = DESKTOP_GRID_SETTINGS.MIN_COLS,
    maxCols: number = DESKTOP_GRID_SETTINGS.MAX_COLS,
    minRows: number = DESKTOP_GRID_SETTINGS.MIN_ROWS,
    maxRows: number = 50
  ): this {
    return this
      .setMinCols(minCols)
      .setMaxCols(maxCols)
      .setMinRows(minRows)
      .setMaxRows(maxRows);
  }

  /**
   * Set grid settings for a specific screen size
   */
  setScreenSize(screenSize: 'MOBILE' | 'TABLET' | 'DESKTOP' | 'LARGE_DESKTOP'): this {
    const settings = getGridSettingsForScreenSize(screenSize);
    return this
      .setMaxCols(settings.MAX_COLS)
      .setMinCols(settings.MIN_COLS)
      .setMaxRows(settings.MAX_ROWS)
      .setMinRows(settings.MIN_ROWS)
      .setFixedColWidth(settings.FIXED_COL_WIDTH)
      .setFixedRowHeight(settings.FIXED_ROW_HEIGHT)
      .setMobileBreakpoint(settings.MOBILE_BREAKPOINT);
  }

  /**
   * Create a builder instance with common dashboard settings
   */
  static createStandard(): StandardDashboardBuilder {
    return new StandardDashboardBuilder()
      .setGridType(GridType.VerticalFixed)
      .setDisplayGrid(DisplayGrid.None)
      .setOuterMargin(true)
      .setDraggable(false)
      .setResizable(false)
      .setMaxCols(DESKTOP_GRID_SETTINGS.MAX_COLS)
      .setMinCols(DESKTOP_GRID_SETTINGS.MIN_COLS)
      .setMaxRows(DESKTOP_GRID_SETTINGS.MAX_ROWS)
      .setMinRows(DESKTOP_GRID_SETTINGS.MIN_ROWS)
      .setFixedColWidth(DESKTOP_GRID_SETTINGS.FIXED_COL_WIDTH)
      .setFixedRowHeight(DESKTOP_GRID_SETTINGS.FIXED_ROW_HEIGHT)
      .setMobileBreakpoint(DESKTOP_GRID_SETTINGS.MOBILE_BREAKPOINT);
  }

  /**
   * Create a builder instance for edit mode
   */
  static createEditMode(): StandardDashboardBuilder {
    return new StandardDashboardBuilder()
      .enableEditMode()
      .setMaxCols(DESKTOP_GRID_SETTINGS.MAX_COLS)
      .setMinCols(DESKTOP_GRID_SETTINGS.MIN_COLS)
      .setMaxRows(DESKTOP_GRID_SETTINGS.MAX_ROWS)
      .setMinRows(DESKTOP_GRID_SETTINGS.MIN_ROWS)
      .setFixedColWidth(DESKTOP_GRID_SETTINGS.FIXED_COL_WIDTH)
      .setFixedRowHeight(DESKTOP_GRID_SETTINGS.FIXED_ROW_HEIGHT)
      .setMobileBreakpoint(DESKTOP_GRID_SETTINGS.MOBILE_BREAKPOINT);
  }

  /**
   * Create a builder instance for mobile devices
   */
  static createMobile(): StandardDashboardBuilder {
    return new StandardDashboardBuilder()
      .setScreenSize('MOBILE')
      .setCompactLayout();
  }

  /**
   * Create a builder instance for tablet devices
   */
  static createTablet(): StandardDashboardBuilder {
    return new StandardDashboardBuilder()
      .setScreenSize('TABLET')
      .setSpaciousLayout();
  }

  /**
   * Create a builder instance for desktop devices
   */
  static createDesktop(): StandardDashboardBuilder {
    return new StandardDashboardBuilder()
      .setScreenSize('DESKTOP')
      .setSpaciousLayout();
  }

  /**
   * Create a builder instance for large desktop devices
   */
  static createLargeDesktop(): StandardDashboardBuilder {
    return new StandardDashboardBuilder()
      .setScreenSize('LARGE_DESKTOP')
      .setSpaciousLayout();
  }

  /**
   * Build the dashboard configuration
   */
  override build(): DashboardConfig {
    return {
      config: this.containerConfig as GridsterConfig,
      widgets: this.widgets,
      filterValues: this.filterValues,
      dashboardId: this.dashboardId,
      isEditMode: this.isEditMode,
      chartHeight: this.chartHeight,
      defaultChartHeight: this.defaultChartHeight,
      filterVisualization: (this as any).filterVisualization,
      // exportToPdf: this.exportToPdf.bind(this)
    };
  }

  /**
   * Export dashboard to PDF (placeholder - will be overridden by component)
   */
  // override exportToPdf(options: any = {}): Promise<void> {
  //   // This is a placeholder - the actual implementation will be provided by the component
  //   return Promise.reject(new Error('Export to PDF method must be implemented by the dashboard component'));
  // }
} 