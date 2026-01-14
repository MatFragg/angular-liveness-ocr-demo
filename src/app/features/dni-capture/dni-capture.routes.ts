import { Routes } from '@angular/router';

export const DNI_CAPTURE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => 
      import('./components/dni-capture.component').then(m => m.DniCaptureComponent)
  }
];
