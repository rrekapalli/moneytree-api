import {Component, Input, EventEmitter, ViewChild, ChangeDetectorRef} from '@angular/core';
import {IWidget} from '../../entities/IWidget';
import {CommonModule} from '@angular/common';
import {NgxEchartsDirective, provideEchartsCore} from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { CompactType, DisplayGrid, GridType } from 'angular-gridster2';
import { IFilterValues } from '../../entities/IFilterValues';

@Component({
  selector: 'vis-echart',
  standalone: true,
  template: `<div
    echarts
    [options]="chartOptions"
    (chartInit)="onChartInit($event)"
    (chartClick)="onClick($event)"
    (chartDblClick)="onChartDblClick($event)"
    [style.height.px]="widget.height || 400"
    [style.width.%]="100"
    #chart
  ></div>`,
  imports: [CommonModule, NgxEchartsDirective],
  providers: [provideEchartsCore({
    echarts: () => import('echarts'),
  })],
})
export class EchartComponent {
  @Input() widget!: IWidget;
  @Input() onDataLoad!: EventEmitter<IWidget>;
  @Input() onUpdateFilter!: EventEmitter<any>;
  @ViewChild('chart', { static: false }) chart!: NgxEchartsDirective;

  isSingleClick: boolean = true;
  
  constructor(private cdr: ChangeDetectorRef) {}
  
  get chartOptions() {
    return this.widget?.config?.options as EChartsOption;
  }

  onChartInit(instance: any) {
    this.widget.chartInstance = instance;
    
    // Check if there are event handlers to set up
    if (this.widget.config?.events?.onChartOptions) {
      this.widget.config.events.onChartOptions(this.widget, instance);
    }
    
    setTimeout(() => {
      this.onDataLoad?.emit(this.widget);
      // Force resize after a short delay to ensure chart uses full height
      setTimeout(() => {
        this.forceChartResize();
      }, 100);
    });
  }

  onChartDblClick(e: any): void {
    this.isSingleClick = false;
  }

  onClick(e: any) {
    this.isSingleClick = true;
    setTimeout(() => {
      let selectedPoint = e.data;
      if(e.seriesType === "scatter") {
        const scatterChartData = e.data.find((item: any) => item.name === this.widget.config.state?.accessor)
        selectedPoint = {
          ...selectedPoint,
          ...scatterChartData as object
        }
      }
      
      // Create filter value from clicked data
      const filterValue = this.createFilterValueFromClickData(selectedPoint, e);
      
      if (filterValue) {
        // Add widget information to filter value
        filterValue['widgetId'] = this.widget.id;
        if (this.widget.config?.header?.title) {
          filterValue['widgetTitle'] = this.widget.config.header.title;
        }
        
        this.onUpdateFilter.emit({
          value: selectedPoint,
          widget: this.widget,
          filterValue: filterValue
        });
      } else {
        // Fallback to original behavior
        this.onUpdateFilter.emit({
          value: selectedPoint,
          widget: this.widget,
        });
      }
    }, 250);
  }

  /**
   * Create filter value from chart click data
   */
  private createFilterValueFromClickData(clickedData: any, event: any): IFilterValues | null {
    if (!clickedData || typeof clickedData !== 'object') {
      return null;
    }

    // Get the filter column from widget config, fallback to accessor
    const filterColumn = this.widget.config?.filterColumn || this.widget.config?.accessor || 'unknown';

    let filterValue: IFilterValues = {
      accessor: 'unknown',
      filterColumn: filterColumn
    };

    // For pie charts, use the name as the filter key
    if (clickedData && typeof clickedData === 'object' && clickedData.name && event.seriesType === 'pie') {
      filterValue = {
        accessor: 'category',
        filterColumn: filterColumn,
        category: clickedData.name,
        value: clickedData.name,
        percentage: clickedData.value?.toString() || '0'
      };
    }
    // For bar charts - handle both object and primitive value cases
    else if (event.seriesType === 'bar') {
      let categoryName: string;
      let value: any;
      
      if (clickedData && typeof clickedData === 'object' && clickedData.name) {
        // If clickedData is an object with a name property
        categoryName = clickedData.name;
        value = clickedData.value || clickedData.name;
      } else {
        // If clickedData is just a value (number), we need to get the category from the x-axis
        value = clickedData;
        
        // Try to get the category name from the chart options
        const chartOptions = this.widget.config?.options as any;
        
        let xAxisData: string[] = [];
        
        // Try multiple ways to access x-axis data
        if (chartOptions?.xAxis) {
          if (Array.isArray(chartOptions.xAxis)) {
            xAxisData = chartOptions.xAxis[0]?.data || [];
          } else {
            xAxisData = chartOptions.xAxis.data || [];
          }
        }
        
        // Also try to get from series data if available
        if (xAxisData.length === 0 && chartOptions?.series?.[0]?.data) {
          const seriesData = chartOptions.series[0].data;
          if (Array.isArray(seriesData) && seriesData.length > 0) {
            // If series data has objects with name property
            if (typeof seriesData[0] === 'object' && seriesData[0].name) {
              xAxisData = seriesData.map((item: any) => item.name);
            }
          }
        }
        
        if (xAxisData && Array.isArray(xAxisData) && event.dataIndex !== undefined) {
          categoryName = xAxisData[event.dataIndex];
        } else {
          // Fallback: use the value as the category name
          categoryName = value?.toString() || 'Unknown';
        }
      }
      
      filterValue = {
        accessor: 'category',
        filterColumn: filterColumn,
        category: categoryName,
        value: value,
        seriesName: event.seriesName
      };
    }
    // For line charts
    else if (event.seriesType === 'line') {
      filterValue = {
        accessor: 'series',
        filterColumn: filterColumn,
        series: event.seriesName || (clickedData && typeof clickedData === 'object' ? clickedData.name : null),
        value: clickedData && typeof clickedData === 'object' ? clickedData.value : clickedData,
        xAxis: clickedData && Array.isArray(clickedData) ? clickedData[0]?.toString() : null,
        yAxis: clickedData && Array.isArray(clickedData) ? clickedData[1]?.toString() : null
      };
    }
    // For scatter plots
    else if (event.seriesType === 'scatter' && clickedData && typeof clickedData === 'object' && clickedData.value && Array.isArray(clickedData.value)) {
      filterValue = {
        accessor: 'coordinates',
        filterColumn: filterColumn,
        x: clickedData.value[0]?.toString(),
        y: clickedData.value[1]?.toString(),
        value: `(${clickedData.value[0]}, ${clickedData.value[1]})`,
        seriesName: event.seriesName
      };
    }
    // For other chart types, try to find meaningful properties
    else if (clickedData && typeof clickedData === 'object') {
      const keys = Object.keys(clickedData);
      if (keys.length > 0) {
        const key = keys[0];
        filterValue = {
          accessor: key,
          filterColumn: filterColumn,
          [key]: clickedData[key],
          value: clickedData[key]?.toString(),
          seriesName: event.seriesName
        };
      }
    } else {
      return null;
    }

    return filterValue.accessor !== 'unknown' ? filterValue : null;
  }

  /**
   * Force chart update when widget data changes
   */
  forceChartUpdate(): void {
    if (this.widget.chartInstance) {
      this.widget.chartInstance.setOption(this.chartOptions);
    }
    // Force change detection
    this.cdr.detectChanges();
  }

  /**
   * Force chart resize to use full widget height
   */
  forceChartResize(): void {
    if (this.widget.chartInstance) {
      this.widget.chartInstance.resize();
    }
  }
}
