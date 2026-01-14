import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { DniCapture } from './components/dni-capture/dni-capture';
import { FaceLivenessWrapper } from './components/face-liveness-wrapper/face-liveness-wrapper';
import { Choice } from './components/choice/choice';
import { CompareDni } from './components/compare-dni/compare-dni';
import { ReniecExtract } from './components/reniec-extract/reniec-extract';

const routes = [
  { path: '', component: DniCapture },
  { path: 'liveness', component: FaceLivenessWrapper },
  { path: 'choice', component: Choice },
  { path: 'compare', component: CompareDni },
  { path: 'reniec', component: ReniecExtract },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideRouter(routes)
  ]
};
