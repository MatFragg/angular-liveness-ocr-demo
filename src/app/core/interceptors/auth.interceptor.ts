import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { switchMap } from 'rxjs';
import { TokenService } from '../services/token.service';
import { environment } from '@env/environment';
import { getLogger } from '../services/logger.service';

/**
 * Interceptor que agrega el token de autorización a las peticiones
 * dirigidas a la API de ACJ Digital.
 */
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const tokenService = inject(TokenService);
  const logger = getLogger();
  
  // Solo interceptar peticiones a la API de ACJ
  if (!req.url.includes(environment.acjApiUrl)) {
    return next(req);
  }

  // Excluir el endpoint de token para evitar recursión
  if (req.url.includes(environment.acjTokenEndpointPath)) {
    return next(req);
  }

  // Obtener token y agregarlo al header
  return tokenService.getToken().pipe(
    switchMap(token => {
      const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      const authReq = req.clone({
        setHeaders: {
          'Authorization': authToken,
          'channel': environment.acjChannel
        }
      });
      
      // Log único consolidado
      logger.logApiCall(req.method, req.url, { 
        headers: ['Authorization', 'channel'] 
      });
      
      return next(authReq);
    })
  );
};
