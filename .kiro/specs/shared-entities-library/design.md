# Design Document

## Overview

This design outlines the refactoring of the MoneyTree backend from a single monolithic structure into a multi-module Maven project with a shared library module. The shared library (`moneytree-shared`) will contain reusable entities, DTOs, repositories, and services that can be imported as a Maven dependency by multiple modulith projects. This approach enables code reuse, maintains consistency across services, and supports the development of additional modulith applications that interact with the same database schema.

The refactoring will transform the current structure:
```
moneytree-backend/
  src/main/java/com/moneytree/
    portfolio/
    screener/
    signal/
    user/
    backtest/
    marketdata/
    connectivity/
```

Into a multi-module structure:
```
moneytree/
  shared/          (shared library)
  backend/         (main application)
  analytics/       (future modulith)
  trading/         (future modulith)
```

## Architecture

### Multi-Module Maven Structure

The project will be restructured as a Maven multi-module project with the following hierarchy:

1. **Parent POM** (`moneytree-parent`): Root project that manages versions and common configurations
2. **Shared Library Module** (`moneytree-shared`): Contains reusable data access components
3. **Application Modules**: Individual modulith applications that depend on the shared library

### Module Dependencies

```
moneytree (pom)
├── shared (jar)
│   └── No dependencies on other modules
└── backend (jar/war)
    └── depends on → shared
```

### Package Structure

#### Shared Library Module (`shared`)

```
com.moneytree.shared/
├── entity/                    # JPA entities
│   ├── portfolio/
│   │   ├── Portfolio.java
│   │   ├── PortfolioHolding.java
│   │   ├── PortfolioTrade.java
│   │   ├── OpenPosition.java
│   │   └── ...
│   ├── screener/
│   │   ├── Screener.java
│   │   ├── ScreenerRun.java
│   │   └── ...
│   ├── user/
│   │   └── User.java
│   ├── marketdata/
│   │   ├── StockTick.java
│   │   ├── Index.java
│   │   └── ...
│   └── common/
│       └── BaseEntity.java (if needed)
├── dto/                       # Data Transfer Objects
│   ├── portfolio/
│   │   ├── PortfolioDTO.java
│   │   ├── PortfolioHoldingDTO.java
│   │   └── ...
│   ├── screener/
│   │   └── ...
│   ├── marketdata/
│   │   └── ...
│   └── common/
│       └── PagedResponse.java
├── repository/                # Spring Data JPA repositories
│   ├── portfolio/
│   │   ├── PortfolioRepository.java
│   │   ├── PortfolioHoldingRepository.java
│   │   └── ...
│   ├── screener/
│   │   └── ...
│   ├── marketdata/
│   │   └── ...
│   └── user/
│       └── UserRepository.java
├── service/                   # Shared business logic services
│   ├── portfolio/
│   │   ├── PortfolioService.java
│   │   └── ...
│   └── common/
│       └── ValidationService.java
├── connectivity/              # External service integrations
│   ├── kite/
│   │   ├── KiteConnectClient.java
│   │   ├── KiteAuthService.java
│   │   ├── KiteMarketDataService.java
│   │   └── dto/
│   │       ├── KiteTickerData.java
│   │       └── ...
│   ├── nse/
│   │   ├── NSEClient.java
│   │   ├── NSEDataService.java
│   │   └── dto/
│   │       └── ...
│   └── common/
│       ├── ConnectivityException.java
│       └── RateLimiter.java
├── mapper/                    # Entity-DTO mappers
│   ├── portfolio/
│   │   └── PortfolioMapper.java
│   └── ...
├── exception/                 # Custom exceptions
│   ├── EntityNotFoundException.java
│   └── ValidationException.java
└── config/                    # Shared configurations
    ├── JpaConfig.java
    └── SharedLibraryAutoConfiguration.java
```

#### Application Module (`backend`)

```
com.moneytree/
├── api/                       # REST controllers
│   ├── PortfolioController.java
│   ├── ScreenerController.java
│   ├── MarketDataController.java
│   └── ...
├── config/                    # Application-specific config
│   ├── OpenApiConfig.java
│   ├── CacheConfig.java
│   └── EnvironmentConfig.java
├── orchestration/             # Application-specific orchestration
│   ├── TradingOrchestrator.java
│   └── AnalyticsOrchestrator.java
└── MoneytreeBackendApplication.java
```

### Component Classification

Components will be classified into three categories:

1. **Shared Components** (move to `moneytree-shared`):
   - Core entities used across multiple modules
   - Common DTOs for API responses
   - Base repositories with standard CRUD operations
   - Utility services (validation, mapping)

2. **Application-Specific Components** (keep in `backend`):
   - REST controllers
   - Application configuration
   - Module-specific business orchestration
   - Application-level caching strategies

3. **Hybrid Components** (evaluate case-by-case):
   - Services with both shared and application-specific logic
   - May need to be split or kept in application with shared interfaces

## Components and Interfaces

### Shared Library Components

#### 1. Entity Layer

**Base Entity Pattern:**
```java
package com.moneytree.shared.entity.common;

@MappedSuperclass
public abstract class BaseEntity {
    @Column(name = "created_at")
    private Instant createdAt = Instant.now();
    
    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
    
    // Getters and setters
}
```

**Domain Entities:**
- All entities from `portfolio`, `screener`, `signal`, `user`, `backtest` modules
- Maintain all JPA annotations, relationships, and constraints
- Extend `BaseEntity` where applicable for common audit fields

#### 2. Repository Layer

**Repository Interface Pattern:**
```java
package com.moneytree.shared.repository.portfolio;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, UUID> {
    List<Portfolio> findByUserId(UUID userId);
    
    @Query("SELECT p FROM Portfolio p WHERE p.userId = :userId AND p.isActive = true")
    List<Portfolio> findActivePortfoliosByUserId(@Param("userId") UUID userId);
}
```

**Repository Features:**
- Extend Spring Data JPA interfaces (JpaRepository, CrudRepository)
- Include custom query methods
- Support pagination and sorting
- Maintain all existing @Query annotations

#### 3. DTO Layer

**DTO Pattern:**
```java
package com.moneytree.shared.dto.portfolio;

public class PortfolioDTO {
    private UUID portfolioId;
    private UUID userId;
    private String name;
    private String description;
    private BigDecimal initialCapital;
    private Instant createdAt;
    
    // Constructors, getters, setters
    // Validation annotations if needed
}
```

**DTO Features:**
- Simple POJOs for data transfer
- Include validation annotations (@NotNull, @Size, etc.)
- Support for nested DTOs where needed
- Builder pattern for complex DTOs

#### 4. Service Layer

**Service Interface Pattern:**
```java
package com.moneytree.shared.service.portfolio;

public interface PortfolioService {
    Portfolio createPortfolio(Portfolio portfolio);
    Portfolio updatePortfolio(UUID portfolioId, Portfolio portfolio);
    void deletePortfolio(UUID portfolioId);
    Portfolio getPortfolioById(UUID portfolioId);
    List<Portfolio> getPortfoliosByUserId(UUID userId);
}
```

**Service Implementation:**
```java
package com.moneytree.shared.service.portfolio;

@Service
@Transactional
public class PortfolioServiceImpl implements PortfolioService {
    private final PortfolioRepository portfolioRepository;
    
    @Autowired
    public PortfolioServiceImpl(PortfolioRepository portfolioRepository) {
        this.portfolioRepository = portfolioRepository;
    }
    
    @Override
    public Portfolio createPortfolio(Portfolio portfolio) {
        // Business logic
        return portfolioRepository.save(portfolio);
    }
    
    // Other method implementations
}
```

#### 5. Connectivity Layer

**Connectivity Client Pattern:**
```java
package com.moneytree.shared.connectivity.kite;

@Service
public class KiteConnectClient {
    private final String apiKey;
    private final String apiSecret;
    private final RestTemplate restTemplate;
    
    @Autowired
    public KiteConnectClient(@Value("${kite.api.key}") String apiKey,
                             @Value("${kite.api.secret}") String apiSecret,
                             RestTemplate restTemplate) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.restTemplate = restTemplate;
    }
    
    public KiteTickerData getTickerData(String symbol) {
        // API call implementation
    }
    
    public List<KiteInstrument> getInstruments() {
        // API call implementation
    }
}
```

**Connectivity Service Pattern:**
```java
package com.moneytree.shared.connectivity.kite;

@Service
public class KiteMarketDataService {
    private final KiteConnectClient kiteClient;
    
    @Autowired
    public KiteMarketDataService(KiteConnectClient kiteClient) {
        this.kiteClient = kiteClient;
    }
    
    public MarketData fetchMarketData(String symbol) {
        KiteTickerData tickerData = kiteClient.getTickerData(symbol);
        // Transform to internal MarketData format
        return transformToMarketData(tickerData);
    }
}
```

**Connectivity Features:**
- Centralized API clients for external services (Kite, NSE, etc.)
- Rate limiting and retry logic
- Error handling and circuit breakers
- DTO models for external API responses
- Transformation logic to internal domain models
- Authentication and token management

**Benefits of Shared Connectivity:**
- Multiple modules can use the same API clients
- Consistent error handling across modules
- Centralized rate limiting prevents API quota issues
- Easier to mock for testing
- Single source of truth for external API integration

#### 6. Mapper Layer

**Mapper Pattern:**
```java
package com.moneytree.shared.mapper.portfolio;

@Component
public class PortfolioMapper {
    public PortfolioDTO toDTO(Portfolio entity) {
        if (entity == null) return null;
        
        PortfolioDTO dto = new PortfolioDTO();
        dto.setPortfolioId(entity.getPortfolioId());
        dto.setUserId(entity.getUserId());
        dto.setName(entity.getName());
        // Map other fields
        return dto;
    }
    
    public Portfolio toEntity(PortfolioDTO dto) {
        if (dto == null) return null;
        
        Portfolio entity = new Portfolio();
        entity.setPortfolioId(dto.getPortfolioId());
        entity.setUserId(dto.getUserId());
        entity.setName(dto.getName());
        // Map other fields
        return entity;
    }
}
```

### Application Module Components

#### 1. Controller Layer

Controllers remain in the application module and use the shared library:

```java
package com.moneytree.api;

@RestController
@RequestMapping("/api/portfolios")
public class PortfolioController {
    private final PortfolioService portfolioService;
    private final PortfolioMapper portfolioMapper;
    
    @Autowired
    public PortfolioController(PortfolioService portfolioService, 
                               PortfolioMapper portfolioMapper) {
        this.portfolioService = portfolioService;
        this.portfolioMapper = portfolioMapper;
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<PortfolioDTO> getPortfolio(@PathVariable UUID id) {
        Portfolio portfolio = portfolioService.getPortfolioById(id);
        return ResponseEntity.ok(portfolioMapper.toDTO(portfolio));
    }
    
    // Other endpoints
}
```

#### 2. Configuration Classes

Application-specific configurations:
- OpenAPI/Swagger configuration
- Cache configuration
- Security configuration
- External service connectivity

### Configuration Management

#### Shared Library Configuration

**Auto-Configuration Class:**
```java
package com.moneytree.shared.config;

@Configuration
@EnableJpaRepositories(basePackages = "com.moneytree.shared.repository")
@EntityScan(basePackages = "com.moneytree.shared.entity")
@ComponentScan(basePackages = "com.moneytree.shared")
public class SharedLibraryAutoConfiguration {
    // Bean definitions if needed
}
```

**spring.factories** (for Spring Boot auto-configuration):
```properties
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
com.moneytree.shared.config.SharedLibraryAutoConfiguration
```

#### Application Configuration

**application.yaml** (in moneytree-backend):
```yaml
spring:
  datasource:
    url: ${DATABASE_URL:jdbc:postgresql://localhost:5432/moneytree}
    username: ${DATABASE_USERNAME:postgres}
    password: ${DATABASE_PASSWORD:postgres}
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
    show-sql: false
```

## Data Models

### Entity Relationships

The shared library will maintain all existing entity relationships:

1. **Portfolio Domain:**
   - Portfolio (1) → (N) PortfolioHolding
   - Portfolio (1) → (N) PortfolioTrade
   - Portfolio (1) → (N) OpenPosition
   - Portfolio (1) → (N) PendingOrder
   - Portfolio (1) → (N) PortfolioCashFlow
   - Portfolio (1) → (N) PortfolioValuationDaily

2. **Screener Domain:**
   - Screener (1) → (N) ScreenerVersion
   - Screener (1) → (N) ScreenerRun
   - ScreenerRun (1) → (N) ScreenerResult
   - Screener (1) → (N) ScreenerAlert

3. **User Domain:**
   - User (1) → (N) Portfolio
   - User (1) → (N) Screener

### Database Schema

The shared library does not manage database schema directly. Schema management remains the responsibility of each application module using:
- Flyway migrations
- Liquibase changesets
- Or manual SQL scripts

The shared library only provides JPA entity mappings to existing tables.

## Correctness Properties


*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: JPA Annotation Preservation

*For any* entity class moved to the shared library, all JPA annotations (@Entity, @Table, @Column, @ManyToOne, @OneToMany, etc.) and their configurations SHALL be preserved exactly as they were in the original module.

**Validates: Requirements 1.2**

### Property 2: DTO Field Mapping Completeness

*For any* DTO class moved to the shared library, all field mappings and validation annotations SHALL be maintained, ensuring no data fields or constraints are lost during migration.

**Validates: Requirements 1.3**

### Property 3: Repository Method Retention

*For any* repository interface moved to the shared library, all custom query methods, method signatures, and Spring Data JPA annotations SHALL be retained without modification.

**Validates: Requirements 1.4**

### Property 4: Service Dependency Injection Integrity

*For any* service class moved to the shared library, all dependency injection configurations (@Autowired, constructor injection) and business logic SHALL remain functional and unchanged.

**Validates: Requirements 1.5**

### Property 5: Maven Dependency Resolution

*For any* modulith project that declares the shared library as a dependency, Maven SHALL successfully resolve all transitive dependencies and make all shared library classes available on the classpath.

**Validates: Requirements 2.2**

### Property 6: Version Consistency

*For all* modules in the multi-module project, version numbers SHALL follow the semantic versioning pattern (MAJOR.MINOR.PATCH) consistently.

**Validates: Requirements 2.4**

### Property 7: Dependency Upgrade Compatibility

*For any* dependent module, upgrading the shared library version SHALL be achievable by updating only the version number in the POM file, without requiring code changes.

**Validates: Requirements 2.5**

### Property 8: Shared Component Placement

*For any* entity, DTO, repository, or service in the shared library, it SHALL be referenced or used by at least two different application modules, confirming it is truly shared.

**Validates: Requirements 3.1**

### Property 9: Module-Specific Component Isolation

*For any* entity, DTO, repository, or service that is used by only one application module, it SHALL remain in that module's package and NOT be placed in the shared library.

**Validates: Requirements 3.2**

### Property 10: Acyclic Dependency Graph

*For the* complete module dependency graph, there SHALL be no circular dependencies between the shared library and any application module, ensuring a clean dependency hierarchy.

**Validates: Requirements 3.4**

### Property 11: Package Naming Convention

*For all* packages in the shared library, they SHALL follow the naming pattern `com.moneytree.shared.*`, and for all application-specific packages, they SHALL follow `com.moneytree.<module>.*`, clearly distinguishing shared from module-specific code.

**Validates: Requirements 3.5**

### Property 12: Spring Context Initialization

*For the* application after refactoring, Spring Boot SHALL successfully initialize the application context, creating all beans, repositories, and services without errors.

**Validates: Requirements 4.2**

### Property 13: API Response Equivalence

*For any* API endpoint request, the response after refactoring SHALL be functionally equivalent to the response before refactoring, ensuring backward compatibility.

**Validates: Requirements 4.3**

### Property 14: Database Operation Correctness

*For any* database operation (create, read, update, delete) performed through shared repositories, the operation SHALL execute successfully and produce correct results consistent with the database schema.

**Validates: Requirements 4.4**

### Property 15: Database Configuration Flexibility

*For any* modulith project using the shared library, it SHALL be able to specify its own database connection properties (URL, credentials, pool settings) independently of other projects.

**Validates: Requirements 6.1, 6.2**

### Property 16: Entity Scanning from Shared Library

*For any* application module using the shared library, Spring JPA SHALL automatically discover and register all entity classes from the `com.moneytree.shared.entity` package.

**Validates: Requirements 6.3**

### Property 17: Transaction Boundary Independence

*For any* modulith project using the shared library, it SHALL be able to define its own transaction management configuration and boundaries without conflicts.

**Validates: Requirements 6.4**

### Property 18: Migration Tool Support

*For any* modulith project using the shared library, it SHALL support both shared database migrations (from the library) and project-specific migrations using Flyway or Liquibase.

**Validates: Requirements 6.5**

### Property 19: Test Independence

*For all* unit tests in the shared library, they SHALL execute successfully without requiring the full application context or external dependencies.

**Validates: Requirements 7.5**

## Error Handling

### Migration Errors

**Entity Migration Errors:**
- **Missing Annotations**: If JPA annotations are accidentally removed during migration, the application will fail to start with `IllegalArgumentException` or `MappingException`
- **Broken Relationships**: If entity relationships are incorrectly migrated, queries will fail with `LazyInitializationException` or return incorrect results
- **Mitigation**: Comprehensive integration tests that verify all entity relationships and database operations

**Dependency Resolution Errors:**
- **Missing Dependencies**: If the shared library POM doesn't declare all necessary dependencies, dependent modules will fail to compile with `ClassNotFoundException`
- **Version Conflicts**: If different modules require different versions of the same dependency, Maven will report conflicts
- **Mitigation**: Proper dependency management in parent POM, use of `<dependencyManagement>` section

**Circular Dependency Errors:**
- **Build Failure**: If circular dependencies are introduced, Maven will fail with "Circular dependency detected"
- **Mitigation**: Strict architectural rules, dependency analysis tools, code review

### Runtime Errors

**Bean Creation Errors:**
- **Missing Component Scan**: If `@ComponentScan` doesn't include shared library packages, beans won't be created
- **Error**: `NoSuchBeanDefinitionException`
- **Mitigation**: Proper auto-configuration in shared library, explicit component scanning configuration

**Database Connection Errors:**
- **Configuration Issues**: If database properties are not properly externalized, applications may fail to connect
- **Error**: `SQLException`, `DataSourceInitializationException`
- **Mitigation**: Clear documentation on required configuration properties, sensible defaults

**Transaction Errors:**
- **Transaction Propagation Issues**: If transaction boundaries are not properly configured, operations may fail or commit prematurely
- **Error**: `TransactionSystemException`, `UnexpectedRollbackException`
- **Mitigation**: Clear transaction management configuration, proper use of `@Transactional` annotations

### Build and Deployment Errors

**Build Errors:**
- **Compilation Failures**: If imports are not updated after migration, compilation will fail
- **Error**: `cannot find symbol` errors
- **Mitigation**: Comprehensive build testing, IDE refactoring tools

**Deployment Errors:**
- **Missing Artifact**: If the shared library is not published to the Maven repository, dependent modules cannot resolve it
- **Error**: `Could not resolve dependencies`
- **Mitigation**: Automated CI/CD pipeline for publishing, local Maven repository for development

**Version Mismatch Errors:**
- **Incompatible Versions**: If a module uses an incompatible version of the shared library, runtime errors may occur
- **Error**: `NoSuchMethodError`, `ClassCastException`
- **Mitigation**: Semantic versioning, clear changelog, deprecation warnings

## Testing Strategy

### Unit Testing

**Shared Library Unit Tests:**

1. **Repository Tests:**
   - Use `@DataJpaTest` for repository layer testing
   - Use H2 in-memory database for fast test execution
   - Test custom query methods
   - Test pagination and sorting
   - Verify constraint violations

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class PortfolioRepositoryTest {
    @Autowired
    private PortfolioRepository portfolioRepository;
    
    @Test
    void testFindByUserId() {
        // Test implementation
    }
}
```

2. **Service Tests:**
   - Use `@SpringBootTest` or mock dependencies
   - Test business logic in isolation
   - Verify transaction behavior
   - Test error handling

```java
@ExtendWith(MockitoExtension.class)
class PortfolioServiceTest {
    @Mock
    private PortfolioRepository portfolioRepository;
    
    @InjectMocks
    private PortfolioServiceImpl portfolioService;
    
    @Test
    void testCreatePortfolio() {
        // Test implementation
    }
}
```

3. **Mapper Tests:**
   - Test entity-to-DTO conversion
   - Test DTO-to-entity conversion
   - Verify null handling
   - Test nested object mapping

**Application Module Unit Tests:**

1. **Controller Tests:**
   - Use `@WebMvcTest` for controller layer testing
   - Mock service dependencies
   - Test request/response mapping
   - Verify HTTP status codes
   - Test validation

```java
@WebMvcTest(PortfolioController.class)
class PortfolioControllerTest {
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private PortfolioService portfolioService;
    
    @Test
    void testGetPortfolio() throws Exception {
        // Test implementation
    }
}
```

### Property-Based Testing

**Property-Based Testing Library:** We will use **jqwik** for property-based testing in Java.

**Configuration:** Each property-based test will run a minimum of 100 iterations to ensure thorough coverage of the input space.

**Property Test Examples:**

1. **Entity Annotation Preservation Property:**

```java
@Property
@Label("Feature: shared-entities-library, Property 1: JPA Annotation Preservation")
void entityAnnotationsPreserved(@ForAll("entities") Class<?> entityClass) {
    // Verify @Entity annotation exists
    assertTrue(entityClass.isAnnotationPresent(Entity.class));
    
    // Verify @Table annotation if present in original
    // Verify field annotations (@Column, @Id, etc.)
}
```

2. **Repository Method Retention Property:**

```java
@Property
@Label("Feature: shared-entities-library, Property 3: Repository Method Retention")
void repositoryMethodsRetained(@ForAll("repositories") Class<?> repoClass) {
    // Verify all expected methods exist
    // Verify method signatures match
    // Verify annotations are present
}
```

3. **Maven Dependency Resolution Property:**

```java
@Property
@Label("Feature: shared-entities-library, Property 5: Maven Dependency Resolution")
void dependenciesResolved(@ForAll("modules") String moduleName) {
    // Build module
    // Verify all classes from shared library are on classpath
    // Verify no ClassNotFoundException
}
```

4. **API Response Equivalence Property:**

```java
@Property
@Label("Feature: shared-entities-library, Property 13: API Response Equivalence")
void apiResponsesEquivalent(@ForAll("apiRequests") HttpRequest request) {
    // Execute request against original system
    // Execute request against refactored system
    // Compare responses (status code, body, headers)
    assertEquals(originalResponse, refactoredResponse);
}
```

5. **Database Operation Correctness Property:**

```java
@Property
@Label("Feature: shared-entities-library, Property 14: Database Operation Correctness")
void databaseOperationsCorrect(@ForAll("entities") Object entity) {
    // Save entity
    // Retrieve entity
    // Verify retrieved entity equals saved entity
    // Update entity
    // Verify update persisted
    // Delete entity
    // Verify entity deleted
}
```

### Integration Testing

**Integration Test Scenarios:**

1. **Full Application Startup Test:**
   - Start the application with shared library
   - Verify all beans are created
   - Verify database connection
   - Verify all endpoints are registered

2. **End-to-End API Tests:**
   - Test complete user workflows
   - Verify data persistence
   - Test cross-module interactions

3. **Database Integration Tests:**
   - Use Testcontainers with PostgreSQL
   - Test against real database
   - Verify migrations work correctly
   - Test transaction behavior

```java
@SpringBootTest
@Testcontainers
class IntegrationTest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15");
    
    @Test
    void testFullWorkflow() {
        // Test implementation
    }
}
```

### Migration Validation Testing

**Pre-Migration Baseline:**
1. Capture all API responses for a comprehensive test suite
2. Document all database queries and their results
3. Record application startup time and memory usage

**Post-Migration Validation:**
1. Re-run all API tests and compare responses
2. Verify database queries produce identical results
3. Compare performance metrics

**Regression Test Suite:**
- All existing tests must pass after refactoring
- No new errors or warnings in logs
- No changes in API behavior

## Implementation Phases

### Phase 1: Project Structure Setup

1. Create parent POM with multi-module structure
2. Create shared library module skeleton
3. Configure Maven build for multi-module project
4. Set up version management
5. **Build Verification**: Run `mvn clean install` to ensure multi-module build works
6. **Git Checkpoint**: Commit with message "feat: set up multi-module Maven structure"

### Phase 2: Entity Migration

1. Identify all entities to be moved to shared library
2. Create entity packages in shared library
3. Move entity classes with all annotations
4. Update imports in original modules
5. **Build Verification**: Run `mvn clean compile` to verify no compilation errors
6. **Git Checkpoint**: Commit with message "refactor: migrate entities to shared library"

### Phase 3: Repository Migration

1. Identify repositories to be moved
2. Create repository packages in shared library
3. Move repository interfaces
4. Update service imports
5. **Build Verification**: Run `mvn clean compile` to verify no compilation errors
6. **Git Checkpoint**: Commit with message "refactor: migrate repositories to shared library"

### Phase 4: DTO and Mapper Migration

1. Identify DTOs to be moved
2. Create DTO packages in shared library
3. Move DTO classes
4. Move mapper classes
5. Update controller imports
6. **Build Verification**: Run `mvn clean compile` to verify no compilation errors
7. **Git Checkpoint**: Commit with message "refactor: migrate DTOs and mappers to shared library"

### Phase 5: Service Migration

1. Identify services to be moved
2. Evaluate service dependencies
3. Move appropriate services to shared library
4. Keep application-specific services in modules
5. Update controller dependencies
6. **Build Verification**: Run `mvn clean compile` to verify no compilation errors
7. **Git Checkpoint**: Commit with message "refactor: migrate services to shared library"

### Phase 6: Connectivity Migration

1. Move Kite connectivity components
2. Move NSE and other connectivity components
3. Update imports in services
4. **Build Verification**: Run `mvn clean compile` to verify no compilation errors
5. **Git Checkpoint**: Commit with message "refactor: migrate connectivity components to shared library"

### Phase 7: Configuration and Auto-Configuration

1. Create shared library auto-configuration
2. Set up component scanning
3. Configure entity scanning
4. Create spring.factories for auto-configuration
5. Update backend module configuration
6. **Build Verification**: Run `mvn clean install` to verify full build
7. **Application Startup Test**: Start application and verify no errors
8. **Git Checkpoint**: Commit with message "feat: configure shared library auto-configuration"

### Phase 8: Testing

1. Write unit tests for shared library components
2. Write property-based tests
3. Update existing tests in application module
4. **Build Verification**: Run `mvn test` to verify all tests pass
5. **Git Checkpoint**: Commit with message "test: add comprehensive test suite for shared library"

### Phase 9: Documentation

1. Create shared library README
2. Write integration guide
3. Document package structure
4. Provide usage examples
5. Create migration guidelines
6. **Git Checkpoint**: Commit with message "docs: add shared library documentation"

### Phase 10: Build and Deployment

1. Configure CI/CD for shared library
2. Set up Maven repository (Nexus/Artifactory)
3. Publish shared library artifact
4. Update application module to use published artifact
5. **Build Verification**: Run full CI/CD pipeline
6. **Git Checkpoint**: Commit with message "ci: configure build and deployment pipeline"

## Dependencies

### Shared Library Dependencies

**Required Dependencies:**
- Spring Boot Starter Data JPA
- Spring Boot Starter Validation
- PostgreSQL Driver
- Jakarta Persistence API
- Hibernate Core (via Spring Data JPA)

**Optional Dependencies:**
- Lombok (for reducing boilerplate)
- MapStruct (for advanced mapping)

**Test Dependencies:**
- Spring Boot Starter Test
- H2 Database (for testing)
- jqwik (for property-based testing)
- Testcontainers (for integration testing)

### Application Module Dependencies

**Required Dependencies:**
- moneytree-shared (the shared library)
- Spring Boot Starter Web
- Spring Boot Starter Actuator
- Spring Boot Starter Cache
- Redis (for caching)

**Dependency Management:**

All dependency versions will be managed in the parent POM using `<dependencyManagement>` to ensure consistency across modules.

## Performance Considerations

### Build Performance

- **Incremental Builds**: Maven will only rebuild changed modules
- **Parallel Builds**: Use `mvn -T 1C` for parallel module builds
- **Dependency Caching**: Maven local repository caches dependencies

### Runtime Performance

- **No Performance Impact**: The refactoring is purely structural and should not affect runtime performance
- **Class Loading**: Shared library classes are loaded once and shared across the application
- **Memory Usage**: Minimal increase due to additional JAR file, but shared code reduces duplication

### Development Workflow

- **Faster Iteration**: Changes to shared library require rebuilding and republishing
- **Local Development**: Use `mvn install` to install shared library to local Maven repository
- **Snapshot Versions**: Use SNAPSHOT versions during development for easier updates

## Security Considerations

### Dependency Security

- **Vulnerability Scanning**: Use Maven dependency-check plugin to scan for known vulnerabilities
- **Regular Updates**: Keep Spring Boot and other dependencies up to date
- **Minimal Dependencies**: Only include necessary dependencies in shared library

### Access Control

- **Maven Repository Access**: Control who can publish to the Maven repository
- **Version Control**: Protect main branch, require code reviews for shared library changes
- **Artifact Signing**: Consider signing JAR artifacts for production deployments

## Build Verification and Git Workflow

### Build Verification Strategy

Each major phase of the refactoring MUST include build verification to ensure the codebase remains in a working state:

**Compilation Verification:**
- Run `mvn clean compile` after each migration phase
- Verify zero compilation errors
- Fix all errors before proceeding to next phase

**Test Verification:**
- Run `mvn clean test` after adding tests
- Verify all tests pass
- Fix failing tests immediately

**Full Build Verification:**
- Run `mvn clean install` after major milestones
- Verify JAR artifacts are created
- Verify no warnings in build output

**Application Startup Verification:**
- Start application with `mvn spring-boot:run`
- Verify Spring context initializes without errors
- Check logs for warnings or configuration issues
- Test key API endpoints
- Stop application cleanly

### Git Commit Strategy

**Commit Frequency:**
- Commit after each major phase completion
- Commit only when build is successful and tests pass
- Never commit broken code

**Commit Message Format:**
Follow conventional commits format:
- `feat:` for new features (e.g., "feat: set up multi-module Maven structure")
- `refactor:` for code refactoring (e.g., "refactor: migrate entities to shared library")
- `test:` for adding tests (e.g., "test: add unit tests for repositories")
- `docs:` for documentation (e.g., "docs: add shared library README")
- `ci:` for CI/CD changes (e.g., "ci: configure build pipeline")
- `fix:` for bug fixes (e.g., "fix: resolve circular dependency issue")

**Commit Checkpoints:**

1. **Phase 1**: "feat: set up multi-module Maven structure"
2. **Phase 2**: "refactor: migrate entities to shared library"
3. **Phase 3**: "refactor: migrate repositories to shared library"
4. **Phase 4**: "refactor: migrate DTOs and mappers to shared library"
5. **Phase 5**: "refactor: migrate services to shared library"
6. **Phase 6**: "refactor: migrate connectivity components to shared library"
7. **Phase 7**: "feat: configure shared library auto-configuration and exceptions"
8. **Phase 8**: "refactor: integrate shared library into backend module"
9. **Phase 9**: "feat: configure database and transaction management"
10. **Phase 10**: "refactor: ensure clean architecture and naming conventions"
11. **Phase 11**: "test: add unit tests for shared library components"
12. **Phase 12**: "test: add integration tests with Testcontainers"
13. **Phase 13**: "test: verify all regression tests pass"
14. **Phase 14**: "docs: add comprehensive shared library documentation"
15. **Phase 15**: "ci: configure build and deployment pipeline"
16. **Phase 16**: "refactor: complete shared library extraction - all tests passing"

**Git Tagging:**
- Create version tag after final verification: `v1.0.0-shared-library`
- Use semantic versioning for future releases

### Error Handling During Build

**If Compilation Fails:**
1. Review error messages carefully
2. Check for missing imports
3. Verify package declarations are correct
4. Ensure all dependencies are declared in POM
5. Fix errors before proceeding

**If Tests Fail:**
1. Review test failure messages
2. Check if test data needs updating
3. Verify test configuration is correct
4. Fix failing tests before committing
5. Do not skip or ignore failing tests

**If Application Fails to Start:**
1. Review Spring Boot startup logs
2. Check for bean creation errors
3. Verify auto-configuration is working
4. Check database connection settings
5. Fix configuration issues before proceeding

### Rollback Strategy

**If Major Issues Occur:**
1. Use `git log` to review recent commits
2. Use `git revert <commit-hash>` to undo problematic changes
3. Or use `git reset --hard <commit-hash>` to go back to last working state
4. Re-apply changes carefully with fixes

**Branch Strategy:**
- Consider creating a feature branch: `feature/shared-library-refactor`
- Commit all changes to feature branch
- Merge to main only after final verification
- This allows easy rollback if needed

## Monitoring and Observability

### Build Monitoring

- **CI/CD Dashboards**: Monitor build success/failure rates
- **Build Time Tracking**: Track build duration for performance optimization
- **Dependency Analysis**: Monitor for outdated or vulnerable dependencies

### Runtime Monitoring

- **Application Metrics**: Use Spring Boot Actuator for health checks and metrics
- **Logging**: Ensure proper logging configuration in shared library
- **Distributed Tracing**: Support for tracing across modules if needed

## Future Enhancements

### Additional Modules

The shared library architecture enables easy creation of new modulith applications:
- **moneytree-analytics**: Analytics and reporting module
- **moneytree-trading**: Automated trading module
- **moneytree-notifications**: Notification service module

### Shared Library Evolution

- **Versioning Strategy**: Use semantic versioning for breaking changes
- **Deprecation Policy**: Clearly mark deprecated APIs and provide migration paths
- **Feature Toggles**: Consider feature flags for gradual rollout of changes

### Advanced Features

- **Multi-Tenancy Support**: Add tenant isolation in shared library
- **Audit Logging**: Centralized audit logging for all database operations
- **Event Sourcing**: Consider event sourcing patterns for critical entities
- **CQRS**: Separate read and write models if needed for performance
