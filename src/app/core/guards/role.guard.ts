import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user) {
          router.navigate(['/auth/login'], {
            queryParams: { returnUrl: state.url }
          });
          return false;
        }

        if (authService.hasAnyRole(allowedRoles)) {
          return true;
        }

        // User doesn't have required role, redirect to dashboard
        router.navigate(['/dashboard']);
        return false;
      })
    );
  };
};

// Guards específicos por rol
export const adminGuard: CanActivateFn = roleGuard(['admin']);
export const medicoGuard: CanActivateFn = roleGuard(['medico', 'admin']);
export const clienteGuard: CanActivateFn = roleGuard(['cliente']);
