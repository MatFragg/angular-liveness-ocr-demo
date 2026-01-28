import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { switchMap, tap } from 'rxjs';
import { TokenService } from '../services/token.service';
import { environment } from '@env/environment';

/**
 * Interceptor que agrega el token de autorización a las peticiones
 * dirigidas a la API de ACJ Digital.
 */
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const tokenService = inject(TokenService);
  
  console.log('🔍 Interceptor - URL:', req.url);
  console.log('🔍 Interceptor - Checking if includes:', environment.acjApiUrl);
  
  // Solo interceptar peticiones a la API de ACJ
  if (!req.url.includes(environment.acjApiUrl)) {
    console.log('❌ Interceptor - NOT an ACJ API request, skipping');
    return next(req);
  }

  // Excluir el endpoint de token para evitar recursión
  if (req.url.includes(environment.acjTokenEndpointPath)) {
    console.log('⏭️ Interceptor - Token endpoint, skipping auth header');
    return next(req);
  }

  console.log('✅ Interceptor - Adding auth header to request');
  
  // Obtener token y agregarlo al header
  return tokenService.getToken().pipe(
    tap(token => console.log('🔑 Interceptor - Token obtained:', token?.substring(0, 50) + '...')),
    switchMap(token => {
      // Agregar prefijo Bearer si no lo tiene
      const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      const authReq = req.clone({
        setHeaders: {
          'Authorization': authToken,
          'channel': environment.acjChannel
        }
      });
      console.log('📤 Interceptor - Request headers:', authReq.headers.keys());
      console.log('📤 Interceptor - Auth header value:', authToken.substring(0, 60) + '...');
      return next(authReq);
    })
  );
};
