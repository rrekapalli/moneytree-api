import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { InstrumentFilterService } from './instrument-filter.api';
import { ApiService } from './api.base';
import { AuthService } from '../security/auth.service';
import { Router } from '@angular/router';
import { InstrumentDto, InstrumentFilter } from '../entities/instrument-filter';

describe('InstrumentFilterService', () => {
  let service: InstrumentFilterService;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getToken', 'logout']);
    authSpy.getToken.and.returnValue('mock-token');
    
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        InstrumentFilterService,
        ApiService,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpyObj }
      ]
    });

    service = TestBed.inject(InstrumentFilterService);
    httpMock = TestBed.inject(HttpTestingController);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getDistinctExchanges', () => {
    it('should call correct endpoint', (done) => {
      const mockExchanges = ['NSE', 'BSE', 'MCX'];

      service.getDistinctExchanges().subscribe(exchanges => {
        expect(exchanges).toEqual(mockExchanges);
        done();
      });

      const req = httpMock.expectOne('/api/v1/instruments/filters/exchanges');
      expect(req.request.method).toBe('GET');
      req.flush(mockExchanges);
    });

    it('should retry on network error', (done) => {
      const mockExchanges = ['NSE', 'BSE'];
      let attemptCount = 0;

      service.getDistinctExchanges().subscribe({
        next: exchanges => {
          expect(exchanges).toEqual(mockExchanges);
          expect(attemptCount).toBe(2); // Initial attempt + 1 retry
          done();
        },
        error: () => done.fail('Should not error after successful retry')
      });

      // First attempt fails
      const req1 = httpMock.expectOne('/api/v1/instruments/filters/exchanges');
      attemptCount++;
      req1.error(new ProgressEvent('error'));

      // Second attempt (retry) succeeds
      const req2 = httpMock.expectOne('/api/v1/instruments/filters/exchanges');
      attemptCount++;
      req2.flush(mockExchanges);
    });

    it('should handle error with catchError after retries exhausted', (done) => {
      service.getDistinctExchanges().subscribe({
        next: () => done.fail('Should not succeed'),
        error: error => {
          expect(error).toBeDefined();
          done();
        }
      });

      // Initial attempt fails
      const req1 = httpMock.expectOne('/api/v1/instruments/filters/exchanges');
      req1.error(new ProgressEvent('error'));

      // First retry fails
      const req2 = httpMock.expectOne('/api/v1/instruments/filters/exchanges');
      req2.error(new ProgressEvent('error'));

      // Second retry fails
      const req3 = httpMock.expectOne('/api/v1/instruments/filters/exchanges');
      req3.error(new ProgressEvent('error'));
    });
  });

  describe('getDistinctIndices', () => {
    it('should call correct endpoint', (done) => {
      const mockIndices = ['NIFTY 50', 'NIFTY BANK', 'NIFTY IT'];

      service.getDistinctIndices().subscribe(indices => {
        expect(indices).toEqual(mockIndices);
        done();
      });

      const req = httpMock.expectOne('/api/v1/instruments/filters/indices');
      expect(req.request.method).toBe('GET');
      req.flush(mockIndices);
    });

    it('should retry on network error', (done) => {
      const mockIndices = ['NIFTY 50'];
      let attemptCount = 0;

      service.getDistinctIndices().subscribe({
        next: indices => {
          expect(indices).toEqual(mockIndices);
          expect(attemptCount).toBe(2);
          done();
        },
        error: () => done.fail('Should not error after successful retry')
      });

      const req1 = httpMock.expectOne('/api/v1/instruments/filters/indices');
      attemptCount++;
      req1.error(new ProgressEvent('error'));

      const req2 = httpMock.expectOne('/api/v1/instruments/filters/indices');
      attemptCount++;
      req2.flush(mockIndices);
    });
  });

  describe('getDistinctSegments', () => {
    it('should call correct endpoint', (done) => {
      const mockSegments = ['EQ', 'FO', 'INDICES'];

      service.getDistinctSegments().subscribe(segments => {
        expect(segments).toEqual(mockSegments);
        done();
      });

      const req = httpMock.expectOne('/api/v1/instruments/filters/segments');
      expect(req.request.method).toBe('GET');
      req.flush(mockSegments);
    });

    it('should retry on network error', (done) => {
      const mockSegments = ['EQ'];
      let attemptCount = 0;

      service.getDistinctSegments().subscribe({
        next: segments => {
          expect(segments).toEqual(mockSegments);
          expect(attemptCount).toBe(2);
          done();
        },
        error: () => done.fail('Should not error after successful retry')
      });

      const req1 = httpMock.expectOne('/api/v1/instruments/filters/segments');
      attemptCount++;
      req1.error(new ProgressEvent('error'));

      const req2 = httpMock.expectOne('/api/v1/instruments/filters/segments');
      attemptCount++;
      req2.flush(mockSegments);
    });
  });

  describe('getFilteredInstruments', () => {
    it('should call correct endpoint with no parameters', (done) => {
      const mockInstruments: InstrumentDto[] = [
        {
          instrumentToken: '123',
          tradingsymbol: 'RELIANCE',
          name: 'Reliance Industries',
          segment: 'EQ',
          exchange: 'NSE',
          instrumentType: 'EQ',
          lastPrice: 2500.50,
          lotSize: 1,
          tickSize: 0.05
        }
      ];

      const filter: InstrumentFilter = {};

      service.getFilteredInstruments(filter).subscribe(instruments => {
        expect(instruments).toEqual(mockInstruments);
        done();
      });

      const req = httpMock.expectOne('/api/v1/instruments/filtered');
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(mockInstruments);
    });

    it('should build correct query parameters with exchange only', (done) => {
      const mockInstruments: InstrumentDto[] = [];
      const filter: InstrumentFilter = { exchange: 'NSE' };

      service.getFilteredInstruments(filter).subscribe(instruments => {
        expect(instruments).toEqual(mockInstruments);
        done();
      });

      const req = httpMock.expectOne(req => 
        req.url === '/api/v1/instruments/filtered' && 
        req.params.get('exchange') === 'NSE'
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('exchange')).toBe('NSE');
      expect(req.request.params.has('index')).toBe(false);
      expect(req.request.params.has('segment')).toBe(false);
      req.flush(mockInstruments);
    });

    it('should build correct query parameters with all filters', (done) => {
      const mockInstruments: InstrumentDto[] = [];
      const filter: InstrumentFilter = {
        exchange: 'NSE',
        index: 'NIFTY 50',
        segment: 'EQ'
      };

      service.getFilteredInstruments(filter).subscribe(instruments => {
        expect(instruments).toEqual(mockInstruments);
        done();
      });

      const req = httpMock.expectOne(req => 
        req.url === '/api/v1/instruments/filtered' &&
        req.params.get('exchange') === 'NSE' &&
        req.params.get('index') === 'NIFTY 50' &&
        req.params.get('segment') === 'EQ'
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('exchange')).toBe('NSE');
      expect(req.request.params.get('index')).toBe('NIFTY 50');
      expect(req.request.params.get('segment')).toBe('EQ');
      req.flush(mockInstruments);
    });

    it('should build correct query parameters with index and segment only', (done) => {
      const mockInstruments: InstrumentDto[] = [];
      const filter: InstrumentFilter = {
        index: 'NIFTY BANK',
        segment: 'FO'
      };

      service.getFilteredInstruments(filter).subscribe(instruments => {
        expect(instruments).toEqual(mockInstruments);
        done();
      });

      const req = httpMock.expectOne(req => 
        req.url === '/api/v1/instruments/filtered' &&
        req.params.get('index') === 'NIFTY BANK' &&
        req.params.get('segment') === 'FO'
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.has('exchange')).toBe(false);
      expect(req.request.params.get('index')).toBe('NIFTY BANK');
      expect(req.request.params.get('segment')).toBe('FO');
      req.flush(mockInstruments);
    });

    it('should retry on network error', (done) => {
      const mockInstruments: InstrumentDto[] = [];
      const filter: InstrumentFilter = { exchange: 'NSE' };
      let attemptCount = 0;

      service.getFilteredInstruments(filter).subscribe({
        next: instruments => {
          expect(instruments).toEqual(mockInstruments);
          expect(attemptCount).toBe(2);
          done();
        },
        error: () => done.fail('Should not error after successful retry')
      });

      const req1 = httpMock.expectOne(req => req.url === '/api/v1/instruments/filtered');
      attemptCount++;
      req1.error(new ProgressEvent('error'));

      const req2 = httpMock.expectOne(req => req.url === '/api/v1/instruments/filtered');
      attemptCount++;
      req2.flush(mockInstruments);
    });

    it('should handle error with catchError after retries exhausted', (done) => {
      const filter: InstrumentFilter = { exchange: 'NSE' };

      service.getFilteredInstruments(filter).subscribe({
        next: () => done.fail('Should not succeed'),
        error: error => {
          expect(error).toBeDefined();
          done();
        }
      });

      // Initial attempt fails
      const req1 = httpMock.expectOne(req => req.url === '/api/v1/instruments/filtered');
      req1.error(new ProgressEvent('error'));

      // First retry fails
      const req2 = httpMock.expectOne(req => req.url === '/api/v1/instruments/filtered');
      req2.error(new ProgressEvent('error'));

      // Second retry fails
      const req3 = httpMock.expectOne(req => req.url === '/api/v1/instruments/filtered');
      req3.error(new ProgressEvent('error'));
    });
  });
});
