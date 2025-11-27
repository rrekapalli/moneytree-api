// Type definitions for echarts
// This file provides type definitions for echarts without creating circular references

// Import from echarts/core to avoid circular references
import { EChartsCoreOption, ECharts as CoreECharts } from 'echarts/core';

// Explicitly define and export the types needed by the application
export interface EChartsOption extends EChartsCoreOption {
  // Add missing properties that are used in our code
  series?: any[] | object;
  dataset?: any;
  tooltip?: any;
  legend?: any;
  xAxis?: any;
  yAxis?: any;
  grid?: any;
  title?: any;
  [key: string]: any; // Add index signature for string keys
}

export interface ECharts extends CoreECharts {
  // Add missing methods
  resize: (opts?: { width?: number | string; height?: number | string; silent?: boolean }) => void;
}

// Create a namespace to match the structure expected by imports
export namespace echarts {
  export type EChartsOption = import('echarts/core').EChartsCoreOption & {
    series?: any[] | object;
    dataset?: any;
    tooltip?: any;
    legend?: any;
    xAxis?: any;
    yAxis?: any;
    grid?: any;
    title?: any;
    [key: string]: any;
  };
  export type ECharts = import('echarts/core').ECharts & {
    resize: (opts?: { width?: number | string; height?: number | string; silent?: boolean }) => void;
  };
}

// Add default export that doesn't create a circular reference
// This is a simple object with the same structure as echarts
declare const echarts: any;

export default echarts;
