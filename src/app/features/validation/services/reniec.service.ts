import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '@env/environment.development';

export interface FacialValidationRequest {
  serialNumber: string;
  template: string;
  type: string;
  quality: string;
  documentNumber: string;
}

export interface FacialValidationResponse {
  result?: {
    code: string;
    info: string;
  };
  data?: {
    reniecErrorCode: number;
    reniecErrorDescription: string;
    documentType: number;
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

@Injectable({
  providedIn: 'root'
})
export class ReniecService {
  private apiUrl = environment.acjApiUrl + environment.acjCompareEndpointPath;


  private defaultType = 'R';
  private defaultQuality = '/';

  constructor(private http: HttpClient) {}

  validacionFacial(request: FacialValidationRequest): Observable<FacialValidationResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('Enviando request al backend:', {
      url: `${this.apiUrl}`,
      dni: request.documentNumber,
      serialNumber: request.serialNumber
    });

    return this.http.post<FacialValidationResponse>(
      `${this.apiUrl}/validacion-facial`, 
      request,
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  buildFacialValidationRequest(
    dni: string, 
    livenessPhoto: string, 
    serialNumber: string
): FacialValidationRequest {
    let cleanTemplate = livenessPhoto;
    if (livenessPhoto && livenessPhoto.startsWith('data:image')) {
        cleanTemplate = livenessPhoto.split(',')[1];
    }

    return {
        serialNumber: serialNumber,
        template: cleanTemplate,
        type: 'R',
        quality: '/',  // IMPORTANTE: usar "/" como en la documentación
        documentNumber: dni  // Sin "/" aquí, se agrega en el backend
    };
}

  private handleError(error: HttpErrorResponse) {
    console.error('Error en servicio Reniec:', error);
    
    let errorMessage = 'Ocurrió un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
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
      
      // Si el backend devuelve un mensaje específico
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.error && error.error.info) {
        errorMessage = error.error.info;
      }
    }
    
    return throwError(() => ({
      status: error.status,
      message: errorMessage,
      error: error.error
    }));
  }
}