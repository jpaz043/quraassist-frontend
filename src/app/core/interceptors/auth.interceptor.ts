import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';

// Flags para manejo de refresh token
let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

// Endpoints que no deben intentar refresh token
const EXCLUDED_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
  '/auth/forgot-password',
  '/auth/reset-password'
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // No agregar withCredentials a las peticiones excluidas
  const isExcluded = EXCLUDED_ENDPOINTS.some(endpoint => req.url.includes(endpoint));

  // Clone request and add withCredentials for cookie-based auth
  const authReq = req.clone({
    withCredentials: true
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Verificar si es un error 401 y si debemos intentar refresh
      const shouldRefresh = error.status === 401 && !isExcluded;

      if (shouldRefresh) {
        if (!isRefreshing) {
          console.log('🔄 Token expired, attempting refresh...');
          isRefreshing = true;
          refreshTokenSubject.next(false);

          // Intentar refresh del token
          return authService.refreshToken().pipe(
            switchMap(() => {
              console.log('✅ Token refreshed successfully, retrying request');
              isRefreshing = false;
              refreshTokenSubject.next(true);

              // Reintentar la petición original con las nuevas cookies
              const retryReq = req.clone({
                withCredentials: true
              });
              return next(retryReq);
            }),
            catchError(refreshError => {
              console.error('❌ Refresh token failed, logging out');
              isRefreshing = false;
              refreshTokenSubject.next(false);

              // Si el refresh falla, hacer logout
              authService.logout().subscribe();

              return throwError(() => refreshError);
            })
          );
        } else {
          // Si ya se está refrescando el token, esperar a que termine
          console.log('⏳ Waiting for token refresh to complete...');
          return refreshTokenSubject.pipe(
            filter(success => success === true),
            take(1),
            switchMap(() => {
              console.log('🔄 Token refresh complete, retrying request');
              // Reintentar la petición después de que el refresh termine exitosamente
              const retryReq = req.clone({
                withCredentials: true
              });
              return next(retryReq);
            })
          );
        }
      }

      return throwError(() => error);
    })
  );
};
