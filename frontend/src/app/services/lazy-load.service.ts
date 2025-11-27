import { Injectable, Type } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Service for lazy loading components and modules
 * 
 * This service provides methods for dynamically importing components and modules
 * to optimize bundle size and improve application performance.
 */
@Injectable({
  providedIn: 'root'
})
export class LazyLoadService {
  /**
   * Lazy load a component
   * 
   * @param importFn A function that returns a dynamic import
   * @param exportName The name of the exported component (default: 'default')
   * @returns An Observable that resolves to the component type
   * 
   * @example
   * ```typescript
   * lazyLoadService.loadComponent(() => import('./path/to/component'))
   *   .subscribe(component => {
   *     // Use the component
   *   });
   * ```
   */
  loadComponent<T>(
    importFn: () => Promise<any>,
    exportName: string = 'default'
  ): Observable<Type<T>> {
    return from(importFn()).pipe(
      map(module => module[exportName] as Type<T>)
    );
  }

  /**
   * Preload a component without rendering it
   * 
   * @param importFn A function that returns a dynamic import
   * @returns A Promise that resolves when the component is loaded
   * 
   * @example
   * ```typescript
   * // Preload a component when hovering over a button
   * <button (mouseenter)="preloadComponent()">Show Component</button>
   * 
   * preloadComponent() {
   *   this.lazyLoadService.preload(() => import('./path/to/component'));
   * }
   * ```
   */
  preload(importFn: () => Promise<any>): Promise<void> {
    return importFn().then(() => {
      // Component is now in the browser's cache
    });
  }

  /**
   * Preload multiple components in parallel
   * 
   * @param importFns An array of functions that return dynamic imports
   * @returns A Promise that resolves when all components are loaded
   * 
   * @example
   * ```typescript
   * // Preload multiple components on app initialization
   * this.lazyLoadService.preloadAll([
   *   () => import('./path/to/component1'),
   *   () => import('./path/to/component2')
   * ]);
   * ```
   */
  preloadAll(importFns: Array<() => Promise<any>>): Promise<void[]> {
    return Promise.all(importFns.map(fn => this.preload(fn)));
  }
}