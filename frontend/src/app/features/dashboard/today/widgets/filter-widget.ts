import { IWidget, WidgetBuilder, IFilterOptions, IFilterValues } from '@dashboards/public-api';

/**
 * Create the filter widget positioned at the top of the dashboard
 * This widget will display applied filters when chart elements are clicked
 */
export function createFilterWidget(): IWidget {
  const filterOptions: IFilterOptions = {
    values: []
  };

  return new WidgetBuilder()
    .setId('filter-widget')
    .setComponent('filter')
    .setPosition({ x: 0, y: 0, cols: 12, rows: 1 })
    .setFilterOptions(filterOptions)
    .build();
}

/**
 * Update filter widget data
 */
export function updateFilterData(widget: IWidget, newData?: IFilterValues[]): void {
  const data = newData || [];
  if (widget.config?.options) {
    (widget.config.options as IFilterOptions).values = data;
  }
}

/**
 * Add a new filter to the filter widget
 */
export function addFilter(widget: IWidget, filter: IFilterValues): void {
  if (widget.config?.options) {
    const filterOptions = widget.config.options as IFilterOptions;
    if (!filterOptions.values) {
      filterOptions.values = [];
    }
    filterOptions.values.push(filter);
  }
}

/**
 * Remove a specific filter from the filter widget
 */
export function removeFilter(widget: IWidget, filterToRemove: IFilterValues): void {
  if (widget.config?.options) {
    const filterOptions = widget.config.options as IFilterOptions;
    if (filterOptions.values) {
      const index = filterOptions.values.findIndex(filter => 
        filter.accessor === filterToRemove.accessor && 
        filter.filterColumn === filterToRemove.filterColumn &&
        filter[filter.accessor] === filterToRemove[filter.accessor]
      );
      if (index !== -1) {
        filterOptions.values.splice(index, 1);
      }
    }
  }
}

/**
 * Clear all filters from the filter widget
 */
export function clearAllFilters(widget: IWidget): void {
  if (widget.config?.options) {
    (widget.config.options as IFilterOptions).values = [];
  }
}

/**
 * Get current filter values from the widget
 */
export function getFilterValues(widget: IWidget): IFilterValues[] {
  if (widget.config?.options) {
    const filterOptions = widget.config.options as IFilterOptions;
    return filterOptions.values || [];
  }
  return [];
} 