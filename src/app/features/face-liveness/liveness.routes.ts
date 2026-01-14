import { Routes } from '@angular/router';
import { dniCaptureGuard } from '@core/guards/dni-capture.guard';

export const LIVENESS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [dniCaptureGuard],
    loadComponent: () => 
      import('./components/liveness-check.component').then(m => m.LivenessCheckComponent)
  }
];
