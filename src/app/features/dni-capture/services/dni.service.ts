import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DniData } from '../models/dni-data.model';
import { environment } from '@env/environment.development';

@Injectable({
  providedIn: 'root'
})
export class DniService {
  private apiUrl = environment.apiUrl + environment.pathApi + environment.dniEndpointPath;
  

  constructor(private http: HttpClient) {}

  processDni(front: File, back: File): Observable<DniData> {
    const formData = new FormData();
    formData.append('frontImage', front);
    formData.append('backImage', back);
    // Cambiar endpoint a /process
    return this.http.post<DniData>(`${this.apiUrl}/process`, formData);
  }
}