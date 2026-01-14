import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DniScannerCaptureComponent } from './dni-scanner-capture/dni-scanner-capture.component';

@Component({
  selector: 'app-dni-capture-container',
  standalone: true,
  imports: [CommonModule, DniScannerCaptureComponent],
  template: `
    <div class="dni-capture-container">
      <h2>Captura de DNI con OpenCV</h2>
      <p class="subtitle">Coloca tu DNI frente a la cámara y el sistema lo detectará automáticamente</p>
      <app-dni-scanner-capture></app-dni-scanner-capture>
    </div>
  `,
  styles: [`
    .dni-capture-container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    h2 {
      text-align: center;
      color: #333;
      margin-bottom: 10px;
    }
    
    .subtitle {
      text-align: center;
      color: #666;
      margin-bottom: 30px;
      font-size: 0.9rem;
    }
  `]
})
export class DniCaptureComponent {
  private router = inject(Router);
}
