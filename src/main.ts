import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { Amplify } from 'aws-amplify';

// Configuración COMPLETA de Amplify
Amplify.configure({
  Auth: {
    Cognito: {
      identityPoolId: 'us-east-1:b6aaaae3-4691-47bd-ad46-01643c73eb02',
      allowGuestAccess: true
    }
  },
  // Configuración adicional para los servicios de AWS
  /*API: {
    REST: {
      rekognition: {
        endpoint: 'https://rekognition.us-east-1.amazonaws.com',
        region: 'us-east-1'
      }
    }
  }*/
});


bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));