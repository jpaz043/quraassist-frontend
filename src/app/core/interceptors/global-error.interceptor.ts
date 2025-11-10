import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ErrorHandlerService } from '../services/error-handler.service';
import { Router } from '@angular/router';

export const globalErrorInterceptor: HttpInterceptorFn = (req, next): Observable<HttpEvent<unknown>> => {
  const errorHandler = inject(ErrorHandlerService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse): Observable<never> => {
      // Manejar errores de autenticación globalmente
      if (errorHandler.isAuthError(error)) {
        // Redirigir al login si no estamos ya ahí
        if (!req.url.includes('/auth/')) {
          router.navigate(['/auth/login']);
        }
      }

      // Log del error para debugging
      console.error('HTTP Error:', {
        url: req.url,
        method: req.method,
        status: error.status,
        message: error.message,
        error: error.error
      });

      // Re-throw el error con mensaje personalizado
      return errorHandler.handleHttpError(error, `Petición ${req.method} a ${req.url}`);
    })
  );
};