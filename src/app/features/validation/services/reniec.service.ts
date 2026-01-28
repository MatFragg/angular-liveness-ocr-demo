import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError, switchMap, map } from 'rxjs';
import { environment } from '@env/environment';
import { TokenService } from '../../../core/services/token.service';
import { LoggerService } from '../../../core/services/logger.service';

// Request según documentación ACJ endpoint 5 (capture)
export interface ReniecCaptureRequest {
  documentNumber: string;
  serialNumber: string;
  type: string;        // "R" por defecto
  quality: string;     // "/" según documentación
  template: string;    // Foto en Base64
}

// Respuesta del endpoint capture de ACJ
export interface ReniecCaptureResponse {
  result?: {
    code: string;
    info: string;
  };
  data?: {
    reniecErrorCode: number;
    reniecErrorDescription: string;
    documentType?: number;
    documentNumber: string;
    personName: string;
    personLastName: string;
    personMotherLastName: string;
    expirationDate: string;
    validity: string;
    restriction: string;
    restrictionGroup: string;
    traking: string;
  };
}

// Modelo de dominio para la validación RENIEC
export interface ReniecValidation {
  documentNumber: string;
  names: string;
  lastNames: string;
  expirationDate: string;
  nationality: string;
  responseCode: string;  // "HIT" o "NO HIT"
  reniecCode: number;
  reniecDescription: string;  // Descripción del código RENIEC
  trackingToken: string;
  isMatch: boolean;
  // Campos adicionales para UI
  validity?: string;
  restriction?: string;
  restrictionGroup?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReniecService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private logger = inject(LoggerService);
  
  private readonly captureUrl = `${environment.acjApiUrl}${environment.acjCaptureEndpointPath}`;

  /**
   * Realiza la validación facial contra RENIEC usando el endpoint capture de ACJ
   * Similar a la implementación mobile que funcionaba correctamente
   */
  validateWithReniec(
    dni: string,
    photoBase64: string,
    serialNumber: string = '123456789'
  ): Observable<ReniecValidation> {
    // Limpiar el base64 si tiene prefijo data:image
    const cleanTemplate = this.cleanBase64(photoBase64);
    
    const request: ReniecCaptureRequest = {
      documentNumber: dni,
      serialNumber: serialNumber,
      type: 'R',
      quality: '/',
      template: cleanTemplate
    };

    this.logger.log('VALIDATION', `Enviando validación RENIEC - DNI: ${dni}`);

    return this.tokenService.getToken().pipe(
      switchMap(token => {
        const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': authToken,
          'channel': environment.acjChannel
        });

        return this.http.post<ReniecCaptureResponse>(this.captureUrl, request, { headers });
      }),
      map(response => {
        this.logger.success('VALIDATION', 'Respuesta RENIEC recibida', { code: response.result?.code });
        return this.mapToDomain(response);
      }),
      catchError(err => this.handleError(err))
    );
  }

  /**
   * Método legacy para compatibilidad - redirige al nuevo método
   */
  validacionFacial(request: ReniecCaptureRequest): Observable<ReniecValidation> {
    return this.validateWithReniec(
      request.documentNumber,
      request.template,
      request.serialNumber
    );
  }

  /**
   * Helper para construir el request (compatibilidad con código existente)
   */
  buildFacialValidationRequest(
    dni: string,
    livenessPhoto: string,
    serialNumber: string
  ): ReniecCaptureRequest {
    return {
      documentNumber: dni,
      serialNumber: serialNumber,
      type: 'R',
      quality: '/',
      template: this.cleanBase64(livenessPhoto)
    };
  }

  /**
   * Mapea la respuesta de ACJ al modelo de dominio
   * Similar al ReniecMapper de la app mobile
   */
  private mapToDomain(response: ReniecCaptureResponse): ReniecValidation {
    const data = response.data;
    const isHit = data?.reniecErrorCode === 70006;
    
    return {
      documentNumber: data?.documentNumber || '',
      names: data?.personName || '',
      lastNames: `${data?.personLastName || ''} ${data?.personMotherLastName || ''}`.trim(),
      expirationDate: data?.expirationDate || '',
      nationality: 'PERUANA',
      responseCode: isHit ? 'HIT' : 'NO HIT',
      reniecCode: data?.reniecErrorCode || 0,
      reniecDescription: data?.reniecErrorDescription || '',
      trackingToken: data?.traking || '',
      isMatch: isHit,
      // Campos adicionales para UI
      validity: data?.validity || '',
      restriction: data?.restriction || '',
      restrictionGroup: data?.restrictionGroup || ''
    };
  }

  /**
   * Limpia el prefijo data:image del base64 si existe
   */
  private cleanBase64(base64: string): string {
    if (base64 && base64.includes('base64,')) {
      return base64.split('base64,')[1];
    }
    return base64;
  }

  private handleError = (error: HttpErrorResponse) => {
    this.logger.error('Error en servicio RENIEC', { status: error.status, message: error.message });
    
    let errorMessage = 'Ocurrió un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 0:
          errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
          break;
        case 400:
          errorMessage = 'Solicitud incorrecta. Verifique los datos enviados.';
          break;
        case 401:
          errorMessage = 'No autorizado. Token de acceso inválido o expirado.';
          break;
        case 403:
          errorMessage = 'Acceso prohibido. No tiene permisos para realizar esta operación.';
          break;
        case 404:
          errorMessage = 'Endpoint no encontrado.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Intente nuevamente más tarde.';
          break;
        case 503:
          errorMessage = 'Servicio no disponible temporalmente.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
      
      // Si ACJ devuelve un mensaje específico
      if (error.error?.result?.info) {
        errorMessage = error.error.result.info;
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }
    
    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      error: error.error
    }));
  }
}