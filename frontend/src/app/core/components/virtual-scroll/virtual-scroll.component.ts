import { Component, Input, TemplateRef, ContentChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { BaseComponent } from '../../base';

/**
 * Virtual Scrolling Component
 * 
 * This component provides efficient rendering of large lists using virtual scrolling.
 * It only renders the items that are currently visible in the viewport, improving
 * performance for large data sets.
 * 
 * Usage:
 * ```html
 * <app-virtual-scroll [items]="largeDataArray" [itemHeight]="50" [containerHeight]="400">
 *   <ng-template #itemTemplate let-item>
 *     <div class="item">{{ item.name }}</div>
 *   </ng-template>
 * </app-virtual-scroll>
 * ```
 */
@Component({
  selector: 'app-virtual-scroll',
  standalone: true,
  imports: [CommonModule, ScrollingModule],
  template: `
    <cdk-virtual-scroll-viewport
      [itemSize]="itemHeight"
      [style.height.px]="containerHeight"
      class="virtual-scroll-viewport">
      <ng-container *cdkVirtualFor="let item of items; let i = index; trackBy: trackByFn">
        <ng-container *ngTemplateOutlet="itemTemplate; context: { $implicit: item, index: i }"></ng-container>
      </ng-container>
    </cdk-virtual-scroll-viewport>
  `,
  styles: [`
    .virtual-scroll-viewport {
      width: 100%;
      overflow-x: hidden;
      overflow-y: auto;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VirtualScrollComponent<T> extends BaseComponent {
  /**
   * The array of items to display in the virtual scroll
   */
  @Input() items: T[] = [];

  /**
   * The height of each item in pixels
   * This is used to calculate the total scroll height
   */
  @Input() itemHeight = 50;

  /**
   * The height of the container in pixels
   */
  @Input() containerHeight = 400;

  /**
   * Template for rendering each item
   */
  @ContentChild('itemTemplate', { static: false })
  itemTemplate!: TemplateRef<{ $implicit: T; index: number }>;

  /**
   * Track function for optimizing rendering
   * @param index The index of the item
   * @param item The item
   * @returns A unique identifier for the item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
}