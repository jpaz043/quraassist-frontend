import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  template: `
    <div class="w-full max-w-md mx-auto">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">
          Restablecer Contraseña
        </h2>
        <p class="text-gray-600">
          Ingrese su nueva contraseña
        </p>
      </div>

      <div *ngIf="!passwordReset && validToken">
        <form [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()" class="space-y-5">
          <!-- Nueva Contraseña -->
          <div>
            <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-2">
              Nueva Contraseña
            </label>
            <input
              type="password"
              id="newPassword"
              formControlName="newPassword"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
              [class.border-error-500]="showError('newPassword')"
              placeholder="Mínimo 8 caracteres"
              autocomplete="new-password"
            >
            <p *ngIf="showError('newPassword')" class="mt-2 text-sm text-error-600">
              La contraseña debe tener al menos 8 caracteres
            </p>
          </div>

          <!-- Confirmar Contraseña -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              formControlName="confirmPassword"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
              [class.border-error-500]="showError('confirmPassword')"
              placeholder="Repita la contraseña"
              autocomplete="new-password"
            >
            <p *ngIf="showError('confirmPassword')" class="mt-2 text-sm text-error-600">
              Las contraseñas no coinciden
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
            [disabled]="resetPasswordForm.invalid || isLoading"
            class="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            <span *ngIf="!isLoading">Restablecer Contraseña</span>
            <span *ngIf="isLoading">Restableciendo...</span>
          </button>
        </form>
      </div>

      <!-- Success message -->
      <div *ngIf="passwordReset" class="text-center">
        <div class="mb-6">
          <svg class="mx-auto h-16 w-16 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">
          Contraseña Actualizada
        </h3>
        <p class="text-gray-600 mb-6">
          Su contraseña ha sido restablecida exitosamente.
          Ahora puede iniciar sesión con su nueva contraseña.
        </p>
        <a
          routerLink="/auth/login"
          class="inline-block py-3 px-6 bg-primary-600 hover:bg-primary-700 text-gray-900 font-medium rounded-lg transition-colors duration-200"
        >
          Ir al Inicio de Sesión
        </a>
      </div>

      <!-- Invalid token -->
      <div *ngIf="!validToken" class="text-center">
        <div class="mb-6">
          <svg class="mx-auto h-16 w-16 text-error-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">
          Enlace Inválido o Expirado
        </h3>
        <p class="text-gray-600 mb-6">
          El enlace de recuperación no es válido o ha expirado.
          Por favor solicite un nuevo enlace.
        </p>
        <a routerLink="/auth/forgot-password" class="text-primary-600 hover:text-primary-700 font-medium">
          Solicitar Nuevo Enlace
        </a>
      </div>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  resetPasswordForm: FormGroup = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, {
    validators: this.passwordMatchValidator
  });

  isLoading = false;
  error: string | null = null;
  passwordReset = false;
  validToken = true;
  private token: string = '';

  ngOnInit(): void {
    // Obtener el token de los query params
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.validToken = false;
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  showError(field: string): boolean {
    const control = this.resetPasswordForm.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid && this.token) {
      this.isLoading = true;
      this.error = null;

      const newPassword = this.resetPasswordForm.value.newPassword;

      this.authService.resetPassword(this.token, newPassword).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.passwordReset = true;
          this.toastService.success(response.message);
        },
        error: (err) => {
          this.isLoading = false;
          if (err.status === 400) {
            this.validToken = false;
          }
          this.error = err.message || 'Error al restablecer la contraseña. Por favor intente nuevamente.';
        }
      });
    }
  }
}
