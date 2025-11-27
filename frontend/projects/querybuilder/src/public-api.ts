/*
 * Public API Surface of querybuilder
 */

// Main module
export * from './lib/querybuilder.module';

// Core models and interfaces
export * from './lib/models';

// Services
export * from './lib/services';

// Components
export * from './lib/components';

// Main component for easy import
export { QueryBuilderComponent } from './lib/components/query-builder/query-builder.component';

// Main service for easy import
export { QueryBuilderService } from './lib/services/query-builder.service';
export { QueryBuilderConfigService } from './lib/services/query-builder-config.service';
export { QueryConverterService, ScreenerCriteria, ScreenerRule, ConversionResult, ConversionValidationError } from './lib/services/query-converter.service';

// Core interfaces for easy import
export { QueryBuilderConfig, Field, Rule, RuleSet, Option } from './lib/models/query-builder.models';
export { STOCK_FIELDS } from './lib/models/stock-fields.model';