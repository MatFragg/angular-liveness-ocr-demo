import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CompareDni } from '../compare-dni/compare-dni';

@Component({
  selector: 'app-comparison',
  standalone: true,
  imports: [CommonModule, CompareDni],
  template: `
    <div class="comparison-container">
      <app-compare-dni></app-compare-dni>
    </div>
  `,
  styles: [`
    .comparison-container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
  `]
})
export class ComparisonComponent {
  private router = inject(Router);
}
