import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppStateService } from '@core/services/app-state.service';

@Component({
  selector: 'app-choice-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './choice-panel.html',
  styleUrls: ['./choice-panel.scss']
})
export class ChoicePanel implements OnInit {
  capturedDni: any | null = null;
  livenessPhoto: string | null = null;
  private router = inject(Router);

  constructor(private appState: AppStateService) {}

  ngOnInit(): void {
    this.capturedDni = this.appState.getDni();
    this.livenessPhoto = this.appState.getLivenessPhoto();
  }

  goToReniecValidation(): void {
    console.log('Navegando a validación RENIEC...');
    this.appState.setCurrentStep('reniec-validation');
    this.router.navigate(['/validation/reniec']);
  }

  goToCompareDni(): void {
    console.log('Navegando a comparación de DNI...');
    this.appState.setCurrentStep('compare-dni');
    this.router.navigate(['/validation/compare']);
  }

  goBack(): void {
    console.log('Volviendo al paso anterior...');
    this.appState.setCurrentStep('dni-capture');
    this.router.navigate(['/dni-capture']);
  }
}
