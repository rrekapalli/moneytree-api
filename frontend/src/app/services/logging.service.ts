import { Injectable } from '@angular/core';

/**
 * Severity levels for logging
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

/**
 * Configuration for the logging service
 */
export interface LoggingConfig {
  minLevel: LogLevel;
  enableConsoleLogging: boolean;
  enableRemoteLogging: boolean;
  remoteLoggingUrl?: string;
}

/**
 * A structured log entry
 */
export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: any;
  context?: string;
}

/**
 * A service for structured logging with severity levels
 */
@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private config: LoggingConfig = {
    minLevel: LogLevel.INFO,
    enableConsoleLogging: true,
    enableRemoteLogging: false
  };

  /**
   * Configure the logging service
   * @param config The logging configuration
   */
  configure(config: Partial<LoggingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Log a message at DEBUG level
   * @param message The message to log
   * @param data Optional data to include
   * @param context Optional context information
   */
  debug(message: string, data?: any, context?: string): void {
    this.log(LogLevel.DEBUG, message, data, context);
  }

  /**
   * Log a message at INFO level
   * @param message The message to log
   * @param data Optional data to include
   * @param context Optional context information
   */
  info(message: string, data?: any, context?: string): void {
    this.log(LogLevel.INFO, message, data, context);
  }

  /**
   * Log a message at WARN level
   * @param message The message to log
   * @param data Optional data to include
   * @param context Optional context information
   */
  warn(message: string, data?: any, context?: string): void {
    this.log(LogLevel.WARN, message, data, context);
  }

  /**
   * Log a message at ERROR level
   * @param message The message to log
   * @param data Optional data to include
   * @param context Optional context information
   */
  error(message: string, data?: any, context?: string): void {
    this.log(LogLevel.ERROR, message, data, context);
  }

  /**
   * Log a message at FATAL level
   * @param message The message to log
   * @param data Optional data to include
   * @param context Optional context information
   */
  fatal(message: string, data?: any, context?: string): void {
    this.log(LogLevel.FATAL, message, data, context);
  }

  /**
   * Log a message at the specified level
   * @param level The severity level
   * @param message The message to log
   * @param data Optional data to include
   * @param context Optional context information
   */
  private log(level: LogLevel, message: string, data?: any, context?: string): void {
    // Skip if below minimum level
    if (level < this.config.minLevel) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      data,
      context
    };

    // Log to console if enabled
    if (this.config.enableConsoleLogging) {
      this.logToConsole(entry);
    }

    // Log to remote if enabled
    if (this.config.enableRemoteLogging && this.config.remoteLoggingUrl) {
      this.logToRemote(entry);
    }
  }

  /**
   * Log to the console with appropriate formatting
   * @param entry The log entry
   */
  private logToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const context = entry.context ? `[${entry.context}]` : '';
    const levelName = LogLevel[entry.level];
    const message = `${timestamp} ${levelName} ${context} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(message, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(message, entry.data || '');
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(message, entry.data || '');
        break;
    }
  }

  /**
   * Log to a remote endpoint
   * @param entry The log entry
   */
  private logToRemote(entry: LogEntry): void {
    if (!this.config.remoteLoggingUrl) {
      return;
    }

    // Only send ERROR and FATAL logs to remote by default
    if (entry.level < LogLevel.ERROR) {
      return;
    }

    fetch(this.config.remoteLoggingUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(entry)
    }).catch(err => {
      // If remote logging fails, log to console as fallback
      console.error('Failed to send log to remote endpoint', err);
    });
  }
}