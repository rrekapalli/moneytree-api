import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { QueryBuilderConfig } from '../../models/query-builder.models';

export interface ConditionOption {
  label: string;
  value: string;
}

@Component({
  selector: 'lib-query-switch-group',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule],
  templateUrl: './query-switch-group.component.html',
  styleUrls: ['./query-switch-group.component.scss']
})
export class QuerySwitchGroupComponent {
  @Input() config!: QueryBuilderConfig;
  @Input() condition: string = 'and';
  @Input() disabled: boolean = false;

  @Output() conditionChange = new EventEmitter<string>();

  readonly conditions: ConditionOption[] = [
    { label: 'AND', value: 'and' },
    { label: 'OR', value: 'or' }
  ];

  onConditionChange(newCondition: string): void {
    if (newCondition !== this.condition) {
      this.condition = newCondition;
      this.conditionChange.emit(this.condition);
    }
  }

  getSelectedCondition(): ConditionOption | undefined {
    return this.conditions.find(c => c.value === this.condition);
  }
}