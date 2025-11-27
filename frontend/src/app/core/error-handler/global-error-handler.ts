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
    // Ignore known non-critical errors
    if (this.shouldIgnoreError(error)) {
      return;
    }

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
   * Check if an error should be ignored (non-critical errors)
   * @param error The error to check
   * @returns true if the error should be ignored
   */
  private shouldIgnoreError(error: any): boolean {
    // Ignore WebSocket connection errors (server may not be running)
    if (error && typeof error === 'object') {
      const errorMessage = (error.message || '').toLowerCase();
      const errorUrl = (error.url || '').toLowerCase();
      
      // WebSocket connection errors
      if (errorMessage.includes('websocket') || 
          errorMessage.includes('connection refused') ||
          errorMessage.includes('err_connection_refused') ||
          errorUrl.includes('websocket') ||
          errorUrl.includes('/ws/') ||
          errorUrl.includes('/engines/ws/')) {
        return true;
      }

      // HTTP 400 errors for endpoints that don't exist yet (expected during development)
      if (error.status === 400) {
        const url = (error.url || '').toLowerCase();
        if (url.includes('/screeners/my') ||
            url.includes('/screeners/public') ||
            url.includes('/screeners/starred')) {
          return true; // These endpoints don't exist yet, ignore the error
        }
      }
    }

    return false;
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