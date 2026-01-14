---
title: 'Project Structure: Angular Authentication & Document Viewer Application'
date: 2024-12-06
tags:
  - project-structure
  - architecture
  - angular
  - authentication
  - document-management
stack:
  - TypeScript
  - Angular 18 (LTS)
  - RxJS 7.8+
  - Angular Signals
  - RxJS Observables
  - Angular HttpClient
  - HTTP Interceptors
  - Angular Material (optional)
  - Tailwind CSS (optional)
principles:
  - '[[Feature-Based Architecture]]'
  - '[[Smart and Presentational Components]]'
  - '[[Dependency Injection]]'
  - '[[Reactive Programming]]'
  - '[[Single Responsibility Principle]]'
---

## 1. Philosophy & Guiding Principles

This structure is designed for **small to medium Angular applications** that require authentication and secure data access, following modern Angular 18+ practices. It balances simplicity with scalability, making it suitable for technical assessments, MVPs, and production-ready small applications.

### Core Principles

- **Standalone Components First**: Eliminates NgModules complexity whilst maintaining clear boundaries
- **Signals for Local State**: Leverages Angular's reactive primitives for component state management
- **RxJS for Async Operations**: Uses observables for HTTP requests, authentication flows, and event streams
- **Feature-Based Organisation**: Groups related functionality together to improve cohesion and maintainability
- **Smart/Presentational Separation**: Distinguishes between container components (smart) and pure UI components (presentational)
- **Dependency Injection**: Utilises Angular's DI system for loose coupling and testability
- **Security-First**: Implements proper token management, HTTP interceptors, and route guards

---

## 2. Folder Structure Tree

```text
.
├── 📄 .editorconfig
├── 📄 .eslintrc.json
├── 📄 angular.json
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 tsconfig.app.json
└── 📁 src/
    ├── 📁 app/
    │   ├── 📁 core/                    # Singleton services, guards, interceptors
    │   │   ├── 📁 guards/
    │   │   │   ├── 📄 auth.guard.ts           # Route protection
    │   │   │   └── 📄 auth.guard.spec.ts
    │   │   │
    │   │   ├── 📁 interceptors/
    │   │   │   ├── 📄 auth.interceptor.ts     # Attaches tokens to requests
    │   │   │   ├── 📄 error.interceptor.ts    # Global error handling
    │   │   │   └── 📄 auth.interceptor.spec.ts
    │   │   │
    │   │   ├── 📁 services/
    │   │   │   ├── 📄 auth.service.ts         # Authentication logic
    │   │   │   ├── 📄 token.service.ts        # Token storage & retrieval
    │   │   │   ├── 📄 notification.service.ts # User notifications
    │   │   │   └── 📄 *.service.spec.ts
    │   │   │
    │   │   └── 📁 models/
    │   │       ├── 📄 auth.model.ts           # Auth-related interfaces
    │   │       └── 📄 api-response.model.ts
    │   │
    │   ├── 📁 features/                # Feature modules (standalone)
    │   │   │
    │   │   ├── 📁 auth/                # Authentication feature
    │   │   │   ├── 📁 components/
    │   │   │   │   ├── 📄 login.component.ts         # Smart component
    │   │   │   │   ├── 📄 login.component.html
    │   │   │   │   ├── 📄 login.component.scss
    │   │   │   │   ├── 📄 login.component.spec.ts
    │   │   │   │   │
    │   │   │   │   └── 📁 ui/                        # Presentational components
    │   │   │   │       ├── 📄 login-form.component.ts
    │   │   │   │       ├── 📄 login-form.component.html
    │   │   │   │       └── 📄 login-form.component.scss
    │   │   │   │
    │   │   │   ├── 📁 models/
    │   │   │   │   └── 📄 login.model.ts
    │   │   │   │
    │   │   │   └── 📄 auth.routes.ts          # Feature routes
    │   │   │
    │   │   └── 📁 documents/           # Document viewer feature
    │   │       ├── 📁 components/
    │   │       │   ├── 📄 document-viewer.component.ts    # Smart component
    │   │       │   ├── 📄 document-viewer.component.html
    │   │       │   ├── 📄 document-viewer.component.scss
    │   │       │   ├── 📄 document-viewer.component.spec.ts
    │   │       │   │
    │   │       │   └── 📁 ui/
    │   │       │       ├── 📄 pdf-viewer.component.ts     # Presentational
    │   │       │       ├── 📄 xml-viewer.component.ts     # Presentational
    │   │       │       ├── 📄 cdr-viewer.component.ts     # Presentational
    │   │       │       └── 📄 document-tabs.component.ts  # Presentational
    │   │       │
    │   │       ├── 📁 services/
    │   │       │   ├── 📄 document.service.ts
    │   │       │   └── 📄 document.service.spec.ts
    │   │       │
    │   │       ├── 📁 models/
    │   │       │   └── 📄 document.model.ts
    │   │       │
    │   │       └── 📄 documents.routes.ts
    │   │
    │   ├── 📁 shared/                  # Reusable components, directives, pipes
    │   │   ├── 📁 components/
    │   │   │   ├── 📄 loading-spinner.component.ts
    │   │   │   ├── 📄 error-message.component.ts
    │   │   │   └── 📄 button.component.ts
    │   │   │
    │   │   ├── 📁 directives/
    │   │   │   └── 📄 auto-focus.directive.ts
    │   │   │
    │   │   ├── 📁 pipes/
    │   │   │   └── 📄 safe-url.pipe.ts         # Sanitise URLs for iframes
    │   │   │
    │   │   └── 📁 utils/
    │   │       ├── 📄 validators.ts             # Custom form validators
    │   │       └── 📄 file-download.util.ts
    │   │
    │   ├── 📄 app.component.ts         # Root component
    │   ├── 📄 app.component.html
    │   ├── 📄 app.component.scss
    │   ├── 📄 app.config.ts            # Application configuration
    │   └── 📄 app.routes.ts            # Root routing configuration
    │
    ├── 📁 assets/
    │   ├── 📁 images/
    │   └── 📁 icons/
    │
    ├── 📁 environments/
    │   ├── 📄 environment.ts           # Development environment
    │   └── 📄 environment.prod.ts      # Production environment
    │
    ├── 📄 index.html
    ├── 📄 main.ts                      # Application bootstrap
    └── 📄 styles.scss                  # Global styles
```

---

## 3. Core Directory Breakdown

### `/src/app/core`

The **core** directory contains singleton services, interceptors, guards, and models that are used throughout the application. These are instantiated once and shared across the entire app.

#### **`/guards`**

- **Purpose**: Protect routes based on authentication status
- **Pattern**: Functional guards (Angular 14+)
- **Example**: `auth.guard.ts` checks if a user has a valid token before accessing protected routes

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/auth/login']);
  return false;
};
```

#### **`/interceptors`**

- **Purpose**: Intercept HTTP requests/responses for cross-cutting concerns
- **Key Interceptors**:
  - `auth.interceptor.ts`: Automatically attaches Bearer tokens to outgoing requests
  - `error.interceptor.ts`: Handles HTTP errors globally (401, 403, 500, etc.)

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const token = tokenService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req);
};
```

#### **`/services`**

- **`auth.service.ts`**: Handles login, logout, token validation
  - Uses **Signals** for authentication state (`isAuthenticated`, `currentUser`)
  - Returns **RxJS Observables** for async operations (login, token refresh)
- **`token.service.ts`**: Manages token storage (localStorage/sessionStorage)
  - Provides methods: `saveToken()`, `getToken()`, `removeToken()`
  - Handles token expiration checks
- **`notification.service.ts`**: Displays user feedback (success, error, warning)

#### **`/models`**

- Defines TypeScript interfaces and types for core domain concepts
- Examples: `AuthResponse`, `TokenPayload`, `ApiError`

---

### `/src/app/features`

The **features** directory is organised by business capability. Each feature is self-contained with its own components, services, and models.

#### **Feature Structure Pattern**

Each feature follows this structure:

```
feature-name/
├── components/          # Smart components (containers)
│   └── ui/             # Presentational components (pure UI)
├── services/           # Feature-specific services
├── models/             # Feature-specific types/interfaces
└── feature.routes.ts   # Feature routing
```

#### **Smart vs Presentational Components**

**Smart Components** (Container Components):

- Located in `components/` root
- Inject services via Dependency Injection
- Manage state using **Signals**
- Handle business logic and data fetching
- Use RxJS for async operations
- Example: `document-viewer.component.ts`

```typescript
@Component({
  selector: 'app-document-viewer',
  standalone: true,
  templateUrl: './document-viewer.component.html',
  imports: [PdfViewerComponent, XmlViewerComponent],
})
export class DocumentViewerComponent {
  private documentService = inject(DocumentService);
  private route = inject(ActivatedRoute);

  // Signals for reactive state
  documentData = signal<DocumentData | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    const ticket = this.route.snapshot.params['ticket'];
    this.loadDocuments(ticket);
  }

  private loadDocuments(ticket: string) {
    this.isLoading.set(true);

    this.documentService.getDocuments(ticket).subscribe({
      next: (data) => {
        this.documentData.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load documents');
        this.isLoading.set(false);
      },
    });
  }
}
```

**Presentational Components** (Dumb Components):

- Located in `components/ui/`
- Receive data via `@Input()` properties
- Emit events via `@Output()` properties
- No service injection (pure functions of their inputs)
- Highly reusable and testable
- Example: `pdf-viewer.component.ts`

```typescript
@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  template: `
    @if (pdfUrl) {
    <iframe [src]="pdfUrl | safeUrl" class="pdf-frame"></iframe>
    } @else {
    <p>No PDF available</p>
    }
  `,
})
export class PdfViewerComponent {
  @Input() pdfUrl?: string;
}
```

#### **`/auth` Feature**

- Handles user authentication
- Components: Login form, registration (if needed)
- Uses reactive forms with custom validators
- Stores token upon successful authentication

#### **`/documents` Feature**

- Displays XML, CDR, and PDF documents
- Components organised by document type
- Service fetches documents from API
- Handles file downloads and in-browser viewing

---

### `/src/app/shared`

Contains reusable components, directives, pipes, and utilities that can be used across multiple features.

#### **`/components`**

- Generic UI components: buttons, modals, loaders
- Independent of business logic
- Highly reusable

#### **`/directives`**

- Custom directives (e.g., `autoFocus`, `clickOutside`)

#### **`/pipes`**

- **`safe-url.pipe.ts`**: Critical for displaying PDFs/XMLs in iframes
  ```typescript
  @Pipe({ name: 'safeUrl', standalone: true })
  export class SafeUrlPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) {}

    transform(url: string): SafeResourceUrl {
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
  }
  ```

#### **`/utils`**

- Helper functions for common tasks
- `file-download.util.ts`: Triggers browser downloads for XML/CDR files
- `validators.ts`: Custom form validators

---

## 4. Data Flow & Architecture Patterns

### Authentication Flow

```
[Login Component] (User enters credentials)
        ↓
[Auth Service] (Calls API with username/password)
        ↓
[HTTP Interceptor] (Adds Basic Auth header)
        ↓
[API: /oauth/token] (Returns access token)
        ↓
[Token Service] (Stores token in localStorage)
        ↓
[Auth Service Signal] (Updates isAuthenticated state)
        ↓
[Route Guard] (Allows navigation to protected routes)
```

### Document Retrieval Flow

```
[Document Viewer Component] (Reads ticket from route params)
        ↓
[Document Service] (Fetches XML, CDR, PDF via HTTP)
        ↓
[Auth Interceptor] (Automatically adds Bearer token)
        ↓
[API Endpoints] (/xml/{ticket}, /cdr/{ticket}, /pdf/{ticket})
        ↓
[Error Interceptor] (Handles 401/403/500 errors)
        ↓
[Document Service] (Returns observables with document data)
        ↓
[Document Viewer Component] (Updates signals with fetched data)
        ↓
[Presentational Components] (Display PDF/XML/CDR in UI)
```

### State Management Strategy

This architecture uses a **hybrid approach** combining Signals and RxJS:

**Signals** (for synchronous state):

- Component local state (loading, error, data)
- Derived computed values
- Simple reactive updates within components

**RxJS Observables** (for asynchronous operations):

- HTTP requests
- Event streams
- Complex data transformations
- Multi-step async workflows

```typescript
// Example: Combining Signals and RxJS
export class DocumentViewerComponent {
  // Signal for state
  documents = signal<DocumentData | null>(null);

  // RxJS for HTTP
  private loadDocuments(ticket: string) {
    this.documentService
      .getDocuments(ticket)
      .pipe(
        catchError((error) => {
          this.error.set(error.message);
          return of(null);
        })
      )
      .subscribe((data) => {
        this.documents.set(data); // Update signal from observable
      });
  }
}
```

### Key Patterns Applied

1. **Dependency Injection**: All services are `@Injectable({ providedIn: 'root' })`
2. **HTTP Interceptors**: Global request/response handling
3. **Route Guards**: Declarative route protection
4. **Smart/Presentational Split**: Clear separation of concerns
5. **Feature-Based Architecture**: High cohesion, low coupling
6. **Reactive Patterns**: Signals + RxJS for state and async operations

---

## 5. Code Examples

### Core Layer: Authentication Service

```typescript
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '@env/environment';
import { TokenService } from './token.service';
import { AuthResponse, LoginCredentials } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private router = inject(Router);

  // Signals for reactive state
  private _isAuthenticated = signal(this.tokenService.hasToken());
  public isAuthenticated = this._isAuthenticated.asReadonly();

  /**
   * Authenticates user and stores token
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    const body = new URLSearchParams({
      grant_type: 'password',
      username: credentials.username,
      password: credentials.password,
    });

    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/oauth/token`, body.toString(), {
        headers: {
          Authorization: 'Basic Y2xpZW50OnNlY3JldA==',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .pipe(
        tap((response) => {
          this.tokenService.saveToken(response.access_token);
          this._isAuthenticated.set(true);
        })
      );
  }

  /**
   * Logs out user and clears token
   */
  logout(): void {
    this.tokenService.removeToken();
    this._isAuthenticated.set(false);
    this.router.navigate(['/auth/login']);
  }
}
```

### Feature Layer: Document Viewer Component (Smart)

```typescript
import { Component, signal, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../services/document.service';
import { PdfViewerComponent } from '../ui/pdf-viewer.component';
import { XmlViewerComponent } from '../ui/xml-viewer.component';
import { CdrViewerComponent } from '../ui/cdr-viewer.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner.component';

@Component({
  selector: 'app-document-viewer',
  standalone: true,
  imports: [
    CommonModule,
    PdfViewerComponent,
    XmlViewerComponent,
    CdrViewerComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.scss'],
})
export class DocumentViewerComponent implements OnInit {
  private documentService = inject(DocumentService);
  private route = inject(ActivatedRoute);

  // Signals for reactive state management
  pdfUrl = signal<string | null>(null);
  xmlUrl = signal<string | null>(null);
  cdrUrl = signal<string | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);
  activeTab = signal<'pdf' | 'xml' | 'cdr'>('pdf');

  ngOnInit(): void {
    const ticket = this.route.snapshot.params['ticket'];
    if (ticket) {
      this.loadDocuments(ticket);
    }
  }

  private loadDocuments(ticket: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    // Fetch all documents concurrently
    this.documentService.getAllDocuments(ticket).subscribe({
      next: (documents) => {
        this.pdfUrl.set(documents.pdf);
        this.xmlUrl.set(documents.xml);
        this.cdrUrl.set(documents.cdr);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load documents. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  downloadDocument(type: 'pdf' | 'xml' | 'cdr'): void {
    const url = type === 'pdf' ? this.pdfUrl() : type === 'xml' ? this.xmlUrl() : this.cdrUrl();

    if (url) {
      this.documentService.downloadFile(url, `document.${type}`);
    }
  }
}
```

### Feature Layer: PDF Viewer Component (Presentational)

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeUrlPipe } from '@shared/pipes/safe-url.pipe';

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe],
  template: `
    <div class="pdf-viewer-container">
      @if (pdfUrl) {
      <iframe [src]="pdfUrl | safeUrl" class="pdf-frame" title="PDF Document Viewer"> </iframe>
      } @else {
      <div class="empty-state">
        <p>No PDF document available</p>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .pdf-viewer-container {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .pdf-frame {
        width: 100%;
        height: 100%;
        border: none;
      }

      .empty-state {
        text-align: center;
        color: #666;
      }
    `,
  ],
})
export class PdfViewerComponent {
  @Input() pdfUrl?: string | null;
}
```

### Infrastructure Layer: HTTP Interceptor

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { TokenService } from '../services/token.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notificationService = inject(NotificationService);
  const tokenService = inject(TokenService);

  return next(req).pipe(
    catchError((error) => {
      switch (error.status) {
        case 401:
          // Unauthorised - token expired or invalid
          tokenService.removeToken();
          router.navigate(['/auth/login']);
          notificationService.error('Session expired. Please login again.');
          break;

        case 403:
          // Forbidden
          notificationService.error('Access denied');
          break;

        case 404:
          notificationService.error('Resource not found');
          break;

        case 500:
          notificationService.error('Server error. Please try again later.');
          break;

        default:
          notificationService.error('An unexpected error occurred');
      }

      return throwError(() => error);
    })
  );
};
```

---

## 6. Key Trade-offs

### Pros

- ✅ **Modern Angular Practices**: Uses Angular 18+ features (standalone, signals, functional guards)
- ✅ **Scalability**: Feature-based structure allows easy addition of new capabilities
- ✅ **Maintainability**: Clear separation of concerns makes code easy to navigate
- ✅ **Type Safety**: Full TypeScript coverage with interfaces and models
- ✅ **Testability**: Services and components are easily unit tested
- ✅ **Security**: Built-in token management, interceptors, and route guards
- ✅ **Reusability**: Shared components and presentational components promote DRY
- ✅ **Developer Experience**: IntelliSense, auto-completion, and compile-time checks

### Cons

- ❌ **Learning Curve**: Requires understanding of Signals, RxJS, and Angular patterns
- ❌ **Initial Setup Time**: More boilerplate than a simple single-file approach
- ❌ **Overkill for Tiny Projects**: May be excessive for 1-2 page applications
- ❌ **Migration Complexity**: Moving from NgModules to standalone requires refactoring
- ❌ **Testing Overhead**: More files means more test files to maintain

---

## 7. When to Use This Structure

### ✅ Use this structure when:

- Building authentication-based applications
- Working with secure APIs requiring token management
- Project expected to grow beyond initial scope
- Multiple developers will work on the codebase
- Technical assessment or portfolio project
- Need to demonstrate modern Angular knowledge
- Application requires file viewing/downloading capabilities
- Long-term maintenance is expected

### ❌ Consider simpler alternatives when:

- Building a prototype in under 4 hours
- Single static page with no backend
- Learning Angular for the first time
- Proof-of-concept that will be discarded
- No authentication or security requirements

---

## 8. Testing Strategy

### Unit Tests (Minimal but Strategic)

Given the project scope, focus testing efforts on critical areas:

#### **Priority 1: Core Services**

```typescript
// auth.service.spec.ts
describe('AuthService', () => {
  it('should store token on successful login', () => {
    // Test token storage
  });

  it('should update isAuthenticated signal after login', () => {
    // Test signal state
  });

  it('should clear token on logout', () => {
    // Test logout flow
  });
});
```

#### **Priority 2: HTTP Interceptors**

```typescript
// auth.interceptor.spec.ts
describe('authInterceptor', () => {
  it('should add Authorization header when token exists', () => {
    // Verify header addition
  });

  it('should not add header when no token', () => {
    // Verify no header when unauthenticated
  });
});
```

#### **Priority 3: Guards**

```typescript
// auth.guard.spec.ts
describe('authGuard', () => {
  it('should allow navigation when authenticated', () => {
    // Test guard allows access
  });

  it('should redirect to login when not authenticated', () => {
    // Test redirect behaviour
  });
});
```

#### **Smart Components** (Optional)

- Test signal state updates
- Test service interactions
- Mock service dependencies

#### **Presentational Components** (Lower Priority)

- Test input/output bindings
- Visual regression tests if time permits

### Integration Tests

For a technical assessment, integration tests are **optional**. If included:

- Test complete authentication flow (login → token storage → route access)
- Test document retrieval flow (fetch → display)

### E2E Tests

Generally **not recommended** for this project scope unless specifically requested.

---

## 9. Security Considerations

### Token Management

**Storage Strategy**:

```typescript
// token.service.ts
export class TokenService {
  private readonly TOKEN_KEY = 'auth_token';

  saveToken(token: string): void {
    // Consider sessionStorage for enhanced security
    sessionStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  removeToken(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
  }

  isTokenExpired(): boolean {
    // Implement JWT expiration check if needed
    const token = this.getToken();
    if (!token) return true;

    // Decode JWT and check exp claim
    // Return true if expired
  }
}
```

**Security Best Practices**:

- Use `sessionStorage` instead of `localStorage` for sensitive tokens
- Never log tokens to console
- Implement token refresh if API supports it
- Clear tokens on logout
- Validate token expiration before API calls

### Content Security

```typescript
// safe-url.pipe.ts - Required for iframe security
@Pipe({ name: 'safeUrl', standalone: true })
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
```

### Route Protection

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes'),
  },
  {
    path: 'documents',
    canActivate: [authGuard], // Protected route
    loadChildren: () => import('./features/documents/documents.routes'),
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
];
```

---

## 10. Related Concepts

- **[[Angular Standalone Components]]**: Eliminates NgModules
- **[[Angular Signals]]**: Reactive state management
- **[[RxJS Observables]]**: Async data streams
- **[[HTTP Interceptors]]**: Request/response middleware
- **[[Route Guards]]**: Navigation protection
- **[[Dependency Injection]]**: Service management
- **[[Smart and Presentational Components]]**: UI architecture pattern
- **[[TypeScript Interfaces]]**: Type safety
- **[[OAuth 2.0]]**: Authentication protocol
- **[[JWT Tokens]]**: Secure authentication

---

## 11. Additional Resources

### Official Documentation

- [Angular Official Docs](https://angular.dev) - Modern Angular documentation
- [Angular Signals Guide](https://angular.dev/guide/signals)
- [RxJS Documentation](https://rxjs.dev)
- [Angular HTTP Client](https://angular.dev/guide/http)

### Recommended Libraries

- **Angular Material**: Pre-built UI components
  ```bash
  ng add @angular/material
  ```
