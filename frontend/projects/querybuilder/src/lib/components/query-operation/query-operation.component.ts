import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { Field } from '../../models/query-builder.models';

export interface OperatorOption {
  label: string;
  value: string;
}

@Component({
  selector: 'lib-query-operation',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule],
  templateUrl: './query-operation.component.html',
  styleUrls: ['./query-operation.component.scss']
})
export class QueryOperationComponent {
  @Input() field?: Field;
  @Input() operator: string = '=';
  @Input() operators: string[] = [];
  @Input() disabled: boolean = false;

  @Output() operatorChange = new EventEmitter<string>();

  // Operator display labels
  private readonly operatorLabels: { [key: string]: string } = {
    '=': 'equals',
    '!=': 'not equals',
    '<': 'less than',
    '<=': 'less than or equal',
    '>': 'greater than',
    '>=': 'greater than or equal',
    'in': 'in',
    'not in': 'not in',
    'contains': 'contains',
    'not contains': 'not contains',
    'between': 'between',
    'not between': 'not between',
    'is null': 'is null',
    'is not null': 'is not null',
    'starts with': 'starts with',
    'ends with': 'ends with'
  };

  onOperatorChange(newOperator: string): void {
    if (newOperator !== this.operator) {
      this.operator = newOperator;
      this.operatorChange.emit(this.operator);
    }
  }

  getOperatorOptions(): OperatorOption[] {
    return this.operators.map(op => ({
      label: this.operatorLabels[op] || op,
      value: op
    }));
  }

  getSelectedOperator(): OperatorOption | undefined {
    return this.getOperatorOptions().find(op => op.value === this.operator);
  }
}