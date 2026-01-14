import { Routes } from '@angular/router';

export const DNI_CAPTURE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => 
      import('./components/dni-scanner-capture/dni-scanner-capture.component').then(m => m.DniScannerCaptureComponent)
  }
];
