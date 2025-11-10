import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  template: `
    <div class="w-full max-w-md mx-auto">
      <h2 class="text-3xl font-bold text-gray-900 mb-2 text-center">
        Bienvenido de Vuelta
      </h2>
      <p class="text-gray-600 mb-8 text-center">
        Ingrese a su cuenta de Platform Doctor
      </p>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
            Correo Electrónico
          </label>
          <input
            type="email"
            id="email"
            formControlName="email"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
            [class.border-error-500]="showError('email')"
            placeholder="doctor@ejemplo.com"
            autocomplete="email"
          >
          <p *ngIf="showError('email')" class="mt-2 text-sm text-error-600">
            Ingrese un correo electrónico válido
          </p>
        </div>

        <!-- Password -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label for="password" class="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <a routerLink="/auth/forgot-password" class="text-sm text-primary-600 hover:text-primary-700">
              ¿Olvidó su contraseña?
            </a>
          </div>
          <div class="relative">
            <input
              [type]="showPassword ? 'text' : 'password'"
              id="password"
              formControlName="password"
              class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
              [class.border-error-500]="showError('password')"
              placeholder="••••••••"
              autocomplete="current-password"
            >
            <button
              type="button"
              (click)="togglePasswordVisibility()"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700"
              aria-label="Mostrar/ocultar contraseña"
            >
              <svg *ngIf="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              <svg *ngIf="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
              </svg>
            </button>
          </div>
          <p *ngIf="showError('password')" class="mt-2 text-sm text-error-600">
            La contraseña es requerida
          </p>
        </div>

        <!-- Demo credentials -->
        <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-sm font-semibold text-blue-900 mb-1">
            🔐 Credenciales de Demostración
          </p>
          <p class="text-sm text-blue-700">Email: <span class="font-mono">demo&#64;platformdoctor.hn</span></p>
          <p class="text-sm text-blue-700">Contraseña: <span class="font-mono">Demo1234!</span></p>
        </div>

        <!-- Error general -->
        <div *ngIf="error" class="p-4 bg-error-50 border border-error-200 rounded-lg">
          <p class="text-sm text-error-700 text-center">
            {{error}}
          </p>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          [disabled]="loginForm.invalid || isLoading"
          class="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          <span *ngIf="!isLoading">Iniciar Sesión</span>
          <span *ngIf="isLoading">Iniciando sesión...</span>
        </button>

        <!-- Register link -->
        <p class="text-sm text-center text-gray-600 mt-6">
          ¿No tiene una cuenta?
          <a routerLink="/auth/register" class="text-primary-600 hover:text-primary-700 font-medium">
            Regístrese aquí
          </a>
        </p>
      </form>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = false;
  error: string | null = null;
  showPassword = false;

  showError(field: string): boolean {
    const control = this.loginForm.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.error = null;

      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          this.error = err.message || 'Error al iniciar sesión. Por favor intente nuevamente.';
        }
      });
    }
  }
}
