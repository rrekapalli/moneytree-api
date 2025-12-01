import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';
import { ScreenersConfigureComponent } from './screeners-configure.component';
import { QueryConverterService } from 'querybuilder';
import { ScreenerCriteria, ScreenerRule } from '../../../services/entities/screener.entities';

describe('ScreenersConfigureComponent - API Integration', () => {
  let component: ScreenersConfigureComponent;
  let fixture: ComponentFixture<ScreenersConfigureComponent>;
  let queryConverter: QueryConverterService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreenersConfigureComponent],
      providers: [
        QueryConverterService,
        ChangeDetectorRef
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ScreenersConfigureComponent);
    component = fixture.componentInstance;
    queryConverter = TestBed.inject(QueryConverterService);
  });

  it('should convert query to screener criteria format', () => {
    // Arrange: Create a simple query
    const query = {
      condition: 'and',
      rules: [
        {
          field: 'marketCap',
          operator: '>',
          value: 1000000000
        }
      ]
    };

    // Act: Trigger query change
    component.onQueryChange(query);

    // Assert: Verify criteria was converted correctly
    expect(component.screenerForm.criteria).toBeDefined();
    expect(component.screenerForm.criteria?.condition).toBe('and');
    expect(component.screenerForm.criteria?.rules.length).toBe(1);
    
    const rule = component.screenerForm.criteria?.rules[0] as ScreenerRule;
    expect(rule.field).toBe('marketCap');
    expect(rule.operator).toBe('>');
    expect(rule.value).toBe(1000000000);
  });

  it('should load existing screener criteria into query builder', () => {
    // Arrange: Create screener with criteria
    const mockScreener = {
      screenerId: '1',
      ownerUserId: '1',
      name: 'Test Screener',
      description: 'Test Description',
      isPublic: false,
      defaultUniverse: 'NSE',
      criteria: {
        condition: 'or',
        rules: [
          {
            field: 'pe',
            operator: '<',
            value: 20
          } as ScreenerRule
        ]
      } as ScreenerCriteria,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    };

    // Act: Set selected screener
    component.selectedScreener = mockScreener;
    component.ngOnChanges({
      selectedScreener: {
        currentValue: mockScreener,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true
      }
    });

    // Assert: Verify query was loaded correctly
    expect(component.currentQuery).toBeDefined();
    expect(component.currentQuery.condition).toBe('or');
    expect(component.currentQuery.rules.length).toBe(1);
    
    const rule = component.currentQuery.rules[0] as any;
    expect(rule.field).toBe('pe');
    expect(rule.operator).toBe('<');
    expect(rule.value).toBe(20);
  });

  it('should validate query before saving', () => {
    // Arrange: Create invalid query
    const invalidQuery = {
      condition: 'invalid',
      rules: [
        {
          field: '',
          operator: '',
          value: null
        }
      ]
    };

    // Act: Set invalid query and try to save
    component.currentQuery = invalidQuery;
    component.screenerForm.name = 'Test Screener';
    component.onSaveScreener();

    // Assert: Verify validation errors are present
    expect(component.queryValidationErrors.length).toBeGreaterThan(0);
  });

  it('should handle empty criteria gracefully', () => {
    // Arrange: Create empty query
    const emptyQuery = {
      condition: 'and',
      rules: []
    };

    // Act: Trigger query change with empty query
    component.onQueryChange(emptyQuery);

    // Assert: Verify criteria is undefined for empty query
    expect(component.screenerForm.criteria).toBeUndefined();
  });
});