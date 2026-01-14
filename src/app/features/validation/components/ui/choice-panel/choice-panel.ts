import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../services/AppStateService';

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

  constructor(private appState: AppStateService) {}

  ngOnInit(): void {
    this.capturedDni = this.appState.getDni();
    this.livenessPhoto = this.appState.getLivenessPhoto();
  }

  goToReniecValidation(): void {
    console.log('Navegando a validación RENIEC...');
    this.appState.setCurrentStep('reniec-validation');
  }

  goToCompareDni(): void {
    console.log('Navegando a comparación de DNI...');
    this.appState.setCurrentStep('compare-dni');
  }

  goBack(): void {
    console.log('Volviendo al paso anterior...');
    this.appState.setCurrentStep('dni-capture');
  }
}
