import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReniecExtract } from '../reniec-extract/reniec-extract';

@Component({
  selector: 'app-reniec-validation',
  standalone: true,
  imports: [CommonModule, ReniecExtract],
  template: `
    <div class="reniec-validation-container">
      <app-reniec-extract></app-reniec-extract>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0c4a6e 100%);
      background-attachment: fixed;
      position: relative;
    }
    
    :host::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 40%),
        radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 40%),
        radial-gradient(circle at 40% 60%, rgba(139, 92, 246, 0.08) 0%, transparent 30%);
      pointer-events: none;
      z-index: 0;
    }
    
    .reniec-validation-container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      position: relative;
      z-index: 1;
    }
  `]
})
export class ReniecValidationComponent {
  private router = inject(Router);
}
