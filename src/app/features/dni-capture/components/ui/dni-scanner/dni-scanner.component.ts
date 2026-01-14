import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { OpenCVService } from '@core/services/opencv.service';
import { CameraService } from '@core/services/camera.service';

interface AnalysisResult {
  blurVariance: number;
  documentPercentage: number;
  isBlurry: boolean;
  isTooFar: boolean;
  isReady: boolean;
}

@Component({
  selector: 'app-dni-scanner',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './dni-scanner.component.html',
  styleUrls: ['./dni-scanner.component.scss']
})
export class DniScannerComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement', { static: false }) canvasElement!: ElementRef<HTMLCanvasElement>;

  // Inputs configurables
  @Input() analysisIntervalMs: number = 400; // 300-500ms recomendado
  @Input() blurThreshold: number = 100; // Umbral de varianza Laplaciana
  @Input() distanceThreshold: number = 30; // Porcentaje mínimo del área del video
  @Input() allowManualCapture: boolean = true; // Permitir captura manual siempre

  // Output events
  @Output() imageCaptured = new EventEmitter<string>();
  @Output() scannerError = new EventEmitter<string>();
  @Output() scannerReady = new EventEmitter<void>();

  // Estado del componente
  private mediaStream?: MediaStream;
  private analysisInterval?: number;
  private cv: any;

  // Signals para estado reactivo
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  
  // Análisis en tiempo real
  private currentAnalysis = signal<AnalysisResult>({
    blurVariance: 0,
    documentPercentage: 0,
    isBlurry: true,
    isTooFar: true,
    isReady: false
  });

  // Computed signals para UI
  isBlurry = computed(() => this.currentAnalysis().isBlurry);
  isTooFar = computed(() => this.currentAnalysis().isTooFar);
  isReadyToCapture = computed(() => {
    if (this.allowManualCapture) {
      // Si allowManualCapture está activo, siempre permitir captura una vez cargado
      return !this.isLoading() && !this.errorMessage();
    }
    // Si no, requiere condiciones óptimas
    return this.currentAnalysis().isReady;
  });
  
  feedbackMessage = computed(() => {
    const analysis = this.currentAnalysis();
    
    if (analysis.isReady) {
      return 'Perfecto! Presiona capturar';
    }
    
    if (analysis.isBlurry) {
      return 'Mantén el celular quieto';
    }
    
    if (analysis.isTooFar) {
      return 'Acércate más al DNI';
    }
    
    return 'Posiciona el DNI en el marco';
  });

  constructor(
    private opencvService: OpenCVService,
    private cameraService: CameraService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      // Verificar soporte de cámara
      if (!this.cameraService.isCameraSupported()) {
        throw new Error('Tu navegador no soporta acceso a cámara');
      }

      // Cargar OpenCV.js
      await this.opencvService.loadOpenCV();
      this.cv = this.opencvService.getCV();

      // Inicializar cámara
      await this.initCamera();
      
      this.isLoading.set(false);
      this.scannerReady.emit();
    } catch (error: any) {
      this.handleError(error.message || 'Error al inicializar el scanner');
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  /**
   * Inicializa el stream de la cámara
   */
  private async initCamera(): Promise<void> {
    try {
      this.mediaStream = await this.cameraService.requestCameraAccess();
      
      // Esperar a que el ViewChild esté disponible
      setTimeout(() => {
        if (this.videoElement) {
          const video = this.videoElement.nativeElement;
          video.srcObject = this.mediaStream!;
          
          video.onloadedmetadata = () => {
            video.play();
            this.startAnalysis();
          };
        }
      }, 100);
    } catch (error: any) {
      throw new Error(error.message || 'Error al acceder a la cámara');
    }
  }

  /**
   * Inicia el análisis periódico de frames
   */
  private startAnalysis(): void {
    this.analysisInterval = window.setInterval(() => {
      this.analyzeFrame();
    }, this.analysisIntervalMs);
  }

  /**
   * Analiza un frame del video
   */
  private analyzeFrame(): void {
    if (!this.videoElement || !this.canvasElement || !this.cv) {
      return;
    }

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;

    // Verificar que el video esté reproduciendo
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      return;
    }

    // Configurar canvas con dimensiones del video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Capturar frame actual
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // Convertir a Mat de OpenCV
      const src = this.cv.imread(canvas);

      // Análisis de blur (Varianza Laplaciana)
      const blurVariance = this.calculateBlur(src);

      // Detección de bordes (Contornos)
      const documentPercentage = this.detectDocumentContours(src);

      // Determinar estado
      const isBlurry = blurVariance < this.blurThreshold;
      const isTooFar = documentPercentage < this.distanceThreshold;
      const isReady = !isBlurry && !isTooFar;

      // Actualizar estado
      this.currentAnalysis.set({
        blurVariance,
        documentPercentage,
        isBlurry,
        isTooFar,
        isReady
      });

      // Limpiar
      src.delete();
    } catch (error) {
      console.error('Error analyzing frame:', error);
    }
  }

  /**
   * Calcula la varianza Laplaciana para detectar blur
   * @param src Mat de OpenCV
   * @returns Varianza (menor = más borroso)
   */
  private calculateBlur(src: any): number {
    const gray = new this.cv.Mat();
    const laplacian = new this.cv.Mat();

    try {
      // Convertir a escala de grises
      this.cv.cvtColor(src, gray, this.cv.COLOR_RGBA2GRAY);

      // Aplicar operador Laplaciano
      this.cv.Laplacian(gray, laplacian, this.cv.CV_64F);

      // Calcular media y desviación estándar
      const mean = new this.cv.Mat();
      const stddev = new this.cv.Mat();
      this.cv.meanStdDev(laplacian, mean, stddev);

      // La varianza es el cuadrado de la desviación estándar
      const variance = Math.pow(stddev.data64F[0], 2);

      // Limpiar matrices temporales
      mean.delete();
      stddev.delete();

      return variance;
    } finally {
      gray.delete();
      laplacian.delete();
    }
  }

  /**
   * Detecta contornos y calcula el porcentaje del área del documento
   * @param src Mat de OpenCV
   * @returns Porcentaje del área ocupada por el rectángulo más grande
   */
  private detectDocumentContours(src: any): number {
    const gray = new this.cv.Mat();
    const edges = new this.cv.Mat();
    const contours = new this.cv.MatVector();
    const hierarchy = new this.cv.Mat();

    try {
      // Convertir a escala de grises
      this.cv.cvtColor(src, gray, this.cv.COLOR_RGBA2GRAY);

      // Detectar bordes con Canny
      this.cv.Canny(gray, edges, 50, 150);

      // Encontrar contornos
      this.cv.findContours(
        edges,
        contours,
        hierarchy,
        this.cv.RETR_EXTERNAL,
        this.cv.CHAIN_APPROX_SIMPLE
      );

      // Buscar el contorno con mayor área
      let maxArea = 0;
      for (let i = 0; i < contours.size(); i++) {
        const contour = contours.get(i);
        const area = this.cv.contourArea(contour);
        if (area > maxArea) {
          maxArea = area;
        }
      }

      // Calcular porcentaje del área del video
      const videoArea = src.rows * src.cols;
      const percentage = (maxArea / videoArea) * 100;

      return percentage;
    } finally {
      gray.delete();
      edges.delete();
      contours.delete();
      hierarchy.delete();
    }
  }

  /**
   * Captura la imagen del DNI
   */
  captureImage(): void {
    if (!this.isReadyToCapture() || !this.canvasElement) {
      return;
    }

    const canvas = this.canvasElement.nativeElement;
    const video = this.videoElement.nativeElement;

    // Asegurar dimensiones correctas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Capturar frame actual
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convertir a base64
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.95);

    // Emitir evento con imagen capturada
    this.imageCaptured.emit(imageBase64);

    console.log('✅ DNI captured successfully');
  }

  /**
   * Detiene la cámara y limpia recursos
   */
  stopCamera(): void {
    this.cleanup();
  }

  /**
   * Limpia recursos al destruir el componente
   */
  private cleanup(): void {
    // Detener análisis
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = undefined;
    }

    // Detener stream de cámara
    if (this.mediaStream) {
      this.cameraService.stopStream(this.mediaStream);
      this.mediaStream = undefined;
    }

    console.log('🧹 Scanner cleanup completed');
  }

  /**
   * Maneja errores y los propaga
   */
  private handleError(message: string): void {
    this.errorMessage.set(message);
    this.isLoading.set(false);
    this.scannerError.emit(message);
    console.error('❌ Scanner error:', message);
  }

  /**
   * Obtiene el ícono apropiado según el estado
   */
  getFeedbackIcon(): string {
    const analysis = this.currentAnalysis();

    if (analysis.isReady) {
      return 'check_circle';
    }

    if (analysis.isBlurry) {
      return 'visibility_off';
    }

    if (analysis.isTooFar) {
      return 'zoom_in';
    }

    return 'photo_camera';
  }
}
