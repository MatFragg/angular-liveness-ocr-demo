import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChoicePanel } from './ui/choice-panel/choice-panel';

@Component({
  selector: 'app-validation-choice',
  standalone: true,
  imports: [CommonModule, ChoicePanel],
  template: `
    <div class="validation-choice-container">
      <h2>¿Cómo desea validar su identidad?</h2>
      <app-choice-panel></app-choice-panel>
    </div>
  `,
  styles: [`
    .validation-choice-container {
      width: 100%;
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
      text-align: center;
    }
    
    h2 {
      margin-bottom: 30px;
      color: #333;
    }
  `]
})
export class ValidationChoiceComponent {
  private router = inject(Router);
}
