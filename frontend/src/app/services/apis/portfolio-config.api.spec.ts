import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PortfolioConfigApiService } from './portfolio-config.api';
import { AuthService } from '../security/auth.service';
import { environment } from '../../../environments/environment';
import { 
  PortfolioConfig, 
  PortfolioConfigCreateRequest, 
  PortfolioConfigUpdateRequest 
} from '../entities/portfolio.entities';

describe('PortfolioConfigApiService', () => {
  let service: PortfolioConfigApiService;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getToken']);
    authSpy.getToken.and.returnValue('mock-token');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PortfolioConfigApiService,
        { provide: AuthService, useValue: authSpy }
      ]
    });

    service = TestBed.inject(PortfolioConfigApiService);
    httpMock = TestBed.inject(HttpTestingController);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getConfig', () => {
    it('should retrieve portfolio configuration successfully', () => {
      const portfolioId = 'test-portfolio-id';
      const mockConfig: PortfolioConfig = {
        portfolioId: portfolioId,
        tradingMode: 'paper',
        signalCheckInterval: 300,
        lookbackDays: 30,
        historicalCacheEnabled: true,
        historicalCacheLookbackDays: 90,
        historicalCacheExchange: 'NSE',
        historicalCacheInstrumentType: 'EQ',
        historicalCacheCandleInterval: 'day',
        historicalCacheTtlSeconds: 3600,
        redisEnabled: false,
        redisHost: 'localhost',
        redisPort: 6379,
        redisDb: 0,
        redisKeyPrefix: 'portfolio:',
        enableConditionalLogging: true,
        cacheDurationSeconds: 300,
        exchange: 'NSE',
        candleInterval: 'day',
        entryBbLower: true,
        entryRsiThreshold: 30,
        entryMacdTurnPositive: true,
        entryVolumeAboveAvg: true,
        entryFallbackSmaPeriod: 20,
        entryFallbackAtrMultiplier: 2.0,
        exitTakeProfitPct: 5.0,
        exitStopLossAtrMult: 2.0,
        exitAllowTpExitsOnly: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      service.getConfig(portfolioId).subscribe(config => {
        expect(config).toEqual(mockConfig);
        expect(config.portfolioId).toBe(portfolioId);
        expect(config.tradingMode).toBe('paper');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/portfolio/${portfolioId}/config`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
      req.flush(mockConfig);
    });

    it('should handle 404 error when config does not exist', () => {
      const portfolioId = 'test-portfolio-id';

      service.getConfig(portfolioId).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.userMessage).toBe('Portfolio configuration not found.');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/portfolio/${portfolioId}/config`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle network error (status 0)', () => {
      const portfolioId = 'test-portfolio-id';

      service.getConfig(portfolioId).subscribe({
        next: () => fail('should have failed with network error'),
        error: (error) => {
          expect(error.status).toBe(0);
          expect(error.userMessage).toBe('Unable to connect to the server. Please check your internet connection.');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/portfolio/${portfolioId}/config`);
      req.error(new ProgressEvent('error'), { status: 0 });
    });

    it('should handle authentication error (status 401)', () => {
      const portfolioId = 'test-portfolio-id';

      service.getConfig(portfolioId).subscribe({
        next: () => fail('should have failed with 401 error'),
        error: (error) => {
          expect(error.status).toBe(401);
          expect(error.userMessage).toBe('Your session has expired. Please log in again.');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/portfolio/${portfolioId}/config`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle authorization error (status 403)', () => {
      const portfolioId = 'test-portfolio-id';

      service.getConfig(portfolioId).subscribe({
        next: () => fail('should have failed with 403 error'),
        error: (error) => {
          expect(error.status).toBe(403);
          expect(error.userMessage).toBe('You do not have permission to perform this action.');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/portfolio/${portfolioId}/config`);
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });

    it('should handle server error (status 500)', () => {
      const portfolioId = 'test-portfolio-id';

      service.getConfig(portfolioId).subscribe({
        next: () => fail('should have failed with 500 error'),
        error: (error) => {
          expect(error.status).toBe(500);
          expect(error.userMessage).toBe('Server error occurred. Please try again later.');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/portfolio/${portfolioId}/config`);
      req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('createConfig', () => {
    it('should create portfolio configuration successfully', () => {
      const portfolioId = 'test-portfolio-id';
      const createRequest: PortfolioConfigCreateRequest = {
        tradingMode: 'paper',
        signalCheckInterval: 300,
        lookbackDays: 30,
        historicalCacheEnabled: true,
        historicalCacheLookbackDays: 90,
        exchange: 'NSE',
        candleInterval: 'day',
        entryRsiThreshold: 30,
        exitTakeProfitPct: 5.0,
        exitStopLossAtrMult: 2.0
      };

      const mockResponse: PortfolioConfig = {
        portfolioId: portfolioId,
        tradingMode: createRequest.tradingMode,
        signalCheckInterval: createRequest.signalCheckInterval,
        lookbackDays: createRequest.lookbackDays,
        historicalCacheEnabled: createRequest.historicalCacheEnabled || false,
        historicalCacheLookbackDays: createRequest.historicalCacheLookbackDays || 90,
        historicalCacheExchange: 'NSE',
        historicalCacheInstrumentType: 'EQ',
        historicalCacheCandleInterval: 'day',
        historicalCacheTtlSeconds: 3600,
        redisEnabled: false,
        redisHost: 'localhost',
        redisPort: 6379,
        redisDb: 0,
        redisKeyPrefix: 'portfolio:',
        enableConditionalLogging: false,
        cacheDurationSeconds: 300,
        exchange: createRequest.exchange || 'NSE',
        candleInterval: createRequest.candleInterval || 'day',
        entryBbLower: false,
        entryRsiThreshold: createRequest.entryRsiThreshold || 30,
        entryMacdTurnPositive: false,
        entryVolumeAboveAvg: false,
        entryFallbackSmaPeriod: 20,
        entryFallbackAtrMultiplier: 2.0,
        exitTakeProfitPct: createRequest.exitTakeProfitPct || 5.0,
        exitStopLossAtrMult: createRequest.exitStopLossAtrMult || 2.0,
        exitAllowTpExitsOnly: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      service.createConfig(portfolioId, createRequest).subscribe(config => {
        expect(config).toEqual(mockResponse);
        expect(config.portfolioId).toBe(portfolioId);
        expect(config.tradingMode).toBe(createRequest.tradingMode);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/portfolio/${portfolioId}/config`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
      req.flush(mockResponse);
    });

    it('should handle validation error (status 400)', () => {
      const portfolioId = 'test-portfolio-id';
      const createRequest: PortfolioConfigCreateRequest = {
        tradingMode: 'invalid',
        signalCheckInterval: -1,
        lookbackDays: 0
      };

      service.createConfig(portfolioId, createRequest).subscribe({
        next: () => fail('should have failed with 400 error'),
        error: (error) => {
          expect(error.status).toBe(400);
          expect(error.userMessage).toContain('Invalid configuration data');
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/portfolio/${portfolioId}/config`);
      req.flush({ message: 'Validation failed' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('updateConfig', () => {
    it('should update portfolio configuration successfully', () => {
      const portfolioId = 'test-portfolio-id';
      const updateRequest: PortfolioConfigUpdateRequest = {
        tradingMode: 'live',
        signalCheckInterval: 600,
        lookbackDays: 60,
        exitTakeProfitPct: 10.0
      };

      const mockResponse: PortfolioConfig = {
        portfolioId: portfolioId,
        tradingMode: 'live',
        signalCheckInterval: 600,
        lookbackDays: 60,
        historicalCacheEnabled: true,
        historicalCacheLookbackDays: 90,
        historicalCacheExchange: 'NSE',
        historicalCacheInstrumentType: 'EQ',
        historicalCacheCandleInterval: 'day',
        historicalCacheTtlSeconds: 3600,
        redisEnabled: false,
        redisHost: 'localhost',
        redisPort: 6379,
        redisDb: 0,
        redisKeyPrefix: 'portfolio:',
        enableConditionalLogging: true,
        cacheDurationSeconds: 300,
        exchange: 'NSE',
        candleInterval: 'day',
        entryBbLower: true,
        entryRsiThreshold: 30,
        entryMacdTurnPositive: true,
        entryVolumeAboveAvg: true,
        entryFallbackSmaPeriod: 20,
        entryFallbackAtrMultiplier: 2.0,
        exitTakeProfitPct: 10.0,
        exitStopLossAtrMult: 2.0,
        exitAllowTpExitsOnly: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
      };

      service.updateConfig(portfolioId, updateRequest).subscribe(config => {
        expect(config).toEqual(mockResponse);
        expect(config.tradingMode).toBe('live');
        expect(config.exitTakeProfitPct).toBe(10.0);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/portfolio/${portfolioId}/config`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
      req.flush(mockResponse);
    });
  });

  describe('deleteConfig', () => {
    it('should delete portfolio configuration successfully', () => {
      const portfolioId = 'test-portfolio-id';

      service.deleteConfig(portfolioId).subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/portfolio/${portfolioId}/config`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
      req.flush(null);
    });
  });

  describe('request payload formatting', () => {
    it('should format POST request payload correctly with all fields', () => {
      const portfolioId = 'test-portfolio-id';
      const createRequest: PortfolioConfigCreateRequest = {
        tradingMode: 'paper',
        signalCheckInterval: 300,
        lookbackDays: 30,
        historicalCacheEnabled: true,
        historicalCacheLookbackDays: 90,
        historicalCacheExchange: 'NSE',
        historicalCacheInstrumentType: 'EQ',
        historicalCacheCandleInterval: 'day',
        historicalCacheTtlSeconds: 3600,
        redisEnabled: true,
        redisHost: 'redis.example.com',
        redisPort: 6379,
        redisPassword: 'secret',
        redisDb: 1,
        redisKeyPrefix: 'test:',
        enableConditionalLogging: true,
        cacheDurationSeconds: 600,
        exchange: 'BSE',
        candleInterval: 'minute',
        entryBbLower: true,
        entryRsiThreshold: 25,
        entryMacdTurnPositive: true,
        entryVolumeAboveAvg: true,
        entryFallbackSmaPeriod: 50,
        entryFallbackAtrMultiplier: 3.0,
        exitTakeProfitPct: 8.0,
        exitStopLossAtrMult: 1.5,
        exitAllowTpExitsOnly: true,
        customJson: { key: 'value' }
      };

      service.createConfig(portfolioId, createRequest).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/portfolio/${portfolioId}/config`);
      expect(req.request.body).toEqual(createRequest);
      expect(req.request.body.tradingMode).toBe('paper');
      expect(req.request.body.redisPassword).toBe('secret');
      expect(req.request.body.customJson).toEqual({ key: 'value' });
      req.flush({} as PortfolioConfig);
    });

    it('should format PUT request payload correctly with partial fields', () => {
      const portfolioId = 'test-portfolio-id';
      const updateRequest: PortfolioConfigUpdateRequest = {
        tradingMode: 'live',
        signalCheckInterval: 600,
        lookbackDays: 60,
        exitTakeProfitPct: 12.0
      };

      service.updateConfig(portfolioId, updateRequest).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/portfolio/${portfolioId}/config`);
      expect(req.request.body).toEqual(updateRequest);
      expect(Object.keys(req.request.body).length).toBe(4);
      req.flush({} as PortfolioConfig);
    });
  });
});
