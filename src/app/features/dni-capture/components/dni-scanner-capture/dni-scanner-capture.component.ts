import {
  Component,
  OnInit,
  OnDestroy,
  NgZone,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { finalize } from 'rxjs/operators';

import { DniScannerComponent } from '../ui/dni-scanner/dni-scanner.component';
import { DniService } from '../../services/dni.service';
import { AppStateService } from '@core/services/app-state.service';
import { DniData } from '../../models/dni-data.model';

type CaptureStep = 'idle' | 'capturing-front' | 'front-captured' | 'capturing-back' | 'preview' | 'processing' | 'completed';

@Component({
  selector: 'app-dni-scanner-capture',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatCardModule,
    DniScannerComponent
  ],
  templateUrl: './dni-scanner-capture.component.html',
  styleUrls: ['./dni-scanner-capture.component.scss']
})
export class DniScannerCaptureComponent implements OnInit, OnDestroy {
  // Estados del proceso
  currentStep: CaptureStep = 'idle';
  
  // Imágenes capturadas
  frontImageBase64: string | null = null;
  backImageBase64: string | null = null;
  frontImageFile: File | null = null;
  backImageFile: File | null = null;
  
  // Resultado del procesamiento
  result: DniData | null = null;
  uploading = false;
  
  // Para navegación a liveness
  livenessReady = false;

  constructor(
    private dniService: DniService,
    private appState: AppStateService,
    private snackBar: MatSnackBar,
    private zone: NgZone,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.detectAndHandleRefresh();
  }

  ngOnDestroy(): void {
    // Cleanup si es necesario
  }

  private detectAndHandleRefresh(): void {
    const currentStep = this.appState.getCurrentStep();
    const hasDni = this.appState.hasDni();

    if (!hasDni && currentStep !== 'dni-capture') {
      console.log('🔄 REFRESH DETECTADO EN DNI-SCANNER-CAPTURE - Reseteando');
      this.appState.resetToStart();
      this.resetCapture();
    }
  }

  /**
   * Inicia el proceso de captura (frente)
   */
  startCapture(): void {
    this.resetCapture();
    this.currentStep = 'capturing-front';
    this.snackBar.open('📸 Posiciona el FRENTE del DNI en el marco', 'Cerrar', { duration: 3000 });
  }

  /**
   * Maneja la captura de imagen del scanner
   */
  onImageCaptured(imageBase64: string): void {
    if (this.currentStep === 'capturing-front') {
      // Capturó el frente
      this.frontImageBase64 = imageBase64;
      this.frontImageFile = this.base64ToFile(imageBase64, 'front.jpg');
      this.currentStep = 'front-captured';
      
      this.snackBar.open('✅ Frente capturado correctamente', 'Cerrar', { duration: 2000 });
      this.cd.markForCheck();
      
    } else if (this.currentStep === 'capturing-back') {
      // Capturó el reverso
      this.backImageBase64 = imageBase64;
      this.backImageFile = this.base64ToFile(imageBase64, 'back.jpg');
      this.currentStep = 'preview';
      
      this.snackBar.open('✅ Reverso capturado correctamente', 'Cerrar', { duration: 2000 });
      this.cd.markForCheck();
    }
  }

  /**
   * Inicia captura del reverso
   */
  captureBack(): void {
    this.currentStep = 'capturing-back';
    this.snackBar.open('📸 Ahora posiciona el REVERSO del DNI', 'Cerrar', { duration: 3000 });
  }

  /**
   * Recaptura el frente
   */
  recaptureFront(): void {
    this.frontImageBase64 = null;
    this.frontImageFile = null;
    this.currentStep = 'capturing-front';
    this.snackBar.open('📸 Recapturando frente del DNI', 'Cerrar', { duration: 2000 });
  }

  /**
   * Recaptura el reverso
   */
  recaptureBack(): void {
    this.backImageBase64 = null;
    this.backImageFile = null;
    this.currentStep = 'capturing-back';
    this.snackBar.open('📸 Recapturando reverso del DNI', 'Cerrar', { duration: 2000 });
  }

  /**
   * Confirma y procesa las imágenes capturadas
   */
  confirmAndProcess(): void {
    if (!this.frontImageFile || !this.backImageFile) {
      this.snackBar.open('❌ Faltan imágenes por capturar', 'Cerrar', { duration: 3000 });
      return;
    }

    this.currentStep = 'processing';
    this.uploading = true;

    const timeout = setTimeout(() => {
      if (this.uploading) {
        this.uploading = false;
        this.snackBar.open('⏰ El proceso está tomando más tiempo de lo esperado. Por favor, intente nuevamente.', 'Cerrar', { duration: 5000 });
        this.resetCaptureAfterError();
      }
    }, 30000);

    this.dniService.processDni(this.frontImageFile, this.backImageFile)
      .pipe(finalize(() => {
        this.uploading = false;
        clearTimeout(timeout);
      }))
      .subscribe({
        next: (data) => {
          this.zone.run(() => {
            this.result = data;
            this.livenessReady = true;
            this.currentStep = 'completed';

            this.snackBar.open('✅ DNI procesado y validado correctamente', 'Cerrar', { duration: 3000 });

            // Guardar en AppState
            const dniForAppState = {
              ...data,
              foto: data.fotoPersona
            };

            try {
              this.appState.setDni(dniForAppState);

              const dniPhotoBase64 = data.fotoPersona || data.frontImageBase64 || null;
              if (dniPhotoBase64) {
                const withPrefix = dniPhotoBase64.startsWith('data:')
                  ? dniPhotoBase64
                  : `data:image/jpeg;base64,${dniPhotoBase64}`;
                this.appState.setDniPhoto(withPrefix);
              }
            } catch (err) {
              console.warn('Error guardando DNI en AppState', err);
            }

            this.cd.markForCheck();
          });
        },
        error: (error) => {
          this.handleProcessingError(error);
        }
      });
  }

  /**
   * Maneja errores del procesamiento
   */
  private handleProcessingError(error: any): void {
    let errorMessage = 'Error al procesar el DNI';

    if (error.error && error.error.message) {
      const errorMsg = error.error.message.toLowerCase();

      if (errorMsg.includes('dni peruano válido') ||
          errorMsg.includes('auténtico') ||
          errorMsg.includes('validación')) {
        errorMessage = '❌ DOCUMENTO NO VÁLIDO\n\n' +
                      'El documento no cumple con los requisitos de un DNI peruano auténtico.\n\n' +
                      'POR FAVOR VERIFIQUE:\n' +
                      '• Que sea un DNI peruano actual\n' +
                      '• Que las imágenes sean nítidas y completas\n' +
                      '• Que se vean claramente ambos lados\n' +
                      '• Que no haya reflejos ni sombras';
      } else if (errorMsg.includes('texto') || errorMsg.includes('ocr')) {
        errorMessage = '❌ TEXTO NO LEGIBLE\n\n' +
                      'No se pudo leer el texto del documento.\n\n' +
                      'RECOMENDACIONES:\n' +
                      '• Mejorar la iluminación\n' +
                      '• Enfocar correctamente la cámara\n' +
                      '• Evitar reflejos y sombras\n' +
                      '• Mantener el documento estable';
      } else if (errorMsg.includes('dni válido') || errorMsg.includes('8 dígitos')) {
        errorMessage = '❌ DNI NO VÁLIDO\n\n' +
                      'No se pudo detectar un número de DNI válido (8 dígitos).\n\n' +
                      'VERIFIQUE:\n' +
                      '• Que el DNI tenga 8 dígitos\n' +
                      '• Que el número sea legible\n' +
                      '• Que no haya reflejos en el número';
      } else {
        errorMessage = error.error.message;
      }
    } else if (error.status === 0) {
      errorMessage = '❌ ERROR DE CONEXIÓN\n\n' +
                    'No se pudo conectar con el servidor.\n' +
                    'Verifique su conexión a internet.';
    } else if (error.status === 400) {
      errorMessage = '❌ ERROR DE VALIDACIÓN\n\n' +
                    'Los datos enviados no son válidos.\n' +
                    'Por favor, verifique las imágenes y vuelva a intentar.';
    }

    this.snackBar.open(errorMessage, 'Cerrar', { duration: 7000 });
    this.resetCaptureAfterError();
  }

  private resetCaptureAfterError(): void {
    setTimeout(() => {
      this.zone.run(() => {
        this.resetCapture();
        this.snackBar.open('🔄 Por favor, intente capturar el DNI nuevamente', 'Cerrar', { duration: 4000 });
        this.cd.markForCheck();
      });
    }, 2000);
  }

  /**
   * Resetea el proceso de captura
   */
  resetCapture(): void {
    this.currentStep = 'idle';
    this.frontImageBase64 = null;
    this.backImageBase64 = null;
    this.frontImageFile = null;
    this.backImageFile = null;
    this.result = null;
    this.livenessReady = false;
    this.uploading = false;
    this.cd.markForCheck();
  }

  /**
   * Navega al siguiente paso (liveness)
   */
  goToLiveness(): void {
    if (!this.livenessReady) return;

    try {
      this.appState.setCurrentStep('liveness');
    } catch (err) {
      console.warn('Error navegando a liveness:', err);
    }
  }

  /**
   * Maneja errores del scanner
   */
  onScannerError(error: string): void {
    this.snackBar.open(`❌ ${error}`, 'Cerrar', { duration: 5000 });
  }

  /**
   * Notifica cuando el scanner está listo
   */
  onScannerReady(): void {
    console.log('✅ Scanner reactivo listo');
  }

  /**
   * Cancela el scanner actual y vuelve al preview
   */
  cancelCurrentScan(): void {
    if (this.currentStep === 'capturing-front') {
      this.resetCapture();
    } else if (this.currentStep === 'capturing-back') {
      this.currentStep = 'front-captured';
    }
  }

  /**
   * Convierte base64 a File
   */
  private base64ToFile(base64: string, filename: string): File {
    // Remover prefijo data:image/...;base64, si existe
    const base64Data = base64.includes('base64,') 
      ? base64.split('base64,')[1] 
      : base64;
    
    const byteString = atob(base64Data);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    
    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
    return new File([blob], filename, { type: 'image/jpeg' });
  }

  /**
   * Descarga una imagen
   */
  downloadImage(base64Data: string | null, filename: string): void {
    if (!base64Data) {
      this.snackBar.open('No hay imagen para descargar', 'Cerrar', { duration: 2000 });
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = base64Data;
      link.download = filename;
      link.click();
      
      this.snackBar.open('📥 Imagen descargada', 'Cerrar', { duration: 2000 });
    } catch (error) {
      console.error('Error al descargar imagen:', error);
      this.snackBar.open('Error al descargar la imagen', 'Cerrar', { duration: 3000 });
    }
  }
}
