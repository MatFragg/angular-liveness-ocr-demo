// face-comparison.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment.development';

@Injectable({
  providedIn: 'root'
})
export class FaceComparisonService {
  private http = inject(HttpClient);
  private baseUrl = environment.acjApiUrl + environment.acjCaptureEndpointPath;

  compareFacesFromFiles(sourceImage: File, targetImage: File): Observable<any> {
    const formData = new FormData();
    formData.append('sourceImage', sourceImage);
    formData.append('targetImage', targetImage);
    
    return this.http.post(`${this.baseUrl}`, formData);
  }

  compareFacesFromBase64(sourceBase64: string, targetBase64: string, similarityThreshold?: number): Observable<any> {
    const body: any = {
      sourceImageBase64: sourceBase64,
      targetImageBase64: targetBase64
    };
    
    if (similarityThreshold) {
      body.similarityThreshold = similarityThreshold;
    }
    
    return this.http.post(`${this.baseUrl}`, body);
  }

  compareWithLivenessReference(livenessSessionId: string, targetImage: File): Observable<any> {
    const formData = new FormData();
    formData.append('livenessSessionId', livenessSessionId);
    formData.append('targetImage', targetImage);
    
    return this.http.post(`${this.baseUrl}/compare-with-liveness`, formData);
  }

  detectFaces(image: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', image);
    
    return this.http.post(`${this.baseUrl}/detect-faces`, formData);
  }
}