import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Generic interfaces for communication
export interface CommunicationData {
  id: string;
  type: string;
  source: string;
  destination: string;
  payload: any;
  timestamp?: Date;
}

export interface DashboardRoute {
  path: string;
  component: string;
}

// Transformation function type
export type DataTransformer<T, R> = (data: T) => R;

// Legacy interface for backward compatibility
export interface SelectedIndexData {
  id: string;
  symbol: string;
  name?: string;
  lastPrice?: number;
  variation?: number;
  percentChange?: number;
  keyCategory?: string;
}

// Communication topics enum for type safety
export enum CommunicationTopic {
  INDEX_SELECTION = 'index_selection',
  STOCK_SELECTION = 'stock_selection',
  PORTFOLIO_SELECTION = 'portfolio_selection',
  WATCHLIST_SELECTION = 'watchlist_selection',
  CUSTOM = 'custom'
}

@Injectable({
  providedIn: 'root'
})
export class ComponentCommunicationService {
  // Generic communication channels using Map for multiple topics
  private communicationChannels = new Map<string, BehaviorSubject<CommunicationData | null>>();
  
  // Registered transformers for different data types
  private transformers = new Map<string, DataTransformer<any, any>>();
  
  // Dashboard routes mapping
  private dashboardRoutes = new Map<string, DashboardRoute>();
  
  constructor() {
    // Initialize default communication channels
    this.initializeChannel(CommunicationTopic.INDEX_SELECTION);
    this.initializeChannel(CommunicationTopic.STOCK_SELECTION);
    this.initializeChannel(CommunicationTopic.PORTFOLIO_SELECTION);
    this.initializeChannel(CommunicationTopic.WATCHLIST_SELECTION);
    
    // Register default transformers
    this.registerTransformer(CommunicationTopic.INDEX_SELECTION, this.defaultIndexTransformer.bind(this));
    
    // Register default dashboard routes
    this.registerDashboardRoute(CommunicationTopic.INDEX_SELECTION, '/dashboard/overall', 'OverallComponent');
  }

  /**
   * Initialize a communication channel for a specific topic
   * @param topic The communication topic
   */
  private initializeChannel(topic: string): void {
    if (!this.communicationChannels.has(topic)) {
      this.communicationChannels.set(topic, new BehaviorSubject<CommunicationData | null>(null));
    }
  }

  /**
   * Send data through a specific communication channel
   * @param topic The communication topic
   * @param source The source component
   * @param destination The destination component
   * @param payload The data payload
   * @param dataType Optional data type identifier
   */
  sendData<T>(topic: string, source: string, destination: string, payload: T, dataType?: string): void {
    this.initializeChannel(topic);
    
    const communicationData: CommunicationData = {
      id: this.generateId(),
      type: dataType || topic,
      source,
      destination,
      payload,
      timestamp: new Date()
    };
    
    const channel = this.communicationChannels.get(topic);
    if (channel) {
      channel.next(communicationData);
    }
  }

  /**
   * Subscribe to data from a specific communication channel
   * @param topic The communication topic
   * @returns Observable of communication data
   */
  receiveData(topic: string): Observable<CommunicationData | null> {
    this.initializeChannel(topic);
    const channel = this.communicationChannels.get(topic);
    return channel ? channel.asObservable() : new BehaviorSubject<CommunicationData | null>(null).asObservable();
  }

  /**
   * Clear data from a specific communication channel
   * @param topic The communication topic
   */
  clearData(topic: string): void {
    const channel = this.communicationChannels.get(topic);
    if (channel) {
      channel.next(null);
    }
  }

  /**
   * Register a data transformer for a specific topic
   * @param topic The communication topic
   * @param transformer The transformation function
   */
  registerTransformer<T, R>(topic: string, transformer: DataTransformer<T, R>): void {
    this.transformers.set(topic, transformer);
  }

  /**
   * Transform data using registered transformer
   * @param topic The communication topic
   * @param data The data to transform
   * @returns Transformed data
   */
  transformData<T, R>(topic: string, data: T): R | null {
    const transformer = this.transformers.get(topic);
    return transformer ? transformer(data) : null;
  }

  /**
   * Register a dashboard route for a specific topic
   * @param topic The communication topic
   * @param path The route path
   * @param component The component name
   */
  registerDashboardRoute(topic: string, path: string, component: string): void {
    this.dashboardRoutes.set(topic, { path, component });
  }

  /**
   * Get dashboard route for a specific topic
   * @param topic The communication topic
   * @returns Dashboard route information
   */
  getDashboardRoute(topic: string): DashboardRoute | null {
    return this.dashboardRoutes.get(topic) || null;
  }

  /**
   * Generate unique ID for communication data
   * @returns Unique identifier
   */
  private generateId(): string {
    return `comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Default transformer for index data (backward compatibility)
   * @param indexData The index data
   * @returns Dashboard data format
   */
  private defaultIndexTransformer(indexData: SelectedIndexData): any {
    const currentDate = new Date();
    const month = currentDate.toLocaleString('default', { month: 'long' });
    
    return {
      id: indexData.id || indexData.symbol,
      assetCategory: indexData.keyCategory || 'Index',
      month: month,
      market: 'Stock Market',
      totalValue: indexData.lastPrice || 0,
      riskValue: Math.abs(indexData.variation || 0),
      returnValue: indexData.percentChange || 0,
      description: `${indexData.symbol} - ${indexData.name || 'Market Index'}`
    };
  }

  // Legacy methods for backward compatibility
  /**
   * @deprecated Use sendData with CommunicationTopic.INDEX_SELECTION instead
   * Set the selected index data
   * @param indexData The selected index data from indices component
   */
  setSelectedIndex(indexData: SelectedIndexData): void {
    this.sendData(CommunicationTopic.INDEX_SELECTION, 'IndicesComponent', 'OverallComponent', indexData, 'index');
  }

  /**
   * @deprecated Use receiveData with CommunicationTopic.INDEX_SELECTION instead
   * Get the selected index data as observable
   * @returns Observable of selected index data
   */
  getSelectedIndex(): Observable<SelectedIndexData | null> {
    return new Observable(subscriber => {
      this.receiveData(CommunicationTopic.INDEX_SELECTION).subscribe(data => {
        subscriber.next(data ? data.payload as SelectedIndexData : null);
      });
    });
  }

  /**
   * @deprecated Use clearData with CommunicationTopic.INDEX_SELECTION instead
   * Clear the selected index data
   */
  clearSelectedIndex(): void {
    this.clearData(CommunicationTopic.INDEX_SELECTION);
  }

  /**
   * @deprecated Use transformData with CommunicationTopic.INDEX_SELECTION instead
   * Transform index data to dashboard data format
   * @param indexData The selected index data
   * @returns Dashboard data row format
   */
  transformToDashboardData(indexData: SelectedIndexData): any {
    return this.transformData(CommunicationTopic.INDEX_SELECTION, indexData);
  }
}