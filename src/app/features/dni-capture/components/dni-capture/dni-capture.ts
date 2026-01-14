import { Component, OnInit, NgZone, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { DniData } from '../../models/dni-data.model';
import { DniService } from '../../services/dni.service';
import { AppStateService } from '@core/services/app-state.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-dni-capture',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, MatTableModule, MatButtonModule, MatSnackBarModule, MatProgressBarModule],
  templateUrl: './dni-capture.html',
  styleUrls: ['./dni-capture.scss'],
})
export class DniCapture implements OnInit, OnDestroy {
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;

  // local MediaStream from getUserMedia
  private localStream: MediaStream | null = null;
  resolvedWidth: number | null = null;
  resolvedHeight: number | null = null;
  videoOptions: MediaTrackConstraints = {
    width: { ideal: 3840 },
    height: { ideal: 2160 },
    facingMode: { ideal: 'environment' }
  };
  trigger: Subject<void> = new Subject<void>();
  isCapturingFront = true;
  captureStep: 'idle' | 'front' | 'back' | 'preview' = 'idle';
  frontImage: File | null = null;
  backImage: File | null = null;
  previewMode = false;
  frontPreviewDataUrl: string | null = null;
  backPreviewDataUrl: string | null = null;
  result: DniData | null = null;
  
  // La lista ahora solo contendrá el último elemento procesado
  capturedList: DniData[] = [];
  // Indica que hay un DNI procesado y listo para continuar con liveness
  livenessReady = false;
  lastProcessedDni: DniData | null = null;
  
  uploading = false;

  // Countdown configuration for automatic capture (seconds)
  countdownSeconds = 7;
  currentCount = 0;
  countdownRunning = false;
  private countdownTimer: any = null;
  
  imageErrors: Map<string, { front: boolean, back: boolean }> = new Map();

  // Voice settings
  voiceEnabled = true;
  voiceLanguage: 'es-ES' | 'es-MX' | 'en-US' = 'es-ES';
  
  // Map de instrucciones por idioma
  private instructions = {
    'es-ES': {
      front: 'Ponga el anverso de su DNI frente a la cámara',
      back: 'Ponga el reverso de su DNI frente a la cámara'
    },
    'es-MX': {
      front: 'Ponga el anverso de su credencial frente a la cámara',
      back: 'Ponga el reverso de su credencial frente a la cámara'
    },
    'en-US': {
      front: 'Place the front of your ID in front of the camera',
      back: 'Place the back of your ID in front of the camera'
    }
  };

  constructor(private dniService: DniService, private snack: MatSnackBar, private appState: AppStateService, private zone: NgZone, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Detectar si hubo un refresh y resetear el componente
    this.detectAndHandleRefresh();
  }

  private speakInstruction(text: string): void {
    if (!this.voiceEnabled) {
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.voiceLanguage;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Web Speech API no disponible en este navegador');
    }
  }

  private getInstruction(type: 'front' | 'back'): string {
    return this.instructions[this.voiceLanguage][type];
  }

  toggleVoice(): void {
    this.voiceEnabled = !this.voiceEnabled;
    const status = this.voiceEnabled ? 'activada' : 'desactivada';
    this.snack.open(`🔊 Voz ${status}`, 'Cerrar', { duration: 2000 });
  }

  changeLanguage(lang: 'es-ES' | 'es-MX' | 'en-US'): void {
    this.voiceLanguage = lang;
    const langNames = {
      'es-ES': 'Español (España)',
      'es-MX': 'Español (México)',
      'en-US': 'English (USA)'
    };
    this.snack.open(`🌐 Idioma: ${langNames[lang]}`, 'Cerrar', { duration: 2000 });
  }

  ngOnDestroy(): void {
    // stop media tracks if active
    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
      this.localStream = null;
    }
  }

  private detectAndHandleRefresh(): void {
    const currentStep = this.appState.getCurrentStep();
    const hasDni = this.appState.hasDni();

    if (!hasDni && currentStep !== 'dni-capture') {
      console.log('🔄 REFRESH DETECTADO EN DNI-CAPTURE - Estado vacío pero paso avanzado');
      this.appState.resetToStart();
      this.resetCapture();
    }
  }

  onImageError(event: any, item: DniData, imageType: 'front' | 'back'): void {
    const key = item.numeroDni;
    if (!this.imageErrors.has(key)) {
      this.imageErrors.set(key, { front: false, back: false });
    }
    
    const errors = this.imageErrors.get(key)!;
    if (imageType === 'front') {
      errors.front = true;
    } else {
      errors.back = true;
    }
    
    this.imageErrors.set(key, errors);
    console.warn(`Error cargando imagen ${imageType} para DNI: ${item.numeroDni}`);
  }

  hasImageError(item: DniData, imageType: 'front' | 'back'): boolean {
    const key = item.numeroDni;
    const errors = this.imageErrors.get(key);
    return errors ? errors[imageType] : false;
  }

  downloadImage(base64Data: string | undefined, filename: string): void {
    if (!base64Data) {
      this.snack.open('No hay datos de imagen para descargar', 'Cerrar', { duration: 3000 });
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = 'data:image/jpeg;base64,' + base64Data;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      this.snack.open('Descarga iniciada', 'Cerrar', { duration: 2000 });
    } catch (error) {
      console.error('Error al descargar imagen:', error);
      this.snack.open('Error al descargar la imagen', 'Cerrar', { duration: 3000 });
    }
  }

  triggerSnapshot(): void {
    this.clearCountdown();
    this.captureFrame();
  }

  startCapture(): void {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.snack.open('❌ Cámara no disponible en este dispositivo', 'Cerrar', { duration: 4000 });
      return;
    }

    this.frontImage = null;
    this.backImage = null;
    this.frontPreviewDataUrl = null;
    this.backPreviewDataUrl = null;
    this.previewMode = false;
    this.isCapturingFront = true;
    this.captureStep = 'front';
    
    this.speakInstruction(this.getInstruction('front'));
    
    this.startStreamAndCountdown();
  }

  private async startStreamAndCountdown() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: this.videoOptions, 
        audio: false 
      });
      
      this.localStream = stream;
      
      if (this.videoElement && this.videoElement.nativeElement) {
        this.videoElement.nativeElement.srcObject = stream;
        await this.videoElement.nativeElement.play();
        
        this.videoElement.nativeElement.onloadedmetadata = () => {
          this.resolvedWidth = this.videoElement.nativeElement.videoWidth;
          this.resolvedHeight = this.videoElement.nativeElement.videoHeight;
          this.cd.detectChanges();
        };
      }

      this.startCountdown();
      
    } catch (err: any) {
      console.error('Error accessing camera', err);
      
      let errorMessage = 'No se pudo acceder a la cámara';
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Permiso de cámara denegado. Por favor, permita el acceso a la cámara.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No se encontró ninguna cámara disponible.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Navegador no compatible con la funcionalidad de cámara.';
      }
      
      this.snack.open(`❌ ${errorMessage}`, 'Cerrar', { duration: 5000 });
      this.resetCapture();
    }
  }

  private captureFrame(): void {
    try {
      const video = this.videoElement?.nativeElement;
      if (!video) return;

      const w = video.videoWidth || 1280;
      const h = video.videoHeight || 720;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, w, h);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.96);
      const blob = this.dataURIToBlob(dataUrl);
      const file = new File([blob], this.isCapturingFront ? 'front.jpg' : 'back.jpg', { type: 'image/jpeg' });

      if (this.captureStep === 'front') {
        this.zone.run(() => {
          this.frontImage = file;
          this.frontPreviewDataUrl = dataUrl;
          this.isCapturingFront = false;
          this.captureStep = 'back';
        });
        this.speakInstruction(this.getInstruction('back'));
        this.startCountdown();
      } else if (this.captureStep === 'back') {
        this.zone.run(() => {
          this.backImage = file;
          this.backPreviewDataUrl = dataUrl;
          this.previewMode = true;
          this.captureStep = 'preview';
          this.clearCountdown();
        });

        if (this.localStream) { 
          this.localStream.getTracks().forEach(t => t.stop()); 
          this.localStream = null; 
        }

        try { 
          this.cd.detectChanges(); 
        } catch (e) {}
        try { 
          document.querySelector('.preview')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
        } catch (e) {}
      }
    } catch (err) {
      console.error('Error capturing frame', err);
    }
  }

  startCountdown(): void {
    this.clearCountdown();
    if (this.captureStep !== 'front' && this.captureStep !== 'back') return;
    this.currentCount = this.countdownSeconds;
    this.countdownRunning = true;
    
    this.zone.run(() => {
      try { this.cd.detectChanges(); } catch (e) {}
    });

    this.countdownTimer = setInterval(() => {
      try {
        this.zone.run(() => {
          this.currentCount = Math.max(0, this.currentCount - 1);
          try { this.cd.detectChanges(); } catch (e) {}
          console.debug('[DNI Capture] countdown tick', this.currentCount);
          if (this.currentCount <= 0) {
            this.clearCountdown();
            try { this.captureFrame(); } catch (err) { console.warn('captureFrame failed', err); }
          }
        });
      } catch (err) {
        console.warn('Countdown tick error', err);
      }
    }, 1000);
  }

  clearCountdown(): void {
    if (this.countdownTimer) {
      try { clearInterval(this.countdownTimer); } catch (e) {}
      this.countdownTimer = null;
    }
    this.countdownRunning = false;
    this.currentCount = 0;
  }

  dataURIToBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mime = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mime });
  }

  confirmUpload(): void {
    if (!this.frontImage || !this.backImage) return;

    this.uploading = true;
    
    const timeout = setTimeout(() => {
      if (this.uploading) {
        this.uploading = false;
        this.snack.open('⏰ El proceso está tomando más tiempo de lo esperado. Por favor, intente nuevamente.', 'Cerrar', { duration: 5000 });
        this.resetCaptureAfterError();
      }
    }, 30000);

    // 🔥 **CAMBIAR DE uploadImages A processDni**
    this.dniService.processDni(this.frontImage, this.backImage)
      .pipe(finalize(() => {
        this.uploading = false;
        clearTimeout(timeout);
      }))
      .subscribe({
        next: (data) => {
          this.zone.run(() => {
            this.result = data;
            this.capturedList = [data];
            this.livenessReady = true;
            this.lastProcessedDni = data;

            this.snack.open('✅ DNI procesado y validado correctamente', 'Cerrar', { duration: 3000 });

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
          let errorMessage = 'Error al procesar el DNI';
          
          // 🔥 **MANEJO MEJORADO DE ERRORES**
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
          
          this.snack.open(errorMessage, 'Cerrar', { duration: 7000 });
          this.resetCaptureAfterError();
        },
      });
  }

  private resetCaptureAfterError(): void {
    setTimeout(() => {
      this.zone.run(() => {
        this.resetCapture();
        this.snack.open('🔄 Por favor, intente capturar el DNI nuevamente', 'Cerrar', { duration: 4000 });
        this.cd.markForCheck();
      });
    }, 2000);
  }

  resetCapture(): void {
    this.frontImage = null;
    this.backImage = null;
    this.isCapturingFront = true;
    this.previewMode = false;
    this.frontPreviewDataUrl = null;
    this.backPreviewDataUrl = null;
    this.captureStep = 'idle';
    this.livenessReady = false;
    this.lastProcessedDni = null;
    this.result = null;
    this.capturedList = [];
    this.clearCountdown();
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
      });
      this.localStream = null;
    }
    
    this.cd.markForCheck();
  }

  get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  goToLiveness() {
    if (!this.livenessReady) return;

    try {
      this.appState.setCurrentStep('liveness');
    } catch (err) {
      console.warn('Error navegando a liveness:', err);
    }
  }
}