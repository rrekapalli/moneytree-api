# Implementation Plan

- [ ] 1. Set up multi-module Maven project structure
  - Create parent POM (moneytree) with multi-module configuration
  - Create shared library module skeleton with basic POM
  - Create backend module with dependency on shared library
  - Configure version management and dependency management in parent POM
  - Run `mvn clean install` to verify multi-module build works without errors
  - Fix any build errors or warnings before proceeding
  - Commit to git with message: "feat: set up multi-module Maven structure"
  - _Requirements: 1.1, 2.1, 2.3, 2.4_

- [ ] 2. Migrate entity classes to shared library
- [ ] 2.1 Create entity package structure in shared library
  - Create `com.moneytree.shared.entity.portfolio` package
  - Create `com.moneytree.shared.entity.screener` package
  - Create `com.moneytree.shared.entity.user` package
  - Create `com.moneytree.shared.entity.signal` package
  - Create `com.moneytree.shared.entity.backtest` package
  - Create `com.moneytree.shared.entity.marketdata` package
  - Create `com.moneytree.shared.entity.common` package for base entities
  - _Requirements: 1.1_

- [ ] 2.2 Move portfolio entities to shared library
  - Move Portfolio, PortfolioHolding, PortfolioTrade entities
  - Move OpenPosition, PendingOrder entities
  - Move PortfolioCashFlow, PortfolioValuationDaily entities
  - Move PortfolioMetricsDaily, PortfolioStockMetricsDaily entities
  - Move PortfolioHoldingValuationDaily, PortfolioTradeLog entities
  - Move PortfolioTransaction entity
  - Verify all JPA annotations are preserved
  - Update package declarations
  - _Requirements: 1.2_

- [ ] 2.3 Move screener entities to shared library
  - Move Screener, ScreenerVersion, ScreenerRun entities
  - Move ScreenerResult, ScreenerAlert entities
  - Move ScreenerFunction, ScreenerFunctionParam entities
  - Move ScreenerParamset, ScreenerSchedule entities
  - Move ScreenerSavedView, ScreenerStar entities
  - Move ScreenerAlertDeliveryChannel entity
  - Verify all relationships are intact
  - _Requirements: 1.2_

- [ ] 2.4 Move user, signal, and backtest entities to shared library
  - Move User entity
  - Move Signal entity
  - Move BacktestRun, BacktestTrade entities
  - Verify all entities compile successfully
  - _Requirements: 1.2_

- [ ] 2.5 Move marketdata entities to shared library
  - Move StockTick, Index entities
  - Move any other market data related entities
  - Verify all entities are properly migrated
  - _Requirements: 1.2_

- [ ] 2.6 Write property test for entity annotation preservation
  - **Property 1: JPA Annotation Preservation**
  - **Validates: Requirements 1.2**

- [ ] 2.7 Build verification and git commit for entity migration
  - Run `mvn clean compile` to verify no compilation errors
  - Run `mvn test-compile` to verify test compilation
  - Fix any compilation errors or warnings
  - Commit to git with message: "refactor: migrate entities to shared library"
  - _Requirements: 1.2, 4.1_

- [ ] 3. Migrate repository interfaces to shared library
- [ ] 3.1 Create repository package structure in shared library
  - Create `com.moneytree.shared.repository.portfolio` package
  - Create `com.moneytree.shared.repository.screener` package
  - Create `com.moneytree.shared.repository.user` package
  - Create `com.moneytree.shared.repository.signal` package
  - Create `com.moneytree.shared.repository.backtest` package
  - Create `com.moneytree.shared.repository.marketdata` package
  - _Requirements: 1.1_

- [ ] 3.2 Move portfolio repositories to shared library
  - Move PortfolioRepository, PortfolioHoldingRepository
  - Move PortfolioTradeRepository, OpenPositionRepository
  - Move PendingOrderRepository, PortfolioCashFlowRepository
  - Move PortfolioValuationDailyRepository, PortfolioMetricsDailyRepository
  - Move PortfolioStockMetricsDailyRepository, PortfolioHoldingValuationDailyRepository
  - Move PortfolioTradeLogRepository, PortfolioTransactionRepository
  - Move PortfolioHoldingSummaryRepository
  - Verify all custom query methods are preserved
  - _Requirements: 1.4_

- [ ] 3.3 Move screener repositories to shared library
  - Move ScreenerRepository, ScreenerVersionRepository
  - Move ScreenerRunRepository, ScreenerResultRepository
  - Move ScreenerAlertRepository, ScreenerAlertDeliveryChannelRepository
  - Move ScreenerFunctionRepository, ScreenerFunctionParamRepository
  - Move ScreenerParamsetRepository, ScreenerScheduleRepository
  - Move ScreenerSavedViewRepository, ScreenerStarRepository
  - Verify all repositories compile
  - _Requirements: 1.4_

- [ ] 3.4 Move other repositories to shared library
  - Move UserRepository
  - Move SignalRepository
  - Move BacktestRunRepository, BacktestTradeRepository
  - Move any marketdata repositories
  - Verify all repositories are functional
  - _Requirements: 1.4_

- [ ] 3.5 Write property test for repository method retention
  - **Property 3: Repository Method Retention**
  - **Validates: Requirements 1.4**

- [ ] 3.6 Build verification and git commit for repository migration
  - Run `mvn clean compile` to verify no compilation errors
  - Fix any import errors or missing dependencies
  - Commit to git with message: "refactor: migrate repositories to shared library"
  - _Requirements: 1.4, 4.1_

- [ ] 4. Migrate DTO classes to shared library
- [ ] 4.1 Create DTO package structure in shared library
  - Create `com.moneytree.shared.dto.portfolio` package
  - Create `com.moneytree.shared.dto.screener` package
  - Create `com.moneytree.shared.dto.common` package
  - Create `com.moneytree.shared.dto.marketdata` package
  - _Requirements: 1.1_

- [ ] 4.2 Move portfolio DTOs to shared library
  - Identify all DTOs in `com.moneytree.api.dto` related to portfolio
  - Move portfolio-related DTOs to shared library
  - Update package declarations
  - Verify validation annotations are preserved
  - _Requirements: 1.3_

- [ ] 4.3 Move screener and other DTOs to shared library
  - Move screener-related DTOs
  - Move common DTOs (PagedResponse, etc.)
  - Move marketdata DTOs
  - Verify all DTOs compile successfully
  - _Requirements: 1.3_

- [ ] 4.4 Write property test for DTO field mapping completeness
  - **Property 2: DTO Field Mapping Completeness**
  - **Validates: Requirements 1.3**

- [ ] 4.5 Build verification and git commit for DTO and mapper migration
  - Run `mvn clean compile` to verify no compilation errors
  - Fix any import errors or validation annotation issues
  - Commit to git with message: "refactor: migrate DTOs and mappers to shared library"
  - _Requirements: 1.3, 4.1_

- [ ] 5. Migrate mapper classes to shared library
- [ ] 5.1 Create mapper package structure in shared library
  - Create `com.moneytree.shared.mapper.portfolio` package
  - Create `com.moneytree.shared.mapper.screener` package
  - Create `com.moneytree.shared.mapper.common` package
  - _Requirements: 1.1_

- [ ] 5.2 Move mapper classes to shared library
  - Move PortfolioMapper and related mappers
  - Move any other mapper classes
  - Update imports in mapper classes
  - Verify mappers compile and work correctly
  - _Requirements: 1.3_

- [ ] 6. Migrate service classes to shared library
- [ ] 6.1 Create service package structure in shared library
  - Create `com.moneytree.shared.service.portfolio` package
  - Create `com.moneytree.shared.service.screener` package
  - Create `com.moneytree.shared.service.user` package
  - Create `com.moneytree.shared.service.signal` package
  - Create `com.moneytree.shared.service.backtest` package
  - Create `com.moneytree.shared.service.common` package
  - _Requirements: 1.1_

- [ ] 6.2 Analyze service dependencies
  - Identify which services are truly shared (used by multiple modules)
  - Identify which services are application-specific
  - Document the classification for each service
  - _Requirements: 3.1, 3.2_

- [ ] 6.3 Move shared services to shared library
  - Move PortfolioService, PortfolioHoldingService
  - Move PortfolioTradeService, OpenPositionService
  - Move PendingOrderService, PortfolioCashFlowService
  - Move PortfolioValuationDailyService, PortfolioMetricsDailyService
  - Move PortfolioStockMetricsDailyService, PortfolioHoldingValuationDailyService
  - Move PortfolioTradeLogService, PortfolioTransactionService
  - Move ScreenerService and related services
  - Move UserService, SignalService, BacktestService
  - Verify dependency injection works correctly
  - _Requirements: 1.5_

- [ ] 6.4 Write property test for service dependency injection integrity
  - **Property 4: Service Dependency Injection Integrity**
  - **Validates: Requirements 1.5**

- [ ] 6.5 Build verification and git commit for service migration
  - Run `mvn clean compile` to verify no compilation errors
  - Fix any dependency injection issues
  - Commit to git with message: "refactor: migrate services to shared library"
  - _Requirements: 1.5, 4.1_

- [ ] 7. Migrate connectivity components to shared library
- [ ] 7.1 Create connectivity package structure in shared library
  - Create `com.moneytree.shared.connectivity.kite` package
  - Create `com.moneytree.shared.connectivity.nse` package
  - Create `com.moneytree.shared.connectivity.common` package
  - Create `com.moneytree.shared.connectivity.kite.dto` package
  - _Requirements: 1.1_

- [ ] 7.2 Move Kite connectivity components to shared library
  - Move KiteConnectClient and related classes
  - Move KiteAuthService, KiteMarketDataService
  - Move Kite DTOs (KiteTickerData, KiteInstrument, etc.)
  - Move Kite-specific configuration classes
  - Verify all connectivity code compiles
  - _Requirements: 1.5_

- [ ] 7.3 Move NSE and other connectivity components
  - Move NSE client and services if they exist
  - Move common connectivity utilities (rate limiter, retry logic)
  - Move connectivity exception classes
  - Verify all external integrations work
  - _Requirements: 1.5_

- [ ] 7.4 Build verification and git commit for connectivity migration
  - Run `mvn clean compile` to verify no compilation errors
  - Fix any API client configuration issues
  - Commit to git with message: "refactor: migrate connectivity components to shared library"
  - _Requirements: 1.5, 4.1_

- [ ] 8. Create shared library configuration
- [ ] 8.1 Create auto-configuration class
  - Create SharedLibraryAutoConfiguration class
  - Add @EnableJpaRepositories annotation with basePackages
  - Add @EntityScan annotation with basePackages
  - Add @ComponentScan annotation with basePackages
  - _Requirements: 1.1_

- [ ] 8.2 Create spring.factories for auto-configuration
  - Create META-INF/spring.factories file
  - Register SharedLibraryAutoConfiguration
  - Verify auto-configuration is picked up by Spring Boot
  - _Requirements: 1.1_

- [ ] 8.3 Create shared exception classes
  - Create `com.moneytree.shared.exception` package
  - Create EntityNotFoundException
  - Create ValidationException
  - Create ConnectivityException
  - Create other common exceptions
  - _Requirements: 1.1_

- [ ] 8.4 Build verification and git commit for shared library configuration
  - Run `mvn clean install` on shared library module
  - Verify JAR artifact is created successfully
  - Fix any auto-configuration issues
  - Commit to git with message: "feat: configure shared library auto-configuration and exceptions"
  - _Requirements: 1.1, 2.1, 4.1_

- [ ] 9. Update backend module to use shared library
- [ ] 9.1 Update backend POM to depend on shared library
  - Add dependency on shared library module
  - Remove redundant dependencies now provided by shared library
  - Verify dependency resolution works
  - _Requirements: 2.2_

- [ ] 9.2 Update imports in controller classes
  - Update imports in all controller classes to use shared library packages
  - Verify controllers compile successfully
  - Test that dependency injection still works
  - _Requirements: 4.1_

- [ ] 9.3 Update backend configuration
  - Remove entity scanning configuration (now in shared library)
  - Remove repository configuration (now in shared library)
  - Keep application-specific configuration (OpenAPI, Cache, etc.)
  - Verify application starts successfully
  - _Requirements: 4.2_

- [ ] 9.4 Write property test for Spring context initialization
  - **Property 12: Spring Context Initialization**
  - **Validates: Requirements 4.2**

- [ ] 9.5 Build verification and application startup test
  - Run `mvn clean install` on entire project
  - Start the backend application with `mvn spring-boot:run`
  - Verify application starts without errors
  - Check logs for any warnings or configuration issues
  - Test a few API endpoints to ensure they work
  - Stop the application
  - Fix any startup or runtime errors
  - Commit to git with message: "refactor: integrate shared library into backend module"
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 10. Update database configuration
- [ ] 10.1 Externalize database configuration
  - Ensure database properties are in application.yaml
  - Verify connection properties can be overridden via environment variables
  - Test with different database configurations
  - _Requirements: 6.1, 6.2_

- [ ] 10.2 Configure entity scanning from shared library
  - Verify @EntityScan includes shared library packages
  - Test that all entities are discovered
  - Verify JPA mappings work correctly
  - _Requirements: 6.3_

- [ ] 10.3 Configure transaction management
  - Verify @Transactional annotations work in shared services
  - Test transaction boundaries
  - Verify rollback behavior
  - _Requirements: 6.4_

- [ ] 10.4 Write property test for database configuration flexibility
  - **Property 15: Database Configuration Flexibility**
  - **Validates: Requirements 6.1, 6.2**

- [ ] 10.5 Write property test for entity scanning
  - **Property 16: Entity Scanning from Shared Library**
  - **Validates: Requirements 6.3**

- [ ] 10.6 Build verification and database connectivity test
  - Run `mvn clean test` to verify database tests pass
  - Test database connection with different configurations
  - Verify entity scanning works correctly
  - Fix any JPA or database configuration issues
  - Commit to git with message: "feat: configure database and transaction management"
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 11. Verify no circular dependencies
- [ ] 11.1 Analyze module dependencies
  - Use Maven dependency plugin to analyze dependencies
  - Verify shared library has no dependency on backend module
  - Verify backend module depends only on shared library
  - Document dependency graph
  - _Requirements: 3.4_

- [ ] 11.2 Write property test for acyclic dependency graph
  - **Property 10: Acyclic Dependency Graph**
  - **Validates: Requirements 3.4**

- [ ] 12. Verify package naming conventions
- [ ] 12.1 Audit package structure
  - Verify all shared library packages follow `com.moneytree.shared.*` pattern
  - Verify backend packages follow `com.moneytree.*` pattern
  - Ensure no shared components are in backend packages
  - Ensure no backend-specific components are in shared library
  - _Requirements: 3.5_

- [ ] 12.2 Write property test for package naming convention
  - **Property 11: Package Naming Convention**
  - **Validates: Requirements 3.5**

- [ ] 12.3 Build verification for architectural compliance
  - Run `mvn clean compile` to verify clean build
  - Run dependency analysis to verify no circular dependencies
  - Verify package structure follows conventions
  - Fix any architectural violations
  - Commit to git with message: "refactor: ensure clean architecture and naming conventions"
  - _Requirements: 3.4, 3.5_

- [ ] 13. Write unit tests for shared library
- [ ] 13.1 Write repository tests
  - Create test configuration with H2 database
  - Write tests for portfolio repositories
  - Write tests for screener repositories
  - Write tests for other repositories
  - Use @DataJpaTest annotation
  - _Requirements: 7.1, 7.3_

- [ ] 13.2 Write service tests
  - Write tests for portfolio services
  - Write tests for screener services
  - Write tests for other services
  - Mock repository dependencies
  - Use @ExtendWith(MockitoExtension.class)
  - _Requirements: 7.2, 7.3_

- [ ] 13.3 Write mapper tests
  - Write tests for entity-to-DTO mapping
  - Write tests for DTO-to-entity mapping
  - Test null handling
  - Test nested object mapping
  - _Requirements: 7.2_

- [ ] 13.4 Create test fixtures and builders
  - Create entity builders for test data
  - Create DTO builders for test data
  - Create test data factories
  - _Requirements: 7.4_

- [ ] 13.5 Write property test for test independence
  - **Property 19: Test Independence**
  - **Validates: Requirements 7.5**

- [ ] 13.6 Build verification for unit tests
  - Run `mvn clean test` on shared library module
  - Verify all unit tests pass
  - Check test coverage reports
  - Fix any failing tests
  - Commit to git with message: "test: add unit tests for shared library components"
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 14. Write integration tests
- [ ] 14.1 Set up Testcontainers for PostgreSQL
  - Add Testcontainers dependency
  - Create test configuration with PostgreSQL container
  - Verify tests can run against real database
  - _Requirements: 4.4_

- [ ] 14.2 Write full application startup test
  - Create integration test that starts the application
  - Verify all beans are created
  - Verify database connection works
  - Verify all endpoints are registered
  - _Requirements: 4.2_

- [ ] 14.3 Write end-to-end API tests
  - Test portfolio CRUD operations
  - Test screener operations
  - Test data persistence
  - Verify responses match expected format
  - _Requirements: 4.3_

- [ ] 14.4 Write property test for API response equivalence
  - **Property 13: API Response Equivalence**
  - **Validates: Requirements 4.3**

- [ ] 14.5 Write property test for database operation correctness
  - **Property 14: Database Operation Correctness**
  - **Validates: Requirements 4.4**

- [ ] 14.6 Build verification for integration tests
  - Run `mvn clean verify` to run all integration tests
  - Verify Testcontainers tests pass
  - Verify end-to-end API tests pass
  - Fix any integration test failures
  - Commit to git with message: "test: add integration tests with Testcontainers"
  - _Requirements: 4.2, 4.3, 4.4_

- [ ] 15. Run regression tests
- [ ] 15.1 Compile the application
  - Run `mvn clean compile` on all modules
  - Verify no compilation errors
  - _Requirements: 4.1_

- [ ] 15.2 Run all existing tests
  - Run `mvn test` on all modules
  - Verify all tests pass
  - Fix any failing tests
  - _Requirements: 4.5_

- [ ] 15.3 Manual testing of key workflows
  - Test portfolio creation and management
  - Test screener execution
  - Test market data retrieval
  - Verify all features work as before
  - _Requirements: 4.3_

- [ ] 15.4 Build verification for regression tests
  - Run `mvn clean install` on entire project
  - Verify all tests pass (unit + integration)
  - Verify no compilation warnings
  - Check application logs for any errors
  - Fix any regression issues
  - Commit to git with message: "test: verify all regression tests pass"
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 16. Create documentation
- [ ] 16.1 Create shared library README
  - Document purpose and structure of shared library
  - Explain package organization
  - List all major components
  - _Requirements: 5.1, 5.3_

- [ ] 16.2 Write integration guide
  - Provide step-by-step instructions for adding shared library as dependency
  - Show example POM configuration
  - Explain configuration requirements
  - _Requirements: 5.2_

- [ ] 16.3 Create usage examples
  - Show how to use shared entities in a new module
  - Show how to use shared repositories
  - Show how to use shared services
  - Show how to use connectivity components
  - _Requirements: 5.4_

- [ ] 16.4 Write migration guidelines
  - Explain how to identify components for shared library
  - Provide checklist for moving components
  - Document common pitfalls and solutions
  - _Requirements: 5.5_

- [ ] 16.5 Commit documentation
  - Review all documentation for completeness
  - Verify examples compile and work
  - Commit to git with message: "docs: add comprehensive shared library documentation"
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 17. Set up build and deployment
- [ ] 17.1 Configure independent build for shared library
  - Verify shared library can be built independently
  - Test `mvn clean install` on shared library module only
  - _Requirements: 8.1_

- [ ] 17.2 Implement semantic versioning
  - Set initial version to 1.0.0
  - Document versioning strategy
  - Create CHANGELOG.md
  - _Requirements: 8.2_

- [ ] 17.3 Set up Maven repository
  - Configure local Maven repository for development
  - Set up Nexus or Artifactory if available
  - Configure deployment in POM
  - _Requirements: 8.4_

- [ ] 17.4 Create CI/CD pipeline
  - Create GitHub Actions or Jenkins pipeline
  - Automate building shared library
  - Automate running tests
  - Automate publishing to Maven repository
  - _Requirements: 8.5_

- [ ] 17.5 Create release process
  - Document how to create a release
  - Set up git tagging for releases
  - Automate version bumping
  - _Requirements: 8.3_

- [ ] 17.6 Build verification for CI/CD pipeline
  - Run CI/CD pipeline end-to-end
  - Verify shared library is built and published
  - Verify backend module can use published artifact
  - Fix any pipeline issues
  - Commit to git with message: "ci: configure build and deployment pipeline"
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 18. Final validation and cleanup
- [ ] 18.1 Verify all requirements are met
  - Review requirements document
  - Verify each requirement has been implemented
  - Test all acceptance criteria
  - _Requirements: All_

- [ ] 18.2 Code cleanup
  - Remove unused imports
  - Remove commented-out code
  - Format code consistently
  - Run static analysis tools
  - _Requirements: All_

- [ ] 18.3 Performance testing
  - Measure application startup time
  - Compare with pre-refactoring baseline
  - Verify no performance degradation
  - _Requirements: 4.2_

- [ ] 18.4 Security audit
  - Review dependencies for vulnerabilities
  - Run Maven dependency-check plugin
  - Update any vulnerable dependencies
  - _Requirements: All_

- [ ] 18.5 Final build verification and git commit
  - Run `mvn clean install` on entire project
  - Verify zero compilation errors
  - Verify zero test failures
  - Verify zero warnings
  - Start application and verify it runs correctly
  - Test key API endpoints
  - Commit to git with message: "refactor: complete shared library extraction - all tests passing"
  - Create git tag: "v1.0.0-shared-library"
  - _Requirements: All_

- [ ] 19. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
