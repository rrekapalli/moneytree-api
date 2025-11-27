import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { Field, Option } from '../../models/query-builder.models';

@Component({
  selector: 'lib-query-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    CheckboxModule,
    MultiSelectModule,
    SelectModule
  ],
  templateUrl: './query-input.component.html',
  styleUrls: ['./query-input.component.scss']
})
export class QueryInputComponent implements OnInit, OnChanges {
  @Input() field?: Field;
  @Input() operator: string = '=';
  @Input() value: any;
  @Input() inputType: string = 'text';
  @Input() disabled: boolean = false;

  @Output() valueChange = new EventEmitter<any>();

  // For between operator
  betweenValues: [any, any] = [null, null];

  ngOnInit(): void {
    this.initializeBetweenValues();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] || changes['operator']) {
      this.initializeBetweenValues();
    }
  }

  private initializeBetweenValues(): void {
    if (this.operator === 'between' && Array.isArray(this.value)) {
      this.betweenValues = [this.value[0], this.value[1]];
    } else if (this.operator === 'between') {
      this.betweenValues = [null, null];
    }
  }

  onValueChange(newValue: any): void {
    this.value = newValue;
    this.valueChange.emit(this.value);
  }

  onBetweenValueChange(index: 0 | 1, newValue: any): void {
    this.betweenValues[index] = newValue;
    this.value = [...this.betweenValues];
    this.valueChange.emit(this.value);
  }

  getFieldOptions(): Option[] {
    return this.field?.options || [];
  }

  isBetweenOperator(): boolean {
    return this.operator === 'between' || this.operator === 'not between';
  }

  isNullOperator(): boolean {
    return this.operator === 'is null' || this.operator === 'is not null';
  }

  isMultiSelectOperator(): boolean {
    return this.operator === 'in' || this.operator === 'not in';
  }

  shouldShowInput(): boolean {
    return !this.isNullOperator();
  }

  getInputTypeForField(): string {
    if (this.field?.type === 'number') {
      return 'number';
    } else if (this.field?.type === 'date') {
      return 'date';
    } else if (this.field?.type === 'boolean') {
      return 'boolean';
    } else if (this.field?.type === 'category' && this.field.options) {
      return this.isMultiSelectOperator() ? 'multiselect' : 'select';
    }
    return 'text';
  }

  getPlaceholder(): string {
    if (this.field?.type === 'number') {
      return 'Enter number';
    } else if (this.field?.type === 'date') {
      return 'Select date';
    } else if (this.field?.type === 'category') {
      return this.isMultiSelectOperator() ? 'Select options' : 'Select option';
    }
    return 'Enter value';
  }
}