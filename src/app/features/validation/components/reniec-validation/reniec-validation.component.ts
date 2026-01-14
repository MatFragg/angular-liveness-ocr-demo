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
    .reniec-validation-container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
  `]
})
export class ReniecValidationComponent {
  private router = inject(Router);
}
