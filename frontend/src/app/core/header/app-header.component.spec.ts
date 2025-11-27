import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AppHeaderComponent } from './app-header.component';
import { AuthService } from '../../services/security/auth.service';
import { NotificationsStateService } from '../../services';
import { ToastService } from '../../services';
import { SettingsStateService } from '../../services';

describe('AppHeaderComponent', () => {
  let component: AppHeaderComponent;
  let fixture: ComponentFixture<AppHeaderComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'logout']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const notificationsStateSpy = jasmine.createSpyObj('NotificationsStateService', ['getNotifications']);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);
    const settingsStateSpy = jasmine.createSpyObj('SettingsStateService', []);

    await TestBed.configureTestingModule({
      imports: [AppHeaderComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NotificationsStateService, useValue: notificationsStateSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: SettingsStateService, useValue: settingsStateSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppHeaderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize user menu items', () => {
    component.ngOnInit();
    expect(component.userMenuItems).toBeDefined();
    expect(component.userMenuItems.length).toBeGreaterThan(0);
  });

  it('should get user display name from fullName', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      fullName: 'John Doe'
    };
    authService.getCurrentUser.and.returnValue(mockUser);

    const displayName = component.getUserDisplayName();
    expect(displayName).toBe('John Doe');
    expect(authService.getCurrentUser).toHaveBeenCalled();
  });

  it('should get user display name from firstName and lastName', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe'
    };
    authService.getCurrentUser.and.returnValue(mockUser);

    const displayName = component.getUserDisplayName();
    expect(displayName).toBe('John Doe');
  });

  it('should get user display name from firstName only', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John'
    };
    authService.getCurrentUser.and.returnValue(mockUser);

    const displayName = component.getUserDisplayName();
    expect(displayName).toBe('John');
  });

  it('should get user display name from name field', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'John Doe'
    };
    authService.getCurrentUser.and.returnValue(mockUser);

    const displayName = component.getUserDisplayName();
    expect(displayName).toBe('John Doe');
  });

  it('should format email name when no name fields are available', () => {
    const mockUser = {
      id: '1',
      email: 'john.doe@example.com'
    };
    authService.getCurrentUser.and.returnValue(mockUser);

    const displayName = component.getUserDisplayName();
    expect(displayName).toBe('John Doe');
  });

  it('should format email with underscores correctly', () => {
    const mockUser = {
      id: '1',
      email: 'john_doe@example.com'
    };
    authService.getCurrentUser.and.returnValue(mockUser);

    const displayName = component.getUserDisplayName();
    expect(displayName).toBe('John Doe');
  });

  it('should fallback to "User" when no user data is available', () => {
    authService.getCurrentUser.and.returnValue(null);

    const displayName = component.getUserDisplayName();
    expect(displayName).toBe('User');
  });

  it('should call auth service logout method', () => {
    component.logout();
    expect(authService.logout).toHaveBeenCalled();
  });

  it('should have logout menu item with correct configuration', () => {
    component.ngOnInit();
    const logoutItem = component.userMenuItems.find(item => item.label === 'Logout');
    
    expect(logoutItem).toBeDefined();
    expect(logoutItem?.icon).toBe('pi pi-sign-out');
    expect(logoutItem?.command).toBeDefined();
  });

  it('should have profile menu item with correct configuration', () => {
    component.ngOnInit();
    const profileItem = component.userMenuItems.find(item => item.label === 'Profile');
    
    expect(profileItem).toBeDefined();
    expect(profileItem?.icon).toBe('pi pi-user');
    expect(profileItem?.command).toBeDefined();
  });
}); 