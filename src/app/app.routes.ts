import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dni-capture',
    pathMatch: 'full'
  },
  {
    path: 'dni-capture',
    loadChildren: () => 
      import('./features/dni-capture/dni-capture.routes')
        .then(m => m.DNI_CAPTURE_ROUTES)
  },
  {
    path: 'liveness',
    loadChildren: () => 
      import('./features/face-liveness/liveness.routes')
        .then(m => m.LIVENESS_ROUTES)
  },
  {
    path: 'validation',
    loadChildren: () => 
      import('./features/validation/validation.routes')
        .then(m => m.VALIDATION_ROUTES)
  },
  {
    path: '**',
    redirectTo: '/dni-capture'
  }
];
