import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AppStateService } from '../services/app-state.service';

export const dniCaptureGuard: CanActivateFn = (route, state) => {
  const appState = inject(AppStateService);
  const router = inject(Router);

  if (!appState.hasDni()) {
    router.navigate(['/dni-capture']);
    return false;
  }

  return true;
};
