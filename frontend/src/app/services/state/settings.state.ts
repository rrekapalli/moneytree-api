import { Injectable, computed, effect, signal } from '@angular/core';

/**
 * Interface for the global settings state
 */
interface SettingsState {
  notificationRetentionMinutes: number;
  maxNotifications: number;
  // Add other global settings here as needed
}

/**
 * Initial state for settings
 */
const initialState: SettingsState = {
  notificationRetentionMinutes: 30, // Default: 30 minutes
  maxNotifications: 100 // Default: 100 notifications
};

@Injectable({
  providedIn: 'root'
})
export class SettingsStateService {
  // State signal
  private state = signal<SettingsState>(initialState);
  
  // Public readable signals
  public notificationRetentionMinutes = computed(() => this.state().notificationRetentionMinutes);
  public maxNotifications = computed(() => this.state().maxNotifications);
  
  constructor() {
    // State changes are handled silently
  }
  
  /**
   * Updates the state
   * @param updates Partial state to update
   */
  private updateState(updates: Partial<SettingsState>): void {
    this.state.update(currentState => ({
      ...currentState,
      ...updates
    }));
  }
  
  /**
   * Set notification retention time in minutes
   * @param minutes Retention time in minutes (minimum 1)
   */
  setNotificationRetentionMinutes(minutes: number): void {
    const validMinutes = Math.max(1, minutes);
    if (validMinutes !== minutes) {
      // Silently adjust to minimum value
    }
    this.updateState({ notificationRetentionMinutes: validMinutes });
  }
  
  /**
   * Set maximum number of notifications to keep
   * @param max Maximum number of notifications (minimum 1)
   */
  setMaxNotifications(max: number): void {
    const validMax = Math.max(1, max);
    if (validMax !== max) {
      // Silently adjust to minimum value
    }
    this.updateState({ maxNotifications: validMax });
  }
}