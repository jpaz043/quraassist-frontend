import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, tap, catchError, of } from 'rxjs';
import { Usuario, AuthResponse, LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly API_URL = `${environment.apiUrl}/api/v1/auth`;

  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Flag para saber si la inicialización ha terminado
  private initializingSubject = new BehaviorSubject<boolean>(true);
  public initializing$ = this.initializingSubject.asObservable();

  constructor() {
    // No verificar inmediatamente, esperar a que Angular esté listo
    setTimeout(() => this.checkInitialAuthState(), 0);
  }

  private checkInitialAuthState(): void {
    // Las cookies se envían automáticamente, solo verificamos si hay sesión
    this.loadUserProfile();
  }

  login(loginDto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, loginDto, {
      withCredentials: true // Importante: permite enviar/recibir cookies
    }).pipe(
      tap(response => {
        this.currentUserSubject.next(response.usuario);
        this.isAuthenticatedSubject.next(true);
        this.initializingSubject.next(false);
      }),
      catchError(error => {
        console.error('Login error:', error);
        let errorMessage = 'Error al iniciar sesión';

        if (error.status === 401) {
          errorMessage = 'Credenciales incorrectas';
        } else if (error.status === 429) {
          errorMessage = 'Demasiados intentos. Intente más tarde';
        } else if (error.status === 0) {
          errorMessage = 'Error de conexión. Verifique su conexión a internet';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }

        return throwError(() => ({ ...error, message: errorMessage }));
      })
    );
  }

  register(registerDto: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, registerDto, {
      withCredentials: true
    }).pipe(
      tap(response => {
        this.currentUserSubject.next(response.usuario);
        this.isAuthenticatedSubject.next(true);
        this.initializingSubject.next(false);
      }),
      catchError(error => {
        console.error('Register error:', error);
        let errorMessage = 'Error al registrarse';

        if (error.status === 409) {
          errorMessage = error.error?.message || 'El email o licencia ya está registrado';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }

        return throwError(() => ({ ...error, message: errorMessage }));
      })
    );
  }

  refreshToken(): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/refresh`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => {
        // Las cookies se actualizan automáticamente
        console.log('Token refreshed successfully');
      }),
      catchError(error => {
        console.error('Refresh token error:', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/logout`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => {
        this.clearAuthState();
        this.router.navigate(['/auth/login']);
      }),
      catchError(error => {
        // Incluso si falla el logout en servidor, limpiamos el estado local
        console.error('Logout error:', error);
        this.clearAuthState();
        this.router.navigate(['/auth/login']);
        return of(void 0);
      })
    );
  }

  private loadUserProfile(): void {
    this.http.get<Usuario>(`${this.API_URL}/profile`, {
      withCredentials: true
    }).pipe(
      tap(usuario => {
        this.currentUserSubject.next(usuario);
        this.isAuthenticatedSubject.next(true);
        this.initializingSubject.next(false);
      }),
      catchError(error => {
        // Si no hay sesión válida, simplemente no hacemos nada
        console.debug('No active session found');
        this.clearAuthState();
        this.initializingSubject.next(false);
        return of(null);
      })
    ).subscribe();
  }

  private clearAuthState(): void {
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  getProfile(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.API_URL}/profile`, {
      withCredentials: true
    });
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.API_URL}/forgot-password`,
      { email }
    ).pipe(
      catchError(error => {
        console.error('Forgot password error:', error);
        return throwError(() => error);
      })
    );
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.API_URL}/reset-password`,
      { token, newPassword }
    ).pipe(
      catchError(error => {
        console.error('Reset password error:', error);
        let errorMessage = 'Error al restablecer contraseña';

        if (error.status === 400) {
          errorMessage = 'Token inválido o expirado';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }

        return throwError(() => ({ ...error, message: errorMessage }));
      })
    );
  }

  get currentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  updateProfile(data: { nombreCompleto?: string; telefono?: string; avatarUrl?: string }): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.API_URL}/profile`, data, {
      withCredentials: true
    }).pipe(
      tap(updatedUser => {
        // Actualizar el usuario en el BehaviorSubject
        this.currentUserSubject.next(updatedUser);
      }),
      catchError(error => {
        console.error('Update profile error:', error);
        return throwError(() => error);
      })
    );
  }

  updateMedicoProfile(data: { numeroLicencia?: string; especialidades?: string[] }): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.API_URL}/medico-profile`, data, {
      withCredentials: true
    }).pipe(
      tap(updatedUser => {
        // Actualizar el usuario en el BehaviorSubject
        this.currentUserSubject.next(updatedUser);
      }),
      catchError(error => {
        console.error('Update medico profile error:', error);
        return throwError(() => error);
      })
    );
  }
}
