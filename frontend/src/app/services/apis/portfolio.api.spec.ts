import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PortfolioApiService } from './portfolio.api';
import { AuthService } from '../security/auth.service';
import { environment } from '../../../environments/environment';
import * as fc from 'fast-check';
import { PortfolioDto, PortfolioUpdateRequest } from '../entities/portfolio.entities';

describe('PortfolioApiService', () => {
  let service: PortfolioApiService;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getToken']);
    authSpy.getToken.and.returnValue('mock-token');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PortfolioApiService,
        { provide: AuthService, useValue: authSpy }
      ]
    });

    service = TestBed.inject(PortfolioApiService);
    httpMock = TestBed.inject(HttpTestingController);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  // **Feature: portfolio-dashboard-refactor, Property 13: Save configuration API call**
  // **Validates: Requirements 5.2**
  describe('Property 13: Save configuration API call', () => {
    it('should send PUT request to correct endpoint with portfolio data for any portfolio update', (done) => {
      // Property: For any portfolio update via Save Configuration, 
      // a PUT request should be sent to /api/portfolio/{id} with the updated portfolio data

      const portfolioIdArbitrary = fc.uuid();
      const portfolioUpdateArbitrary = fc.record({
        name: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
        description: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
        baseCurrency: fc.option(fc.constantFrom('USD', 'EUR', 'INR', 'GBP'), { nil: undefined }),
        inceptionDate: fc.option(fc.date().map(d => d.toISOString()), { nil: undefined }),
        riskProfile: fc.option(fc.constantFrom('CONSERVATIVE', 'MODERATE', 'AGGRESSIVE'), { nil: undefined }),
        isActive: fc.option(fc.boolean(), { nil: undefined })
      });

      fc.assert(
        fc.asyncProperty(portfolioIdArbitrary, portfolioUpdateArbitrary, async (portfolioId, updateRequest) => {
          // Arrange
          const mockResponse: PortfolioDto = {
            id: portfolioId,
            name: updateRequest.name || 'Test Portfolio',
            description: updateRequest.description || 'Test Description',
            baseCurrency: updateRequest.baseCurrency,
            inceptionDate: updateRequest.inceptionDate || new Date().toISOString(),
            riskProfile: updateRequest.riskProfile || 'MODERATE',
            isActive: updateRequest.isActive !== undefined ? updateRequest.isActive : true
          };

          // Act
          service.updatePortfolio(portfolioId, updateRequest).subscribe(response => {
            // Assert - response should match mock
            expect(response).toEqual(mockResponse);
          });

          // Assert - HTTP request should be made correctly
          const req = httpMock.expectOne(`${environment.apiUrl}/portfolio/${portfolioId}`);
          expect(req.request.method).toBe('PUT');
          expect(req.request.body).toEqual(updateRequest);
          expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');

          req.flush(mockResponse);
        }),
        { numRuns: 100 }
      ).then(() => done()).catch(error => done.fail(error));
    });
  });

  // **Feature: portfolio-dashboard-refactor, Property 21: Create portfolio API call**
  // **Validates: Requirements 8.3**
  describe('Property 21: Create portfolio API call', () => {
    it('should send POST request to correct endpoint with portfolio data for any new portfolio creation', (done) => {
      // Property: For any new portfolio creation, 
      // a POST request should be sent to /api/portfolio with the portfolio data

      const portfolioCreateArbitrary = fc.record({
        userId: fc.option(fc.uuid(), { nil: undefined }),
        name: fc.string({ minLength: 1, maxLength: 100 }),
        description: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
        baseCurrency: fc.option(fc.constantFrom('USD', 'EUR', 'INR', 'GBP'), { nil: undefined }),
        inceptionDate: fc.option(fc.date().map(d => d.toISOString()), { nil: undefined }),
        riskProfile: fc.option(fc.constantFrom('CONSERVATIVE', 'MODERATE', 'AGGRESSIVE'), { nil: undefined }),
        isActive: fc.option(fc.boolean(), { nil: undefined }),
        symbols: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 10 }), { maxLength: 10 }), { nil: undefined })
      });

      fc.assert(
        fc.asyncProperty(portfolioCreateArbitrary, async (createRequest) => {
          // Arrange
          const mockResponse: PortfolioDto = {
            id: fc.sample(fc.uuid(), 1)[0],
            name: createRequest.name,
            description: createRequest.description || '',
            baseCurrency: createRequest.baseCurrency,
            inceptionDate: createRequest.inceptionDate || new Date().toISOString(),
            riskProfile: createRequest.riskProfile || 'MODERATE',
            isActive: createRequest.isActive !== undefined ? createRequest.isActive : true
          };

          // Act
          service.createPortfolio(createRequest).subscribe(response => {
            // Assert - response should have an ID and match the request data
            expect(response.id).toBeDefined();
            expect(response.name).toBe(createRequest.name);
          });

          // Assert - HTTP request should be made correctly
          const req = httpMock.expectOne(`${environment.apiUrl}/portfolio`);
          expect(req.request.method).toBe('POST');
          expect(req.request.body).toEqual(createRequest);
          expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');

          req.flush(mockResponse);
        }),
        { numRuns: 100 }
      ).then(() => done()).catch(error => done.fail(error));
    });
  });
});
