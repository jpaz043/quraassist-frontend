import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ImageUploadComponent, ImageUploadResult } from '../../../shared/components/image-upload/image-upload.component';
import { PhoneInputComponent } from '../../../shared/components/phone-input/phone-input.component';
import { AuthService } from '../../../core/services/auth.service';
import { CloudinaryService, ImageType } from '../../../core/services/cloudinary.service';

@Component({
  selector: 'app-perfil-medico',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ImageUploadComponent,
    PhoneInputComponent
  ],
  template: `
    <div class="perfil-medico-container">
      <!-- Header -->
      <div class="header">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Mi Perfil</h1>
            <p class="text-sm text-gray-600 mt-1">Gestiona tu información personal y profesional</p>
          </div>
        </div>
      </div>

      <!-- Contenido -->
      <div class="content-grid">
        <!-- Sección Avatar -->
        <div class="card avatar-section">
          <h2 class="card-title">Foto de Perfil</h2>
          <p class="card-subtitle">Esta foto se mostrará en tu perfil y en las citas con pacientes</p>

          <div class="avatar-upload-container">
            <app-image-upload
              [label]="'foto de perfil'"
              [uploadIcon]="'account_circle'"
              [placeholderText]="'Sube tu foto de perfil'"
              [hintText]="'JPG, PNG o WebP (máx. 5MB)'"
              [currentImageUrl]="currentUser()?.avatarUrl || null"
              [imageType]="ImageType.AVATAR"
              [entityId]="currentUser()?.id || ''"
              (imageUploaded)="onAvatarUploaded($event)"
              (imageRemoved)="onAvatarRemoved()"
              (uploadError)="onUploadError($event)">
            </app-image-upload>
          </div>
        </div>

        <!-- Sección Información Personal -->
        <div class="card">
          <h2 class="card-title">Información Personal</h2>
          <p class="card-subtitle">Actualiza tus datos personales</p>

          <form [formGroup]="personalForm" (ngSubmit)="savePersonalInfo()" class="form-container">
            <!-- Nombre Completo -->
            <div class="form-group">
              <label for="nombreCompleto" class="form-label">
                Nombre Completo
                <span class="text-red-500">*</span>
              </label>
              <input
                id="nombreCompleto"
                type="text"
                formControlName="nombreCompleto"
                class="form-input"
                placeholder="Dr. Juan Pérez">
              @if (personalForm.get('nombreCompleto')?.invalid && personalForm.get('nombreCompleto')?.touched) {
                <span class="error-message">El nombre completo es requerido</span>
              }
            </div>

            <!-- Email (readonly) -->
            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="form-input"
                readonly>
              <p class="text-xs text-gray-500 mt-1">El email no puede ser modificado</p>
            </div>

            <!-- Teléfono -->
            <div class="form-group">
              <app-phone-input
                label="Teléfono"
                formControlName="telefono"
                [helperText]="'Número de teléfono en Honduras'">
              </app-phone-input>
            </div>

            <!-- Botones -->
            <div class="form-actions">
              <button
                type="submit"
                [disabled]="personalForm.invalid || savingPersonal()"
                class="btn-primary">
                @if (savingPersonal()) {
                  <span class="material-icons-outlined animate-spin">refresh</span>
                  Guardando...
                } @else {
                  <span class="material-icons-outlined">save</span>
                  Guardar Cambios
                }
              </button>
            </div>
          </form>
        </div>

        <!-- Sección Información Profesional -->
        <div class="card">
          <h2 class="card-title">Información Profesional</h2>
          <p class="card-subtitle">Actualiza tus credenciales médicas</p>

          <form [formGroup]="professionalForm" (ngSubmit)="saveProfessionalInfo()" class="form-container">
            <!-- Número de Licencia -->
            <div class="form-group">
              <label for="numeroLicencia" class="form-label">
                Número de Licencia Médica
                <span class="text-red-500">*</span>
              </label>
              <input
                id="numeroLicencia"
                type="text"
                formControlName="numeroLicencia"
                class="form-input"
                placeholder="LIC-12345">
              @if (professionalForm.get('numeroLicencia')?.invalid && professionalForm.get('numeroLicencia')?.touched) {
                <span class="error-message">El número de licencia es requerido</span>
              }
            </div>

            <!-- Especialidades -->
            <div class="form-group">
              <label for="especialidades" class="form-label">Especialidades</label>
              <select
                id="especialidades"
                formControlName="especialidades"
                class="form-input"
                multiple
                size="4">
                <option value="MEDICINA_GENERAL">Medicina General</option>
                <option value="PEDIATRIA">Pediatría</option>
                <option value="GINECOLOGIA">Ginecología</option>
                <option value="CARDIOLOGIA">Cardiología</option>
                <option value="DERMATOLOGIA">Dermatología</option>
                <option value="PSIQUIATRIA">Psiquiatría</option>
                <option value="ODONTOLOGIA">Odontología</option>
                <option value="OFTALMOLOGIA">Oftalmología</option>
              </select>
              <p class="text-xs text-gray-500 mt-1">Mantén presionado Ctrl/Cmd para seleccionar múltiples opciones</p>
            </div>

            <!-- Botones -->
            <div class="form-actions">
              <button
                type="submit"
                [disabled]="professionalForm.invalid || savingProfessional()"
                class="btn-primary">
                @if (savingProfessional()) {
                  <span class="material-icons-outlined animate-spin">refresh</span>
                  Guardando...
                } @else {
                  <span class="material-icons-outlined">save</span>
                  Guardar Cambios
                }
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Mensajes de éxito/error -->
      @if (successMessage()) {
        <div class="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-md">
          <div class="flex items-center gap-3">
            <span class="material-icons-outlined text-green-600">check_circle</span>
            <p class="text-sm text-green-800">{{ successMessage() }}</p>
          </div>
        </div>
      }

      @if (errorMessage()) {
        <div class="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-md">
          <div class="flex items-center gap-3">
            <span class="material-icons-outlined text-red-600">error</span>
            <p class="text-sm text-red-800">{{ errorMessage() }}</p>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .perfil-medico-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .header {
      margin-bottom: 2rem;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    @media (min-width: 768px) {
      .content-grid {
        grid-template-columns: 300px 1fr;
      }

      .avatar-section {
        grid-row: span 2;
      }
    }

    .card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .card-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
      margin-bottom: 0.25rem;
    }

    .card-subtitle {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 1.5rem;
    }

    .avatar-upload-container {
      display: flex;
      justify-content: center;
      padding: 1rem 0;
    }

    .form-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    .form-input {
      padding: 0.625rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .form-input:focus {
      outline: none;
      border-color: #26A8DB;
      box-shadow: 0 0 0 3px rgba(38, 168, 219, 0.1);
    }

    .form-input:read-only {
      background-color: #f9fafb;
      cursor: not-allowed;
    }

    .error-message {
      font-size: 0.75rem;
      color: #dc2626;
      margin-top: 0.25rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }

    .btn-primary {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      background: #26A8DB;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary:hover:not(:disabled) {
      background: #1e90c9;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(38, 168, 219, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `]
})
export class PerfilMedicoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly cloudinaryService = inject(CloudinaryService);
  private readonly router = inject(Router);

  // Exponer ImageType para usar en el template
  readonly ImageType = ImageType;

  currentUser = signal<any>(null);
  personalForm!: FormGroup;
  professionalForm!: FormGroup;

  savingPersonal = signal(false);
  savingProfessional = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    // Suscribirse al usuario actual desde AuthService
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser.set(user);
        this.initForms();
      }
    });

    // Si no hay usuario cargado, intentar obtenerlo
    if (!this.authService.currentUser) {
      this.authService.getProfile().subscribe({
        next: (user) => {
          this.currentUser.set(user);
          this.initForms();
        },
        error: (error) => {
          console.error('Error loading user profile:', error);
          this.showError('Error al cargar el perfil. Por favor, intenta nuevamente.');
        }
      });
    }
  }

  private initForms(): void {
    const user = this.currentUser();

    // Construir el teléfono completo si existen ambos campos
    let fullPhone = '';
    if (user?.medico?.telefonoCodigoPais && user?.medico?.telefonoNumero) {
      fullPhone = `${user.medico.telefonoCodigoPais} ${user.medico.telefonoNumero}`;
    }

    this.personalForm = this.fb.group({
      nombreCompleto: [user?.nombreCompleto || '', Validators.required],
      email: [{ value: user?.email || '', disabled: true }],
      telefono: [fullPhone]
    });

    this.professionalForm = this.fb.group({
      numeroLicencia: [user?.medico?.numeroLicencia || '', Validators.required],
      especialidades: [user?.medico?.especialidades || []]
    });
  }

  onAvatarUploaded(result: ImageUploadResult): void {
    console.log('Avatar uploaded:', result);

    // Actualizar en el backend
    this.authService.updateProfile({ avatarUrl: result.url }).subscribe({
      next: (updatedUser) => {
        this.currentUser.set(updatedUser);
        this.showSuccess('Foto de perfil actualizada exitosamente');
      },
      error: (error) => {
        console.error('Error updating avatar:', error);
        this.showError('Error al actualizar la foto de perfil');
      }
    });
  }

  onAvatarRemoved(): void {
    console.log('Avatar removed');

    // Actualizar en el backend
    this.authService.updateProfile({ avatarUrl: '' }).subscribe({
      next: (updatedUser) => {
        this.currentUser.set(updatedUser);
        this.showSuccess('Foto de perfil eliminada');
      },
      error: (error) => {
        console.error('Error removing avatar:', error);
        this.showError('Error al eliminar la foto de perfil');
      }
    });
  }

  onUploadError(error: string): void {
    this.showError(error);
  }

  savePersonalInfo(): void {
    if (this.personalForm.invalid) return;

    this.savingPersonal.set(true);

    // Separar el teléfono en código de país y número
    const telefonoCompleto = this.personalForm.value.telefono || '';
    let telefonoCodigoPais = '+504';
    let telefonoNumero = '';

    if (telefonoCompleto) {
      // El formato viene como "+504 9999-9999" del PhoneInputComponent
      const match = telefonoCompleto.match(/^(\+\d{1,4})\s*(.+)$/);
      if (match) {
        telefonoCodigoPais = match[1];
        telefonoNumero = match[2].replace(/\D/g, ''); // Remover guiones y espacios
      }
    }

    const personalData = {
      nombreCompleto: this.personalForm.value.nombreCompleto,
      telefonoCodigoPais,
      telefonoNumero
    };

    this.authService.updateProfile(personalData).subscribe({
      next: (updatedUser) => {
        this.savingPersonal.set(false);
        this.currentUser.set(updatedUser);
        this.showSuccess('Información personal actualizada exitosamente');
      },
      error: (error) => {
        this.savingPersonal.set(false);
        console.error('Error updating personal info:', error);
        const errorMsg = error.error?.message || 'Error al actualizar la información personal';
        this.showError(errorMsg);
      }
    });
  }

  saveProfessionalInfo(): void {
    if (this.professionalForm.invalid) return;

    this.savingProfessional.set(true);

    const professionalData = {
      numeroLicencia: this.professionalForm.value.numeroLicencia,
      especialidades: this.professionalForm.value.especialidades
    };

    this.authService.updateMedicoProfile(professionalData).subscribe({
      next: (updatedUser) => {
        this.savingProfessional.set(false);
        this.currentUser.set(updatedUser);
        this.showSuccess('Información profesional actualizada exitosamente');
      },
      error: (error) => {
        this.savingProfessional.set(false);
        console.error('Error updating professional info:', error);
        const errorMsg = error.error?.message || 'Error al actualizar la información profesional';
        this.showError(errorMsg);
      }
    });
  }

  private showSuccess(message: string): void {
    this.successMessage.set(message);
    setTimeout(() => this.successMessage.set(null), 3000);
  }

  private showError(message: string): void {
    this.errorMessage.set(message);
    setTimeout(() => this.errorMessage.set(null), 5000);
  }
}
