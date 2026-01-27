import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment.development';

export interface LivenessResult {
  sessionId: string;
  status: string;
  confidence: number;
  ReferenceImage?: {  // Cambiado a mayúscula para coincidir con el backend
    Bytes?: string;   // Campo para la imagen en Base64
    boundingBox?: {
      Width: number;  // Cambiado a mayúscula
      Height: number; // Cambiado a mayúscula
      Left: number;   // Cambiado a mayúscula
      Top: number;    // Cambiado a mayúscula
    };
  };
}

@Injectable({ providedIn: 'root' })
export class LivenessService {
  private apiUrl = environment.apiUrl + environment.pathApi + environment.livenessEndpointPath;

  constructor(private http: HttpClient) {}

  createSession(): Observable<{ sessionId: string }> {
    return this.http.post<{ sessionId: string }>(`${this.apiUrl}/create-session`, {});
  }

  getResults(sessionId: string): Observable<LivenessResult> {
    return this.http.get<LivenessResult>(`${this.apiUrl}/results/${sessionId}`);
  }
}