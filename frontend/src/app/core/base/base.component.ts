import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Base component class that implements OnPush change detection strategy
 * and provides common functionality for components.
 * 
 * This class should be extended by components to ensure consistent
 * performance optimizations across the application.
 */
@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export abstract class BaseComponent implements OnDestroy {
  /**
   * Subject that emits when the component is destroyed
   * Use this to unsubscribe from observables in child components
   * 
   * Example usage:
   * ```
   * someObservable$.pipe(
   *   takeUntil(this.destroy$)
   * ).subscribe(data => {
   *   // Handle data
   * });
   * ```
   */
  protected destroy$ = new Subject<void>();

  /**
   * Cleanup resources when the component is destroyed
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}