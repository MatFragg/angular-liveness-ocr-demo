import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FaceLivenessWrapper } from './face-liveness-wrapper/face-liveness-wrapper';

@Component({
  selector: 'app-liveness-check',
  standalone: true,
  imports: [CommonModule, FaceLivenessWrapper],
  template: `
    <div class="liveness-check-container">
      <app-face-liveness-wrapper></app-face-liveness-wrapper>
    </div>
  `,
  styles: [`
    .liveness-check-container {
      width: 100%;
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }
  `]
})
export class LivenessCheckComponent {
  private router = inject(Router);
}
