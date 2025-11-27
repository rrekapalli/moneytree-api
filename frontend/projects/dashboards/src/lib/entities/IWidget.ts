import {ECharts, EChartsOption} from 'echarts';
import {GridsterItem} from 'angular-gridster2';
import {IState} from './IState';
import {IFilterOptions} from './IFilterOptions';
import {ITileOptions} from './ITileOptions';
import {IMarkdownCellOptions} from './IMarkdownCellOptions';
import {ICodeCellOptions} from './ICodeCellOptions';
import {ITableOptions} from './ITableOptions';
import {IFilterValues} from './IFilterValues';
import {FilterBy} from '../echart-chart-builders/apache-echart-builder';

/**
 * Interface representing a widget in the dashboard
 */
export interface IWidget extends GridsterItem {
  /** Unique identifier for the widget */
  id: string;
  
  /** Position and size configuration for the gridster layout */
  position: GridsterItem;
  
  /** Widget configuration object */
  config: {
    /** Component type identifier */
    component?: string;
    
    /** Initial state of the widget */
    initialState?: IState;
    
    /** Current state of the widget */
    state?: IState;
    
    /** Header configuration */
    header?: {
      /** Widget title */
      title: string;
      /** Available options for the widget header */
      options?: string[];
    };
    
    /** Size configuration [width, height] */
    size?: number[];
    
    /** Widget-specific options based on the component type */
    options: EChartsOption | IFilterOptions | ITileOptions | IMarkdownCellOptions | ICodeCellOptions | ITableOptions;
    
    /** Data accessor key for retrieving values */
    accessor?: string;
    
    /** Filter column/property to use when applying filters (falls back to accessor if not specified) */
    filterColumn?: string;
    
    /** How to filter when this widget is clicked: by value or by category */
    filterBy?: FilterBy;
    
    /** Event handlers */
    events?: {
      /** Callback function when chart options change
       * @param widget - The current widget instance
       * @param chart - Optional ECharts instance
       * @param filters - Optional filter values
       */
      onChartOptions?: (widget: IWidget, chart?: ECharts, filters?: string | IFilterValues[]) => void 
    };
  };
  
  /** Data series for the widget */
  series?: [{}];
  
  /** Dynamic data for the widget that can be updated via API calls */
  data?: any;
  
  /** Reference to the ECharts instance if applicable */
  chartInstance?: ECharts | null;
  
  /** Optional height of the widget */
  height?: number;

  /** Method to update widget data dynamically */
  setData?(data: any): void;
}
