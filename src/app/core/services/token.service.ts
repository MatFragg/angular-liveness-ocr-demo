import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, tap, map, shareReplay, switchMap } from 'rxjs';
import { TokenResponse, TokenRequest, CachedToken } from '../models/token-response.model';
import { environment } from '@env/environment';

const TOKEN_STORAGE_KEY = 'acj_token_cache';
const TOKEN_EXPIRY_BUFFER_MS = 60000; // Renovar 1 minuto antes de expirar

@Injectable({ providedIn: 'root' })
export class TokenService {
  private http = inject(HttpClient);
  private tokenRequest$: Observable<string> | null = null;

  private readonly tokenUrl = `${environment.acjApiUrl}${environment.acjTokenEndpointPath}`;

  /**
   * Obtiene un token válido. Si hay uno en caché y no ha expirado, lo retorna.
   * Si no hay token o está por expirar, solicita uno nuevo.
   */
  getToken(): Observable<string> {
    const cached = this.getCachedToken();
    
    if (cached && this.isTokenValid(cached)) {
      return of(cached.token);
    }

    // Si ya hay una petición en progreso, reutilizarla
    if (this.tokenRequest$) {
      return this.tokenRequest$;
    }

    // Solicitar nuevo token
    this.tokenRequest$ = this.requestNewToken().pipe(
      tap(() => {
        this.tokenRequest$ = null;
      }),
      shareReplay(1)
    );

    return this.tokenRequest$;
  }

  /**
   * Limpia el token almacenado
   */
  clearToken(): void {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    this.tokenRequest$ = null;
  }

  /**
   * Verifica si hay un token válido disponible
   */
  hasValidToken(): boolean {
    const cached = this.getCachedToken();
    return cached !== null && this.isTokenValid(cached);
  }

  private requestNewToken(): Observable<string> {
    const body: TokenRequest = {
      clientId: environment.acjClientId,
      clientSecret: environment.acjClientSecret
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'channel': environment.acjChannel
    });

    return this.http.post<TokenResponse>(this.tokenUrl, body, { headers }).pipe(
      tap(response => {
        this.cacheToken(response);
      }),
      map(response => response.accessToken)
    );
  }

  private cacheToken(response: TokenResponse): void {
    const cached: CachedToken = {
      token: response.accessToken,
      expiresAt: Date.now() + (response.expireIn * 1000) // expireIn viene en segundos
    };
    sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(cached));
  }

  private getCachedToken(): CachedToken | null {
    const stored = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (!stored) {
      return null;
    }
    try {
      return JSON.parse(stored) as CachedToken;
    } catch {
      return null;
    }
  }

  private isTokenValid(cached: CachedToken): boolean {
    // Token es válido si no ha expirado y tiene al menos 1 minuto de vida
    return cached.expiresAt > (Date.now() + TOKEN_EXPIRY_BUFFER_MS);
  }
}
