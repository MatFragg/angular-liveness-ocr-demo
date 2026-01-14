---
title: Angular Web App with Feature-Sliced Design and Clean Architecture
date: 2025-11-03
tags:
  - project-structure
  - architecture
  - angular
  - web
  - frontend
  - fsd
stack:
  - Angular 19
  - TypeScript
  - RxJS
  - Angular Signals
  - TailwindCSS
  - Angular Material
principles:
  - '[[Angular Clean Architecture]]'
  - '[[Feature-Sliced Design]]'
  - '[[Domain-Driven Design]]'
  - '[[Repository Pattern]]'
  - '[[Facade Pattern]]'
---

## 1. Philosophy & Guiding Principles

This structure combines **[[Feature-Sliced Design (FSD)]]** with **[[Angular Clean Architecture]]** principles, creating a modular, scalable frontend architecture that aligns perfectly with a Spring Boot backend using NTier + Clean Architecture.

- **Feature-Driven Organization:** Code is organized by business features (clientes, viviendas, simulador) rather than technical layers, improving cohesion and maintainability.
- **Dependency Rule:** Dependencies flow inwards. Presentation depends on domain, data implements domain contracts, but domain depends on nothing external.
- **Layer Separation:** Each feature maintains three distinct layers:
  - **Domain Layer:** Pure business logic and contracts
  - **Data Layer:** API communication and data transformation
  - **Presentation Layer:** UI components and state management
- **Facade Pattern:** ViewModels/Facades act as simplified interfaces to complex subsystems, orchestrating use cases and managing state.
- **Reactive State Management:** Leverages Angular Signals (native) for simple, reactive state management without external libraries.
- **Backend Alignment:** Structure mirrors Spring Boot's controller → service → repository pattern for team consistency.

---

## 2. Folder Structure Tree

```text
src/
├── 📁 app/
│   ├── 📁 core/                          # Singleton services, guards, interceptors
│   │   ├── 📁 guards/
│   │   │   ├── 📄 auth.guard.ts
│   │   │   └── 📄 role.guard.ts
│   │   ├── 📁 interceptors/
│   │   │   ├── 📄 auth.interceptor.ts
│   │   │   ├── 📄 error.interceptor.ts
│   │   │   └── 📄 loading.interceptor.ts
│   │   ├── 📁 services/
│   │   │   ├── 📄 auth.service.ts
│   │   │   ├── 📄 storage.service.ts
│   │   │   └── 📄 notification.service.ts
│   │   └── 📁 models/
│   │       ├── 📄 user.model.ts
│   │       └── 📄 session.model.ts
│   │
│   ├── 📁 shared/                        # Reusable components, pipes, directives
│   │   ├── 📁 components/
│   │   │   ├── 📁 loading-spinner/
│   │   │   ├── 📁 toast-notification/
│   │   │   ├── 📁 confirmation-dialog/
│   │   │   └── 📁 empty-state/
│   │   ├── 📁 pipes/
│   │   │   ├── 📄 currency-format.pipe.ts
│   │   │   ├── 📄 date-format.pipe.ts
│   │   │   └── 📄 percentage.pipe.ts
│   │   ├── 📁 directives/
│   │   │   ├── 📄 number-only.directive.ts
│   │   │   ├── 📄 currency-input.directive.ts
│   │   │   └── 📄 auto-focus.directive.ts
│   │   ├── 📁 validators/
│   │   │   ├── 📄 dni.validator.ts
│   │   │   ├── 📄 phone.validator.ts
│   │   │   └── 📄 custom.validators.ts
│   │   └── 📁 models/
│   │       └── 📄 base.model.ts
│   │
│   ├── 📁 features/                      # Feature modules (business domains)
│   │   │
│   │   ├── 📁 layouts/                   # ⭐ Layouts feature
│   │   │   └── 📁 presentation/
│   │   │       ├── 📁 components/
│   │   │       │   ├── 📁 unauthenticated-layout/
│   │   │       │   │   ├── 📄 unauthenticated-layout.component.ts
│   │   │       │   │   ├── 📄 unauthenticated-layout.component.html
│   │   │       │   │   └── 📄 unauthenticated-layout.component.scss
│   │   │       │   ├── 📁 authenticated-layout/
│   │   │       │   │   ├── 📄 authenticated-layout.component.ts
│   │   │       │   │   ├── 📄 authenticated-layout.component.html
│   │   │       │   │   └── 📄 authenticated-layout.component.scss
│   │   │       │   ├── 📁 navbar/
│   │   │       │   │   ├── 📄 navbar.component.ts
│   │   │       │   │   ├── 📄 navbar.component.html
│   │   │       │   │   └── 📄 navbar.component.scss
│   │   │       │   ├── 📁 sidebar/
│   │   │       │   │   ├── 📄 sidebar.component.ts
│   │   │       │   │   ├── 📄 sidebar.component.html
│   │   │       │   │   └── 📄 sidebar.component.scss
│   │   │       │   ├── 📁 footer/
│   │   │       │   │   ├── 📄 footer.component.ts
│   │   │       │   │   ├── 📄 footer.component.html
│   │   │       │   │   └── 📄 footer.component.scss
│   │   │       │   └── 📁 user-menu/
│   │   │       │       ├── 📄 user-menu.component.ts
│   │   │       │       ├── 📄 user-menu.component.html
│   │   │       │       └── 📄 user-menu.component.scss
│   │   │       └── 📁 state/
│   │   │           └── 📄 layout.facade.ts
│   │   │
│   │   ├── 📁 clientes/                  # Clientes feature
│   │   │   ├── 📁 data/                  # Data layer
│   │   │   │   ├── 📁 datasources/
│   │   │   │   │   └── 📄 cliente.datasource.ts
│   │   │   │   ├── 📁 dtos/
│   │   │   │   │   ├── 📄 cliente.dto.ts
│   │   │   │   │   ├── 📄 create-cliente.dto.ts
│   │   │   │   │   └── 📄 update-cliente.dto.ts
│   │   │   │   ├── 📁 mappers/
│   │   │   │   │   └── 📄 cliente.mapper.ts
│   │   │   │   └── 📁 repositories/
│   │   │   │       └── 📄 cliente.repository.impl.ts
│   │   │   │
│   │   │   ├── 📁 domain/                # Domain layer
│   │   │   │   ├── 📁 models/
│   │   │   │   │   └── 📄 cliente.model.ts
│   │   │   │   ├── 📁 repositories/
│   │   │   │   │   └── 📄 cliente.repository.ts
│   │   │   │   └── 📁 usecases/
│   │   │   │       ├── 📄 get-clientes.usecase.ts
│   │   │   │       ├── 📄 get-cliente-by-id.usecase.ts
│   │   │   │       ├── 📄 create-cliente.usecase.ts
│   │   │   │       ├── 📄 update-cliente.usecase.ts
│   │   │   │       ├── 📄 delete-cliente.usecase.ts
│   │   │   │       └── 📄 search-clientes.usecase.ts
│   │   │   │
│   │   │   ├── 📁 presentation/          # Presentation layer
│   │   │   │   ├── 📁 components/
│   │   │   │   │   ├── 📁 cliente-list/
│   │   │   │   │   │   ├── 📄 cliente-list.component.ts
│   │   │   │   │   │   ├── 📄 cliente-list.component.html
│   │   │   │   │   │   └── 📄 cliente-list.component.scss
│   │   │   │   │   ├── 📁 cliente-form/
│   │   │   │   │   │   ├── 📄 cliente-form.component.ts
│   │   │   │   │   │   ├── 📄 cliente-form.component.html
│   │   │   │   │   │   └── 📄 cliente-form.component.scss
│   │   │   │   │   └── 📁 cliente-detail/
│   │   │   │   │
│   │   │   │   ├── 📁 pages/
│   │   │   │   │   ├── 📁 clientes-page/
│   │   │   │   │   │   ├── 📄 clientes-page.component.ts
│   │   │   │   │   │   ├── 📄 clientes-page.component.html
│   │   │   │   │   │   └── 📄 clientes-page.component.scss
│   │   │   │   │   └── 📁 cliente-edit-page/
│   │   │   │   │
│   │   │   │   └── 📁 state/
│   │   │   │       ├── 📄 clientes.state.ts
│   │   │   │       └── 📄 clientes.facade.ts
│   │   │   │
│   │   │   └── 📄 clientes.routes.ts
│   │   │
│   │   ├── 📁 viviendas/                 # Viviendas feature
│   │   │   ├── 📁 data/
│   │   │   │   ├── 📁 datasources/
│   │   │   │   │   └── 📄 vivienda.datasource.ts
│   │   │   │   ├── 📁 dtos/
│   │   │   │   │   └── 📄 vivienda.dto.ts
│   │   │   │   ├── 📁 mappers/
│   │   │   │   │   └── 📄 vivienda.mapper.ts
│   │   │   │   └── 📁 repositories/
│   │   │   │       └── 📄 vivienda.repository.impl.ts
│   │   │   │
│   │   │   ├── 📁 domain/
│   │   │   │   ├── 📁 models/
│   │   │   │   │   ├── 📄 vivienda.model.ts
│   │   │   │   │   └── 📄 tipo-vivienda.enum.ts
│   │   │   │   ├── 📁 repositories/
│   │   │   │   │   └── 📄 vivienda.repository.ts
│   │   │   │   └── 📁 usecases/
│   │   │   │       ├── 📄 get-viviendas.usecase.ts
│   │   │   │       ├── 📄 create-vivienda.usecase.ts
│   │   │   │       ├── 📄 update-vivienda.usecase.ts
│   │   │   │       ├── 📄 delete-vivienda.usecase.ts
│   │   │   │       └── 📄 filter-viviendas.usecase.ts
│   │   │   │
│   │   │   ├── 📁 presentation/
│   │   │   │   ├── 📁 components/
│   │   │   │   │   ├── 📁 vivienda-card/
│   │   │   │   │   ├── 📁 vivienda-gallery/
│   │   │   │   │   ├── 📁 vivienda-form/
│   │   │   │   │   └── 📁 vivienda-filters/
│   │   │   │   ├── 📁 pages/
│   │   │   │   │   ├── 📁 viviendas-page/
│   │   │   │   │   └── 📁 vivienda-detail-page/
│   │   │   │   └── 📁 state/
│   │   │   │       ├── 📄 viviendas.state.ts
│   │   │   │       └── 📄 viviendas.facade.ts
│   │   │   │
│   │   │   └── 📄 viviendas.routes.ts
│   │   │
│   │   ├── 📁 simulador/                 # Simulador feature
│   │   │   ├── 📁 data/
│   │   │   │   ├── 📁 datasources/
│   │   │   │   │   └── 📄 simulacion.datasource.ts
│   │   │   │   ├── 📁 dtos/
│   │   │   │   │   ├── 📄 simulacion-request.dto.ts
│   │   │   │   │   ├── 📄 simulacion-response.dto.ts
│   │   │   │   │   └── 📄 cronograma.dto.ts
│   │   │   │   ├── 📁 mappers/
│   │   │   │   │   ├── 📄 simulacion.mapper.ts
│   │   │   │   │   └── 📄 cronograma.mapper.ts
│   │   │   │   └── 📁 repositories/
│   │   │   │       └── 📄 simulacion.repository.impl.ts
│   │   │   │
│   │   │   ├── 📁 domain/
│   │   │   │   ├── 📁 models/
│   │   │   │   │   ├── 📄 simulacion.model.ts
│   │   │   │   │   ├── 📄 cronograma.model.ts
│   │   │   │   │   ├── 📄 cuota.model.ts
│   │   │   │   │   ├── 📄 indicadores.model.ts
│   │   │   │   │   └── 📄 configuracion.model.ts
│   │   │   │   ├── 📁 repositories/
│   │   │   │   │   └── 📄 simulacion.repository.ts
│   │   │   │   ├── 📁 usecases/
│   │   │   │   │   ├── 📄 calcular-simulacion.usecase.ts
│   │   │   │   │   ├── 📄 generar-cronograma.usecase.ts
│   │   │   │   │   ├── 📄 calcular-indicadores.usecase.ts
│   │   │   │   │   ├── 📄 guardar-simulacion.usecase.ts
│   │   │   │   │   └── 📄 exportar-pdf.usecase.ts
│   │   │   │   └── 📁 services/
│   │   │   │       ├── 📄 calculadora-francesa.service.ts
│   │   │   │       ├── 📄 tasa-converter.service.ts
│   │   │   │       └── 📄 indicadores-financieros.service.ts
│   │   │   │
│   │   │   ├── 📁 presentation/
│   │   │   │   ├── 📁 components/
│   │   │   │   │   ├── 📁 simulador-form/
│   │   │   │   │   ├── 📁 cronograma-table/
│   │   │   │   │   ├── 📁 resultado-panel/
│   │   │   │   │   ├── 📁 indicadores-panel/
│   │   │   │   │   └── 📁 configuracion-panel/
│   │   │   │   ├── 📁 pages/
│   │   │   │   │   ├── 📁 simulador-page/
│   │   │   │   │   └── 📁 cronograma-detail-page/
│   │   │   │   └── 📁 state/
│   │   │   │       ├── 📄 simulador.state.ts
│   │   │   │       └── 📄 simulador.facade.ts
│   │   │   │
│   │   │   └── 📄 simulador.routes.ts
│   │   │
│   │   ├── 📁 entidades-bancarias/       # Entidades Bancarias feature
│   │   │   ├── 📁 data/
│   │   │   ├── 📁 domain/
│   │   │   ├── 📁 presentation/
│   │   │   └── 📄 entidades.routes.ts
│   │   │
│   │   ├── 📁 historial/                 # Historial feature
│   │   │   ├── 📁 data/
│   │   │   ├── 📁 domain/
│   │   │   ├── 📁 presentation/
│   │   │   └── 📄 historial.routes.ts
│   │   │
│   │   ├── 📁 configuracion/             # Configuración feature
│   │   │   ├── 📁 data/
│   │   │   ├── 📁 domain/
│   │   │   ├── 📁 presentation/
│   │   │   └── 📄 configuracion.routes.ts
│   │   │
│   │   └── 📁 dashboard/                 # ⭐ Dashboard feature (UPDATED)
│   │       ├── 📁 data/                  # Data layer
│   │       │   ├── 📁 datasources/
│   │       │   │   └── 📄 dashboard-analytics.datasource.ts
│   │       │   ├── 📁 dtos/
│   │       │   │   ├── 📄 dashboard-stats.dto.ts
│   │       │   │   └── 📄 activity.dto.ts
│   │       │   ├── 📁 mappers/
│   │       │   │   └── 📄 dashboard-stats.mapper.ts
│   │       │   └── 📁 repositories/
│   │       │       └── 📄 dashboard.repository.impl.ts
│   │       │
│   │       ├── 📁 domain/                # Domain layer
│   │       │   ├── 📁 models/
│   │       │   │   ├── 📄 dashboard-stats.model.ts
│   │       │   │   ├── 📄 cliente-stats.model.ts
│   │       │   │   ├── 📄 vivienda-stats.model.ts
│   │       │   │   └── 📄 activity.model.ts
│   │       │   ├── 📁 repositories/
│   │       │   │   └── 📄 dashboard.repository.ts
│   │       │   └── 📁 usecases/
│   │       │       ├── 📄 get-dashboard-stats.usecase.ts
│   │       │       └── 📄 get-recent-activity.usecase.ts
│   │       │
│   │       ├── 📁 presentation/          # Presentation layer
│   │       │   ├── 📁 components/
│   │       │   │   ├── 📁 stats-card/
│   │       │   │   ├── 📁 clientes-summary-chart/
│   │       │   │   ├── 📁 viviendas-summary-chart/
│   │       │   │   └── 📁 recent-activity-list/
│   │       │   ├── 📁 pages/
│   │       │   │   └── 📁 dashboard-page/
│   │       │   └── 📁 state/
│   │       │       ├── 📄 dashboard.state.ts
│   │       │       └── 📄 dashboard.facade.ts
│   │       │
│   │       └── 📄 dashboard.routes.ts
│   │
│   ├── 📄 app.component.ts
│   ├── 📄 app.component.html
│   ├── 📄 app.component.scss
│   ├── 📄 app.config.ts
│   └── 📄 app.routes.ts
│
├── 📁 assets/
│   ├── 📁 images/
│   ├── 📁 icons/
│   └── 📁 fonts/
│
├── 📁 environments/
│   ├── 📄 environment.ts
│   └── 📄 environment.prod.ts
│
├── 📄 styles.scss
├── 📄 index.html
└── 📄 main.ts
```

---

## 3. Core Directory Breakdown

### **`/core`**: Application Singleton Services

Contains services, guards, and interceptors that should be instantiated only once and shared across the entire application.

- **`guards/`**: Route guards for authentication and authorization
- **`interceptors/`**: HTTP interceptors for request/response manipulation
- **`services/`**: Core application services (auth, storage, notifications)
- **`models/`**: Core application-wide models

**Rule**: Services in core should be provided in 'root' and are singletons.

### **`/shared`**: Reusable UI Components and Utilities

Contains "dumb" components, pipes, directives, and validators used across multiple features.

- **`components/`**: Presentational components with @Input/@Output
- **`pipes/`**: Pure transformation pipes
- **`directives/`**: Reusable attribute directives
- **`validators/`**: Custom form validators
- **`models/`**: Shared interfaces and types

**Key Principle**: Shared components should be stateless and reusable.

### **`/features`**: Feature Modules (Business Domains)

Each feature represents a business domain and is self-contained with its own three-layer architecture.

#### **Feature Structure (3 Layers)**

##### **1. Data Layer** (`/data`)

Implements repository interfaces and handles all external communication:

- **`datasources/`**: HTTP services using HttpClient
  - Contains methods for API calls
  - Returns Observables of DTOs
  - Example: `getClientes(): Observable<ClienteDto[]>`
- **`dtos/`**: Data Transfer Objects matching API contracts
  - Mirrors backend DTOs exactly
  - Used only for API communication
  - Should match Spring Boot controller response structures
- **`mappers/`**: Converts DTOs to Domain Models
  - Pure functions: `toModel()` and `toDto()`
  - Isolates API changes from domain layer
  - Example: `clienteDtoToModel(dto: ClienteDto): Cliente`
- **`repositories/`**: Repository implementations
  - Implements domain repository interfaces
  - Orchestrates datasource + mapper
  - Handles error transformation

##### **2. Domain Layer** (`/domain`)

Pure business logic, framework-agnostic:

- **`models/`**: Business entities with validation rules
  - Plain TypeScript classes/interfaces
  - Contains business validation methods
  - No Angular dependencies
  - Example: `Cliente` with `isValid()`, `canApplyForLoan()`
- **`repositories/`**: Repository interfaces (contracts)
  - Abstract classes or interfaces
  - Defines what operations are available
  - Independent of implementation details
  - Example: `abstract class ClienteRepository`
- **`usecases/`**: Application-specific business rules
  - One class per business operation
  - Orchestrates domain logic
  - Returns Observables of domain models
  - Example: `GetClientesUseCase`, `CreateClienteUseCase`
- **`services/`**: Complex business logic
  - Used when logic is shared across multiple use cases
  - Pure computational services
  - Example: `CalculadoraFrancesaService`

##### **3. Presentation Layer** (`/presentation`)

UI components and state management:

- **`components/`**: Feature-specific UI components
  - Smart components (with facade) or dumb components
  - Organized by component responsibility
  - Example: `cliente-list`, `cliente-form`
- **`pages/`**: Route-level components
  - Container components that compose feature components
  - Connected to router
  - Example: `clientes-page` (route: `/clientes`)
- **`state/`**: State management
  - `*.state.ts`: State interface definition
  - `*.facade.ts`: Facade service using Angular Signals
  - Orchestrates use cases and manages component state

---

## 4. Data Flow & Architecture Patterns

### Request Flow (User Action → Data)

```
User Interaction (Component)
        ↓
    Facade (state management)
        ↓
    Use Case (business logic)
        ↓
Repository Interface (domain contract)
        ↓
Repository Implementation (data layer)
        ↓
DataSource (HTTP service)
        ↓
    Spring Boot API
```

### Response Flow (Data → UI)

```
Spring Boot API (returns DTO)
        ↓
DataSource (receives DTO)
        ↓
Mapper (DTO → Domain Model)
        ↓
Repository Implementation
        ↓
Use Case (processes result)
        ↓
Facade (updates Signal state)
        ↓
Component (UI updates reactively)
```

### State Management Flow (Angular Signals)

```
Component calls Facade method
        ↓
Facade updates loading signal
        ↓
Facade calls Use Case
        ↓
Use Case returns Observable
        ↓
Facade updates data/error signals
        ↓
Component template reacts to signal changes
```

### Key Patterns Applied

1. **[[Angular N-Tier Layer Architecture with DDD]]**: Three-layer separation within each feature
2. **[[Feature-Sliced Design]]**: Features organized by business domain
3. **[[What is exactly the Repository Pattern about]]**: Abstraction over data access
4. **[[Use Case Pattern]]**: Single-responsibility business operations
5. **[[Facade Pattern]]**: Simplified interface for complex subsystem
6. **[[Mapper Pattern]]**: Layer-specific model transformation
7. **[[Dependency Injection]]**: Angular's built-in DI system
8. **[[Reactive Programming]]**: RxJS Observables + Angular Signals

---

## 5. Code Examples

### Cross-Feature Data: Dashboard Pattern

### The Dashboard Challenge

Dashboards present a unique architectural challenge in Feature-Sliced Design:

- ✅ They are legitimate features (own route, UI, and business logic)
- ❌ They need data from multiple features without tight coupling
- 🎯 They must display aggregated statistics without duplicating business logic

### ✅ **Recommended Approach: Dedicated Backend Endpoint (Option 1)**

For dashboards displaying **basic statistics and aggregations**, use a dedicated backend endpoint.

#### When to Use:

- Dashboard shows simple metrics (counts, sums, averages, percentages)
- Statistics are primarily read-only and don't require complex client-side transformations
- Backend can efficiently calculate aggregations using SQL
- You want optimal performance (single HTTP request)
- The dashboard is a reporting/analytics view

#### Architecture:

```
┌─────────────────────────────────────────────────┐
│           Spring Boot Backend                   │
│                                                  │
│  /api/dashboard/stats → DashboardController     │
│       ↓                                          │
│  DashboardService (aggregates data from         │
│  ClienteService, ViviendaService, etc.)         │
│       ↓                                          │
│  Returns: DashboardStatsDto                     │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│        Angular Frontend - Dashboard Feature     │
│                                                  │
│  Data Layer:                                     │
│    - DashboardAnalyticsDataSource (HTTP call)   │
│    - DashboardStatsMapper (DTO → Model)         │
│    - DashboardRepositoryImpl                    │
│                                                  │
│  Domain Layer:                                   │
│    - DashboardStats model                       │
│    - GetDashboardStatsUseCase                   │
│                                                  │
│  Presentation Layer:                             │
│    - DashboardFacade (state management)         │
│    - DashboardPage (displays charts/cards)      │
└─────────────────────────────────────────────────┘
```

#### Benefits:

- ✅ **Performance**: Single HTTP request vs. multiple
- ✅ **Simplicity**: Dashboard feature remains decoupled from other features
- ✅ **Backend Optimization**: SQL aggregations are more efficient
- ✅ **Caching**: Easy to cache the endpoint response
- ✅ **Maintainability**: Statistics logic centralized in backend
- ✅ **Scalability**: Backend can handle complex queries efficiently

#### Implementation Example:

```typescript
// ========================================
// BACKEND (Spring Boot)
// ========================================

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    public DashboardStatsDto getStats() {
        return dashboardService.getAggregatedStats();
    }
}

@Service
public class DashboardService {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private ViviendaRepository viviendaRepository;

    @Autowired
    private SimulacionRepository simulacionRepository;

    public DashboardStatsDto getAggregatedStats() {
        return DashboardStatsDto.builder()
            .totalClientes(clienteRepository.count())
            .clientesNuevosEsteMes(clienteRepository.countCreatedAfter(getMonthStart()))
            .totalViviendas(viviendaRepository.count())
            .viviendasDisponibles(viviendaRepository.countByEstado("DISPONIBLE"))
            .simulacionesEsteMes(simulacionRepository.countCreatedAfter(getMonthStart()))
            .promedioMontoSimulado(simulacionRepository.averageMontoThisMonth())
            .actividadReciente(activityRepository.findTop10ByOrderByFechaDesc())
            .build();
    }
}

// ========================================
// FRONTEND (Angular)
// ========================================

// data/datasources/dashboard-analytics.datasource.ts
@Injectable({ providedIn: 'root' })
export class DashboardAnalyticsDataSource {
  private readonly apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStatsDto> {
    return this.http.get<DashboardStatsDto>(`${this.apiUrl}/stats`);
  }
}

// domain/models/dashboard-stats.model.ts
export interface DashboardStats {
  clientes: ClienteStats;
  viviendas: ViviendaStats;
  simulaciones: SimulacionStats;
  actividadReciente: Activity[];
}

export interface ClienteStats {
  total: number;
  nuevosEsteMes: number;
  crecimientoMensual: number;
}

// domain/usecases/get-dashboard-stats.usecase.ts
@Injectable()
export class GetDashboardStatsUseCase {
  constructor(private repository: DashboardRepository) {}

  execute(): Observable<DashboardStats> {
    return this.repository.getStats();
  }
}

// presentation/state/dashboard.facade.ts
@Injectable()
export class DashboardFacade {
  private state = signal<DashboardState>({
    stats: null,
    loading: false,
    error: null
  });

  stats = computed(() => this.state().stats);
  loading = computed(() => this.state().loading);

  constructor(private getDashboardStatsUseCase: GetDashboardStatsUseCase) {}

  loadStats(): void {
    this.updateState({ loading: true, error: null });

    this.getDashboardStatsUseCase.execute()
      .pipe(take(1))
      .subscribe({
        next: (stats) => {
          this.updateState({ stats, loading: false });
        },
        error: (error) => {
          this.updateState({
            error: error.message,
            loading: false
          });
        }
      });
  }
}
```

---

### ⚠️ **Alternative Approach: Frontend Aggregation (Option 2)**

For dashboards requiring **complex client-side calculations** or **frontend-specific business logic**.

#### When to Use:

- Dashboard performs complex financial calculations (TIR, VAN, NPV, IRR)
- You need real-time transformations that can't be pre-computed
- The calculations require frontend-specific libraries or algorithms
- Backend cannot or should not perform these calculations
- You need to combine data from multiple sources with custom aggregation logic

#### Architecture:

```
┌─────────────────────────────────────────────────┐
│        Angular Frontend - Dashboard Feature     │
│                                                  │
│  Domain Layer:                                   │
│    - Imports repository INTERFACES (contracts)  │
│      from other features                        │
│    - ClienteRepository (interface)              │
│    - ViviendaRepository (interface)             │
│    - SimulacionRepository (interface)           │
│                                                  │
│    - CalculatePortfolioMetricsUseCase           │
│      (performs complex aggregations)            │
│                                                  │
│  Data Layer: N/A (uses other features' repos)   │
│                                                  │
│  Presentation Layer:                             │
│    - DashboardFacade (orchestrates use cases)   │
└─────────────────────────────────────────────────┘
                    ↓
         Uses repositories from:
    Clientes, Viviendas, Simulador features
```

#### Implementation Example:

```typescript
// domain/usecases/calculate-portfolio-metrics.usecase.ts
import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

// Import ONLY repository interfaces (contracts)
import { ClienteRepository } from '../../clientes/domain/repositories/cliente.repository';
import { ViviendaRepository } from '../../viviendas/domain/repositories/vivienda.repository';
import { SimulacionRepository } from '../../simulador/domain/repositories/simulacion.repository';

@Injectable()
export class CalculatePortfolioMetricsUseCase {
  constructor(
    private clienteRepo: ClienteRepository,
    private viviendaRepo: ViviendaRepository,
    private simulacionRepo: SimulacionRepository
  ) {}

  execute(): Observable<PortfolioMetrics> {
    return forkJoin({
      clientes: this.clienteRepo.getAll(),
      viviendas: this.viviendaRepo.getAll(),
      simulaciones: this.simulacionRepo.getRecent(30),
    }).pipe(
      map(({ clientes, viviendas, simulaciones }) => {
        // Complex financial calculations here
        const portfolioValue = this.calculateNPV(viviendas);
        const irr = this.calculateIRR(simulaciones);
        const riskScore = this.calculateRiskScore(clientes, simulaciones);

        return {
          totalValue: portfolioValue,
          internalRateOfReturn: irr,
          riskScore,
          projectedGrowth: this.projectGrowth(simulaciones),
        };
      })
    );
  }

  private calculateNPV(viviendas: Vivienda[]): number {
    // Complex NPV calculation logic
    return viviendas.reduce((npv, v) => {
      return npv + v.precioVenta / Math.pow(1.1, v.añosEnMercado);
    }, 0);
  }

  private calculateIRR(simulaciones: Simulacion[]): number {
    // Complex IRR calculation using Newton-Raphson
    // ... implementation
  }
}

// dashboard.routes.ts
import { Routes } from '@angular/router';

// Import repository implementations from other features
import { ClienteRepository } from '../clientes/domain/repositories/cliente.repository';
import { ClienteRepositoryImpl } from '../clientes/data/repositories/cliente.repository.impl';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    providers: [
      // Provide implementations from other features
      { provide: ClienteRepository, useClass: ClienteRepositoryImpl },
      { provide: ViviendaRepository, useClass: ViviendaRepositoryImpl },

      // Dashboard-specific use cases
      CalculatePortfolioMetricsUseCase,
      GetDashboardStatsUseCase,
    ],
    children: [
      {
        path: '',
        loadComponent: () => import('./presentation/pages/dashboard-page/dashboard-page.component'),
      },
    ],
  },
];
```

#### Trade-offs:

| Aspect              | Option 1 (Backend Endpoint) | Option 2 (Frontend Aggregation)     |
| ------------------- | --------------------------- | ----------------------------------- |
| **Performance**     | ✅ Single HTTP request      | ❌ Multiple parallel requests       |
| **Complexity**      | ✅ Simple frontend          | ❌ Complex frontend logic           |
| **Backend Load**    | ⚠️ Backend does work        | ✅ Offloads to client               |
| **Maintainability** | ✅ Centralized logic        | ⚠️ Distributed logic                |
| **Flexibility**     | ⚠️ Requires backend changes | ✅ Fast iteration                   |
| **Caching**         | ✅ Easy to cache            | ⚠️ Complex cache strategy           |
| **Coupling**        | ✅ Low coupling             | ⚠️ Medium coupling (multiple repos) |

---

### 🎯 **Decision Matrix**

**Use Option 1 (Backend Endpoint) when:**

- ✅ Dashboard shows counts, sums, averages, percentages
- ✅ Statistics are primarily for display/reporting
- ✅ Backend can efficiently calculate with SQL
- ✅ Performance is critical (fewer HTTP requests)
- ✅ You want to cache statistics easily
- ✅ The dashboard is relatively static

**Use Option 2 (Frontend Aggregation) when:**

- ✅ Complex financial calculations (NPV, IRR, WACC)
- ✅ Client-side data transformations required
- ✅ Real-time projections/simulations needed
- ✅ Backend cannot/should not do calculations
- ✅ Need to use specialized frontend libraries
- ✅ Combining data requires custom logic

**For most analytics dashboards:** ✅ **Use Option 1**

---

### Domain Layer Example (Clientes Feature)

```typescript
// domain/models/cliente.model.ts
export interface Cliente {
  id?: number;
  nombreCompleto: string;
  dni: string;
  telefono: string;
  email: string;
  ingresoMensual: number;
  ocupacion?: string;
}

export class ClienteValidator {
  static isValid(cliente: Cliente): boolean {
    return (
      cliente.nombreCompleto.trim().length > 0 &&
      this.isDniValid(cliente.dni) &&
      cliente.email.includes('@') &&
      cliente.ingresoMensual > 0
    );
  }

  static isDniValid(dni: string): boolean {
    return /^\d{8}$/.test(dni);
  }

  static canApplyForLoan(ingresoMensual: number, cuotaMensual: number): boolean {
    const ratio = cuotaMensual / ingresoMensual;
    return ratio <= 0.35; // Max 35% of income
  }
}

// domain/repositories/cliente.repository.ts
import { Observable } from 'rxjs';
import { Cliente } from '../models/cliente.model';

export abstract class ClienteRepository {
  abstract getAll(): Observable<Cliente[]>;
  abstract getById(id: number): Observable<Cliente>;
  abstract create(cliente: Cliente): Observable<Cliente>;
  abstract update(id: number, cliente: Cliente): Observable<Cliente>;
  abstract delete(id: number): Observable<void>;
  abstract search(query: string): Observable<Cliente[]>;
}

// domain/usecases/get-clientes.usecase.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ClienteRepository } from '../repositories/cliente.repository';
import { Cliente } from '../models/cliente.model';

@Injectable()
export class GetClientesUseCase {
  constructor(private repository: ClienteRepository) {}

  execute(): Observable<Cliente[]> {
    return this.repository.getAll();
  }
}

// domain/usecases/create-cliente.usecase.ts
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ClienteRepository } from '../repositories/cliente.repository';
import { Cliente, ClienteValidator } from '../models/cliente.model';

@Injectable()
export class CreateClienteUseCase {
  constructor(private repository: ClienteRepository) {}

  execute(cliente: Cliente): Observable<Cliente> {
    if (!ClienteValidator.isValid(cliente)) {
      return throwError(() => new Error('Datos de cliente inválidos'));
    }
    return this.repository.create(cliente);
  }
}

// domain/usecases/search-clientes.usecase.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ClienteRepository } from '../repositories/cliente.repository';
import { Cliente } from '../models/cliente.model';

@Injectable()
export class SearchClientesUseCase {
  constructor(private repository: ClienteRepository) {}

  execute(query: string): Observable<Cliente[]> {
    if (query.trim().length === 0) {
      return this.repository.getAll();
    }
    return this.repository.search(query);
  }
}
```

### Data Layer Example (Clientes Feature)

```typescript
// data/dtos/cliente.dto.ts
export interface ClienteDto {
  id?: number;
  nombreCompleto: string;
  dni: string;
  telefono: string;
  email: string;
  ingresoMensual: number;
  ocupacion?: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface CreateClienteDto {
  nombreCompleto: string;
  dni: string;
  telefono: string;
  email: string;
  ingresoMensual: number;
  ocupacion?: string;
}

export interface UpdateClienteDto {
  nombreCompleto?: string;
  telefono?: string;
  email?: string;
  ingresoMensual?: number;
  ocupacion?: string;
}

// data/datasources/cliente.datasource.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ClienteDto, CreateClienteDto, UpdateClienteDto } from '../dtos/cliente.dto';

@Injectable({ providedIn: 'root' })
export class ClienteDataSource {
  private readonly apiUrl = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ClienteDto[]> {
    return this.http.get<ClienteDto[]>(this.apiUrl);
  }

  getById(id: number): Observable<ClienteDto> {
    return this.http.get<ClienteDto>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateClienteDto): Observable<ClienteDto> {
    return this.http.post<ClienteDto>(this.apiUrl, dto);
  }

  update(id: number, dto: UpdateClienteDto): Observable<ClienteDto> {
    return this.http.put<ClienteDto>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  search(query: string): Observable<ClienteDto[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<ClienteDto[]>(`${this.apiUrl}/search`, { params });
  }
}

// data/mappers/cliente.mapper.ts
import { Injectable } from '@angular/core';
import { Cliente } from '../../domain/models/cliente.model';
import { ClienteDto, CreateClienteDto, UpdateClienteDto } from '../dtos/cliente.dto';

@Injectable({ providedIn: 'root' })
export class ClienteMapper {
  toModel(dto: ClienteDto): Cliente {
    return {
      id: dto.id,
      nombreCompleto: dto.nombreCompleto,
      dni: dto.dni,
      telefono: dto.telefono,
      email: dto.email,
      ingresoMensual: dto.ingresoMensual,
      ocupacion: dto.ocupacion,
    };
  }

  toCreateDto(model: Cliente): CreateClienteDto {
    return {
      nombreCompleto: model.nombreCompleto,
      dni: model.dni,
      telefono: model.telefono,
      email: model.email,
      ingresoMensual: model.ingresoMensual,
      ocupacion: model.ocupacion,
    };
  }

  toUpdateDto(model: Cliente): UpdateClienteDto {
    return {
      nombreCompleto: model.nombreCompleto,
      telefono: model.telefono,
      email: model.email,
      ingresoMensual: model.ingresoMensual,
      ocupacion: model.ocupacion,
    };
  }

  toModelArray(dtos: ClienteDto[]): Cliente[] {
    return dtos.map((dto) => this.toModel(dto));
  }
}

// data/repositories/cliente.repository.impl.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClienteRepository } from '../../domain/repositories/cliente.repository';
import { Cliente } from '../../domain/models/cliente.model';
import { ClienteDataSource } from '../datasources/cliente.datasource';
import { ClienteMapper } from '../mappers/cliente.mapper';

@Injectable({ providedIn: 'root' })
export class ClienteRepositoryImpl extends ClienteRepository {
  constructor(private dataSource: ClienteDataSource, private mapper: ClienteMapper) {
    super();
  }

  getAll(): Observable<Cliente[]> {
    return this.dataSource.getAll().pipe(map((dtos) => this.mapper.toModelArray(dtos)));
  }

  getById(id: number): Observable<Cliente> {
    return this.dataSource.getById(id).pipe(map((dto) => this.mapper.toModel(dto)));
  }

  create(cliente: Cliente): Observable<Cliente> {
    const dto = this.mapper.toCreateDto(cliente);
    return this.dataSource.create(dto).pipe(map((responseDto) => this.mapper.toModel(responseDto)));
  }

  update(id: number, cliente: Cliente): Observable<Cliente> {
    const dto = this.mapper.toUpdateDto(cliente);
    return this.dataSource
      .update(id, dto)
      .pipe(map((responseDto) => this.mapper.toModel(responseDto)));
  }

  delete(id: number): Observable<void> {
    return this.dataSource.delete(id);
  }

  search(query: string): Observable<Cliente[]> {
    return this.dataSource.search(query).pipe(map((dtos) => this.mapper.toModelArray(dtos)));
  }
}
```

### Presentation Layer Example (Clientes Feature)

```typescript
// presentation/state/clientes.state.ts
import { Cliente } from '../../domain/models/cliente.model';

export interface ClientesState {
  clientes: Cliente[];
  selectedCliente: Cliente | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
}

export const initialClientesState: ClientesState = {
  clientes: [],
  selectedCliente: null,
  loading: false,
  error: null,
  searchQuery: '',
};

// presentation/state/clientes.facade.ts
import { Injectable, signal, computed } from '@angular/core';
import { take } from 'rxjs/operators';
import { ClientesState, initialClientesState } from './clientes.state';
import { GetClientesUseCase } from '../../domain/usecases/get-clientes.usecase';
import { GetClienteByIdUseCase } from '../../domain/usecases/get-cliente-by-id.usecase';
import { CreateClienteUseCase } from '../../domain/usecases/create-cliente.usecase';
import { UpdateClienteUseCase } from '../../domain/usecases/update-cliente.usecase';
import { DeleteClienteUseCase } from '../../domain/usecases/delete-cliente.usecase';
import { SearchClientesUseCase } from '../../domain/usecases/search-clientes.usecase';
import { Cliente } from '../../domain/models/cliente.model';

@Injectable()
export class ClientesFacade {
  // State signals
  private state = signal<ClientesState>(initialClientesState);

  // Computed signals (derived state)
  clientes = computed(() => this.state().clientes);
  selectedCliente = computed(() => this.state().selectedCliente);
  loading = computed(() => this.state().loading);
  error = computed(() => this.state().error);
  searchQuery = computed(() => this.state().searchQuery);

  // Computed: filtered clientes
  filteredClientes = computed(() => {
    const query = this.state().searchQuery.toLowerCase();
    if (!query) return this.state().clientes;

    return this.state().clientes.filter(
      (c) => c.nombreCompleto.toLowerCase().includes(query) || c.dni.includes(query)
    );
  });

  constructor(
    private getClientesUseCase: GetClientesUseCase,
    private getClienteByIdUseCase: GetClienteByIdUseCase,
    private createClienteUseCase: CreateClienteUseCase,
    private updateClienteUseCase: UpdateClienteUseCase,
    private deleteClienteUseCase: DeleteClienteUseCase,
    private searchClientesUseCase: SearchClientesUseCase
  ) {}

  loadClientes(): void {
    this.updateState({ loading: true, error: null });

    this.getClientesUseCase
      .execute()
      .pipe(take(1))
      .subscribe({
        next: (clientes) => {
          this.updateState({
            clientes,
            loading: false,
          });
        },
        error: (error) => {
          this.updateState({
            error: error.message || 'Error al cargar clientes',
            loading: false,
          });
        },
      });
  }

  loadClienteById(id: number): void {
    this.updateState({ loading: true, error: null });

    this.getClienteByIdUseCase
      .execute(id)
      .pipe(take(1))
      .subscribe({
        next: (cliente) => {
          this.updateState({
            selectedCliente: cliente,
            loading: false,
          });
        },
        error: (error) => {
          this.updateState({
            error: error.message || 'Error al cargar cliente',
            loading: false,
          });
        },
      });
  }

  createCliente(cliente: Cliente): void {
    this.updateState({ loading: true, error: null });

    this.createClienteUseCase
      .execute(cliente)
      .pipe(take(1))
      .subscribe({
        next: (newCliente) => {
          const currentClientes = this.state().clientes;
          this.updateState({
            clientes: [...currentClientes, newCliente],
            loading: false,
          });
        },
        error: (error) => {
          this.updateState({
            error: error.message || 'Error al crear cliente',
            loading: false,
          });
        },
      });
  }

  updateCliente(id: number, cliente: Cliente): void {
    this.updateState({ loading: true, error: null });

    this.updateClienteUseCase
      .execute(id, cliente)
      .pipe(take(1))
      .subscribe({
        next: (updatedCliente) => {
          const currentClientes = this.state().clientes;
          const updatedList = currentClientes.map((c) => (c.id === id ? updatedCliente : c));
          this.updateState({
            clientes: updatedList,
            loading: false,
          });
        },
        error: (error) => {
          this.updateState({
            error: error.message || 'Error al actualizar cliente',
            loading: false,
          });
        },
      });
  }

  deleteCliente(id: number): void {
    this.updateState({ loading: true, error: null });

    this.deleteClienteUseCase
      .execute(id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          const currentClientes = this.state().clientes;
          const filteredList = currentClientes.filter((c) => c.id !== id);
          this.updateState({
            clientes: filteredList,
            loading: false,
          });
        },
        error: (error) => {
          this.updateState({
            error: error.message || 'Error al eliminar cliente',
            loading: false,
          });
        },
      });
  }

  searchClientes(query: string): void {
    this.updateState({ searchQuery: query, loading: true, error: null });

    this.searchClientesUseCase
      .execute(query)
      .pipe(take(1))
      .subscribe({
        next: (clientes) => {
          this.updateState({
            clientes,
            loading: false,
          });
        },
        error: (error) => {
          this.updateState({
            error: error.message || 'Error en la búsqueda',
            loading: false,
          });
        },
      });
  }

  clearError(): void {
    this.updateState({ error: null });
  }

  clearSelectedCliente(): void {
    this.updateState({ selectedCliente: null });
  }

  private updateState(partial: Partial<ClientesState>): void {
    this.state.update((current) => ({ ...current, ...partial }));
  }
}

// presentation/pages/clientes-page/clientes-page.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClientesFacade } from '../../state/clientes.facade';
import { ClienteListComponent } from '../../components/cliente-list/cliente-list.component';
import { LoadingSpinnerComponent } from '../../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorViewComponent } from '../../../../../shared/components/error-view/error-view.component';

@Component({
  selector: 'app-clientes-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ClienteListComponent,
    LoadingSpinnerComponent,
    ErrorViewComponent,
  ],
  providers: [ClientesFacade],
  template: `
    <div class="container mx-auto p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Gestión de Clientes</h1>
        <button class="btn btn-primary" routerLink="./nuevo">+ Nuevo Cliente</button>
      </div>

      <div class="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o DNI..."
          class="input input-bordered w-full"
          [value]="facade.searchQuery()"
          (input)="onSearch($event)"
        />
      </div>

      @if (facade.loading()) {
      <app-loading-spinner />
      } @else if (facade.error()) {
      <app-error-view [message]="facade.error()!" (retry)="facade.loadClientes()" />
      } @else {
      <app-cliente-list
        [clientes]="facade.filteredClientes()"
        (edit)="onEdit($event)"
        (delete)="onDelete($event)"
      />
      }
    </div>
  `,
})
export class ClientesPageComponent implements OnInit {
  constructor(public facade: ClientesFacade) {}

  ngOnInit(): void {
    this.facade.loadClientes();
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.facade.searchClientes(query);
  }

  onEdit(id: number): void {
    // Navigate to edit page
  }

  onDelete(id: number): void {
    if (confirm('¿Está seguro de eliminar este cliente?')) {
      this.facade.deleteCliente(id);
    }
  }
}

// presentation/components/cliente-list/cliente-list.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Cliente } from '../../../domain/models/cliente.model';
import { CurrencyFormatPipe } from '../../../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe],
  template: `
    <div class="overflow-x-auto">
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th>DNI</th>
            <th>Nombre Completo</th>
            <th>Teléfono</th>
            <th>Ingreso Mensual</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for (cliente of clientes; track cliente.id) {
          <tr>
            <td>{{ cliente.dni }}</td>
            <td>{{ cliente.nombreCompleto }}</td>
            <td>{{ cliente.telefono }}</td>
            <td>{{ cliente.ingresoMensual | currencyFormat }}</td>
            <td>
              <button class="btn btn-sm btn-info mr-2" (click)="edit.emit(cliente.id!)">
                Editar
              </button>
              <button class="btn btn-sm btn-error" (click)="delete.emit(cliente.id!)">
                Eliminar
              </button>
            </td>
          </tr>
          } @empty {
          <tr>
            <td colspan="5" class="text-center">No se encontraron clientes</td>
          </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class ClienteListComponent {
  @Input() clientes: Cliente[] = [];
  @Output() edit = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();
}

// presentation/components/cliente-form/cliente-form.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Cliente } from '../../../domain/models/cliente.model';
import { DniValidator } from '../../../../../shared/validators/dni.validator';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
      <div class="form-control">
        <label class="label">
          <span class="label-text">Nombre Completo *</span>
        </label>
        <input
          type="text"
          formControlName="nombreCompleto"
          class="input input-bordered"
          [class.input-error]="isFieldInvalid('nombreCompleto')"
        />
        @if (isFieldInvalid('nombreCompleto')) {
        <label class="label">
          <span class="label-text-alt text-error"> El nombre es requerido </span>
        </label>
        }
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">DNI *</span>
        </label>
        <input
          type="text"
          formControlName="dni"
          class="input input-bordered"
          maxlength="8"
          [class.input-error]="isFieldInvalid('dni')"
        />
        @if (isFieldInvalid('dni')) {
        <label class="label">
          <span class="label-text-alt text-error"> DNI debe tener 8 dígitos </span>
        </label>
        }
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Teléfono *</span>
        </label>
        <input
          type="text"
          formControlName="telefono"
          class="input input-bordered"
          [class.input-error]="isFieldInvalid('telefono')"
        />
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Email *</span>
        </label>
        <input
          type="email"
          formControlName="email"
          class="input input-bordered"
          [class.input-error]="isFieldInvalid('email')"
        />
        @if (isFieldInvalid('email')) {
        <label class="label">
          <span class="label-text-alt text-error"> Email inválido </span>
        </label>
        }
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Ingreso Mensual S/ *</span>
        </label>
        <input
          type="number"
          formControlName="ingresoMensual"
          class="input input-bordered"
          [class.input-error]="isFieldInvalid('ingresoMensual')"
        />
      </div>

      <div class="form-control">
        <label class="label">
          <span class="label-text">Ocupación</span>
        </label>
        <input type="text" formControlName="ocupacion" class="input input-bordered" />
      </div>

      <div class="flex gap-2">
        <button type="submit" class="btn btn-primary" [disabled]="form.invalid || loading">
          {{ submitText }}
        </button>
        <button type="button" class="btn btn-ghost" (click)="cancel.emit()">Cancelar</button>
      </div>
    </form>
  `,
})
export class ClienteFormComponent implements OnInit {
  @Input() cliente?: Cliente;
  @Input() loading = false;
  @Input() submitText = 'Guardar';
  @Output() submit = new EventEmitter<Cliente>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    if (this.cliente) {
      this.form.patchValue(this.cliente);
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      nombreCompleto: ['', [Validators.required, Validators.minLength(3)]],
      dni: ['', [Validators.required, DniValidator.validate]],
      telefono: ['', [Validators.required, Validators.minLength(9)]],
      email: ['', [Validators.required, Validators.email]],
      ingresoMensual: [0, [Validators.required, Validators.min(1)]],
      ocupacion: [''],
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.form.valid) {
      const clienteData: Cliente = {
        ...this.form.value,
        id: this.cliente?.id,
      };
      this.submit.emit(clienteData);
    }
  }
}
```

### Simulador Feature Example (Complex Business Logic)

```typescript
// domain/services/calculadora-francesa.service.ts
import { Injectable } from '@angular/core';
import { Cuota } from '../models/cuota.model';
import { Configuracion } from '../models/configuracion.model';

@Injectable({ providedIn: 'root' })
export class CalculadoraFrancesaService {
  calcularTEM(tea: number): number {
    return Math.pow(1 + tea, 1 / 12) - 1;
  }

  convertirTasaNominalAEfectiva(tasaNominal: number, capitalizacion: number): number {
    return Math.pow(1 + tasaNominal / capitalizacion, capitalizacion) - 1;
  }

  calcularCuotaMensual(monto: number, tem: number, plazoMeses: number): number {
    if (tem === 0) return monto / plazoMeses;

    const numerador = tem * Math.pow(1 + tem, plazoMeses);
    const denominador = Math.pow(1 + tem, plazoMeses) - 1;

    return monto * (numerador / denominador);
  }

  generarCronograma(
    montoFinanciar: number,
    tem: number,
    plazoAnios: number,
    configuracion: Configuracion
  ): Cuota[] {
    const plazoMeses = plazoAnios * 12;
    const cuotaMensual = this.calcularCuotaMensual(montoFinanciar, tem, plazoMeses);
    const cronograma: Cuota[] = [];
    let saldoActual = montoFinanciar;

    for (let mes = 1; mes <= plazoMeses; mes++) {
      let cuota: number;
      let interes: number;
      let capital: number;

      // Periodo de gracia total
      if (configuracion.tipoGracia === 'TOTAL' && mes <= configuracion.mesesGracia) {
        interes = saldoActual * tem;
        cuota = 0;
        capital = 0;
        saldoActual += interes;
      }
      // Periodo de gracia parcial
      else if (configuracion.tipoGracia === 'PARCIAL' && mes <= configuracion.mesesGracia) {
        interes = saldoActual * tem;
        cuota = interes;
        capital = 0;
      }
      // Cuota normal
      else {
        interes = saldoActual * tem;
        cuota = cuotaMensual;
        capital = cuota - interes;
        saldoActual -= capital;
      }

      cronograma.push({
        numero: mes,
        fecha: this.calcularFechaCuota(mes),
        saldoInicial: saldoActual + capital,
        cuota: this.redondear(cuota),
        capital: this.redondear(capital),
        interes: this.redondear(interes),
        saldoFinal: this.redondear(saldoActual),
      });
    }

    // Ajustar última cuota por redondeo
    this.ajustarUltimaCuota(cronograma);

    return cronograma;
  }

  private calcularFechaCuota(mes: number): Date {
    const fecha = new Date();
    fecha.setMonth(fecha.getMonth() + mes);
    return fecha;
  }

  private redondear(valor: number): number {
    return Math.round(valor * 100) / 100;
  }

  private ajustarUltimaCuota(cronograma: Cuota[]): void {
    const ultimaCuota = cronograma[cronograma.length - 1];
    if (Math.abs(ultimaCuota.saldoFinal) < 1) {
      ultimaCuota.capital += ultimaCuota.saldoFinal;
      ultimaCuota.cuota = ultimaCuota.capital + ultimaCuota.interes;
      ultimaCuota.saldoFinal = 0;
    }
  }
}

// domain/services/indicadores-financieros.service.ts
import { Injectable } from '@angular/core';
import { Cuota } from '../models/cuota.model';

@Injectable({ providedIn: 'root' })
export class IndicadoresFinancierosService {
  calcularVAN(inversion: number, cuotas: number[], tasaDescuento: number = 0.1): number {
    const tasaMensual = Math.pow(1 + tasaDescuento, 1 / 12) - 1;
    let van = -inversion;

    cuotas.forEach((cuota, index) => {
      van += cuota / Math.pow(1 + tasaMensual, index + 1);
    });

    return this.redondear(van);
  }

  calcularTIR(inversion: number, cuotas: number[]): number {
    let tasaMin = 0;
    let tasaMax = 1;
    const precision = 0.0001;

    while (tasaMax - tasaMin > precision) {
      const tasaMedia = (tasaMin + tasaMax) / 2;
      const vanTest = this.calcularVAN(inversion, cuotas, tasaMedia);

      if (vanTest > 0) {
        tasaMin = tasaMedia;
      } else {
        tasaMax = tasaMedia;
      }
    }

    const tirMensual = (tasaMin + tasaMax) / 2;
    const tirAnual = Math.pow(1 + tirMensual, 12) - 1;

    return this.redondear(tirAnual * 100);
  }

  calcularTCEA(
    montoDesembolsado: number,
    cronograma: Cuota[],
    comisionApertura: number,
    gastosNotariales: number
  ): number {
    const seguroIncendio = 50;
    const tasaSeguroDesgravamen = 0.0005;

    const cuotasConCostos = cronograma.map((cuota) => {
      const seguroDesgravamen = cuota.saldoInicial * tasaSeguroDesgravamen;
      return cuota.cuota + seguroDesgravamen + seguroIncendio;
    });

    const montoTotal = montoDesembolsado - comisionApertura - gastosNotariales;
    const tir = this.calcularTIR(montoTotal, cuotasConCostos);

    return tir;
  }

  private redondear(valor: number): number {
    return Math.round(valor * 100) / 100;
  }
}
```

### Dependency Injection & Module Configuration

```typescript
// clientes/clientes.routes.ts
import { Routes } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

// Domain layer providers
import { ClienteRepository } from './domain/repositories/cliente.repository';
import { GetClientesUseCase } from './domain/usecases/get-clientes.usecase';
import { GetClienteByIdUseCase } from './domain/usecases/get-cliente-by-id.usecase';
import { CreateClienteUseCase } from './domain/usecases/create-cliente.usecase';
import { UpdateClienteUseCase } from './domain/usecases/update-cliente.usecase';
import { DeleteClienteUseCase } from './domain/usecases/delete-cliente.usecase';
import { SearchClientesUseCase } from './domain/usecases/search-clientes.usecase';

// Data layer providers
import { ClienteRepositoryImpl } from './data/repositories/cliente.repository.impl';

export const CLIENTES_ROUTES: Routes = [
  {
    path: '',
    providers: [
      // Repository implementation
      { provide: ClienteRepository, useClass: ClienteRepositoryImpl },

      // Use cases
      GetClientesUseCase,
      GetClienteByIdUseCase,
      CreateClienteUseCase,
      UpdateClienteUseCase,
      DeleteClienteUseCase,
      SearchClientesUseCase,
    ],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./presentation/pages/clientes-page/clientes-page.component').then(
            (m) => m.ClientesPageComponent
          ),
      },
      {
        path: 'nuevo',
        loadComponent: () =>
          import('./presentation/pages/cliente-create-page/cliente-create-page.component').then(
            (m) => m.ClienteCreatePageComponent
          ),
      },
      {
        path: ':id/editar',
        loadComponent: () =>
          import('./presentation/pages/cliente-edit-page/cliente-edit-page.component').then(
            (m) => m.ClienteEditPageComponent
          ),
      },
    ],
  },
];

// app.routes.ts (Main application routes)
import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/presentation/pages/login-page/login-page.component').then(
        (m) => m.LoginPageComponent
      ),
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  },
  {
    path: 'clientes',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/clientes/clientes.routes').then((m) => m.CLIENTES_ROUTES),
  },
  {
    path: 'viviendas',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/viviendas/viviendas.routes').then((m) => m.VIVIENDAS_ROUTES),
  },
  {
    path: 'simulador',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/simulador/simulador.routes').then((m) => m.SIMULADOR_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
```

---

## 6. Key Trade-offs

### Pros

- ✅ **Clear Feature Boundaries**: Each feature is self-contained and independent
- ✅ **High Testability**: Each layer can be tested in isolation
- ✅ **Maintainability**: Easy to locate and modify code by feature
- ✅ **Scalability**: Add new features without affecting existing ones
- ✅ **Backend Alignment**: Structure mirrors Spring Boot NTier architecture
- ✅ **Team Collaboration**: Multiple developers can work on different features
- ✅ **Framework Independence**: Domain layer has no Angular dependencies
- ✅ **Type Safety**: Full TypeScript type checking across all layers
- ✅ **Native Reactivity**: Angular Signals provide simple state management
- ✅ **Lazy Loading**: Features load on-demand, improving initial load time

### Cons

- ❌ **More Boilerplate**: Requires interfaces, implementations, and mappers
- ❌ **Learning Curve**: Team needs to understand multiple architectural patterns
- ❌ **Initial Setup Time**: Takes longer to set up compared to simple architectures
- ❌ **More Files**: Each feature has multiple files across three layers
- ❌ **Potential Over-engineering**: May be too complex for very simple CRUD applications

---

## 7. When to Use This Structure

### ✅ Use this structure when:

- Building a medium to large-scale business application (10+ screens)
- Working with a team of 2+ frontend developers
- Your backend uses Clean Architecture or NTier architecture
- Long-term maintenance is expected (2+ years)
- Business logic is complex and evolves frequently
- Multiple features/domains need clear separation
- You need high test coverage and maintainability
- The application will scale with new features over time
- Team is comfortable with TypeScript and Angular
- Project has adequate time for proper architecture setup

### ❌ Consider simpler alternatives when:

- Building a simple CRUD application with minimal business logic
- Working solo on a small project (< 5 screens)
- Tight MVP deadline (< 2 weeks)
- The application is a prototype or proof of concept
- Team is completely unfamiliar with Clean Architecture
- Project is a one-off tool with no future maintenance
- Business logic is trivial (simple form submissions)
- The entire app is just a wrapper around a backend API

---

## 8. Testing Strategy

### Unit Tests

**Domain Layer (Pure Business Logic)**

Test use cases and domain services without any framework dependencies:

```typescript
// domain/usecases/create-cliente.usecase.spec.ts
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CreateClienteUseCase } from './create-cliente.usecase';
import { ClienteRepository } from '../repositories/cliente.repository';
import { Cliente, ClienteValidator } from '../models/cliente.model';

describe('CreateClienteUseCase', () => {
  let useCase: CreateClienteUseCase;
  let mockRepository: jasmine.SpyObj<ClienteRepository>;

  beforeEach(() => {
    mockRepository = jasmine.createSpyObj('ClienteRepository', ['create']);

    TestBed.configureTestingModule({
      providers: [CreateClienteUseCase, { provide: ClienteRepository, useValue: mockRepository }],
    });

    useCase = TestBed.inject(CreateClienteUseCase);
  });

  it('should create cliente when data is valid', (done) => {
    const validCliente: Cliente = {
      nombreCompleto: 'Juan Pérez',
      dni: '12345678',
      telefono: '987654321',
      email: 'juan@example.com',
      ingresoMensual: 3000,
    };

    const expectedResult: Cliente = { ...validCliente, id: 1 };
    mockRepository.create.and.returnValue(of(expectedResult));

    useCase.execute(validCliente).subscribe({
      next: (result) => {
        expect(result).toEqual(expectedResult);
        expect(mockRepository.create).toHaveBeenCalledWith(validCliente);
        done();
      },
    });
  });

  it('should throw error when cliente data is invalid', (done) => {
    const invalidCliente: Cliente = {
      nombreCompleto: '',
      dni: '123', // Invalid DNI
      telefono: '987654321',
      email: 'invalid-email',
      ingresoMensual: -1000,
    };

    useCase.execute(invalidCliente).subscribe({
      error: (error) => {
        expect(error.message).toBe('Datos de cliente inválidos');
        expect(mockRepository.create).not.toHaveBeenCalled();
        done();
      },
    });
  });
});

// domain/services/calculadora-francesa.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { CalculadoraFrancesaService } from './calculadora-francesa.service';
import { Configuracion } from '../models/configuracion.model';

describe('CalculadoraFrancesaService', () => {
  let service: CalculadoraFrancesaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CalculadoraFrancesaService],
    });
    service = TestBed.inject(CalculadoraFrancesaService);
  });

  it('should calculate TEM correctly', () => {
    const tea = 0.12; // 12% annual
    const tem = service.calcularTEM(tea);

    expect(tem).toBeCloseTo(0.00949, 5);
  });

  it('should convert nominal to effective rate', () => {
    const tasaNominal = 0.12;
    const capitalizacion = 12;
    const tea = service.convertirTasaNominalAEfectiva(tasaNominal, capitalizacion);

    expect(tea).toBeCloseTo(0.1268, 4);
  });

  it('should calculate monthly payment correctly', () => {
    const monto = 100000;
    const tem = 0.01; // 1% monthly
    const plazoMeses = 12;

    const cuota = service.calcularCuotaMensual(monto, tem, plazoMeses);

    expect(cuota).toBeCloseTo(8884.88, 2);
  });

  it('should generate cronograma without grace period', () => {
    const config: Configuracion = {
      moneda: 'SOLES',
      tipoTasa: 'EFECTIVA',
      tipoGracia: 'SIN_GRACIA',
      mesesGracia: 0,
      capitalizacion: 12,
    };

    const cronograma = service.generarCronograma(100000, 0.01, 1, config);

    expect(cronograma.length).toBe(12);
    expect(cronograma[0].saldoInicial).toBe(100000);
    expect(cronograma[11].saldoFinal).toBeCloseTo(0, 2);
  });
});
```

**Data Layer (Repository & Mappers)**

Test repository implementations and data transformations:

```typescript
// data/repositories/cliente.repository.impl.spec.ts
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ClienteRepositoryImpl } from './cliente.repository.impl';
import { ClienteDataSource } from '../datasources/cliente.datasource';
import { ClienteMapper } from '../mappers/cliente.mapper';
import { ClienteDto } from '../dtos/cliente.dto';
import { Cliente } from '../../domain/models/cliente.model';

describe('ClienteRepositoryImpl', () => {
  let repository: ClienteRepositoryImpl;
  let mockDataSource: jasmine.SpyObj<ClienteDataSource>;
  let mapper: ClienteMapper;

  beforeEach(() => {
    mockDataSource = jasmine.createSpyObj('ClienteDataSource', [
      'getAll',
      'getById',
      'create',
      'update',
      'delete',
    ]);

    TestBed.configureTestingModule({
      providers: [
        ClienteRepositoryImpl,
        { provide: ClienteDataSource, useValue: mockDataSource },
        ClienteMapper,
      ],
    });

    repository = TestBed.inject(ClienteRepositoryImpl);
    mapper = TestBed.inject(ClienteMapper);
  });

  it('should fetch all clientes and map to domain models', (done) => {
    const dtos: ClienteDto[] = [
      {
        id: 1,
        nombreCompleto: 'Juan Pérez',
        dni: '12345678',
        telefono: '987654321',
        email: 'juan@example.com',
        ingresoMensual: 3000,
      },
    ];

    mockDataSource.getAll.and.returnValue(of(dtos));

    repository.getAll().subscribe({
      next: (clientes) => {
        expect(clientes.length).toBe(1);
        expect(clientes[0].nombreCompleto).toBe('Juan Pérez');
        expect(mockDataSource.getAll).toHaveBeenCalled();
        done();
      },
    });
  });

  it('should create cliente with proper DTO transformation', (done) => {
    const cliente: Cliente = {
      nombreCompleto: 'Juan Pérez',
      dni: '12345678',
      telefono: '987654321',
      email: 'juan@example.com',
      ingresoMensual: 3000,
    };

    const responseDto: ClienteDto = { ...cliente, id: 1 };
    mockDataSource.create.and.returnValue(of(responseDto));

    repository.create(cliente).subscribe({
      next: (result) => {
        expect(result.id).toBe(1);
        expect(mockDataSource.create).toHaveBeenCalled();
        done();
      },
    });
  });
});

// data/mappers/cliente.mapper.spec.ts
import { ClienteMapper } from './cliente.mapper';
import { ClienteDto } from '../dtos/cliente.dto';
import { Cliente } from '../../domain/models/cliente.model';

describe('ClienteMapper', () => {
  let mapper: ClienteMapper;

  beforeEach(() => {
    mapper = new ClienteMapper();
  });

  it('should map DTO to domain model', () => {
    const dto: ClienteDto = {
      id: 1,
      nombreCompleto: 'Juan Pérez',
      dni: '12345678',
      telefono: '987654321',
      email: 'juan@example.com',
      ingresoMensual: 3000,
      ocupacion: 'Ingeniero',
      fechaCreacion: '2024-01-01',
      fechaActualizacion: '2024-01-01',
    };

    const model = mapper.toModel(dto);

    expect(model.id).toBe(1);
    expect(model.nombreCompleto).toBe('Juan Pérez');
    expect(model.dni).toBe('12345678');
    expect(model.ocupacion).toBe('Ingeniero');
    // Note: fechaCreacion and fechaActualizacion are not mapped
  });

  it('should map domain model to create DTO', () => {
    const model: Cliente = {
      nombreCompleto: 'Juan Pérez',
      dni: '12345678',
      telefono: '987654321',
      email: 'juan@example.com',
      ingresoMensual: 3000,
      ocupacion: 'Ingeniero',
    };

    const dto = mapper.toCreateDto(model);

    expect(dto.id).toBeUndefined();
    expect(dto.nombreCompleto).toBe('Juan Pérez');
    expect(dto.fechaCreacion).toBeUndefined();
  });

  it('should map array of DTOs to domain models', () => {
    const dtos: ClienteDto[] = [
      {
        id: 1,
        nombreCompleto: 'Juan Pérez',
        dni: '12345678',
        telefono: '987654321',
        email: 'juan@example.com',
        ingresoMensual: 3000,
      },
      {
        id: 2,
        nombreCompleto: 'María García',
        dni: '87654321',
        telefono: '912345678',
        email: 'maria@example.com',
        ingresoMensual: 4000,
      },
    ];

    const models = mapper.toModelArray(dtos);

    expect(models.length).toBe(2);
    expect(models[0].nombreCompleto).toBe('Juan Pérez');
    expect(models[1].nombreCompleto).toBe('María García');
  });
});
```

**Presentation Layer (Facade & Components)**

Test state management and component logic:

```typescript
// presentation/state/clientes.facade.spec.ts
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ClientesFacade } from './clientes.facade';
import { GetClientesUseCase } from '../../domain/usecases/get-clientes.usecase';
import { CreateClienteUseCase } from '../../domain/usecases/create-cliente.usecase';
import { DeleteClienteUseCase } from '../../domain/usecases/delete-cliente.usecase';
import { Cliente } from '../../domain/models/cliente.model';

describe('ClientesFacade', () => {
  let facade: ClientesFacade;
  let mockGetUseCase: jasmine.SpyObj<GetClientesUseCase>;
  let mockCreateUseCase: jasmine.SpyObj<CreateClienteUseCase>;
  let mockDeleteUseCase: jasmine.SpyObj<DeleteClienteUseCase>;

  beforeEach(() => {
    mockGetUseCase = jasmine.createSpyObj('GetClientesUseCase', ['execute']);
    mockCreateUseCase = jasmine.createSpyObj('CreateClienteUseCase', ['execute']);
    mockDeleteUseCase = jasmine.createSpyObj('DeleteClienteUseCase', ['execute']);

    TestBed.configureTestingModule({
      providers: [
        ClientesFacade,
        { provide: GetClientesUseCase, useValue: mockGetUseCase },
        { provide: CreateClienteUseCase, useValue: mockCreateUseCase },
        { provide: DeleteClienteUseCase, useValue: mockDeleteUseCase },
      ],
    });

    facade = TestBed.inject(ClientesFacade);
  });

  it('should initialize with empty state', () => {
    expect(facade.clientes()).toEqual([]);
    expect(facade.loading()).toBe(false);
    expect(facade.error()).toBeNull();
  });

  it('should load clientes and update state', (done) => {
    const mockClientes: Cliente[] = [
      {
        id: 1,
        nombreCompleto: 'Juan Pérez',
        dni: '12345678',
        telefono: '987654321',
        email: 'juan@example.com',
        ingresoMensual: 3000,
      },
    ];

    mockGetUseCase.execute.and.returnValue(of(mockClientes));

    facade.loadClientes();

    setTimeout(() => {
      expect(facade.loading()).toBe(false);
      expect(facade.clientes()).toEqual(mockClientes);
      expect(facade.error()).toBeNull();
      done();
    }, 100);
  });

  it('should handle error when loading clientes fails', (done) => {
    const errorMessage = 'Network error';
    mockGetUseCase.execute.and.returnValue(throwError(() => new Error(errorMessage)));

    facade.loadClientes();

    setTimeout(() => {
      expect(facade.loading()).toBe(false);
      expect(facade.error()).toContain(errorMessage);
      expect(facade.clientes()).toEqual([]);
      done();
    }, 100);
  });

  it('should create cliente and add to state', (done) => {
    const newCliente: Cliente = {
      nombreCompleto: 'Juan Pérez',
      dni: '12345678',
      telefono: '987654321',
      email: 'juan@example.com',
      ingresoMensual: 3000,
    };

    const createdCliente: Cliente = { ...newCliente, id: 1 };
    mockCreateUseCase.execute.and.returnValue(of(createdCliente));

    facade.createCliente(newCliente);

    setTimeout(() => {
      expect(facade.clientes().length).toBe(1);
      expect(facade.clientes()[0].id).toBe(1);
      done();
    }, 100);
  });

  it('should delete cliente and remove from state', (done) => {
    // Setup initial state
    const mockClientes: Cliente[] = [
      {
        id: 1,
        nombreCompleto: 'Juan',
        dni: '12345678',
        telefono: '987654321',
        email: 'juan@test.com',
        ingresoMensual: 3000,
      },
      {
        id: 2,
        nombreCompleto: 'María',
        dni: '87654321',
        telefono: '912345678',
        email: 'maria@test.com',
        ingresoMensual: 4000,
      },
    ];

    mockGetUseCase.execute.and.returnValue(of(mockClientes));
    facade.loadClientes();

    setTimeout(() => {
      mockDeleteUseCase.execute.and.returnValue(of(undefined));
      facade.deleteCliente(1);

      setTimeout(() => {
        expect(facade.clientes().length).toBe(1);
        expect(facade.clientes()[0].id).toBe(2);
        done();
      }, 100);
    }, 100);
  });
});

// presentation/components/cliente-list/cliente-list.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClienteListComponent } from './cliente-list.component';
import { Cliente } from '../../../domain/models/cliente.model';

describe('ClienteListComponent', () => {
  let component: ClienteListComponent;
  let fixture: ComponentFixture<ClienteListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClienteListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ClienteListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display clientes in table', () => {
    const mockClientes: Cliente[] = [
      {
        id: 1,
        nombreCompleto: 'Juan Pérez',
        dni: '12345678',
        telefono: '987654321',
        email: 'juan@example.com',
        ingresoMensual: 3000,
      },
    ];

    component.clientes = mockClientes;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('td').textContent).toContain('12345678');
  });

  it('should emit edit event when edit button clicked', () => {
    spyOn(component.edit, 'emit');

    const mockClientes: Cliente[] = [
      {
        id: 1,
        nombreCompleto: 'Juan Pérez',
        dni: '12345678',
        telefono: '987654321',
        email: 'juan@example.com',
        ingresoMensual: 3000,
      },
    ];

    component.clientes = mockClientes;
    fixture.detectChanges();

    const editButton = fixture.nativeElement.querySelector('.btn-info');
    editButton.click();

    expect(component.edit.emit).toHaveBeenCalledWith(1);
  });

  it('should display empty message when no clientes', () => {
    component.clientes = [];
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('No se encontraron clientes');
  });
});
```

### Integration Tests

Test complete feature flows with mocked HTTP:

```typescript
// clientes.feature.integration.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClientesFacade } from './presentation/state/clientes.facade';
import { ClienteRepository } from './domain/repositories/cliente.repository';
import { ClienteRepositoryImpl } from './data/repositories/cliente.repository.impl';
import { GetClientesUseCase } from './domain/usecases/get-clientes.usecase';
import { CreateClienteUseCase } from './domain/usecases/create-cliente.usecase';
import { ClienteDataSource } from './data/datasources/cliente.datasource';
import { ClienteMapper } from './data/mappers/cliente.mapper';
import { environment } from '../../../environments/environment';
import { ClienteDto } from './data/dtos/cliente.dto';

describe('Clientes Feature Integration', () => {
  let facade: ClientesFacade;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ClientesFacade,
        ClienteDataSource,
        ClienteMapper,
        { provide: ClienteRepository, useClass: ClienteRepositoryImpl },
        GetClientesUseCase,
        CreateClienteUseCase,
      ],
    });

    facade = TestBed.inject(ClientesFacade);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load clientes from API', (done) => {
    const mockResponse: ClienteDto[] = [
      {
        id: 1,
        nombreCompleto: 'Juan Pérez',
        dni: '12345678',
        telefono: '987654321',
        email: 'juan@example.com',
        ingresoMensual: 3000,
      },
    ];

    facade.loadClientes();

    const req = httpMock.expectOne(`${environment.apiUrl}/clientes`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    setTimeout(() => {
      expect(facade.clientes().length).toBe(1);
      expect(facade.clientes()[0].nombreCompleto).toBe('Juan Pérez');
      done();
    }, 100);
  });

  it('should create cliente via API', (done) => {
    const newCliente = {
      nombreCompleto: 'María García',
      dni: '87654321',
      telefono: '912345678',
      email: 'maria@example.com',
      ingresoMensual: 4000,
    };

    const mockResponse: ClienteDto = { ...newCliente, id: 2 };

    facade.createCliente(newCliente);

    const req = httpMock.expectOne(`${environment.apiUrl}/clientes`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newCliente);
    req.flush(mockResponse);

    setTimeout(() => {
      expect(facade.clientes().length).toBe(1);
      expect(facade.clientes()[0].id).toBe(2);
      done();
    }, 100);
  });
});
```

### End-to-End Tests (Optional)

Test complete user flows using Cypress or Playwright:

```typescript
// e2e/clientes.e2e.spec.ts
describe('Clientes Feature E2E', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('admin@test.com');
    cy.get('input[name="password"]').type('password');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should display clientes list', () => {
    cy.visit('/clientes');
    cy.get('table').should('be.visible');
    cy.get('tbody tr').should('have.length.greaterThan', 0);
  });

  it('should create new cliente', () => {
    cy.visit('/clientes');
    cy.contains('Nuevo Cliente').click();

    cy.get('input[name="nombreCompleto"]').type('Juan Pérez Test');
    cy.get('input[name="dni"]').type('12345678');
    cy.get('input[name="telefono"]').type('987654321');
    cy.get('input[name="email"]').type('juan.test@example.com');
    cy.get('input[name="ingresoMensual"]').type('3000');

    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/clientes');
    cy.contains('Juan Pérez Test').should('be.visible');
  });

  it('should search clientes', () => {
    cy.visit('/clientes');
    cy.get('input[placeholder*="Buscar"]').type('Juan');
    cy.get('tbody tr').should('have.length.greaterThan', 0);
    cy.get('tbody').should('contain', 'Juan');
  });

  it('should delete cliente', () => {
    cy.visit('/clientes');
    cy.get('tbody tr').first().find('.btn-error').click();
    cy.on('window:confirm', () => true);
    cy.wait(500);
    // Verify cliente was removed
  });
});
```

---

## 9. Related Concepts

- [[Angular Clean Architecture]]
- [[Feature-Sliced Design]]
- [[Domain-Driven Design]]
- [[Repository Pattern]]
- [[Use Case Pattern]]
- [[Facade Pattern]]
- [[Mapper Pattern]]
- [[Dependency Injection]]
- [[SOLID Principles]]
- [[Dependency Inversion Principle]]
- [[Separation of Concerns]]
- [[Single Responsibility Principle]]
- [[Reactive Programming]]
- [[Angular Signals]]
- [[RxJS Observables]]
- [[Lazy Loading]]
- [[State Management Patterns]]

---

## 10. Additional Resources

### Official Documentation

- [Angular Architecture Guide](https://angular.dev/guide/architecture)
- [Angular Signals Documentation](https://angular.dev/guide/signals)
- [RxJS Official Guide](https://rxjs.dev/guide/overview)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

### Recommended Libraries/Tools

- **Angular Material**: UI component library for Material Design
- **TailwindCSS**: Utility-first CSS framework
- **RxJS**: Reactive programming library (built into Angular)
- **jsPDF**: PDF generation for reports
- **SheetJS (xlsx)**: Excel file generation
- **Angular DevTools**: Browser extension for debugging
- **Prettier**: Code formatter
- **ESLint**: Linting tool for TypeScript/JavaScript

### Community Examples

- [Angular Architecture Patterns](https://github.com/angular/angular/blob/main/aio/content/guide/architecture.md)
- [Enterprise Angular Applications](https://github.com/ngx-rocket/generator-ngx-rocket)
- [Angular Clean Architecture Example](https://github.com/Im-Rises/clean-architecture-angular)

### Books & Articles

- "Clean Architecture" by Robert C. Martin
- "Domain-Driven Design" by Eric Evans
- "Angular Development with TypeScript" by Yakov Fain
- [Feature-Sliced Design Documentation](https://feature-sliced.design/)
- [Angular Best Practices](https://angular.dev/best-practices)

---

## 11. Migration Notes

### From Legacy Angular Architecture

If you're migrating from a traditional Angular architecture (services + components):

**Phase 1: Preparation (Week 1)**

1. Identify business features in your current application
2. Map existing services to domain/data layers
3. Document dependencies between features
4. Create the new folder structure alongside existing code
5. Set up ESLint rules for layer boundaries

**Phase 2: Extract Shared Layer (Week 2)**

1. Move reusable components to `/shared/components/`
2. Extract common pipes to `/shared/pipes/`
3. Move validators to `/shared/validators/`
4. Create shared models in `/shared/models/`

**Phase 3: Migrate First Feature (Weeks 3-4)**

Choose the simplest, most isolated feature (often authentication or a simple CRUD):

1. Create feature folder structure: `/features/[feature-name]/`
2. **Domain Layer:**
   - Define domain models in `/domain/models/`
   - Create repository interfaces in `/domain/repositories/`
   - Extract business logic to use cases in `/domain/usecases/`
3. **Data Layer:**
   - Create DTOs matching API in `/data/dtos/`
   - Move HTTP calls to datasources in `/data/datasources/`
   - Create mappers in `/data/mappers/`
   - Implement repositories in `/data/repositories/`
4. **Presentation Layer:**
   - Move components to `/presentation/components/`
   - Create pages in `/presentation/pages/`
   - Implement facade in `/presentation/state/`
5. Update route configuration
6. Test thoroughly before proceeding

**Phase 4: Migrate Remaining Features (Weeks 5-10)**

1. Repeat Phase 3 for each remaining feature
2. Migrate one feature at a time to avoid breaking the build
3. Update cross-feature dependencies to use proper interfaces
4. Refactor shared code as you discover patterns

**Phase 5: Cleanup & Optimization (Week 11+)**

1. Remove old architecture files
2. Update documentation
3. Add comprehensive tests for all layers
4. Optimize lazy loading configuration
5. Review and refine layer boundaries
6. Create developer onboarding guide

### From Component-Heavy Architecture

If you have a lot of smart components with embedded business logic:

**Week 1-2: Extract Business Logic**

1. Identify business logic in components
2. Create use case classes for each business operation
3. Move logic from components to use cases
4. Keep components focused on presentation

**Week 3-4: Introduce Repository Pattern**

1. Create repository interfaces in domain layer
2. Move HTTP calls from components/services to repositories
3. Implement repositories in data layer
4. Update components to use repositories through use cases

**Week 5-6: Add State Management**

1. Create facade services for each feature
2. Move state from components to facades
3. Use Angular Signals for reactive state
4. Update components to consume facade signals

**Week 7-8: Organize by Feature**

1. Group related components, use cases, and repositories
2. Create feature modules with proper boundaries
3. Set up lazy loading for each feature
4. Update routing configuration

### Common Migration Pitfalls

1. **Trying to migrate everything at once**: Migrate incrementally, feature by feature
2. **Not setting up proper DI**: Ensure repository interfaces are properly provided
3. **Mixing old and new patterns**: Be consistent within each feature
4. **Over-abstracting**: Don't create unnecessary layers of indirection
5. **Ignoring tests**: Write tests as you migrate to catch regressions
6. **Not documenting**: Keep team informed of architecture decisions

### Checklist Before Migration

- [ ] Team understands Clean Architecture principles
- [ ] Backend API contracts are stable and documented
- [ ] Existing test coverage is adequate
- [ ] Git branching strategy is defined (feature branches recommended)
- [ ] Development environment is set up with Angular 19+
- [ ] Team capacity is available (avoid during critical releases)
- [ ] Rollback plan is documented
- [ ] Code review process adapted for new architecture

### Post-Migration Validation

- [ ] All features working as before
- [ ] No direct imports between features
- [ ] Domain layer has no Angular dependencies
- [ ] Repository interfaces properly implemented
- [ ] Facades managing state correctly
- [ ] Lazy loading working for all features
- [ ] Tests passing at all layers
- [ ] Build times acceptable
- [ ] Bundle sizes optimized
- [ ] Team comfortable with new structure
- [ ] Documentation complete and accessible
