import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { NotificationType } from './entities/notification';

export interface ToastMessage {
  severity: string;
  summary: string;
  detail: string;
  life?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<ToastMessage>();
  public toast$ = this.toastSubject.asObservable();

  constructor() {}

  /**
   * Show a toast message
   * @param severity The severity of the message (success, info, warn, error)
   * @param summary The summary of the message
   * @param detail The detail of the message
   * @param life The life of the message in milliseconds (default: 3000)
   */
  show(severity: string, summary: string, detail: string, life: number = 3000): void {
    this.toastSubject.next({ severity, summary, detail, life });
  }

  /**
   * Show a toast message for a notification
   * @param type The notification type
   * @param title The notification title
   * @param message The notification message
   * @param life The life of the message in milliseconds (default: 3000)
   */
  showNotification(type: NotificationType, title: string, message: string, life: number = 3000): void {
    const severity = this.mapNotificationTypeToSeverity(type);
    this.show(severity, title, message, life);
  }

  /**
   * Show an error toast message
   * @param options The toast message options
   */
  showError(options: Partial<ToastMessage>): void {
    this.toastSubject.next({
      severity: 'error',
      summary: options.summary || 'Error',
      detail: options.detail || 'An error occurred',
      life: options.life || 5000
    });
  }

  /**
   * Map a notification type to a toast severity
   * @param type The notification type
   * @returns The toast severity
   */
  private mapNotificationTypeToSeverity(type: NotificationType): string {
    switch (type) {
      case NotificationType.SUCCESS:
        return 'success';
      case NotificationType.WARNING:
        return 'warn';
      case NotificationType.ERROR:
        return 'error';
      case NotificationType.INFO:
      default:
        return 'info';
    }
  }
}
