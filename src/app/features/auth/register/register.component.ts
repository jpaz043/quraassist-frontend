import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Especialidad } from '../../../core/models';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, RouterLink],
  template: `
    <div class="w-full max-w-md mx-auto">
      <h2 class="text-3xl font-bold text-gray-900 mb-2 text-center">
        Crear Cuenta
      </h2>
      <p class="text-gray-600 mb-8 text-center">
        Únete a Platform Doctor Honduras
      </p>

      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-5">
        <!-- Nombre Completo -->
        <div>
          <label for="nombreCompleto" class="block text-sm font-medium text-gray-700 mb-2">
            Nombre Completo *
          </label>
          <input
            type="text"
            id="nombreCompleto"
            formControlName="nombreCompleto"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
            [class.border-error-500]="showError('nombreCompleto')"
            placeholder="Dr. Juan Pérez Rodríguez"
          >
          <p *ngIf="showError('nombreCompleto')" class="mt-2 text-sm text-error-600">
            El nombre completo es requerido
          </p>
        </div>

        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
            Correo Electrónico *
          </label>
          <input
            type="email"
            id="email"
            formControlName="email"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
            [class.border-error-500]="showError('email')"
            placeholder="doctor@ejemplo.com"
          >
          <p *ngIf="showError('email')" class="mt-2 text-sm text-error-600">
            Ingrese un correo electrónico válido
          </p>
        </div>

        <!-- Especialidades (Opcional) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Especialidades (Opcional)
          </label>
          <p class="text-xs text-gray-500 mb-3">
            Deje vacío si es médico general
          </p>
          <select
            multiple
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900"
            (change)="onEspecialidadChange($event)"
            size="5"
          >
            <option *ngFor="let esp of especialidadesOptions" [value]="esp.value">
              {{ esp.label }}
            </option>
          </select>
          <p class="text-xs text-gray-500 mt-2">
            Mantenga presionado Ctrl/Cmd para seleccionar múltiples especialidades
          </p>
        </div>

        <!-- Número de Licencia -->
        <div>
          <label for="numeroLicencia" class="block text-sm font-medium text-gray-700 mb-2">
            Número de Licencia Médica *
          </label>
          <input
            type="text"
            id="numeroLicencia"
            formControlName="numeroLicencia"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
            [class.border-error-500]="showError('numeroLicencia')"
            placeholder="MED-12345"
          >
          <p *ngIf="showError('numeroLicencia')" class="mt-2 text-sm text-error-600">
            El número de licencia es requerido
          </p>
        </div>

        <!-- Teléfono (Opcional) -->
        <div>
          <label for="telefono" class="block text-sm font-medium text-gray-700 mb-2">
            Teléfono (Opcional)
          </label>
          <input
            type="tel"
            id="telefono"
            formControlName="telefono"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
            placeholder="+504 1234-5678"
          >
        </div>

        <!-- Password -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
            Contraseña *
          </label>
          <input
            type="password"
            id="password"
            formControlName="password"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
            [class.border-error-500]="showError('password')"
            placeholder="Mínimo 8 caracteres"
          >
          <p *ngIf="showError('password')" class="mt-2 text-sm text-error-600">
            La contraseña debe tener al menos 8 caracteres
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
          [disabled]="registerForm.invalid || isLoading"
          class="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          <span *ngIf="!isLoading">Crear Cuenta</span>
          <span *ngIf="isLoading">Creando cuenta...</span>
        </button>

        <!-- Login link -->
        <p class="text-sm text-center text-gray-600 mt-6">
          ¿Ya tiene una cuenta?
          <a routerLink="/auth/login" class="text-primary-600 hover:text-primary-700 font-medium">
            Inicie sesión aquí
          </a>
        </p>
      </form>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup = this.fb.group({
    nombreCompleto: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    especialidades: [[]],
    numeroLicencia: ['', [Validators.required]],
    telefono: [''],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  especialidadesOptions = [
    { value: Especialidad.MEDICINA_GENERAL, label: 'Medicina General' },
    { value: Especialidad.PEDIATRIA, label: 'Pediatría' },
    { value: Especialidad.GINECOLOGIA, label: 'Ginecología' },
    { value: Especialidad.CARDIOLOGIA, label: 'Cardiología' },
    { value: Especialidad.DERMATOLOGIA, label: 'Dermatología' },
    { value: Especialidad.PSIQUIATRIA, label: 'Psiquiatría' },
    { value: Especialidad.ODONTOLOGIA, label: 'Odontología' },
    { value: Especialidad.OFTALMOLOGIA, label: 'Oftalmología' },
  ];

  isLoading = false;
  error: string | null = null;

  showError(field: string): boolean {
    const control = this.registerForm.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  onEspecialidadChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const selectedOptions = Array.from(select.selectedOptions).map(option => option.value);
    this.registerForm.patchValue({ especialidades: selectedOptions });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.error = null;

      const formValue = this.registerForm.value;
      // Si no hay especialidades seleccionadas, enviamos array vacío
      const registerData = {
        ...formValue,
        especialidades: formValue.especialidades.length > 0 ? formValue.especialidades : undefined
      };

      this.authService.register(registerData).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          this.error = err.message || 'Error al crear la cuenta. Por favor intente nuevamente.';
        }
      });
    }
  }
}
