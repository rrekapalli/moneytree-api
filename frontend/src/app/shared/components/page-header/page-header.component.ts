import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule
  ],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss'
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() actionButtonLabel: string = '';
  @Input() actionButtonIcon: string = 'pi pi-plus';
  @Input() showActionButton: boolean = true;
  @Input() actionButtonDisabled: boolean = false;
  @Input() actionButtonLoading: boolean = false;
  
  @Output() actionButtonClick = new EventEmitter<void>();

  onActionButtonClick(): void {
    this.actionButtonClick.emit();
  }
}
