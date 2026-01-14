import { Component, ElementRef, AfterViewInit, OnDestroy, ChangeDetectorRef, NgZone, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { firstValueFrom, Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { FaceLivenessDetectorCore } from '@aws-amplify/ui-react-liveness';
import '@aws-amplify/ui-react/styles.css';
import { LivenessService } from '../../services/liveness.service';
import { AppStateService } from '@core/services/app-state.service';

@Component({
  selector: 'app-face-liveness-wrapper',
  template: `
    <div style="max-width:900px; margin:20px auto; text-align:center;">
      <div id="react-root" style="width: 100%; height: 800px; margin: auto;"></div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule],
})
export class FaceLivenessWrapper implements AfterViewInit, OnDestroy {
  private root?: Root;
  private destroy$ = new Subject<void>();
  private isTransitioning = false;
  private router = inject(Router);

  constructor(
    private host: ElementRef, 
    private livenessService: LivenessService, 
    private appState: AppStateService, 
    private cd: ChangeDetectorRef,
    private zone: NgZone
  ) {
    this.detectAndHandleRefresh();
  }

  private detectAndHandleRefresh(): void {
    // Verificar si hay DNI pero no hay foto de liveness
    const hasDni = this.appState.hasDni();
    const hasLivenessPhoto = this.appState.hasLivenessPhoto();
    const currentStep = this.appState.getCurrentStep();

    if (!hasDni && currentStep === 'liveness') {
      console.log('🔄 REFRESH DETECTADO EN FACE-LIVENESS - DNI vacío');
      this.appState.resetToStart();
    }
  }

  async ngAfterViewInit() {
    const container = this.host.nativeElement.querySelector('#react-root');
    if (!container) {
      console.error('❌ Contenedor react-root no encontrado');
      return;
    }

    this.root = createRoot(container);

    try {
      const sessionResponse = await firstValueFrom(this.livenessService.createSession());
      const sessionId = sessionResponse?.sessionId;

      if (!sessionId) {
        console.error('❌ No se pudo obtener sessionId');
        return;
      }

      console.log('📱 Sesión liveness creada:', sessionId);

      this.root.render(
        React.createElement(FaceLivenessDetectorCore, {
          sessionId,
          region: 'us-east-1',
          onAnalysisComplete: async () => {
            console.log('✅ onAnalysisComplete disparado');
            await this.handleLivenessComplete(sessionId);
          },
          onError: (error: any) => {
            console.error('❌ Error en Liveness:', error);
            alert(`Error: ${error?.message || error}`);
          },
        })
      );

      // Fallback: Polling para detectar cuando se completa (por si el callback no funciona)
      this.startCompletionPolling(sessionId);
    } catch (err) {
      console.error('❌ Error inicializando liveness:', err);
    }
  }

  private handleLivenessComplete(sessionId: string): Promise<void> {
    return new Promise(async (resolve) => {
      if (this.isTransitioning) {
        resolve();
        return;
      }
      this.isTransitioning = true;

      this.zone.run(async () => {
        try {
          console.log('📡 Obteniendo resultados del servidor...');
          const result = await firstValueFrom(this.livenessService.getResults(sessionId));
          console.log('🧾 Resultado completo del backend:', result);

          const photoBase64 =
            (result as any)?.ReferenceImage?.Bytes ||
            (result as any)?.referenceImage?.bytes ||
            null;

          // Guardamos resultado en AppState
          this.appState.setLivenessResult(result);
          if (photoBase64) {
            // Procesar la foto a formato carnet vertical
            console.log('📸 Procesando foto a formato carnet...');
            const carnetPhoto = await this.convertToCarnetFormat(photoBase64);
            this.appState.setLivenessPhoto(carnetPhoto);
            console.log('✓ Foto de liveness guardada en formato carnet');
          }

          // Navegar al siguiente paso
          console.log('→ Navegando a choice...');
          setTimeout(() => {
            this.zone.run(() => {
              console.log('⚡ Ejecutando cambio en zone');
              this.appState.setCurrentStep('choice');
              this.router.navigate(['/validation/choice']);
              this.cd.markForCheck();
              this.cd.detectChanges();
              console.log('✓ Paso actualizado a: choice y navegando...');
            });
            resolve();
          }, 500);
        } catch (err) {
          console.error('❌ Error obteniendo resultados:', err);
          alert('Error al procesar los resultados del liveness');
          this.isTransitioning = false;
          resolve();
        }
      });
    });
  }

  /**
   * Convierte la foto de liveness a formato carnet vertical (3:4)
   * Dimensiones típicas: 300x400px o 600x800px
   */
  private async convertToCarnetFormat(base64Image: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          // Dimensiones objetivo para foto carnet (proporción 3:4)
          const targetWidth = 600;  // Ancho en pixels
          const targetHeight = 800; // Alto en pixels (vertical)
          const targetRatio = targetWidth / targetHeight; // 0.75

          // Crear canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('No se pudo crear contexto 2D'));
            return;
          }

          canvas.width = targetWidth;
          canvas.height = targetHeight;

          // Calcular recorte centrado en el rostro
          // La imagen original suele ser horizontal, queremos la parte central vertical
          const sourceRatio = img.width / img.height;
          
          let sourceX = 0;
          let sourceY = 0;
          let sourceWidth = img.width;
          let sourceHeight = img.height;

          if (sourceRatio > targetRatio) {
            // Imagen más ancha que target, recortar los lados
            sourceWidth = img.height * targetRatio;
            sourceX = (img.width - sourceWidth) / 2; // Centrar horizontalmente
          } else {
            // Imagen más alta que target, recortar arriba/abajo
            sourceHeight = img.width / targetRatio;
            sourceY = (img.height - sourceHeight) / 2; // Centrar verticalmente
          }

          // Dibujar la imagen recortada y redimensionada
          ctx.drawImage(
            img,
            sourceX, sourceY, sourceWidth, sourceHeight, // Source rectangle
            0, 0, targetWidth, targetHeight              // Destination rectangle
          );

          // Convertir a base64
          const carnetBase64 = canvas.toDataURL('image/jpeg', 0.92).split(',')[1];
          
          console.log(`✅ Foto convertida: ${img.width}x${img.height} → ${targetWidth}x${targetHeight}`);
          resolve(carnetBase64);
        } catch (error) {
          console.error('Error procesando imagen:', error);
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Error cargando imagen'));
      };

      // Cargar la imagen
      img.src = `data:image/jpeg;base64,${base64Image}`;
    });
  }

  private startCompletionPolling(sessionId: string): void {
    // Polling cada 2 segundos durante máximo 120 segundos
    interval(2000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(async () => {
        if (this.isTransitioning) {
          this.destroy$.next();
          return;
        }

        try {
          const result = await firstValueFrom(this.livenessService.getResults(sessionId));
          
          // Si tenemos status SUCCEEDED y aún no hemos transitado
          if (result?.status === 'SUCCEEDED' && !this.isTransitioning) {
            console.log('🔍 Polling detectó SUCCEEDED');
            this.handleLivenessComplete(sessionId);
          }
        } catch (err) {
          // Sin logging de errores en polling para no contaminar consola
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.root) {
      try {
        this.root.unmount();
      } catch (err) {
        console.warn('Error unmounting root:', err);
      }
      this.root = undefined;
    }
  }
}