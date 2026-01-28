import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppStateService } from '@core/services/app-state.service';
import { LoggerService } from '@core/services/logger.service';

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
  private logger = inject(LoggerService);

  constructor(private appState: AppStateService) {}

  ngOnInit(): void {
    this.capturedDni = this.appState.getDni();
    this.livenessPhoto = this.appState.getLivenessPhoto();
  }

  goToReniecValidation(): void {
    this.logger.log('NAV', 'Navegando a validación RENIEC');
    this.appState.setCurrentStep('reniec-validation');
    this.router.navigate(['/validation/reniec']);
  }

  goToCompareDni(): void {
    this.logger.log('NAV', 'Navegando a comparación de DNI');
    this.appState.setCurrentStep('compare-dni');
    this.router.navigate(['/validation/compare']);
  }

  goBack(): void {
    this.logger.log('NAV', 'Volviendo a DNI capture');
    this.appState.setCurrentStep('dni-capture');
    this.router.navigate(['/dni-capture']);
  }
}
