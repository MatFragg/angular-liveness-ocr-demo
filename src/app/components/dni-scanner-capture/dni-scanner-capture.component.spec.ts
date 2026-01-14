import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DniScannerCaptureComponent } from './dni-scanner-capture.component';
import { DniService } from '../../services/dni';
import { AppStateService } from '../../services/AppStateService';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('DniScannerCaptureComponent', () => {
  let component: DniScannerCaptureComponent;
  let fixture: ComponentFixture<DniScannerCaptureComponent>;

  beforeEach(async () => {
    const dniServiceSpy = jasmine.createSpyObj('DniService', ['processDni']);
    const appStateSpy = jasmine.createSpyObj('AppStateService', ['getCurrentStep', 'hasDni', 'resetToStart', 'setDni', 'setDniPhoto', 'setCurrentStep']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [DniScannerCaptureComponent],
      providers: [
        { provide: DniService, useValue: dniServiceSpy },
        { provide: AppStateService, useValue: appStateSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DniScannerCaptureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start in idle state', () => {
    expect(component.currentStep).toBe('idle');
  });

  it('should transition to capturing-front when startCapture is called', () => {
    component.startCapture();
    expect(component.currentStep).toBe('capturing-front');
  });
});
