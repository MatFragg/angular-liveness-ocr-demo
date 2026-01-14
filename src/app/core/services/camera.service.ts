import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  /**
   * Solicita acceso a la cámara del dispositivo
   * @param constraints Configuración personalizada de MediaStream (opcional)
   * @returns Promise con el MediaStream de la cámara
   */
  async requestCameraAccess(
    constraints?: MediaStreamConstraints
  ): Promise<MediaStream> {
    try {
      const defaultConstraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment', // Cámara trasera en móviles
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(
        constraints || defaultConstraints
      );

      console.log('✅ Camera access granted');
      return stream;
    } catch (error) {
      this.handleCameraError(error);
      throw error;
    }
  }

  /**
   * Detiene todos los tracks del stream de la cámara
   * @param stream MediaStream a detener
   */
  stopStream(stream: MediaStream): void {
    stream.getTracks().forEach(track => {
      track.stop();
      console.log(`🛑 Camera track stopped: ${track.label}`);
    });
  }

  /**
   * Maneja errores específicos de acceso a cámara
   * @param error Error capturado
   */
  private handleCameraError(error: any): void {
    console.error('❌ Camera error:', error);

    if (error.name === 'NotAllowedError') {
      console.error('❌ Camera access denied by user');
      throw new Error('Permiso de cámara denegado. Por favor, permite el acceso a la cámara.');
    } else if (error.name === 'NotFoundError') {
      console.error('❌ No camera found on device');
      throw new Error('No se encontró ninguna cámara en este dispositivo.');
    } else if (error.name === 'NotReadableError') {
      console.error('❌ Camera is already in use');
      throw new Error('La cámara ya está en uso por otra aplicación.');
    } else if (error.name === 'OverconstrainedError') {
      console.error('❌ Camera constraints not satisfied');
      throw new Error('La cámara no cumple con los requisitos necesarios.');
    } else {
      throw new Error('Error al acceder a la cámara. Por favor, verifica los permisos.');
    }
  }

  /**
   * Verifica si el navegador soporta getUserMedia
   * @returns true si el navegador soporta acceso a cámara
   */
  isCameraSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
}
