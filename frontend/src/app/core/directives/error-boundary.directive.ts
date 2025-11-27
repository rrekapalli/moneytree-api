import { Directive, Host, HostListener, Optional } from '@angular/core';
import { ErrorBoundaryComponent } from '../components/error-boundary/error-boundary.component';
import { LoggingService } from '../../services/logging.service';

/**
 * Error Boundary Directive
 * 
 * This directive catches errors in the component it's attached to and forwards them
 * to the nearest ErrorBoundaryComponent.
 * 
 * Usage:
 * <app-error-boundary>
 *   <app-potentially-buggy-component errorBoundary></app-potentially-buggy-component>
 * </app-error-boundary>
 */
@Directive({
  selector: '[errorBoundary]',
  standalone: true
})
export class ErrorBoundaryDirective {
  constructor(
    @Optional() @Host() private errorBoundary: ErrorBoundaryComponent,
    private loggingService: LoggingService
  ) {
    if (!this.errorBoundary) {
      this.loggingService.warn(
        'ErrorBoundaryDirective used without an ErrorBoundaryComponent parent',
        null,
        'ErrorBoundaryDirective'
      );
    }
  }

  /**
   * Catch errors from the host component
   * @param error The error that occurred
   */
  @HostListener('error', ['$event'])
  onError(error: any): void {
    if (this.errorBoundary) {
      this.errorBoundary.catchError(error);
    } else {
      // If no error boundary component is found, log the error
      this.loggingService.error(
        'Error caught by ErrorBoundaryDirective but no ErrorBoundaryComponent found',
        error,
        'ErrorBoundaryDirective'
      );
    }
  }
}