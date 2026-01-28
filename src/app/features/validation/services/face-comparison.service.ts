// face-comparison.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap, map } from 'rxjs';
import { environment } from '@env/environment';
import { TokenService } from '../../../core/services/token.service';
import { LoggerService } from '../../../core/services/logger.service';
@Injectable({
  providedIn: 'root'
})
export class FaceComparisonService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private logger = inject(LoggerService);
  
  // Usar el endpoint de compare según la documentación de ACJ
  private compareUrl = environment.acjApiUrl + environment.acjCompareEndpointPath;

  /**
   * Compara dos imágenes faciales usando la API de ACJ
   * Según documentación: POST /management/v1/facial-biometrics/compare
   * Body: { imageFirst: string, imageSecond: string }
   */
  compareFacesFromBase64(sourceBase64: string, targetBase64: string, similarityThreshold?: number): Observable<any> {
    // Remover el prefijo data:image/...;base64, si existe
    const cleanBase64 = (base64: string): string => {
      if (base64.includes('base64,')) {
        return base64.split('base64,')[1];
      }
      return base64;
    };

    const imageFirst = cleanBase64(sourceBase64);
    const imageSecond = cleanBase64(targetBase64);
    
    const body = {
      imageFirst,
      imageSecond
    };
    
    this.logger.log('API', `Comparación facial - DNI: ${imageFirst.length} chars, Liveness: ${imageSecond.length} chars`);
    
    // Obtener token y enviar headers directamente (igual que TokenService)
    return this.tokenService.getToken().pipe(
      switchMap(token => {
        const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': authToken,
          'channel': environment.acjChannel
        });
        
        return this.http.post<any>(this.compareUrl, body, { headers });
      }),
      map(response => {
        // Transformar respuesta de ACJ al formato esperado por el componente
        this.logger.success('API', 'Comparación facial completada', { match: response.data?.match, score: response.data?.similarityScore });
        return {
          status: response.result?.code === '000' ? 'SUCCESS' : 'ERROR',
          message: response.result?.info || '',
          similarityScore: response.data?.similarityScore || 0,
          isMatch: response.data?.match || false,
          confidenceLevel: this.getConfidenceLevel(response.data?.similarityScore || 0),
          faceMatchesCount: response.data?.match ? 1 : 0
        };
      })
    );
  }

  private getConfidenceLevel(score: number): string {
    if (score >= 90) return 'MUY ALTA';
    if (score >= 80) return 'ALTA';
    if (score >= 70) return 'MEDIA';
    return 'BAJA';
  }

  compareFacesFromFiles(sourceImage: File, targetImage: File): Observable<any> {
    // Convertir files a base64 y usar compareFacesFromBase64
    return new Observable(observer => {
      const readFileAsBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      Promise.all([
        readFileAsBase64(sourceImage),
        readFileAsBase64(targetImage)
      ]).then(([source, target]) => {
        this.compareFacesFromBase64(source, target).subscribe({
          next: result => observer.next(result),
          error: err => observer.error(err),
          complete: () => observer.complete()
        });
      }).catch(err => observer.error(err));
    });
  }
}