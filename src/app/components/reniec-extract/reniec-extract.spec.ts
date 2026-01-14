import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReniecExtract } from './reniec-extract';
import { AppStateService } from '../../services/AppStateService';
import { ReniecService } from '../../services/reniec.service';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('ReniecExtract', () => {
  let component: ReniecExtract;
  let fixture: ComponentFixture<ReniecExtract>;
  let mockAppStateService: jasmine.SpyObj<AppStateService>;
  let mockReniecService: jasmine.SpyObj<ReniecService>;
  let mockDeviceInfoService: jasmine.SpyObj<any>;

  beforeEach(async () => {
    mockAppStateService = jasmine.createSpyObj('AppStateService', [
      'getDni', 'getDniNumber', 'hasLivenessPhoto', 'isLivenessPassed', 'getLivenessPhoto',
      'getSerialNumber', 'setSerialNumber', 'hasSerialNumber'
    ]);
    
    mockReniecService = jasmine.createSpyObj('ReniecService', [
      'buildFacialValidationRequest', 'validacionFacial'
    ]);

    mockDeviceInfoService = jasmine.createSpyObj('DeviceInfoService', [
      'getOrCreateSerial'
    ]);
    mockDeviceInfoService.getOrCreateSerial.and.returnValue('SERIAL-001');

    await TestBed.configureTestingModule({
      imports: [ReniecExtract, CommonModule],
      providers: [
        { provide: AppStateService, useValue: mockAppStateService },
        { provide: ReniecService, useValue: mockReniecService },
        { provide: DeviceInfoService, useValue: mockDeviceInfoService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReniecExtract);
    component = fixture.componentInstance;
  });

  it('should create component instance', () => {
    expect(component).toBeTruthy();
  });

  it('should load data from AppStateService on init', () => {
    mockAppStateService.getDni.and.returnValue({ numeroDni: '12345678' } as any);
    mockAppStateService.getDniNumber.and.returnValue('12345678');
    mockAppStateService.hasLivenessPhoto.and.returnValue(true);
    mockAppStateService.isLivenessPassed.and.returnValue(true);
    mockAppStateService.getLivenessPhoto.and.returnValue('base64image');
    mockAppStateService.getSerialNumber.and.returnValue('DEVICE-001');
    mockAppStateService.hasSerialNumber.and.returnValue(true);
    
    mockReniecService.buildFacialValidationRequest.and.returnValue({
      serialNumber: 'DEVICE-001',
      template: 'base64image',
      type: 'R',
      quality: '/',
      documentNumber: '12345678'
    });

    fixture.detectChanges();

    expect(component.dni).toBe('12345678');
    expect(component.serialNumber).toBe('DEVICE-001');
    expect(component.hasLivenessPhoto).toBe(true);
    expect(component.livenessPassed).toBe(true);
    expect(component.hasSerialNumber).toBe(true);
    expect(component.previewData).toBeTruthy();
    expect(mockDeviceInfoService.getOrCreateSerial).toHaveBeenCalled();
  });

  it('should handle successful validation with HIT response', () => {
    const mockResponse = {
      result: { code: '000', info: 'OK' },
      data: {
        reniecErrorCode: 70006,
        reniecErrorDescription: 'HIT: Persona Identificada',
        documentType: 1,
        documentNumber: '12345678',
        personName: 'JUAN',
        personLastName: 'PEREZ',
        personMotherLastName: 'GOMEZ',
        expirationDate: '16-02-2032',
        validity: '1',
        restriction: '',
        restrictionGroup: '22',
        traking: '8ea178d200504158ae23d8cd95c5ce13'
      }
    };

    mockReniecService.validacionFacial.and.returnValue(of(mockResponse));
    component.previewData = {
      serialNumber: 'DEVICE-001',
      template: 'base64image',
      type: 'R',
      quality: '/',
      documentNumber: '12345678'
    };

    component.sendValidation();

    expect(component.isSending).toBeFalse();
    expect(component.response).toEqual(mockResponse);
    expect(component.error).toBeNull();
    expect(component.isHit).toBeTrue();
    expect(component.validationStatus).toBe('HIT - Persona identificada');
  });

  it('should handle NO HIT response', () => {
    const mockResponse = {
      result: { code: '000', info: 'OK' },
      data: {
        reniecErrorCode: 70007,
        reniecErrorDescription: 'NO HIT',
        documentType: 1,
        documentNumber: '12345678',
        personName: '',
        personLastName: '',
        personMotherLastName: '',
        expirationDate: '',
        validity: '',
        restriction: '',
        restrictionGroup: '',
        traking: 'abc123'
      }
    };

    mockReniecService.validacionFacial.and.returnValue(of(mockResponse));
    component.previewData = {
      serialNumber: 'DEVICE-001',
      template: 'base64image',
      type: 'R',
      quality: '/',
      documentNumber: '12345678'
    };

    component.sendValidation();

    expect(component.isNoHit).toBeTrue();
    expect(component.validationStatus).toBe('NO HIT - No corresponde');
  });

  it('should handle network error', () => {
    const mockError = { 
      status: 0,
      message: 'Network error'
    };

    mockReniecService.validacionFacial.and.returnValue(throwError(() => mockError));
    component.previewData = {
      serialNumber: 'DEVICE-001',
      template: 'base64image',
      type: 'R',
      quality: '/',
      documentNumber: '12345678'
    };

    component.sendValidation();

    expect(component.isSending).toBeFalse();
    expect(component.error).toContain('No se pudo conectar con el servidor');
  });

  it('should update serial number in AppState', () => {
    component.serialNumber = 'NEW-DEVICE-001';
    component.onSerialNumberChange();
    
    expect(mockAppStateService.setSerialNumber).toHaveBeenCalledWith('NEW-DEVICE-001');
  });

  it('should validate request data correctly', () => {
    component.previewData = {
      serialNumber: '',
      template: '',
      type: 'R',
      quality: '/',
      documentNumber: '123'
    };

    const isValid = component['validateRequestData']();
    
    expect(isValid).toBeFalse();
    expect(component.error).toContain('El DNI debe tener al menos 8 dígitos');
    expect(component.error).toContain('La imagen facial está vacía');
    expect(component.error).toContain('El número de serie del dispositivo es requerido');
  });

  it('should detect canValidate correctly', () => {
    component.dni = '12345678';
    component.hasLivenessPhoto = true;
    component.hasSerialNumber = true;
    component.isSending = false;

    expect(component.canValidate).toBeTrue();

    component.hasSerialNumber = false;
    expect(component.canValidate).toBeFalse();
  });
});