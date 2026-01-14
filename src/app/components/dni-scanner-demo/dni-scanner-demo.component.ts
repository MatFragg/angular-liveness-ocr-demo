import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DniScannerComponent } from '../dni-scanner/dni-scanner.component';

@Component({
  selector: 'app-dni-scanner-demo',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    DniScannerComponent
  ],
  template: `
    <div class="demo-container">
      <mat-card class="demo-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>credit_card</mat-icon>
            Scanner de DNI - Demo
          </mat-card-title>
          <mat-card-subtitle>
            Componente reactivo con análisis de desenfoque y detección de bordes
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          @if (!showScanner) {
            <div class="start-container">
              <p class="instructions">
                Este componente analiza en tiempo real:
              </p>
              <ul class="features-list">
                <li>
                  <mat-icon>blur_on</mat-icon>
                  <span><strong>Desenfoque:</strong> Detecta si la imagen está borrosa</span>
                </li>
                <li>
                  <mat-icon>zoom_out_map</mat-icon>
                  <span><strong>Distancia:</strong> Verifica que el DNI esté suficientemente cerca</span>
                </li>
                <li>
                  <mat-icon>crop_free</mat-icon>
                  <span><strong>Marco guía:</strong> Facilita el posicionamiento preciso</span>
                </li>
                <li>
                  <mat-icon>feedback</mat-icon>
                  <span><strong>Feedback reactivo:</strong> Mensajes en tiempo real</span>
                </li>
              </ul>

              <button 
                mat-raised-button 
                color="primary" 
                (click)="startScanner()"
                class="start-button">
                <mat-icon>camera_alt</mat-icon>
                Iniciar Scanner
              </button>
            </div>
          }

          @if (showScanner) {
            <app-dni-scanner
              [analysisIntervalMs]="400"
              (imageCaptured)="onImageCaptured($event)"
              (scannerError)="onScannerError($event)"
              (scannerReady)="onScannerReady()">
            </app-dni-scanner>
          }

          @if (capturedImage) {
            <div class="result-container">
              <h3>✅ DNI Capturado</h3>
              <img [src]="capturedImage" alt="DNI Capturado" class="captured-image">
              
              <div class="actions">
                <button mat-raised-button color="primary" (click)="resetScanner()">
                  <mat-icon>refresh</mat-icon>
                  Capturar Otro DNI
                </button>
                
                <button mat-stroked-button (click)="downloadImage()">
                  <mat-icon>download</mat-icon>
                  Descargar Imagen
                </button>
              </div>
            </div>
          }
        </mat-card-content>
      </mat-card>

      @if (logs.length > 0) {
        <mat-card class="logs-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>description</mat-icon>
              Eventos del Scanner
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="logs-container">
              @for (log of logs; track log.timestamp) {
                <div class="log-entry" [class]="log.type">
                  <span class="log-time">{{ log.timestamp | date:'HH:mm:ss' }}</span>
                  <span class="log-message">{{ log.message }}</span>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .demo-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .demo-card {
      mat-card-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        margin: -16px -16px 24px -16px;
        border-radius: 4px 4px 0 0;

        mat-card-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 24px;
          margin: 0;

          mat-icon {
            font-size: 32px;
            width: 32px;
            height: 32px;
          }
        }

        mat-card-subtitle {
          color: rgba(255, 255, 255, 0.9);
          margin-top: 8px;
        }
      }
    }

    .start-container {
      text-align: center;
      padding: 40px 20px;

      .instructions {
        font-size: 18px;
        margin-bottom: 24px;
        color: #666;
      }

      .features-list {
        list-style: none;
        padding: 0;
        margin: 0 auto 32px;
        max-width: 500px;
        text-align: left;

        li {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px;
          margin-bottom: 8px;
          background: #f5f5f5;
          border-radius: 8px;

          mat-icon {
            color: #667eea;
            flex-shrink: 0;
          }

          span {
            flex: 1;
          }
        }
      }

      .start-button {
        font-size: 16px;
        padding: 12px 32px;
        height: auto;

        mat-icon {
          margin-right: 8px;
        }
      }
    }

    .result-container {
      text-align: center;
      padding: 24px;
      background: #f5f5f5;
      border-radius: 12px;
      margin-top: 24px;

      h3 {
        color: #4caf50;
        margin-bottom: 16px;
        font-size: 20px;
      }

      .captured-image {
        max-width: 100%;
        max-height: 400px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        margin-bottom: 24px;
      }

      .actions {
        display: flex;
        gap: 16px;
        justify-content: center;
        flex-wrap: wrap;

        button {
          mat-icon {
            margin-right: 8px;
          }
        }
      }
    }

    .logs-card {
      mat-card-header {
        background: #37474f;
        color: white;
        padding: 16px;
        margin: -16px -16px 16px -16px;
        border-radius: 4px 4px 0 0;

        mat-card-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          margin: 0;
        }
      }

      .logs-container {
        max-height: 300px;
        overflow-y: auto;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        background: #263238;
        padding: 12px;
        border-radius: 4px;

        .log-entry {
          padding: 6px 8px;
          margin-bottom: 4px;
          border-radius: 4px;
          display: flex;
          gap: 12px;

          &.info {
            background: rgba(33, 150, 243, 0.1);
            color: #2196f3;
          }

          &.success {
            background: rgba(76, 175, 80, 0.1);
            color: #4caf50;
          }

          &.error {
            background: rgba(244, 67, 54, 0.1);
            color: #f44336;
          }

          .log-time {
            opacity: 0.7;
            flex-shrink: 0;
          }

          .log-message {
            flex: 1;
          }
        }
      }
    }

    @media (max-width: 768px) {
      .demo-container {
        padding: 16px;
      }

      .result-container .actions {
        flex-direction: column;

        button {
          width: 100%;
        }
      }
    }
  `]
})
export class DniScannerDemoComponent {
  showScanner = false;
  capturedImage: string | null = null;
  logs: Array<{ timestamp: Date; message: string; type: 'info' | 'success' | 'error' }> = [];

  startScanner(): void {
    this.showScanner = true;
    this.capturedImage = null;
    this.addLog('Scanner iniciado', 'info');
  }

  onScannerReady(): void {
    this.addLog('Scanner listo - OpenCV.js cargado', 'success');
  }

  onImageCaptured(imageBase64: string): void {
    this.capturedImage = imageBase64;
    this.showScanner = false;
    this.addLog(`Imagen capturada - Tamaño: ${this.getImageSize(imageBase64)}`, 'success');
  }

  onScannerError(error: string): void {
    this.addLog(`Error: ${error}`, 'error');
  }

  resetScanner(): void {
    this.capturedImage = null;
    this.showScanner = true;
    this.addLog('Reiniciando scanner', 'info');
  }

  downloadImage(): void {
    if (!this.capturedImage) return;

    const link = document.createElement('a');
    link.href = this.capturedImage;
    link.download = `dni-capture-${Date.now()}.jpg`;
    link.click();
    
    this.addLog('Imagen descargada', 'success');
  }

  private addLog(message: string, type: 'info' | 'success' | 'error'): void {
    this.logs.unshift({
      timestamp: new Date(),
      message,
      type
    });

    // Mantener solo los últimos 10 logs
    if (this.logs.length > 10) {
      this.logs = this.logs.slice(0, 10);
    }
  }

  private getImageSize(base64: string): string {
    const sizeInBytes = (base64.length * 3) / 4;
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    return `${sizeInKB} KB`;
  }
}
