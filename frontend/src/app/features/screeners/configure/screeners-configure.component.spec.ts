import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';

import { ScreenersConfigureComponent } from './screeners-configure.component';
import { ScreenerResp } from '../../../services/entities/screener.entities';

describe('ScreenersConfigureComponent', () => {
  let component: ScreenersConfigureComponent;
  let fixture: ComponentFixture<ScreenersConfigureComponent>;

  const mockScreener: ScreenerResp = {
    screenerId: '1',
    ownerUserId: '1',
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
        ScreenersConfigureComponent,
        FormsModule,
        ButtonModule,
        SelectModule,
        InputTextModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenersConfigureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form when selectedScreener changes', () => {
    component.selectedScreener = mockScreener;
    component.ngOnChanges({
      selectedScreener: {
        currentValue: mockScreener,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true
      }
    });

    expect(component.screenerForm.name).toBe(mockScreener.name);
    expect(component.screenerForm.description).toBe(mockScreener.description);
  });

  it('should detect basic info changes', () => {
    component.screenerForm = {
      name: 'Original Name',
      description: 'Original Description',
      isPublic: false,
      defaultUniverse: 'NIFTY 50',
      criteria: undefined
    };

    component.originalBasicInfo = {
      name: 'Original Name',
      description: 'Original Description',
      isPublic: false,
      defaultUniverse: 'NIFTY 50'
    };

    expect(component.hasBasicInfoChanges()).toBeFalsy();

    component.screenerForm.name = 'Changed Name';
    expect(component.hasBasicInfoChanges()).toBeTruthy();
  });

  it('should emit events correctly', () => {
    spyOn(component.createScreener, 'emit');
    spyOn(component.clearSelection, 'emit');
    spyOn(component.saveScreener, 'emit');

    component.onCreateScreener();
    component.onClearSelection();
    
    component.screenerForm.name = 'Test';
    component.onSaveScreener();

    expect(component.createScreener.emit).toHaveBeenCalled();
    expect(component.clearSelection.emit).toHaveBeenCalled();
    expect(component.saveScreener.emit).toHaveBeenCalledWith(component.screenerForm);
  });

  it('should toggle edit mode correctly', () => {
    component.isEditingBasicInfo = false;
    component.toggleBasicInfoEdit();
    expect(component.isEditingBasicInfo).toBeTruthy();

    component.toggleBasicInfoEdit();
    expect(component.isEditingBasicInfo).toBeFalsy();
  });
});