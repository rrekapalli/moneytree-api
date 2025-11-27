# QueryBuilder Library

A compact, theme-integrated query builder library for Angular applications using PrimeNG v20 components.

## Features

- **Compact Design**: Space-efficient UI optimized for integration within existing forms
- **Theme Integration**: Seamlessly integrates with PrimeNG v20 themes and application CSS custom properties
- **Accessibility Compliant**: Meets WCAG guidelines with proper focus management and responsive design
- **Angular v20 Compatible**: Built with Angular v20 and standalone component patterns
- **TypeScript Support**: Full TypeScript support with comprehensive type definitions

## Installation

The library is built as part of the main application build process:

```bash
npm run build:querybuilder
```

## Basic Usage

### Import Components (Angular v20 Standalone)

```typescript
import { QueryBuilderComponent } from 'querybuilder';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [QueryBuilderComponent],
  template: `
    <lib-query-builder
      [config]="queryConfig"
      [query]="currentQuery"
      (queryChange)="onQueryChange($event)"
      (validationChange)="onValidationChange($event)">
    </lib-query-builder>
  `
})
export class MyComponent { }
```

### Legacy Module Import

```typescript
import { QueryBuilderModule } from 'querybuilder';

@NgModule({
  imports: [QueryBuilderModule],
  // ...
})
export class YourModule { }
```

### Use in Component Template

```html
<lib-query-builder
  [config]="queryConfig"
  [query]="currentQuery"
  [allowRuleset]="true"
  [allowEmpty]="false"
  (queryChange)="onQueryChange($event)"
  (validationChange)="onValidationChange($event)">
</lib-query-builder>
```

### Component Configuration

```typescript
import { Component } from '@angular/core';
import { QueryBuilderConfig, RuleSet, QueryBuilderConfigService } from 'querybuilder';

@Component({
  selector: 'app-stock-screener',
  standalone: true,
  imports: [QueryBuilderComponent],
  template: `
    <div class="screener-form">
      <h3>Stock Screening Criteria</h3>
      <lib-query-builder
        [config]="queryConfig"
        [query]="currentQuery"
        [allowRuleset]="true"
        [allowEmpty]="false"
        (queryChange)="onQueryChange($event)"
        (validationChange)="onValidationChange($event)">
      </lib-query-builder>
      
      <div class="form-actions">
        <button [disabled]="!isValid" (click)="saveScreener()">
          Save Screener
        </button>
      </div>
    </div>
  `
})
export class StockScreenerComponent {
  queryConfig: QueryBuilderConfig;
  currentQuery: RuleSet = { condition: 'and', rules: [] };
  isValid = false;

  constructor(private configService: QueryBuilderConfigService) {
    // Use the service to get pre-configured stock fields
    this.queryConfig = this.configService.createStockQueryBuilderConfig({
      allowEmptyRulesets: false,
      allowRuleset: true
    });
  }

  onQueryChange(query: RuleSet) {
    this.currentQuery = query;
    console.log('Query changed:', query);
    
    // Convert to API format if needed
    const apiQuery = this.convertToApiFormat(query);
    console.log('API format:', apiQuery);
  }

  onValidationChange(isValid: boolean) {
    this.isValid = isValid;
    console.log('Validation state:', isValid);
  }

  saveScreener() {
    if (this.isValid) {
      // Save the screener configuration
      const screenerData = {
        name: 'My Screener',
        criteria: this.currentQuery,
        createdAt: new Date()
      };
      
      // Call your API service
      // this.screenerService.save(screenerData);
    }
  }

  private convertToApiFormat(query: RuleSet): any {
    // Convert QueryBuilder format to your API format
    return {
      condition: query.condition,
      rules: query.rules.map(rule => {
        if ('field' in rule) {
          return {
            field: rule.field,
            operator: rule.operator,
            value: rule.value
          };
        }
        return rule; // Handle nested rulesets
      })
    };
  }
}
```

## Theme Integration

### CSS Custom Properties

The library integrates with your application's CSS custom properties:

```scss
:root {
  --primary-color: #4CAF50;
  --font-size: 0.875rem;
  --surface-card: #ffffff;
  --surface-border: #e9ecef;
  // ... other theme variables
}
```

### Theme Variants

Apply different size variants using CSS classes:

```html
<!-- Default compact design -->
<lib-query-builder [config]="config" [query]="query"></lib-query-builder>

<!-- Extra compact for space-constrained layouts -->
<lib-query-builder 
  class="qb-compact" 
  [config]="config" 
  [query]="query">
</lib-query-builder>

<!-- Maximum density -->
<lib-query-builder 
  class="qb-dense" 
  [config]="config" 
  [query]="query">
</lib-query-builder>

<!-- Comfortable for better accessibility -->
<lib-query-builder 
  class="qb-comfortable" 
  [config]="config" 
  [query]="query">
</lib-query-builder>
```

### Dark Theme Support

The library automatically adapts to dark themes:

```html
<div class="p-dark">
  <lib-query-builder [config]="config" [query]="query"></lib-query-builder>
</div>
```

### PrimeNG Theme Compatibility

Works with all PrimeNG v20 themes:

- Aura (default)
- Material
- Bootstrap
- Lara

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Support**: Proper ARIA labels and semantic markup
- **High Contrast Mode**: Enhanced visibility in high contrast mode
- **Reduced Motion**: Respects user's motion preferences
- **Touch Targets**: Minimum 44px touch targets on mobile devices
- **Focus Management**: Clear focus indicators and logical tab order

## Responsive Design

The library adapts to different screen sizes:

- **Desktop**: Full horizontal layout with optimal spacing
- **Tablet**: Adjusted sizing for touch interaction
- **Mobile**: Stacked layout with larger touch targets

## Advanced Usage

### Custom Field Configuration

```typescript
import { QueryBuilderConfigService, Field } from 'querybuilder';

export class CustomScreenerComponent {
  constructor(private configService: QueryBuilderConfigService) {}

  createCustomConfig(): QueryBuilderConfig {
    // Create custom fields
    const customFields: Field[] = [
      this.configService.createCustomField({
        name: 'customRatio',
        type: 'number',
        label: 'Custom Financial Ratio',
        operators: ['>', '<', '=', 'between'],
        defaultOperator: '>',
        defaultValue: 1.5
      }),
      {
        name: 'riskLevel',
        type: 'category',
        label: 'Risk Level',
        operators: ['=', '!=', 'in'],
        defaultOperator: '=',
        options: [
          { name: 'Low Risk', value: 'LOW' },
          { name: 'Medium Risk', value: 'MEDIUM' },
          { name: 'High Risk', value: 'HIGH' }
        ]
      }
    ];

    return this.configService.createStockQueryBuilderConfig({
      customFields: [...this.configService.getStockFields(), ...customFields],
      allowEmptyRulesets: false,
      allowRuleset: true
    });
  }
}
```

### Loading Existing Queries

```typescript
export class ScreenerEditComponent implements OnInit {
  queryConfig: QueryBuilderConfig;
  currentQuery: RuleSet = { condition: 'and', rules: [] };

  constructor(
    private configService: QueryBuilderConfigService,
    private screenerService: ScreenerService,
    private route: ActivatedRoute
  ) {
    this.queryConfig = this.configService.createStockQueryBuilderConfig();
  }

  async ngOnInit() {
    const screenerId = this.route.snapshot.params['id'];
    if (screenerId) {
      await this.loadExistingScreener(screenerId);
    }
  }

  private async loadExistingScreener(id: string) {
    try {
      const screener = await this.screenerService.getById(id);
      
      // Convert API format back to QueryBuilder format
      this.currentQuery = this.convertFromApiFormat(screener.criteria);
    } catch (error) {
      console.error('Failed to load screener:', error);
      // Handle error - show message, redirect, etc.
    }
  }

  private convertFromApiFormat(apiCriteria: any): RuleSet {
    return {
      condition: apiCriteria.condition || 'and',
      rules: apiCriteria.rules?.map((rule: any) => {
        if (rule.field && rule.operator) {
          return {
            field: rule.field,
            operator: rule.operator,
            value: rule.value
          };
        }
        return rule; // Handle nested rulesets
      }) || []
    };
  }
}
```

### Validation and Error Handling

```typescript
export class ValidatedScreenerComponent {
  queryConfig: QueryBuilderConfig;
  currentQuery: RuleSet = { condition: 'and', rules: [] };
  validationErrors: string[] = [];
  isValid = false;

  constructor(
    private configService: QueryBuilderConfigService,
    private queryBuilderService: QueryBuilderService
  ) {
    this.queryConfig = this.configService.createStockQueryBuilderConfig();
  }

  onQueryChange(query: RuleSet) {
    this.currentQuery = query;
    this.validateQuery();
  }

  onValidationChange(isValid: boolean) {
    this.isValid = isValid;
  }

  private validateQuery() {
    const result = this.queryBuilderService.validateRuleset(
      this.currentQuery,
      this.queryConfig.fields,
      false // Don't allow empty
    );

    this.validationErrors = result.errors.map(error => error.message);
    
    if (!result.valid) {
      console.warn('Query validation failed:', result.errors);
    }
  }

  getValidationMessage(): string {
    if (this.validationErrors.length === 0) {
      return 'Query is valid';
    }
    
    return `Validation errors: ${this.validationErrors.join(', ')}`;
  }
}
```

### Integration with Reactive Forms

```typescript
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';

export class ReactiveFormScreenerComponent {
  screenerForm: FormGroup;
  queryConfig: QueryBuilderConfig;

  constructor(
    private fb: FormBuilder,
    private configService: QueryBuilderConfigService
  ) {
    this.queryConfig = this.configService.createStockQueryBuilderConfig();
    
    this.screenerForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      criteria: [{ condition: 'and', rules: [] }],
      isActive: [true]
    });
  }

  onQueryChange(query: RuleSet) {
    this.screenerForm.patchValue({ criteria: query });
  }

  onSubmit() {
    if (this.screenerForm.valid) {
      const formValue = this.screenerForm.value;
      console.log('Submitting screener:', formValue);
      
      // Submit to API
      // this.screenerService.create(formValue);
    }
  }
}
```

## Field Types

### Number Fields

```typescript
{
  name: 'price',
  type: 'number',
  label: 'Price',
  operators: ['=', '!=', '<', '<=', '>', '>=', 'between'],
  defaultOperator: '>',
  defaultValue: 100
}
```

### Category Fields

```typescript
{
  name: 'category',
  type: 'category',
  label: 'Category',
  operators: ['=', '!=', 'in', 'not in'],
  defaultOperator: '=',
  options: [
    { name: 'Option 1', value: 'opt1' },
    { name: 'Option 2', value: 'opt2' }
  ]
}
```

### Boolean Fields

```typescript
{
  name: 'isActive',
  type: 'boolean',
  label: 'Is Active',
  operators: ['='],
  defaultOperator: '=',
  defaultValue: true
}
```

### Date Fields

```typescript
{
  name: 'createdDate',
  type: 'date',
  label: 'Created Date',
  operators: ['=', '!=', '<', '<=', '>', '>=', 'between'],
  defaultOperator: '>=',
  defaultValue: new Date()
}
```

## Operators

- `=` - Equals
- `!=` - Not equals
- `<` - Less than
- `<=` - Less than or equal
- `>` - Greater than
- `>=` - Greater than or equal
- `in` - In list
- `not in` - Not in list
- `contains` - Contains text
- `between` - Between two values

## API Reference

### QueryBuilderComponent

#### Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `config` | `QueryBuilderConfig` | - | Field definitions and configuration |
| `query` | `RuleSet` | `{ condition: 'and', rules: [] }` | Initial query state |
| `allowRuleset` | `boolean` | `true` | Allow nested rule groups |
| `allowEmpty` | `boolean` | `false` | Allow empty rulesets |
| `emptyMessage` | `string` | `'No rules defined'` | Message for empty state |

#### Outputs

| Event | Type | Description |
|-------|------|-------------|
| `queryChange` | `EventEmitter<RuleSet>` | Emitted when query changes |
| `validationChange` | `EventEmitter<boolean>` | Emitted when validation state changes |

### Interfaces

#### QueryBuilderConfig

```typescript
interface QueryBuilderConfig {
  fields: Field[];
  allowEmptyRulesets?: boolean;
  allowRuleset?: boolean;
  getOperators?: (fieldName: string, field: Field) => string[];
  getInputType?: (field: Field, operator: string) => string;
  getOptions?: (field: Field) => Option[];
}
```

#### Field

```typescript
interface Field {
  name: string;
  type: string;
  label?: string;
  options?: Option[];
  operators?: string[];
  defaultValue?: any;
  defaultOperator?: string;
  nullable?: boolean;
  entity?: string;
}
```

#### RuleSet

```typescript
interface RuleSet {
  condition: string;
  rules: Array<Rule | RuleSet>;
}
```

#### Rule

```typescript
interface Rule {
  field: string;
  operator: string;
  value?: any;
  entity?: string;
}
```

## Styling Customization

### CSS Custom Properties

Override the library's CSS custom properties to customize appearance:

```scss
.query-builder {
  --qb-primary-color: #your-color;
  --qb-font-size: 0.8rem;
  --qb-input-height: 30px;
  --qb-border-radius: 6px;
  --qb-gap: 6px;
}
```

### Component-Specific Styling

Target specific components for custom styling:

```scss
.query-builder {
  .query-field-details {
    // Custom field details styling
  }
  
  .query-button-group {
    // Custom button group styling
  }
  
  .query-remove-button {
    // Custom remove button styling
  }
}
```

## Performance Considerations

- **OnPush Change Detection**: Components use OnPush change detection strategy
- **Minimal DOM Updates**: Efficient rendering with minimal DOM manipulation
- **Lazy Loading**: Components are loaded only when needed
- **Small Bundle Size**: Optimized for minimal impact on application bundle size

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Follow the existing code style and patterns
2. Ensure all tests pass
3. Add tests for new functionality
4. Update documentation as needed

## License

This library is part of the MoneyPlant application and follows the same license terms.