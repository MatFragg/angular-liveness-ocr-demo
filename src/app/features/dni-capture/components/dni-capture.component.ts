import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DniCapture } from './dni-capture/dni-capture';

@Component({
  selector: 'app-dni-capture-container',
  standalone: true,
  imports: [CommonModule, DniCapture],
  template: `
    <div class="dni-capture-container">
      <app-dni-capture></app-dni-capture>
    </div>
  `,
  styles: [`
    .dni-capture-container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
  `]
})
export class DniCaptureComponent {
  private router = inject(Router);
}
