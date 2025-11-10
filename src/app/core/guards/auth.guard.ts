import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map, filter, take, switchMap } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Primero esperamos a que termine la inicialización
  return authService.initializing$.pipe(
    filter(initializing => !initializing), // Esperar a que initializing sea false
    take(1),
    switchMap(() => authService.isAuthenticated$),
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      }

      // Store the intended URL for redirecting after login
      router.navigate(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    })
  );
};

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Primero esperamos a que termine la inicialización
  return authService.initializing$.pipe(
    filter(initializing => !initializing), // Esperar a que initializing sea false
    take(1),
    switchMap(() => authService.isAuthenticated$),
    take(1),
    map(isAuthenticated => {
      if (!isAuthenticated) {
        return true;
      }

      // User is authenticated, redirect to dashboard
      router.navigate(['/dashboard']);
      return false;
    })
  );
};