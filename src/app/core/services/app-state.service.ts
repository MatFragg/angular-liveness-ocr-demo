import { Injectable, signal, computed } from '@angular/core';

export type AppStep = 'dni-capture' | 'liveness' | 'choice' | 'compare-dni' | 'reniec-validation' | 'completed';

export interface VerificationFlowState {
  dni: any | null;
  livenessResult: any | null;
  livenessPhoto: string | null;
  dniPhoto: any | null;
  serialNumber: string | null;
  comparisonResult: boolean | null;
  reniecValidationResult: boolean | null;
  currentStep: AppStep;
}

@Injectable({ providedIn: 'root' })
export class AppStateService {
  private state = signal<VerificationFlowState>({
    dni: null,
    livenessResult: null,
    livenessPhoto: null,
    dniPhoto: null,
    serialNumber: null,
    comparisonResult: null,
    reniecValidationResult: null,
    currentStep: 'dni-capture'
  });

  // Readonly signals
  dni = computed(() => this.state().dni);
  livenessResult = computed(() => this.state().livenessResult);
  livenessPhoto = computed(() => this.state().livenessPhoto);
  dniPhoto = computed(() => this.state().dniPhoto);
  serialNumber = computed(() => this.state().serialNumber);
  comparisonResult = computed(() => this.state().comparisonResult);
  reniecValidationResult = computed(() => this.state().reniecValidationResult);
  currentStep = computed(() => this.state().currentStep);

  // Computed: flow completion checks
  hasDni = computed(() => !!this.state().dni);
  hasLivenessResult = computed(() => !!this.state().livenessResult);
  hasLivenessPhoto = computed(() => !!(this.state().livenessPhoto && this.state().livenessPhoto!.trim()));
  hasSerialNumber = computed(() => !!(this.state().serialNumber && this.state().serialNumber!.trim()));
  isLivenessPassed = computed(() => this.state().livenessResult?.status === 'SUCCEEDED');

  // Session key management
  private sessionKey: string = '';

  constructor() {
    this.initializeSession();
  }

  private initializeSession(): void {
    const sessionKey = sessionStorage.getItem('appSessionKey');
    if (!sessionKey) {
      this.sessionKey = Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('appSessionKey', this.sessionKey);
      console.log('🆕 Nueva sesión iniciada:', this.sessionKey);
    } else {
      this.sessionKey = sessionKey;
      console.log('📦 Sesión restaurada:', this.sessionKey);
    }
  }

  isNewSession(): boolean {
    const storedKey = sessionStorage.getItem('appSessionKey');
    return storedKey !== this.sessionKey;
  }

  // Setters
  setDni(dni: any) {
    this.state.update(s => ({ ...s, dni }));
  }

  setLivenessResult(result: any) {
    this.state.update(s => ({ ...s, livenessResult: result }));
  }

  setLivenessPhoto(photoBase64: string | null) {
    this.state.update(s => ({ ...s, livenessPhoto: photoBase64 ?? null }));
  }

  setDniPhoto(photo: any) {
    this.state.update(s => ({ ...s, dniPhoto: photo }));
  }

  setSerialNumber(serialNumber: string | null) {
    this.state.update(s => ({ ...s, serialNumber }));
  }

  setComparisonResult(isMatch: boolean) {
    this.state.update(s => ({ ...s, comparisonResult: isMatch }));
  }

  setReniecValidationResult(isHit: boolean) {
    this.state.update(s => ({ ...s, reniecValidationResult: isHit }));
  }

  setCurrentStep(step: AppStep) {
    this.state.update(s => ({ ...s, currentStep: step }));
  }

  // Legacy getters (for compatibility during migration)
  getDni() {
    return this.state().dni;
  }

  getDniNumber(): string | null {
    return this.state().dni?.numeroDni ?? null;
  }

  getLivenessResult() {
    return this.state().livenessResult;
  }

  getLivenessPhoto(): string | null {
    return this.state().livenessPhoto;
  }

  getDniPhoto() {
    return this.state().dniPhoto;
  }

  getSerialNumber(): string | null {
    return this.state().serialNumber;
  }

  getCurrentStep(): AppStep {
    return this.state().currentStep;
  }

  getComparisonResult(): boolean | null {
    return this.state().comparisonResult;
  }

  getReniecValidationResult(): boolean | null {
    return this.state().reniecValidationResult;
  }

  // Navigation
  goToNextStep(): void {
    const current = this.state().currentStep;
    let nextStep: AppStep = current;

    switch (current) {
      case 'dni-capture':
        nextStep = 'liveness';
        break;
      case 'liveness':
        nextStep = 'choice';
        break;
      case 'reniec-validation':
        nextStep = 'completed';
        break;
    }

    this.state.update(s => ({ ...s, currentStep: nextStep }));
  }

  resetToStart(): void {
    this.state.set({
      dni: null,
      livenessResult: null,
      livenessPhoto: null,
      dniPhoto: null,
      serialNumber: null,
      comparisonResult: null,
      reniecValidationResult: null,
      currentStep: 'dni-capture'
    });
  }
}
