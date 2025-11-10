import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  template: `
    <div class="w-full max-w-md mx-auto">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">
          ¿Olvidó su contraseña?
        </h2>
        <p class="text-gray-600">
          Ingrese su correo electrónico y le enviaremos un enlace para restablecer su contraseña
        </p>
      </div>

      <div *ngIf="!emailSent">
        <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()" class="space-y-5">
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

          <!-- Error general -->
          <div *ngIf="error" class="p-4 bg-error-50 border border-error-200 rounded-lg">
            <p class="text-sm text-error-700 text-center">
              {{error}}
            </p>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            [disabled]="forgotPasswordForm.invalid || isLoading"
            class="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            <span *ngIf="!isLoading">Enviar Enlace de Recuperación</span>
            <span *ngIf="isLoading">Enviando...</span>
          </button>

          <!-- Back to login -->
          <p class="text-sm text-center text-gray-600 mt-6">
            <a routerLink="/auth/login" class="text-primary-600 hover:text-primary-700 font-medium">
              ← Volver al inicio de sesión
            </a>
          </p>
        </form>
      </div>

      <!-- Success message -->
      <div *ngIf="emailSent" class="text-center">
        <div class="mb-6">
          <svg class="mx-auto h-16 w-16 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">
          Correo Enviado
        </h3>
        <p class="text-gray-600 mb-6">
          Hemos enviado un enlace de recuperación a su correo electrónico.
          Por favor revise su bandeja de entrada y siga las instrucciones.
        </p>
        <a routerLink="/auth/login" class="text-primary-600 hover:text-primary-700 font-medium">
          ← Volver al inicio de sesión
        </a>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  forgotPasswordForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  isLoading = false;
  error: string | null = null;
  emailSent = false;

  showError(field: string): boolean {
    const control = this.forgotPasswordForm.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      this.error = null;

      const email = this.forgotPasswordForm.value.email;

      this.authService.forgotPassword(email).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.emailSent = true;
          this.toastService.success(response.message);
        },
        error: (err) => {
          this.isLoading = false;
          this.error = err.message || 'Error al enviar el correo. Por favor intente nuevamente.';
        }
      });
    }
  }
}
