import { Component, Input, Output, EventEmitter, inject, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { QueryBuilderConfig, Rule, Field } from '../../models/query-builder.models';
import { QueryBuilderService } from '../../services/query-builder.service';
import { QueryOperationComponent } from '../query-operation/query-operation.component';
import { QueryInputComponent } from '../query-input/query-input.component';

@Component({
  selector: 'lib-query-field-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SelectModule,
    QueryOperationComponent,
    QueryInputComponent
  ],
  templateUrl: './query-field-details.component.html',
  styleUrls: ['./query-field-details.component.scss']
})
export class QueryFieldDetailsComponent implements OnInit, OnChanges {
  @Input() config!: QueryBuilderConfig;
  @Input() rule!: Rule;
  @Input() operatorMap?: { [key: string]: string[] };
  @Input() disabled: boolean = false;

  @Output() ruleChange = new EventEmitter<Rule>();

  private queryBuilderService = inject(QueryBuilderService);

  selectedField?: Field;
  availableOperators: string[] = [];

  ngOnInit(): void {
    this.updateSelectedField();
    this.updateAvailableOperators();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rule'] || changes['config']) {
      this.updateSelectedField();
      this.updateAvailableOperators();
    }
  }

  private updateSelectedField(): void {
    if (this.config?.fields && this.rule?.field) {
      this.selectedField = this.config.fields.find(f => f.name === this.rule.field);
    }
  }

  private updateAvailableOperators(): void {
    if (this.selectedField) {
      this.availableOperators = this.queryBuilderService.getOperators(this.selectedField);
    }
  }

  onFieldChange(fieldName: string): void {
    const field = this.config.fields?.find(f => f.name === fieldName);
    if (field) {
      const updatedRule: Rule = {
        ...this.rule,
        field: fieldName,
        operator: field.defaultOperator || this.queryBuilderService.getOperators(field)[0] || '=',
        value: field.defaultValue
      };
      
      this.rule = updatedRule;
      this.selectedField = field;
      this.updateAvailableOperators();
      this.ruleChange.emit(this.rule);
    }
  }

  onOperatorChange(operator: string): void {
    const updatedRule: Rule = {
      ...this.rule,
      operator
    };

    // Reset value if operator changed to one that doesn't support current value type
    if (this.selectedField) {
      const inputType = this.queryBuilderService.getInputType(this.selectedField, operator);
      if (inputType === 'boolean' && typeof this.rule.value !== 'boolean') {
        updatedRule.value = true;
      } else if (inputType === 'number' && typeof this.rule.value !== 'number') {
        updatedRule.value = 0;
      } else if (operator === 'between' && !Array.isArray(this.rule.value)) {
        updatedRule.value = [null, null];
      }
    }

    this.rule = updatedRule;
    this.ruleChange.emit(this.rule);
  }

  onValueChange(value: any): void {
    const updatedRule: Rule = {
      ...this.rule,
      value
    };
    
    this.rule = updatedRule;
    this.ruleChange.emit(this.rule);
  }

  getFieldOptions(): Field[] {
    return this.config.fields || [];
  }

  getInputType(): string {
    if (this.selectedField) {
      return this.queryBuilderService.getInputType(this.selectedField, this.rule.operator);
    }
    return 'text';
  }
}