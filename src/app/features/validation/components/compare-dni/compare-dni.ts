import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppStateService } from '@core/services/app-state.service';
import { FaceComparisonService } from '../../services/face-comparison.service';

interface ComparisonResult {
  status: string;
  message: string;
  similarityScore: number;
  isMatch: boolean;
  confidenceLevel: string;
  faceMatchesCount: number;
  faceMatches?: Array<{
    similarity: number;
    boundingBox?: {
      width: number;
      height: number;
      left: number;
      top: number;
    };
  }>;
  sourceFaceDetails?: any;
  targetFaceDetails?: any;
}

@Component({
  selector: 'app-compare-dni',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compare-dni.html',
  styleUrls: ['./compare-dni.scss']
})
export class CompareDni implements OnInit {
  private appState = inject(AppStateService);
  private comparisonService = inject(FaceComparisonService);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);

  // Estado del componente
  loading = false;
  comparing = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  
  // Configuración
  similarityThreshold = 85;
  autoContinue = false;
  
  // Resultados
  comparisonResult: ComparisonResult | null = null;
  
  // Imágenes
  dniImageBase64: string | null = null;
  livenessImageBase64: string | null = null;
  dniFileName = 'dni.jpg';
  livenessFileName = 'liveness.jpg';
  
  // Estadísticas
  matchStats = {
    totalComparisons: 0,
    successfulMatches: 0,
    failedMatches: 0,
    averageSimilarity: 0
  };

  ngOnInit(): void {
    this.loadStateFromAppState();
    
    // Cargar estadísticas desde localStorage
    this.loadStats();
    
    // Si tenemos ambas imágenes, realizar comparación automática
    if (this.dniImageBase64 && this.livenessImageBase64) {
      setTimeout(() => {
        this.performComparison();
      }, 500);
    }
  }

  private loadStateFromAppState(): void {
    const dniPhoto = this.appState.getDniPhoto();
    const livenessPhoto = this.appState.getLivenessPhoto();
    
    console.log('DNI Photo from state:', dniPhoto);
    console.log('Liveness Photo from state:', livenessPhoto);
    
    // Obtener imagen del DNI
    if (dniPhoto) {
      if (typeof dniPhoto === 'object') {
        // Si es un objeto, intentar extraer la imagen
        if (dniPhoto.imageBase64) {
          this.dniImageBase64 = dniPhoto.imageBase64.startsWith('data:') ? dniPhoto.imageBase64 : `data:image/jpeg;base64,${dniPhoto.imageBase64}`;
        } else if (dniPhoto.image) {
          this.dniImageBase64 = dniPhoto.image.startsWith('data:') ? dniPhoto.image : `data:image/jpeg;base64,${dniPhoto.image}`;
        } else if (dniPhoto.base64) {
          this.dniImageBase64 = dniPhoto.base64.startsWith('data:') ? dniPhoto.base64 : `data:image/jpeg;base64,${dniPhoto.base64}`;
        }
      } else if (typeof dniPhoto === 'string') {
        this.dniImageBase64 = dniPhoto.startsWith('data:') ? dniPhoto : `data:image/jpeg;base64,${dniPhoto}`;
      }
    }
    
    // Obtener imagen del liveness
    if (livenessPhoto) {
      this.livenessImageBase64 = livenessPhoto.startsWith('data:') ? livenessPhoto : `data:image/jpeg;base64,${livenessPhoto}`;
    }
    
    // Si no tenemos imágenes, mostrar error
    if (!this.dniImageBase64) {
      this.errorMessage = 'No se encontró la imagen del DNI. Por favor, vuelva a capturar el documento.';
    }
    
    if (!this.livenessImageBase64) {
      this.errorMessage = 'No se encontró la imagen del Liveness. Por favor, realice nuevamente la verificación de vivacidad.';
    }
  }

  private loadStats(): void {
    const savedStats = localStorage.getItem('faceComparisonStats');
    if (savedStats) {
      this.matchStats = JSON.parse(savedStats);
    }
  }

  private saveStats(result: ComparisonResult): void {
    this.matchStats.totalComparisons++;
    
    if (result.isMatch) {
      this.matchStats.successfulMatches++;
    } else {
      this.matchStats.failedMatches++;
    }
    
    // Actualizar promedio de similitud
    if (this.matchStats.totalComparisons > 0) {
      const totalSimilarity = (this.matchStats.averageSimilarity * (this.matchStats.totalComparisons - 1)) + result.similarityScore;
      this.matchStats.averageSimilarity = totalSimilarity / this.matchStats.totalComparisons;
    } else {
      this.matchStats.averageSimilarity = result.similarityScore;
    }
    
    localStorage.setItem('faceComparisonStats', JSON.stringify(this.matchStats));
  }

  performComparison(): void {
    if (!this.dniImageBase64 || !this.livenessImageBase64) {
      this.errorMessage = 'Faltan imágenes para realizar la comparación.';
      return;
    }
    
    this.comparing = true;
    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;
    
    console.log('Iniciando comparación...');
    console.log('DNI Base64 length:', this.dniImageBase64?.length);
    console.log('Liveness Base64 length:', this.livenessImageBase64?.length);
    
    this.comparisonService.compareFacesFromBase64(
      this.dniImageBase64,
      this.livenessImageBase64,
      this.similarityThreshold
    ).subscribe({
      next: (response) => {
        console.log('Respuesta de comparación:', response);
        this.comparisonResult = response;
        this.comparing = false;
        this.loading = false;
        
        // Guardar estadísticas
        this.saveStats(response);
        
        // Guardar el resultado en el estado
        this.appState.setComparisonResult(response.isMatch);
        
        // Mensaje según resultado
        if (response.isMatch) {
          this.successMessage = `✅ Las imágenes coinciden con un ${response.similarityScore.toFixed(2)}% de similitud.`;
          
          // Continuar automáticamente si está configurado
          if (this.autoContinue && response.similarityScore >= this.similarityThreshold) {
            setTimeout(() => {
              this.continueToNextStep();
            }, 2000);
          }
        } else {
          this.errorMessage = `❌ Las imágenes no coinciden (${response.similarityScore.toFixed(2)}% de similitud).`;
        }
        
        this.cd.detectChanges();
      },
      error: (error) => {
        console.error('Error en comparación:', error);
        this.comparing = false;
        this.loading = false;
        this.errorMessage = `Error al comparar imágenes: ${error.error?.error || error.message}`;
        this.cd.detectChanges();
      }
    });
  }

  retryComparison(): void {
    this.comparisonResult = null;
    this.errorMessage = null;
    this.successMessage = null;
    this.performComparison();
  }

  continueToNextStep(): void {
    // Navegar a la siguiente pantalla según el flujo
    this.router.navigate(['/reniec']);
  }
  
  finishAndReturnHome(): void {
    // Mostrar alerta con el resultado final
    const comparisonResult = this.appState.getComparisonResult();
    const reniecResult = this.appState.getReniecValidationResult();
    
    let alertMessage = '';
    
    if (comparisonResult !== null && reniecResult !== null) {
      // Ambos procesos se completaron
      if (comparisonResult && reniecResult) {
        alertMessage = 'HIT, persona identificada';
      } else {
        alertMessage = 'No HIT, persona no identificada';
      }
    } else if (comparisonResult !== null) {
      // Solo se completó comparación
      if (comparisonResult) {
        alertMessage = 'Comparación exitosa - HIT, persona identificada';
      } else {
        alertMessage = 'Comparación fallida - No HIT, persona no identificada';
      }
    } else {
      alertMessage = 'Proceso completado';
    }
    
    alert(alertMessage);
    this.appState.resetToStart();
  }

  goBack(): void {
    this.router.navigate(['/choice']);
  }

  resetComparison(): void {
    this.comparisonResult = null;
    this.errorMessage = null;
    this.successMessage = null;
    this.dniImageBase64 = null;
    this.livenessImageBase64 = null;
    this.appState.setDniPhoto(null);
    this.appState.setLivenessPhoto(null);
    
    // Volver al inicio del flujo
    this.router.navigate(['/']);
  }

  getSimilarityColor(score: number): string {
    if (score >= 90) return '#10b981'; // Verde
    if (score >= 80) return '#f59e0b'; // Amarillo
    if (score >= 70) return '#ef4444'; // Rojo
    return '#6b7280'; // Gris
  }

  getConfidenceIcon(level: string): string {
    switch (level) {
      case 'MUY ALTA': return '✅';
      case 'ALTA': return '👍';
      case 'MEDIA': return '⚠️';
      case 'BAJA': return '❌';
      default: return '❓';
    }
  }

  downloadReport(): void {
    if (!this.comparisonResult) return;
    
    const report = {
      fecha: new Date().toISOString(),
      dniNumber: this.appState.getDniNumber(),
      serialNumber: this.appState.getSerialNumber(),
      similarityThreshold: this.similarityThreshold,
      result: this.comparisonResult,
      stats: this.matchStats
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comparacion-facial-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}