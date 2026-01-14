import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type AppStep = 'dni-capture' | 'liveness' | 'choice' | 'compare-dni' | 'reniec-validation' | 'completed';

@Injectable({
  providedIn: 'root',
})
export class AppStateService {
  private _dni: any = null;
  private _livenessResult: any = null;
  private _livenessPhoto: string | null = null;
  private _dniPhoto: any = null;
  private _serialNumber: string | null = null;
  private _sessionKey: string = '';
  private _comparisonResult: boolean | null = null;
  private _reniecValidationResult: boolean | null = null;
  
  // Sistema de pasos
  private _currentStep = new BehaviorSubject<AppStep>('dni-capture');
  public currentStep$: Observable<AppStep> = this._currentStep.asObservable();

  constructor() {
    this.initializeSession();
  }

  private initializeSession(): void {
    // Generar una clave de sesión única al inicializar el servicio
    const sessionKey = sessionStorage.getItem('appSessionKey');
    if (!sessionKey) {
      // Primera vez que se carga la app
      this._sessionKey = Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('appSessionKey', this._sessionKey);
      console.log('🆕 Nueva sesión iniciada:', this._sessionKey);
    } else {
      // La sesión ya existe - esto significa que NO fue un refresh
      this._sessionKey = sessionKey;
      console.log('📦 Sesión restaurada:', this._sessionKey);
    }
  }

  isNewSession(): boolean {
    // Verificar si esta es una sesión nueva (después de un refresh)
    const storedKey = sessionStorage.getItem('appSessionKey');
    return storedKey !== this._sessionKey;
  }

  setDni(dni: any) {
    this._dni = dni;
  }

  getDni() {
    return this._dni;
  }

  getDniNumber(): string | null {
    return this._dni?.numeroDni ?? null;
  }

  hasDni(): boolean {
    return !!this._dni;
  }

  setLivenessResult(result: any) {
    this._livenessResult = result;
  }

  getLivenessResult() {
    return this._livenessResult;
  }

  isLivenessPassed(): boolean {
    return this._livenessResult?.status === 'SUCCEEDED';
  }

  setLivenessPhoto(photoBase64: string | null) {
    this._livenessPhoto = photoBase64 ?? null;
  }

  getLivenessPhoto(): string | null {
    return this._livenessPhoto;
  }

  hasLivenessPhoto(): boolean {
    return !!(this._livenessPhoto && this._livenessPhoto.trim());
  }

  setDniPhoto(photo: any) {
    this._dniPhoto = photo;
  }

  getDniPhoto() {
    return this._dniPhoto;
  }

  setSerialNumber(serialNumber: string | null) {
    this._serialNumber = serialNumber;
  }

  getSerialNumber(): string | null {
    return this._serialNumber;
  }

  hasSerialNumber(): boolean {
    return !!(this._serialNumber && this._serialNumber.trim());
  }

  // Gestión de pasos
  getCurrentStep(): AppStep {
    return this._currentStep.value;
  }

  setCurrentStep(step: AppStep): void {
    this._currentStep.next(step);
  }

  goToNextStep(): void {
    const current = this._currentStep.value;
    if (current === 'dni-capture') {
      this._currentStep.next('liveness');
    } else if (current === 'liveness') {
      this._currentStep.next('choice');
    } else if (current === 'choice') {
      // No hay siguiente paso automático después de choice,
      // se navega explícitamente a reniec-validation o compare
    } else if (current === 'reniec-validation') {
      this._currentStep.next('completed');
    }
  }

  resetToStart(): void {
    this._dni = null;
    this._livenessResult = null;
    this._livenessPhoto = null;
    this._dniPhoto = null;
    this._comparisonResult = null;
    this._reniecValidationResult = null;
    this._currentStep.next('dni-capture');
  }

  // Gestión de resultados de validación
  setComparisonResult(isMatch: boolean): void {
    this._comparisonResult = isMatch;
  }

  getComparisonResult(): boolean | null {
    return this._comparisonResult;
  }

  setReniecValidationResult(isHit: boolean): void {
    this._reniecValidationResult = isHit;
  }

  getReniecValidationResult(): boolean | null {
    return this._reniecValidationResult;
  }
}
