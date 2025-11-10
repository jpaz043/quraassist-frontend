import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Interceptor para manejar errores relacionados con tokens insuficientes
 * y mostrar mensajes amigables al usuario
 */
export const tokenErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Detectar errores de tokens insuficientes
      if (error.status === 400 && error.error?.message) {
        const errorMessage = error.error.message.toLowerCase();

        // Verificar si es un error de tokens insuficientes
        if (
          errorMessage.includes('tokens insuficientes') ||
          errorMessage.includes('insufficient tokens') ||
          errorMessage.includes('no hay tokens disponibles') ||
          errorMessage.includes('no tokens available')
        ) {
          // Mostrar toast notification (si tienes un servicio de notificaciones)
          console.warn('⚠️ Tokens insuficientes:', error.error.message);

          // Opcional: Puedes agregar un servicio de notificaciones aquí
          // this.notificationService.warning('Tokens insuficientes', error.error.message);

          // Crear un error más amigable
          const friendlyError = new HttpErrorResponse({
            error: {
              ...error.error,
              userFriendlyMessage: 'No tienes suficientes tokens para realizar esta acción. Por favor recarga tu cuenta.',
              suggestedAction: 'RECHARGE_TOKENS',
              redirectTo: '/tokens'
            },
            headers: error.headers,
            status: error.status,
            statusText: error.statusText,
            url: error.url || undefined
          });

          return throwError(() => friendlyError);
        }
      }

      // Si no es un error de tokens, dejar pasar el error original
      return throwError(() => error);
    })
  );
};

/**
 * Helper function para extraer mensajes amigables de errores de tokens
 */
export function getTokenErrorMessage(error: any): string {
  if (error?.error?.userFriendlyMessage) {
    return error.error.userFriendlyMessage;
  }

  if (error?.error?.message) {
    const msg = error.error.message;
    if (msg.includes('tokens insuficientes') || msg.includes('insufficient tokens')) {
      return 'No tienes suficientes tokens para realizar esta acción. Por favor recarga tu cuenta.';
    }
  }

  return 'Ha ocurrido un error inesperado. Por favor intenta de nuevo.';
}

/**
 * Helper function para determinar si un error es de tokens
 */
export function isTokenError(error: any): boolean {
  if (error?.status === 400 && error?.error?.message) {
    const msg = error.error.message.toLowerCase();
    return msg.includes('token') && (msg.includes('insuficiente') || msg.includes('insufficient'));
  }
  return false;
}
