import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AppStateService } from '../services/app-state.service';

export const livenessGuard: CanActivateFn = (route, state) => {
  const appState = inject(AppStateService);
  const router = inject(Router);

  if (!appState.hasLivenessResult()) {
    router.navigate(['/liveness']);
    return false;
  }

  return true;
};
