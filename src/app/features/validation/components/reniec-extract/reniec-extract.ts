import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStateService } from '@core/services/app-state.service';
import { FacialValidationRequest, FacialValidationResponse, ReniecService } from '../../services/reniec.service';
import { DeviceInfoService } from '@core/services/device-info.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reniec-extract',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reniec-extract.html',
  styleUrls: ['./reniec-extract.scss']
})
export class ReniecExtract implements OnInit {
  // Datos del request
  previewData: FacialValidationRequest | null = null;
  serialNumber: string = '123456789';
  hasSerialNumber = false;
  
  // Estados de la UI
  isSending = false;
  response: FacialValidationResponse | null = null;
  error: string | null = null;
  
  // Información del estado actual
  dni: string | null = null;
  hasLivenessPhoto = false;
  livenessPassed = false;
  
  // Mensaje que se mostrará en pantalla
  statusMessage: string = '';
  showStatusMessage: boolean = false;
  isRedirecting: boolean = false;
  
  // Estadísticas de la imagen
  imageStats = {
    sizeKB: 0,
    dimensions: { width: 0, height: 0 },
    base64Length: 0
  };

  constructor(
    private appState: AppStateService,
    private reniecService: ReniecService,
    private deviceInfo: DeviceInfoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Detectar si hubo un refresh
    this.detectAndHandleRefresh();
    
    this.loadAppStateData();
    this.loadDeviceSerial();
  }

  private detectAndHandleRefresh(): void {
    // Verificar si no hay DNI pero estamos en reniec-validation
    const hasDni = this.appState.hasDni();
    const hasLivenessPhoto = this.appState.hasLivenessPhoto();
    const currentStep = this.appState.getCurrentStep();

    if ((!hasDni || !hasLivenessPhoto) && currentStep === 'reniec-validation') {
      console.log('🔄 REFRESH DETECTADO EN RENIEC-EXTRACT - Estado incompleto');
      this.appState.resetToStart();
    }
  }

  private loadDeviceSerial(): void {
    const serial = this.deviceInfo.getOrCreateSerial();
    if (serial && serial.trim()) {
      this.serialNumber = serial.trim();
      this.appState.setSerialNumber(this.serialNumber);
      this.hasSerialNumber = this.appState.hasSerialNumber();
    }
  }

  private loadAppStateData(): void {
    console.log('Cargando datos del AppState...');
    
    this.dni = this.appState.getDniNumber();
    const livenessPhoto = this.appState.getLivenessPhoto();
    this.serialNumber = this.appState.getSerialNumber() ?? this.serialNumber;
    this.hasSerialNumber = this.appState.hasSerialNumber() || !!this.serialNumber;
    
    this.hasLivenessPhoto = this.appState.hasLivenessPhoto();
    this.livenessPassed = this.appState.isLivenessPassed();

    if (this.dni && livenessPhoto) {
      this.generatePreview(livenessPhoto);
    }
  }

  private generatePreview(livenessPhoto: string): void {
    this.previewData = this.reniecService.buildFacialValidationRequest(
      this.dni!,
      livenessPhoto,
      this.serialNumber
    );
    
    this.calculateImageStats(livenessPhoto);
  }

  private calculateImageStats(base64Image: string): void {
    if (!base64Image) return;
    
    const base64Length = base64Image.length;
    const sizeInKB = Math.round((base64Length * 3) / 4 / 1024);
    
    this.imageStats.base64Length = base64Length;
    this.imageStats.sizeKB = sizeInKB;
    
    this.getImageDimensions(base64Image);
  }

  private getImageDimensions(base64Image: string): void {
    const img = new Image();
    img.onload = () => {
      this.imageStats.dimensions = {
        width: img.width,
        height: img.height
      };
    };
    
    img.onerror = () => {
      this.imageStats.dimensions = { width: 0, height: 0 };
    };
    
    if (base64Image.startsWith('data:image')) {
      img.src = base64Image;
    } else {
      img.src = `data:image/jpeg;base64,${base64Image}`;
    }
  }

  sendValidation(): void {
    console.log('=== INICIANDO VALIDACIÓN FACIAL ===');
    
    if (!this.previewData) {
      this.showError('No hay datos para enviar. Complete primero la verificación de liveness.');
      return;
    }

    if (!this.validateRequestData()) {
      return;
    }

    this.isSending = true;
    this.error = null;
    this.response = null;
    this.statusMessage = 'Enviando validación facial...';
    this.showStatusMessage = true;

    this.reniecService.validacionFacial(this.previewData).subscribe({
      next: (resp) => {
        console.log('=== RESPUESTA DEL BACKEND ===', resp);
        this.isSending = false;
        this.handleResponse(resp);
      },
      error: (err) => {
        console.error('=== ERROR EN LA SOLICITUD ===', err);
        this.isSending = false;
        this.showError(this.extractErrorMessage(err));
      }
    });
  }

  private validateRequestData(): boolean {
    const errors: string[] = [];

    if (!this.previewData!.documentNumber || this.previewData!.documentNumber.length < 8) {
      errors.push('El DNI debe tener al menos 8 dígitos');
    }

    if (!this.previewData!.template || this.previewData!.template.length < 100) {
      errors.push('La imagen facial es inválida o muy pequeña');
    }

    if (!this.previewData!.serialNumber || this.previewData!.serialNumber.trim() === '') {
      errors.push('El número de serie del dispositivo es requerido');
    }

    if (errors.length > 0) {
      this.showError(errors.join('. '));
      return false;
    }

    return true;
  }

  private handleResponse(response: any): void {
    console.log('Procesando respuesta...', response);
    
    // CASO A: Backend devuelve solo el objeto data (sin result)
    if (response && response.reniecErrorCode !== undefined) {
      console.log('✓ Respuesta con solo data recibida');
      
      // Convertir el objeto data en la estructura completa
      this.response = {
        result: {
          code: '000',
          info: 'OK'
        },
        data: response
      };
      
      this.processSuccessResponse();
      return;
    }
    
    // CASO B: Backend devuelve estructura completa con result y data
    if (response && response.result && response.data) {
      console.log('✓ Respuesta completa recibida');
      
      this.response = response;
      
      if (response.result.code === '000' || response.result.code === '0000') {
        this.processSuccessResponse();
      } else {
        this.showError(response.result.info || 'Error en la validación');
      }
      return;
    }
    
    // CASO C: Respuesta inesperada
    this.showError('Formato de respuesta inesperado del servidor');
  }

  private processSuccessResponse(): void {
    if (!this.response?.data) return;
    
    console.log('✓ Validación exitosa');
    
    const errorDesc = this.response.data.reniecErrorDescription || '';
    const personName = this.response.data.personName || '';
    const personLastName = this.response.data.personLastName || '';
    const personMotherLastName = this.response.data.personMotherLastName || '';
    const documentNumber = this.response.data.documentNumber || '';
    
    // Guardar el resultado de RENIEC en el estado
    this.appState.setReniecValidationResult(this.isHit);
    
    // Mostrar mensaje en pantalla según el resultado
    if (this.isHit) {
      this.statusMessage = '¡Persona Identificada!';
      this.showStatusMessage = true;
      
      // NO redirigir automáticamente - permitir que el usuario vea los datos
      // this.isRedirecting = true;
      // setTimeout(() => {
      //   console.log('Redirigiendo a pantalla inicial...');
      //   this.showFinalAlert();
      //   this.appState.resetToStart();
      // }, 3000);
    } else if (this.isNoHit) {
      this.statusMessage = 'NO HIT - La persona no coincide';
      this.showStatusMessage = true;
      
      // También configurar redirección para NO HIT
      this.isRedirecting = true;
      setTimeout(() => {
        console.log('Redirigiendo a pantalla inicial...');
        this.showFinalAlert();
        this.appState.resetToStart();
      }, 3000);
    } else {
      this.statusMessage = 'Validación completada';
      this.showStatusMessage = true;
    }
    
    console.log('Mensaje mostrado:', this.statusMessage);
    console.log('Datos de la persona:', {
      nombre: personName + ' ' + personLastName + ' ' + personMotherLastName,
      dni: documentNumber,
      tracking: this.response.data.traking
    });
    
    // Forzar detección de cambios para que Angular actualice la vista
    console.log('🔄 Forzando detección de cambios...');
    this.cdr.detectChanges();
    console.log('✅ Detección de cambios completada');
  }

  private showError(message: string): void {
    this.error = message;
    this.statusMessage = '';
    this.showStatusMessage = false;
    console.error('Error:', message);
  }

  private extractErrorMessage(error: any): string {
    if (error.status === 0) {
      return 'Error de conexión: No se pudo conectar con el servidor. Verifique que el backend esté ejecutándose.';
    } else if (error.status === 400) {
      return 'Error en la solicitud. Verifique los datos enviados.';
    } else if (error.status === 401) {
      return 'Error de autenticación con el servicio RENIEC';
    } else if (error.status === 500) {
      if (error.error && error.error.info) {
        return `Error interno del servidor: ${error.error.info}`;
      }
      return 'Error interno del servidor. Intente nuevamente.';
    } else if (error.error?.message) {
      return error.error.message;
    } else if (error.message) {
      return error.message;
    } else {
      return `Error desconocido: ${error.status || 'No se pudo completar la solicitud'}`;
    }
  }

  // Propiedades computadas para la vista
  get isHit(): boolean {
    if (!this.response?.data) {
      console.log('❌ isHit: false - no response.data');
      return false;
    }
    
    const errorCode = Number(this.response.data.reniecErrorCode);
    const errorDesc = this.response.data.reniecErrorDescription || '';
    
    console.log('🔍 Verificando HIT:', {
      errorCode,
      errorDesc,
      isCode70006: errorCode === 70006,
      includesHIT: errorDesc.includes('HIT: Persona Identificada'),
      fullData: this.response.data
    });
    
    const result = errorCode === 70006 || errorDesc.includes('HIT: Persona Identificada');
    console.log(`✅ isHit resultado: ${result}`);
    
    return result;
  }

  get isNoHit(): boolean {
    if (!this.response?.data) return false;
    
    const errorCode = Number(this.response.data.reniecErrorCode);
    const errorDesc = this.response.data.reniecErrorDescription || '';
    
    return errorCode === 70007 || errorDesc.includes('NO HIT');
  }

  get showSuccess(): boolean {
    return (this.response?.data && this.isHit) || 
           this.response?.result?.code === '000' || 
           this.response?.result?.code === '0000';
  }

  get hasResponse(): boolean {
    return this.response !== null;
  }

  reset(): void {
    console.log('Reiniciando componente...');
    this.appState.resetToStart();
  }

  get isPersonaIdentificada(): boolean {
    if (!this.response?.data) return false;
    return this.isHit;
  }

  copyTracking(): void {
    if (this.response?.data?.traking) {
      navigator.clipboard.writeText(this.response.data.traking)
        .then(() => {
          console.log('✓ Tracking copiado al portapapeles');
          this.statusMessage = 'Código copiado al portapapeles';
          this.showStatusMessage = true;
          setTimeout(() => {
            this.showStatusMessage = false;
          }, 2000);
        })
        .catch(err => {
          console.error('Error al copiar tracking:', err);
          this.showError('No se pudo copiar el código de seguimiento');
        });
    }
  }

  refreshData(): void {
    console.log('Refrescando datos del estado...');
    this.loadAppStateData();
  }

  get canValidate(): boolean {
    return this.dni !== null && 
           this.hasLivenessPhoto && 
           this.hasSerialNumber &&
           !this.isSending;
  }

  get validationStatus(): string {
    if (this.isHit) return 'HIT - Persona identificada';
    if (this.isNoHit) return 'NO HIT - No coincide';
    if (this.showSuccess && this.response?.data) return 'Validación exitosa';
    return 'Pendiente';
  }

  get validationStatusClass(): string {
    if (this.isHit) return 'status-hit';
    if (this.isNoHit) return 'status-no-hit';
    if (this.showSuccess) return 'status-success';
    return 'status-pending';
  }

  dismissStatusMessage(): void {
    this.showStatusMessage = false;
    this.statusMessage = '';
  }

  // Getter para depurar la visibilidad de la sección de datos de persona
  get shouldShowPersonData(): boolean {
    const hasResponse = this.response !== null;
    const hasData = this.response?.data !== null && this.response?.data !== undefined;
    const hitStatus = this.isHit;
    
    console.log('🔍 shouldShowPersonData:', {
      hasResponse,
      hasData,
      hitStatus,
      result: hasResponse && hasData && hitStatus,
      responseData: this.response?.data
    });
    
    return hasResponse && hasData && hitStatus;
  }

  onImageError(event: Event): void {
    console.error('Error cargando la imagen:', event);
    const img = event.target as HTMLImageElement;
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGMkYyRjIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2Ij5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4=';
  }

  private showFinalAlert(): void {
    // Obtener resultados de ambos procesos
    const comparisonResult = this.appState.getComparisonResult();
    const reniecResult = this.appState.getReniecValidationResult();
    
    // Determinar si ambos procesos fueron exitosos
    let alertMessage = '';
    
    if (comparisonResult !== null && reniecResult !== null) {
      // Ambos procesos se completaron
      if (comparisonResult && reniecResult) {
        alertMessage = 'HIT, persona identificada';
      } else {
        alertMessage = 'No HIT, persona no identificada';
      }
    } else if (reniecResult !== null) {
      // Solo se completó RENIEC
      if (reniecResult) {
        alertMessage = 'HIT, persona identificada';
      } else {
        alertMessage = 'No HIT, persona no identificada';
      }
    } else {
      // Por defecto
      alertMessage = 'Proceso completado';
    }
    
    alert(alertMessage);
  }
}