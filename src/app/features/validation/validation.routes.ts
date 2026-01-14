import { Routes } from '@angular/router';
import { livenessGuard } from '@core/guards/liveness.guard';

export const VALIDATION_ROUTES: Routes = [
  {
    path: '',
    canActivate: [livenessGuard],
    children: [
      {
        path: '',
        loadComponent: () => 
          import('./components/validation-choice.component')
            .then(m => m.ValidationChoiceComponent)
      },
      {
        path: 'compare',
        loadComponent: () => 
          import('./components/comparison/comparison.component')
            .then(m => m.ComparisonComponent)
      },
      {
        path: 'reniec',
        loadComponent: () => 
          import('./components/reniec-validation/reniec-validation.component')
            .then(m => m.ReniecValidationComponent)
      }
    ]
  }
];
