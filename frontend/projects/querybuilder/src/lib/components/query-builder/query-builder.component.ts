import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QueryBuilderConfig, RuleSet, Rule, LocalRuleMeta } from '../../models/query-builder.models';
import { QueryBuilderService } from '../../services/query-builder.service';
import { QueryEntityComponent } from '../query-entity/query-entity.component';

/**
 * Main QueryBuilder component that provides a visual interface for building complex queries.
 * Replicates the functionality of Angular-QueryBuilder with Angular v20 and PrimeNG v20 components.
 * 
 * @example
 * ```html
 * <lib-query-builder
 *   [config]="queryConfig"
 *   [query]="currentQuery"
 *   [allowRuleset]="true"
 *   [allowEmpty]="false"
 *   (queryChange)="onQueryChange($event)"
 *   (validationChange)="onValidationChange($event)">
 * </lib-query-builder>
 * ```
 * 
 * @example
 * ```typescript
 * // Component usage
 * export class MyComponent {
 *   queryConfig: QueryBuilderConfig = {
 *     fields: [
 *       { name: 'name', type: 'string', label: 'Name' },
 *       { name: 'age', type: 'number', label: 'Age' }
 *     ]
 *   };
 *   
 *   currentQuery: RuleSet = { condition: 'and', rules: [] };
 *   
 *   onQueryChange(query: RuleSet) {
 *     this.currentQuery = query;
 *   }
 * }
 * ```
 */
@Component({
  selector: 'lib-query-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, QueryEntityComponent],
  templateUrl: './query-builder.component.html',
  styleUrls: ['./query-builder.component.scss']
})
export class QueryBuilderComponent implements OnInit, OnChanges {
  /** Configuration object containing field definitions and operators */
  @Input() config!: QueryBuilderConfig;
  
  /** Current query state as a RuleSet object */
  @Input() query: RuleSet = { condition: 'and', rules: [] };
  
  /** Whether to allow nested rule groups (rulesets) */
  @Input() allowRuleset: boolean = true;
  
  /** Whether to allow empty rulesets */
  @Input() allowEmpty: boolean = true;
  
  /** Message to display when a ruleset is empty and allowEmpty is false */
  @Input() emptyMessage: string = 'A ruleset cannot be empty. Please add a rule or remove it all together.';
  
  /** Custom CSS class names to apply to the component */
  @Input() classNames?: { [key: string]: string };
  
  /** Custom operator mappings for specific fields */
  @Input() operatorMap?: { [key: string]: string[] };
  
  /** Parent ruleset value for nested components */
  @Input() parentValue?: RuleSet;
  
  /** ARIA level for accessibility in nested structures */
  @Input() parentAriaLevel: number = 0;

  /** Emitted when the query structure changes */
  @Output() queryChange = new EventEmitter<RuleSet>();
  
  /** Emitted when the validation state changes */
  @Output() validationChange = new EventEmitter<boolean>();

  private queryBuilderService = inject(QueryBuilderService);

  /**
   * Component initialization lifecycle hook.
   * Ensures query is initialized and validates the initial state.
   */
  ngOnInit(): void {
    if (!this.query) {
      this.query = { condition: 'and', rules: [] };
    }
    this.validateQuery();
  }

  /**
   * Handles input property changes.
   * Re-validates the query when it changes.
   * 
   * @param changes - Object containing the changed properties
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['query'] && !changes['query'].firstChange) {
      this.validateQuery();
    }
  }

  /**
   * Handles query changes from child components.
   * Updates the internal query state and emits the change.
   * 
   * @param query - The updated query (RuleSet or Rule)
   */
  onQueryChange(query: RuleSet | Rule): void {
    // The main query builder should always work with RuleSet
    if ('condition' in query && 'rules' in query) {
      this.query = { ...query };
      this.queryChange.emit(this.query);
      this.validateQuery();
    }
  }

  /**
   * Validates the current query and emits validation state.
   * Uses the QueryBuilderService to perform validation.
   * 
   * @private
   */
  private validateQuery(): void {
    const result = this.queryBuilderService.validateRuleset(this.query, this.config.fields || [], this.allowEmpty);
    this.validationChange.emit(result.valid);
  }

  /**
   * Returns the disabled state of the component.
   * Currently always returns false but can be extended for conditional disabling.
   * 
   * @returns Always false in current implementation
   */
  getDisabledState(): boolean {
    return false;
  }

  /**
   * Calculates the ARIA level for accessibility.
   * Used for proper screen reader navigation in nested structures.
   * 
   * @returns The ARIA level for this component
   */
  getAriaLevel(): number {
    return this.parentAriaLevel + 1;
  }

  /**
   * Builds the CSS class string for the component.
   * Combines base classes with custom class names.
   * 
   * @returns The complete CSS class string
   */
  getClassNames(): string {
    const baseClass = 'query-builder';
    const customClasses = this.classNames ? Object.values(this.classNames).join(' ') : '';
    return `${baseClass} ${customClasses}`.trim();
  }
}