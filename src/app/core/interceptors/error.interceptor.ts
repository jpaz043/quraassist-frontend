import { HttpInterceptorFn, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error inesperado';

      // Errores específicos de la aplicación médica
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else {
        switch (error.status) {
          case HttpStatusCode.Unauthorized:
            errorMessage = 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.';
            router.navigate(['/auth/login']);
            break;
          case HttpStatusCode.Forbidden:
            errorMessage = 'No tiene permisos para realizar esta acción.';
            break;
          case HttpStatusCode.NotFound:
            errorMessage = 'El recurso solicitado no existe.';
            break;
          case HttpStatusCode.TooManyRequests:
            errorMessage = 'Ha excedido el límite de solicitudes. Por favor, espere un momento.';
            break;
          case HttpStatusCode.BadRequest:
            errorMessage = 'Los datos ingresados no son válidos.';
            break;
          case HttpStatusCode.GatewayTimeout:
          case HttpStatusCode.ServiceUnavailable:
            errorMessage = 'El servicio no está disponible en este momento. Por favor, intente más tarde.';
            break;
        }
      }

      // Log error para auditoría
      console.error('Error en la aplicación:', {
        timestamp: new Date().toISOString(),
        url: req.url,
        method: req.method,
        status: error.status,
        message: errorMessage,
        error: error.error
      });

      return throwError(() => ({
        message: errorMessage,
        status: error.status,
        timestamp: new Date().toISOString()
      }));
    })
  );
};