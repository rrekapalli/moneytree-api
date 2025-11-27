import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { FeatureFlagStateService } from '../../services/state/feature-flag.state';

/**
 * Directive for conditionally rendering elements based on feature flags
 * 
 * Usage:
 * <div *featureFlag="'feature-name'">This will only show if the feature is enabled</div>
 * <div *featureFlag="'feature-name'; else disabledTemplate">Feature enabled content</div>
 * <ng-template #disabledTemplate>Feature disabled content</ng-template>
 */
@Directive({
  selector: '[featureFlag]',
  standalone: true
})
export class FeatureFlagDirective implements OnInit {
  private hasView = false;
  private featureName = '';

  @Input() set featureFlag(name: string) {
    this.featureName = name;
    this.updateView();
  }

  @Input() set featureFlagElse(templateRef: TemplateRef<any>) {
    this.elseTemplateRef = templateRef;
    this.updateView();
  }

  private elseTemplateRef: TemplateRef<any> | null = null;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private featureFlagService: FeatureFlagStateService
  ) {}

  ngOnInit(): void {
    this.updateView();
  }

  private updateView(): void {
    if (!this.featureName) {
      return;
    }

    const isEnabled = this.featureFlagService.isFeatureEnabled(this.featureName);

    if (isEnabled && !this.hasView) {
      this.viewContainer.clear();
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!isEnabled && this.hasView) {
      this.viewContainer.clear();
      if (this.elseTemplateRef) {
        this.viewContainer.createEmbeddedView(this.elseTemplateRef);
      }
      this.hasView = false;
    } else if (!isEnabled && !this.hasView && this.elseTemplateRef) {
      this.viewContainer.clear();
      this.viewContainer.createEmbeddedView(this.elseTemplateRef);
    }
  }
}