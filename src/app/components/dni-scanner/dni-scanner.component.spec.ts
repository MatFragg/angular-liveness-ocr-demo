import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DniScannerComponent } from './dni-scanner.component';
import { OpenCVService } from '../../core/services/opencv.service';
import { CameraService } from '../../core/services/camera.service';

describe('DniScannerComponent', () => {
  let component: DniScannerComponent;
  let fixture: ComponentFixture<DniScannerComponent>;
  let opencvService: jasmine.SpyObj<OpenCVService>;
  let cameraService: jasmine.SpyObj<CameraService>;

  beforeEach(async () => {
    const opencvSpy = jasmine.createSpyObj('OpenCVService', ['loadOpenCV', 'getCV', 'isCVLoaded']);
    const cameraSpy = jasmine.createSpyObj('CameraService', ['requestCameraAccess', 'stopStream', 'isCameraSupported']);

    await TestBed.configureTestingModule({
      imports: [DniScannerComponent],
      providers: [
        { provide: OpenCVService, useValue: opencvSpy },
        { provide: CameraService, useValue: cameraSpy }
      ]
    }).compileComponents();

    opencvService = TestBed.inject(OpenCVService) as jasmine.SpyObj<OpenCVService>;
    cameraService = TestBed.inject(CameraService) as jasmine.SpyObj<CameraService>;

    fixture = TestBed.createComponent(DniScannerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default configuration', () => {
    expect(component.analysisIntervalMs).toBe(400);
    expect(component.blurThreshold).toBe(100);
    expect(component.distanceThreshold).toBe(30);
  });

  it('should check camera support on init', () => {
    cameraService.isCameraSupported.and.returnValue(true);
    expect(cameraService.isCameraSupported).toBeDefined();
  });
});
