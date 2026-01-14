import { Injectable, signal } from '@angular/core';

declare const cv: any;

@Injectable({
  providedIn: 'root'
})
export class OpenCVService {
  private cvLoaded = signal<boolean>(false);
  private loadingPromise?: Promise<void>;

  /**
   * Carga OpenCV.js si no está ya cargado
   * @returns Promise que se resuelve cuando OpenCV está listo
   */
  async loadOpenCV(): Promise<void> {
    if (this.cvLoaded()) {
      return;
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = new Promise((resolve, reject) => {
      // Verificar si OpenCV ya está cargado
      if (typeof cv !== 'undefined' && cv.Mat) {
        this.cvLoaded.set(true);
        resolve();
        return;
      }

      // Polling hasta que OpenCV esté disponible
      const checkCV = setInterval(() => {
        if (typeof cv !== 'undefined' && cv.Mat) {
          clearInterval(checkCV);
          this.cvLoaded.set(true);
          console.log('✅ OpenCV.js loaded successfully');
          resolve();
        }
      }, 100);

      // Timeout después de 30 segundos
      setTimeout(() => {
        clearInterval(checkCV);
        reject(new Error('OpenCV loading timeout - verify script is included in index.html'));
      }, 30000);
    });

    return this.loadingPromise;
  }

  /**
   * Verifica si OpenCV está cargado
   * @returns true si OpenCV está disponible
   */
  isCVLoaded(): boolean {
    return this.cvLoaded();
  }

  /**
   * Obtiene la instancia global de cv
   * @returns Objeto cv de OpenCV.js
   * @throws Error si OpenCV no está cargado
   */
  getCV(): any {
    if (!this.cvLoaded()) {
      throw new Error('OpenCV not loaded. Call loadOpenCV() first.');
    }
    return cv;
  }
}
