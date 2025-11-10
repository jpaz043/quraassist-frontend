import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { rateLimitInterceptor } from './core/interceptors/rate-limit.interceptor';
import { globalErrorInterceptor } from './core/interceptors/global-error.interceptor';
import { tokenErrorInterceptor } from './core/interceptors/token-error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        tokenErrorInterceptor, // Handle token errors specifically
        errorInterceptor,
        rateLimitInterceptor,
        globalErrorInterceptor
      ])
    ),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};
