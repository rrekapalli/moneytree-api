import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { QueryBuilderConfig, RuleSet, Rule, LocalRuleMeta } from '../../models/query-builder.models';
import { QueryBuilderService } from '../../services/query-builder.service';
import { QuerySwitchGroupComponent } from '../query-switch-group/query-switch-group.component';
import { QueryButtonGroupComponent } from '../query-button-group/query-button-group.component';
import { QueryFieldDetailsComponent } from '../query-field-details/query-field-details.component';
import { QueryRemoveButtonComponent } from '../query-remove-button/query-remove-button.component';

/**
 * QueryEntityComponent renders individual rules or rule groups with compact padding.
 * Handles recursive rendering logic exactly matching Angular-QueryBuilder behavior.
 * 
 * @example
 * ```html
 * <lib-query-entity
 *   [config]="queryConfig"
 *   [data]="ruleOrRuleSet"
 *   [allowRuleset]="true"
 *   [allowEmpty]="false"
 *   (dataChange)="onEntityChange($event)">
 * </lib-query-entity>
 * ```
 */
@Component({
  selector: 'lib-query-entity',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MessageModule,
    QuerySwitchGroupComponent,
    QueryButtonGroupComponent,
    QueryFieldDetailsComponent,
    QueryRemoveButtonComponent
  ],
  templateUrl: './query-entity.component.html',
  styleUrls: ['./query-entity.component.scss']
})
export class QueryEntityComponent implements OnInit {
  /** QueryBuilder configuration containing field definitions */
  @Input() config!: QueryBuilderConfig;
  
  /** The rule or ruleset data to render */
  @Input() data!: RuleSet | Rule;
  
  /** Parent ruleset for context */
  @Input() parentValue?: RuleSet;
  
  /** Whether nested rule groups are allowed */
  @Input() allowRuleset: boolean = true;
  
  /** Whether empty rulesets are allowed */
  @Input() allowEmpty: boolean = true;
  
  /** Message to display for empty rulesets */
  @Input() emptyMessage: string = 'A ruleset cannot be empty. Please add a rule or remove it all together.';
  
  /** Custom operator mappings */
  @Input() operatorMap?: { [key: string]: string[] };
  
  /** ARIA level for accessibility */
  @Input() parentAriaLevel: number = 0;

  /** Emitted when the entity data changes */
  @Output() dataChange = new EventEmitter<RuleSet | Rule>();

  private queryBuilderService = inject(QueryBuilderService);

  meta: LocalRuleMeta = { ruleset: false, invalid: false };

  ngOnInit(): void {
    this.updateMeta();
  }

  private updateMeta(): void {
    this.meta.ruleset = this.isRuleSet(this.data);
    if (this.isRuleSet(this.data)) {
      const result = this.queryBuilderService.validateRuleset(this.data, this.config.fields || [], this.allowEmpty);
      this.meta.invalid = !result.valid;
    } else {
      // For individual rules, we'll consider them valid for now
      // More detailed validation can be added later
      this.meta.invalid = false;
    }
  }

  isRuleSet(data: RuleSet | Rule): data is RuleSet {
    return 'condition' in data && 'rules' in data;
  }

  isRule(data: RuleSet | Rule): data is Rule {
    return 'field' in data && 'operator' in data;
  }

  getRuleSet(): RuleSet {
    return this.data as RuleSet;
  }

  getRule(): Rule {
    return this.data as Rule;
  }

  onConditionChange(condition: string): void {
    if (this.isRuleSet(this.data)) {
      const updatedRuleSet = { ...this.data, condition };
      this.data = updatedRuleSet;
      this.dataChange.emit(this.data);
      this.updateMeta();
    }
  }

  onAddRule(): void {
    if (this.isRuleSet(this.data)) {
      // Create a copy of the ruleset to avoid mutation
      const rulesetCopy = { ...this.data, rules: [...this.data.rules] };
      // Add rule to the copy
      this.queryBuilderService.addRule(rulesetCopy, this.config.fields?.[0]);
      // Emit the updated copy
      this.data = rulesetCopy;
      this.dataChange.emit(this.data);
      this.updateMeta();
    }
  }

  onAddRuleSet(): void {
    if (this.isRuleSet(this.data)) {
      // Create a copy of the ruleset to avoid mutation
      const rulesetCopy = { ...this.data, rules: [...this.data.rules] };
      // Add ruleset to the copy
      this.queryBuilderService.addRuleSet(rulesetCopy);
      // Emit the updated copy
      this.data = rulesetCopy;
      this.dataChange.emit(this.data);
      this.updateMeta();
    }
  }

  onRuleChange(index: number, rule: Rule | RuleSet): void {
    if (this.isRuleSet(this.data)) {
      const updatedRules = [...this.data.rules];
      updatedRules[index] = rule;
      const updatedRuleSet = {
        ...this.data,
        rules: updatedRules
      };
      this.data = updatedRuleSet;
      this.dataChange.emit(this.data);
      this.updateMeta();
    }
  }

  onRemoveRule(index: number): void {
    if (this.isRuleSet(this.data)) {
      const updatedRules = this.data.rules.filter((_, i) => i !== index);
      const updatedRuleSet = {
        ...this.data,
        rules: updatedRules
      };
      this.data = updatedRuleSet;
      this.dataChange.emit(this.data);
      this.updateMeta();
    }
  }

  onRemoveEntity(): void {
    // This will be handled by the parent component
    // The parent should listen to this event and remove this entity
  }

  onRuleFieldChange(rule: Rule): void {
    this.data = rule;
    this.dataChange.emit(this.data);
    this.updateMeta();
  }

  getDisabledState(): boolean {
    return false;
  }

  getAriaLevel(): number {
    return this.parentAriaLevel + 1;
  }

  showEmptyWarning(): boolean {
    return this.isRuleSet(this.data) && 
           !this.allowEmpty && 
           this.data.rules.length === 0;
  }

  /**
   * TrackBy function for ngFor to prevent unnecessary re-renders
   * This helps maintain input focus when values change
   */
  trackByIndex(index: number): number {
    return index;
  }
}