import { Component, signal, ChangeDetectorRef, ChangeDetectionStrategy, NgZone, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AppStateService, AppStep } from './services/AppStateService';
import { DniCapture } from './components/dni-capture/dni-capture';
import { DniScannerCaptureComponent } from './components/dni-scanner-capture/dni-scanner-capture.component';
import { FaceLivenessWrapper } from './components/face-liveness-wrapper/face-liveness-wrapper';
import { ChoicePanel } from './components/choice-panel/choice-panel';
import { CompareDni } from './components/compare-dni/compare-dni';
import { ReniecExtract } from './components/reniec-extract/reniec-extract';

@Component({
  selector: 'app-root',
  imports: [CommonModule, HttpClientModule, DniCapture, DniScannerCaptureComponent, FaceLivenessWrapper, ChoicePanel, CompareDni, ReniecExtract],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default
})
export class App implements OnInit {
  protected readonly title = signal('aws-liveness-demo');
  currentStep: AppStep = 'dni-capture';
  
  // Toggle para alternar entre método de captura tradicional vs scanner reactivo
  useReactiveScanner = false;

  constructor(
    public appState: AppStateService,
    private cd: ChangeDetectorRef,
    private zone: NgZone
  ) {
    // Detectar refresh de página
    this.detectPageRefresh();
  }

  private detectPageRefresh(): void {
    // Si el usuario está en sessionStorage, significa que hay estado previo
    const hasStoredState = sessionStorage.getItem('appState');
    
    // Obtener la clave de sesión almacenada previamente
    const previousSessionKey = sessionStorage.getItem('previousSessionKey');
    const currentSessionKey = sessionStorage.getItem('appSessionKey');
    
    // Si las claves son diferentes, hubo un refresh
    if (previousSessionKey && previousSessionKey !== currentSessionKey) {
      console.log('🔄 REFRESH DETECTADO - Reseteando a inicio');
      this.appState.resetToStart();
    }
    
    // Guardar la clave actual para comparar en el próximo refresh
    sessionStorage.setItem('previousSessionKey', currentSessionKey || '');
  }

  ngOnInit(): void {
    // Suscribirse a cambios de paso dentro de ngOnInit para evitar errores
    this.appState.currentStep$.subscribe(step => {
      this.zone.run(() => {
        console.log('📍 App recibió cambio de paso:', step);
        this.currentStep = step;
        this.cd.detectChanges();
        console.log('✓ Cambio de paso detectado y aplicado');
      });
    });
  }

  // En el App.ts, actualiza el array de pasos en la función isStepCompleted:
isStepCompleted(step: AppStep): boolean {
  const steps: AppStep[] = [
    'dni-capture', 
    'liveness', 
    'choice', 
    'compare-dni', 
    'reniec-validation', 
    'completed'
  ];
  
  // Si estamos en reniec-validation, también consideramos compare-dni como completado
  if (step === 'compare-dni' && this.currentStep === 'reniec-validation') {
    return true;
  }
  
  return steps.indexOf(step) < steps.indexOf(this.currentStep);
}

isStepActive(step: AppStep): boolean {
  // Si estamos en reniec-validation, el paso 5 debe mostrarse como activo
  if (step === 'reniec-validation' && this.currentStep === 'reniec-validation') {
    return true;
  }
  
  return this.currentStep === step;
}

toggleCaptureMethod(): void {
  this.useReactiveScanner = !this.useReactiveScanner;
  const method = this.useReactiveScanner ? 'Scanner Reactivo' : 'Captura Tradicional';
  console.log(`🔄 Método de captura cambiado a: ${method}`);
}

}
