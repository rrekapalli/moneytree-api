import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { LoggingService } from '../../services/logging.service';
import { ToastService } from '../../services/toast.service';

/**
 * Global error handler for the application
 * Captures and logs all unhandled errors
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(
    private loggingService: LoggingService,
    private toastService: ToastService,
    private zone: NgZone
  ) {}

  /**
   * Handle an error
   * @param error The error object
   */
  handleError(error: any): void {
    // Extract error information
    const message = error.message || 'Unknown error';
    const stack = error.stack || '';
    const name = error.name || 'Error';
    
    // Log the error with full details
    this.loggingService.error(
      `Unhandled error: ${message}`,
      { name, stack, originalError: error },
      'GlobalErrorHandler'
    );

    // Show user-friendly message in the UI
    // Using NgZone to ensure Angular change detection is triggered
    this.zone.run(() => {
      this.toastService.showError({
        summary: 'Application Error',
        detail: 'An unexpected error occurred. Our team has been notified.',
        life: 5000
      });
    });

    // Optionally, you can also report to an error monitoring service like Sentry
    // this.reportToErrorMonitoring(error);
    
    // Log to console in development mode
    console.error('Unhandled error:', error);
  }

  /**
   * Report error to an external monitoring service
   * This is a placeholder for integration with services like Sentry
   * @param error The error to report
   */
  private reportToErrorMonitoring(error: any): void {
    // Example integration with error monitoring service
    // if (environment.production) {
    //   Sentry.captureException(error);
    // }
  }
}