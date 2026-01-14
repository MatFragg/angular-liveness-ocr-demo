import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DniData } from '../models/dni-data.model';

@Injectable({
  providedIn: 'root'
})
export class DniService {
  private apiUrl = 'http://localhost:8081/api/dni';

  constructor(private http: HttpClient) {}

  processDni(front: File, back: File): Observable<DniData> {
    const formData = new FormData();
    formData.append('frontImage', front);
    formData.append('backImage', back);
    // Cambiar endpoint a /process
    return this.http.post<DniData>(`${this.apiUrl}/process`, formData);
  }
}