import { Component, Input, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, Subscription } from 'rxjs';
import { LoggingService } from '../../../services/logging.service';

/**
 * Error Boundary Component
 * 
 * This component catches errors in its child components and displays a fallback UI
 * instead of crashing the entire application.
 * 
 * Usage:
 * <app-error-boundary>
 *   <ng-template #fallback let-error>
 *     <div class="error-ui">
 *       <h3>Something went wrong</h3>
 *       <p>{{ error?.message }}</p>
 *       <button (click)="retry()">Retry</button>
 *     </div>
 *   </ng-template>
 *   
 *   <!-- Your component that might throw errors -->
 *   <app-potentially-buggy-component></app-potentially-buggy-component>
 * </app-error-boundary>
 */
@Component({
  selector: 'app-error-boundary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="!hasError; else errorTemplate">
      <ng-content></ng-content>
    </ng-container>
    
    <ng-template #errorTemplate>
      <ng-container *ngTemplateOutlet="fallbackTemplate || defaultFallback; context: { $implicit: error }"></ng-container>
    </ng-template>
    
    <ng-template #defaultFallback let-error>
      <div class="error-boundary-fallback">
        <h3>Something went wrong</h3>
        <p>An error occurred in this component.</p>
        <button (click)="retry()">Retry</button>
      </div>
    </ng-template>
  `,
  styles: [`
    .error-boundary-fallback {
      padding: 1rem;
      border: 1px solid #f5c6cb;
      border-radius: 0.25rem;
      background-color: #f8d7da;
      color: #721c24;
      margin: 1rem 0;
    }
    
    .error-boundary-fallback button {
      background-color: #dc3545;
      color: white;
      border: none;
      padding: 0.375rem 0.75rem;
      border-radius: 0.25rem;
      cursor: pointer;
    }
    
    .error-boundary-fallback button:hover {
      background-color: #c82333;
    }
  `]
})
export class ErrorBoundaryComponent implements OnDestroy {
  @Input() fallbackTemplate?: TemplateRef<any>;
  
  hasError = false;
  error: any = null;
  
  private errorSubject = new Subject<any>();
  private subscription: Subscription;
  
  constructor(private loggingService: LoggingService) {
    // Subscribe to error events from child components
    this.subscription = this.errorSubject.subscribe(error => {
      this.handleError(error);
    });
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.errorSubject.complete();
  }
  
  /**
   * Catch errors from child components
   * This method is called by the ErrorBoundaryDirective
   * @param error The error that occurred
   */
  catchError(error: any): void {
    this.errorSubject.next(error);
  }
  
  /**
   * Handle the error
   * @param error The error that occurred
   */
  private handleError(error: any): void {
    this.hasError = true;
    this.error = error;
    
    // Log the error
    this.loggingService.error(
      'Error caught by ErrorBoundary',
      error,
      'ErrorBoundaryComponent'
    );
  }
  
  /**
   * Reset the error state and retry rendering the component
   */
  retry(): void {
    this.hasError = false;
    this.error = null;
  }
}