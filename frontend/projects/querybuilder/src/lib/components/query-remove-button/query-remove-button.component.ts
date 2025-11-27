import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'lib-query-remove-button',
  standalone: true,
  imports: [CommonModule, ButtonModule, ConfirmDialogModule, TooltipModule],
  providers: [ConfirmationService],
  templateUrl: './query-remove-button.component.html',
  styleUrls: ['./query-remove-button.component.scss']
})
export class QueryRemoveButtonComponent {
  @Input() disabled: boolean = false;
  @Input() isRuleSet: boolean = false;
  @Input() confirmRemoval: boolean = true;

  @Output() remove = new EventEmitter<void>();

  constructor(private confirmationService: ConfirmationService) {}

  onRemove(): void {
    if (this.disabled) {
      return;
    }

    if (this.confirmRemoval && this.isRuleSet) {
      this.confirmationService.confirm({
        message: 'Are you sure you want to remove this rule group and all its rules?',
        header: 'Confirm Removal',
        icon: 'pi pi-exclamation-triangle',
        acceptButtonStyleClass: 'p-button-danger p-button-sm',
        rejectButtonStyleClass: 'p-button-secondary p-button-sm',
        accept: () => {
          this.remove.emit();
        }
      });
    } else {
      this.remove.emit();
    }
  }

  getTooltip(): string {
    return this.isRuleSet ? 'Remove rule group' : 'Remove rule';
  }

  getAriaLabel(): string {
    return this.isRuleSet ? 'Remove rule group' : 'Remove rule';
  }
}