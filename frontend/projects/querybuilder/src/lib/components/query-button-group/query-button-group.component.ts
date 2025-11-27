import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { QueryBuilderConfig } from '../../models/query-builder.models';

@Component({
  selector: 'lib-query-button-group',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './query-button-group.component.html',
  styleUrls: ['./query-button-group.component.scss']
})
export class QueryButtonGroupComponent {
  @Input() config!: QueryBuilderConfig;
  @Input() allowRuleset: boolean = true;
  @Input() disabled: boolean = false;

  @Output() addRule = new EventEmitter<void>();
  @Output() addRuleSet = new EventEmitter<void>();

  onAddRule(): void {
    if (!this.disabled) {
      this.addRule.emit();
    }
  }

  onAddRuleSet(): void {
    if (!this.disabled && this.allowRuleset) {
      this.addRuleSet.emit();
    }
  }

  get canAddRule(): boolean {
    return !this.disabled;
  }

  get canAddRuleSet(): boolean {
    return !this.disabled && this.allowRuleset;
  }
}