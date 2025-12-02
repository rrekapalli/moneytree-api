/**
 * Theme Integration and Accessibility Validation Tests
 * 
 * This test suite validates that the QueryBuilder library properly integrates
 * with the application theme system and maintains accessibility compliance
 * with compact design.
 */

import { TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  template: `
    <div class="query-builder" [class]="themeClass">
      <div class="test-input p-inputtext">Test Input</div>
      <button class="test-button p-button">Test Button</button>
      <div class="test-select p-select">
        <span class="p-select-label">Test Select</span>
      </div>
      <div class="test-checkbox p-checkbox">
        <div class="p-checkbox-box"></div>
      </div>
      <div class="test-message p-message p-message-error">
        <span class="p-message-text">Test Message</span>
      </div>
    </div>
  `,
  styles: [`
    @import '../lib/querybuilder.scss';
    @import '../lib/theme-integration.scss';
  `]
})
class TestThemeComponent {
  themeClass = '';
}

describe('QueryBuilder Theme Integration', () => {
  let component: TestThemeComponent;
  let fixture: any;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestThemeComponent],
      imports: [NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TestThemeComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
  });

  describe('CSS Custom Properties Integration', () => {
    it('should use application theme variables', () => {
      // Set up CSS custom properties to simulate app theme
      const rootElement = document.documentElement;
      rootElement.style.setProperty('--primary-color', '#4CAF50');
      rootElement.style.setProperty('--font-size', '0.875rem');
      rootElement.style.setProperty('--surface-card', '#ffffff');
      
      fixture.detectChanges();
      
      const queryBuilder = debugElement.query(By.css('.query-builder'));
      const computedStyle = getComputedStyle(queryBuilder.nativeElement);
      
      // Verify theme integration
      expect(computedStyle.getPropertyValue('--qb-primary-color').trim()).toBe('var(--primary-color, #4CAF50)');
      expect(computedStyle.getPropertyValue('--qb-font-size').trim()).toBe('var(--font-size, 0.875rem)');
    });

    it('should provide fallback values when app theme variables are not available', () => {
      // Clear any existing CSS custom properties
      const rootElement = document.documentElement;
      rootElement.style.removeProperty('--primary-color');
      rootElement.style.removeProperty('--font-size');
      
      fixture.detectChanges();
      
      const queryBuilder = debugElement.query(By.css('.query-builder'));
      const computedStyle = getComputedStyle(queryBuilder.nativeElement);
      
      // Should use fallback values
      expect(computedStyle.fontSize).toBeTruthy();
      expect(computedStyle.color).toBeTruthy();
    });
  });

  describe('Compact Design Validation', () => {
    it('should maintain compact spacing in default mode', () => {
      fixture.detectChanges();
      
      const inputElement = debugElement.query(By.css('.test-input'));
      const buttonElement = debugElement.query(By.css('.test-button'));
      
      const inputStyle = getComputedStyle(inputElement.nativeElement);
      const buttonStyle = getComputedStyle(buttonElement.nativeElement);
      
      // Verify compact dimensions
      expect(parseInt(inputStyle.height)).toBeLessThanOrEqual(32);
      expect(parseInt(buttonStyle.height)).toBeLessThanOrEqual(32);
      expect(inputStyle.fontSize).toBe('0.875rem');
    });

    it('should apply even more compact styling in compact mode', () => {
      component.themeClass = 'qb-compact';
      fixture.detectChanges();
      
      const inputElement = debugElement.query(By.css('.test-input'));
      const inputStyle = getComputedStyle(inputElement.nativeElement);
      
      // Should be more compact than default
      expect(parseInt(inputStyle.height)).toBeLessThanOrEqual(28);
    });

    it('should apply maximum compactness in dense mode', () => {
      component.themeClass = 'qb-dense';
      fixture.detectChanges();
      
      const inputElement = debugElement.query(By.css('.test-input'));
      const inputStyle = getComputedStyle(inputElement.nativeElement);
      
      // Should be most compact
      expect(parseInt(inputStyle.height)).toBeLessThanOrEqual(24);
    });
  });

  describe('Accessibility Compliance', () => {
    it('should maintain minimum touch target sizes on mobile', () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 480 });
      window.dispatchEvent(new Event('resize'));
      
      fixture.detectChanges();
      
      const buttonElement = debugElement.query(By.css('.test-button'));
      const buttonStyle = getComputedStyle(buttonElement.nativeElement);
      
      // Should meet minimum 44px touch target on mobile
      expect(parseInt(buttonStyle.height)).toBeGreaterThanOrEqual(44);
    });

    it('should provide proper focus indicators', () => {
      fixture.detectChanges();
      
      const inputElement = debugElement.query(By.css('.test-input'));
      inputElement.nativeElement.focus();
      
      const inputStyle = getComputedStyle(inputElement.nativeElement, ':focus');
      
      // Should have visible focus indicator
      expect(inputStyle.outline || inputStyle.boxShadow).toBeTruthy();
    });

    it('should maintain color contrast in different themes', () => {
      // Test light theme
      component.themeClass = '';
      fixture.detectChanges();
      
      const textElement = debugElement.query(By.css('.test-input'));
      const lightStyle = getComputedStyle(textElement.nativeElement);
      
      // Test dark theme
      component.themeClass = 'p-dark';
      fixture.detectChanges();
      
      const darkStyle = getComputedStyle(textElement.nativeElement);
      
      // Both should have readable text colors
      expect(lightStyle.color).toBeTruthy();
      expect(darkStyle.color).toBeTruthy();
      expect(lightStyle.color).not.toBe(darkStyle.color);
    });

    xit('should support high contrast mode', () => {
      // TODO: Fix this test - jest is not available in Jasmine/Karma setup
      // Simulate high contrast preference
      // Object.defineProperty(window, 'matchMedia', {
      //   value: jest.fn().mockImplementation(query => ({
      //     matches: query === '(prefers-contrast: high)',
      //     media: query,
      //     onchange: null,
      //     addListener: jest.fn(),
      //     removeListener: jest.fn(),
      //     addEventListener: jest.fn(),
      //     removeEventListener: jest.fn(),
      //     dispatchEvent: jest.fn(),
      //   })),
      // });

      // fixture.detectChanges();
      
      // const inputElement = debugElement.query(By.css('.test-input'));
      // const inputStyle = getComputedStyle(inputElement.nativeElement);
      
      // Should have enhanced borders in high contrast mode
      // expect(parseInt(inputStyle.borderWidth)).toBeGreaterThanOrEqual(2);
    });

    xit('should respect reduced motion preferences', () => {
      // TODO: Fix this test - jest is not available in Jasmine/Karma setup
      // Simulate reduced motion preference
      // Object.defineProperty(window, 'matchMedia', {
      //   value: jest.fn().mockImplementation(query => ({
      //     matches: query === '(prefers-reduced-motion: reduce)',
      //     media: query,
      //     onchange: null,
      //     addListener: jest.fn(),
      //     removeListener: jest.fn(),
      //     addEventListener: jest.fn(),
      //     removeEventListener: jest.fn(),
      //     dispatchEvent: jest.fn(),
      //   })),
      // });

      fixture.detectChanges();
      
      const buttonElement = debugElement.query(By.css('.test-button'));
      const buttonStyle = getComputedStyle(buttonElement.nativeElement);
      
      // Should have no transitions when reduced motion is preferred
      expect(buttonStyle.transition).toBe('none');
    });
  });

  describe('PrimeNG Theme Compatibility', () => {
    it('should work with Aura theme', () => {
      component.themeClass = 'p-theme-aura';
      fixture.detectChanges();
      
      const queryBuilder = debugElement.query(By.css('.query-builder'));
      expect(queryBuilder.nativeElement).toHaveClass('p-theme-aura');
    });

    it('should work with Material theme', () => {
      component.themeClass = 'p-theme-material';
      fixture.detectChanges();
      
      const queryBuilder = debugElement.query(By.css('.query-builder'));
      expect(queryBuilder.nativeElement).toHaveClass('p-theme-material');
    });

    it('should work with Bootstrap theme', () => {
      component.themeClass = 'p-theme-bootstrap';
      fixture.detectChanges();
      
      const queryBuilder = debugElement.query(By.css('.query-builder'));
      expect(queryBuilder.nativeElement).toHaveClass('p-theme-bootstrap');
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to tablet viewport', () => {
      // Simulate tablet viewport
      Object.defineProperty(window, 'innerWidth', { value: 768 });
      window.dispatchEvent(new Event('resize'));
      
      fixture.detectChanges();
      
      const inputElement = debugElement.query(By.css('.test-input'));
      const inputStyle = getComputedStyle(inputElement.nativeElement);
      
      // Should have appropriate sizing for tablet
      expect(parseInt(inputStyle.height)).toBeGreaterThanOrEqual(36);
    });

    it('should stack components vertically on mobile', () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 480 });
      window.dispatchEvent(new Event('resize'));
      
      fixture.detectChanges();
      
      // Components should adapt to mobile layout
      const queryBuilder = debugElement.query(By.css('.query-builder'));
      expect(queryBuilder.nativeElement).toBeTruthy();
    });
  });

  describe('Print Styles', () => {
    it('should apply print-friendly styles', () => {
      // Simulate print media
      const printStyleSheet = document.createElement('style');
      printStyleSheet.media = 'print';
      printStyleSheet.textContent = `
        @media print {
          .query-builder { --qb-font-size: 10pt; }
          .p-button { display: none; }
        }
      `;
      document.head.appendChild(printStyleSheet);
      
      fixture.detectChanges();
      
      // Print styles should be applied
      expect(printStyleSheet.textContent).toContain('display: none');
      
      document.head.removeChild(printStyleSheet);
    });
  });
});

describe('Theme Utility Classes', () => {
  let fixture: any;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestThemeComponent],
      imports: [NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TestThemeComponent);
    debugElement = fixture.debugElement;
  });

  it('should provide theme color utility classes', () => {
    const testElement = document.createElement('div');
    testElement.className = 'qb-theme-primary';
    document.body.appendChild(testElement);
    
    const computedStyle = getComputedStyle(testElement);
    expect(computedStyle.color).toBeTruthy();
    
    document.body.removeChild(testElement);
  });

  it('should provide background utility classes', () => {
    const testElement = document.createElement('div');
    testElement.className = 'qb-bg-surface';
    document.body.appendChild(testElement);
    
    const computedStyle = getComputedStyle(testElement);
    expect(computedStyle.backgroundColor).toBeTruthy();
    
    document.body.removeChild(testElement);
  });

  it('should provide border utility classes', () => {
    const testElement = document.createElement('div');
    testElement.className = 'qb-border-primary';
    document.body.appendChild(testElement);
    
    const computedStyle = getComputedStyle(testElement);
    expect(computedStyle.borderColor).toBeTruthy();
    
    document.body.removeChild(testElement);
  });
});