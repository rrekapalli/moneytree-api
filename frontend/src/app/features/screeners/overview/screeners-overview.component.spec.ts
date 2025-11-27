import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { ScreenersOverviewComponent } from './screeners-overview.component';
import { ScreenerResp } from '../../../services/entities/screener.entities';

describe('ScreenersOverviewComponent', () => {
  let component: ScreenersOverviewComponent;
  let fixture: ComponentFixture<ScreenersOverviewComponent>;

  const mockScreener: ScreenerResp = {
    screenerId: 1,
    name: 'Test Screener',
    description: 'Test Description',
    isPublic: false,
    defaultUniverse: 'NIFTY 50',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    criteria: undefined
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ScreenersOverviewComponent,
        ButtonModule,
        TagModule,
        TooltipModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenersOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should track screener by id', () => {
    const result = component.trackScreenerById(0, mockScreener);
    expect(result).toBe(mockScreener.screenerId);
  });

  it('should format date correctly', () => {
    const testDate = '2024-01-15T10:30:00Z';
    const result = component.formatDate(testDate);
    expect(result).toContain('2024');
  });

  it('should check if screener is starred', () => {
    component.starredScreeners = [mockScreener];
    const result = component.isStarred(mockScreener);
    expect(result).toBeTruthy();
  });

  it('should emit events correctly', () => {
    spyOn(component.runScreener, 'emit');
    spyOn(component.configureScreener, 'emit');
    
    component.onRunScreener(mockScreener);
    component.onConfigureScreener(mockScreener);
    
    expect(component.runScreener.emit).toHaveBeenCalledWith(mockScreener);
    expect(component.configureScreener.emit).toHaveBeenCalledWith(mockScreener);
  });
});