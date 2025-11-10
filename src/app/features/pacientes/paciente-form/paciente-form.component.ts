import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { NgClass, NgIf, NgFor } from '@angular/common';
import { PacientesService } from '../pacientes.service';
import { Paciente } from '../../../core/models/paciente.model';

@Component({
  selector: 'app-paciente-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, NgIf, NgFor, RouterLink],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">
            {{isEditing ? 'Editar' : 'Nuevo'}} Paciente
          </h1>
          <p class="page-subtitle">
            {{isEditing ? 'Modifique los datos del paciente' : 'Complete los datos para registrar al paciente'}}
          </p>
        </div>
        <button 
          routerLink="/pacientes"
          class="btn-secondary"
        >
          Cancelar
        </button>
      </div>

      <!-- Formulario -->
      <div class="card-medical">
        <form [formGroup]="pacienteForm" (ngSubmit)="onSubmit()" class="space-y-8">
          <!-- Datos Personales -->
          <div class="space-y-6">
            <h3 class="text-lg font-medium text-gray-900">
              Datos Personales
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Nombre -->
              <div class="form-group">
                <label class="form-label">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  formControlName="nombreCompleto"
                  class="input-medical w-full"
                  [class.border-error-500]="showError('nombreCompleto')"
                  placeholder="Juan Pérez"
                >
                <p *ngIf="showError('nombreCompleto')" class="form-error">
                  El nombre es requerido
                </p>
              </div>

              <!-- Teléfono -->
              <div class="form-group">
                <label class="form-label">
                  Teléfono
                </label>
                <input
                  type="tel"
                  formControlName="telefono"
                  class="input-medical w-full"
                  [class.border-error-500]="showError('telefono')"
                  placeholder="+504 9999-9999"
                >
                <p *ngIf="showError('telefono')" class="form-error">
                  El teléfono es requerido
                </p>
              </div>

              <!-- Email -->
              <div class="form-group">
                <label class="form-label">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  formControlName="email"
                  class="input-medical w-full"
                  [class.border-error-500]="showError('email')"
                  placeholder="juan@ejemplo.com"
                >
                <p *ngIf="showError('email')" class="form-error">
                  Ingrese un correo válido
                </p>
              </div>

              <!-- Fecha de Nacimiento -->
              <div class="form-group">
                <label class="form-label">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  formControlName="fechaNacimiento"
                  class="input-medical w-full"
                >
              </div>

              <!-- Género -->
              <div class="form-group">
                <label class="form-label">
                  Género
                </label>
                <select
                  formControlName="genero"
                  class="input-medical w-full"
                >
                  <option value="">Seleccione...</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>

              <!-- Tipo de Sangre -->
              <div class="form-group">
                <label class="form-label">
                  Tipo de Sangre
                </label>
                <select
                  formControlName="tipoSangre"
                  class="input-medical w-full"
                >
                  <option value="">Seleccione...</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Información Médica -->
          <div class="space-y-6">
            <h3 class="text-lg font-medium text-gray-900">
              Información Médica
            </h3>

            <!-- Alergias -->
            <div class="form-group">
              <label class="form-label">
                Alergias
              </label>
              <input
                type="text"
                formControlName="alergias"
                class="input-medical w-full"
                placeholder="Penicilina, Látex, etc. (separadas por coma)"
              >
            </div>

            <!-- Notas -->
            <div class="form-group">
              <label class="form-label">
                Notas Médicas
              </label>
              <textarea
                formControlName="notas"
                rows="3"
                class="input-medical w-full"
                placeholder="Antecedentes, condiciones crónicas, etc."
              ></textarea>
            </div>

            <!-- Etiquetas -->
            <div class="form-group">
              <label class="form-label">
                Etiquetas
              </label>
              <div class="space-x-2">
                <button
                  *ngFor="let etiqueta of etiquetasComunes"
                  type="button"
                  (click)="toggleEtiqueta(etiqueta)"
                  [class]="'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ' + 
                    (tieneEtiqueta(etiqueta) ? 
                      'bg-primary-900 text-primary-200 border border-primary-700' : 
                      'bg-gray-100 text-gray-700 hover:bg-gray-600 border border-gray-300')"
                >
                  {{etiqueta}}
                  <span class="material-icons-outlined text-sm ml-1">
                    {{tieneEtiqueta(etiqueta) ? 'close' : 'add'}}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <!-- Consentimiento WhatsApp -->
          <div class="space-y-6">
            <h3 class="text-lg font-medium text-gray-900">
              Comunicación
            </h3>

            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input
                  type="checkbox"
                  formControlName="consentimientoWhatsApp"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 bg-white rounded"
                >
              </div>
              <div class="ml-3 text-sm">
                <label class="font-medium text-gray-700">
                  Autoriza comunicación por WhatsApp
                </label>
                <p class="text-gray-600">
                  El paciente acepta recibir recordatorios y comunicaciones por WhatsApp
                </p>
              </div>
            </div>
          </div>

          <!-- Error general -->
          <p *ngIf="error" class="text-sm text-error-400 text-center">
            {{error}}
          </p>

          <!-- Submit -->
          <div class="flex justify-end">
            <button
              type="submit"
              [disabled]="pacienteForm.invalid || isLoading"
              class="btn-primary"
              [class.opacity-50]="pacienteForm.invalid || isLoading"
            >
              <span *ngIf="!isLoading">
                {{isEditing ? 'Guardar Cambios' : 'Registrar Paciente'}}
              </span>
              <span *ngIf="isLoading">
                {{isEditing ? 'Guardando...' : 'Registrando...'}}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class PacienteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private pacientesService = inject(PacientesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  pacienteForm: FormGroup;
  isLoading = false;
  isEditing = false;
  error: string | null = null;
  etiquetasComunes: string[] = [];

  constructor() {
    this.pacienteForm = this.fb.group({
      nombreCompleto: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      email: ['', [Validators.email]],
      fechaNacimiento: [''],
      genero: [''],
      tipoSangre: [''],
      alergias: [''],
      notas: [''],
      consentimientoWhatsApp: [false],
      etiquetas: [[]]
    });
  }

  ngOnInit(): void {
    // Cargar etiquetas comunes
    this.pacientesService.getEtiquetasComunes().subscribe(etiquetas => {
      this.etiquetasComunes = etiquetas;
    });

    // Verificar si estamos editando
    const pacienteId = this.route.snapshot.params['id'];
    if (pacienteId) {
      this.isEditing = true;
      this.cargarPaciente(pacienteId);
    }
  }

  cargarPaciente(id: string): void {
    this.isLoading = true;
    this.pacientesService.getPaciente(id).subscribe({
      next: (paciente) => {
        if (paciente) {
          this.pacienteForm.patchValue({
            nombreCompleto: paciente.nombreCompleto,
            telefono: paciente.telefono,
            email: paciente.email,
            fechaNacimiento: paciente.fechaNacimiento,
            genero: paciente.genero,
            tipoSangre: paciente.tipoSangre,
            alergias: paciente.alergias?.join(', '),
            notas: paciente.notas,
            consentimientoWhatsApp: paciente.consentimientoWhatsApp,
            etiquetas: paciente.etiquetas
          });
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar el paciente';
        this.isLoading = false;
      }
    });
  }

  showError(field: string): boolean {
    const control = this.pacienteForm.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  tieneEtiqueta(etiqueta: string): boolean {
    const etiquetas = this.pacienteForm.get('etiquetas')?.value || [];
    return etiquetas.includes(etiqueta);
  }

  toggleEtiqueta(etiqueta: string): void {
    const etiquetas = [...(this.pacienteForm.get('etiquetas')?.value || [])];
    const index = etiquetas.indexOf(etiqueta);
    
    if (index === -1) {
      etiquetas.push(etiqueta);
    } else {
      etiquetas.splice(index, 1);
    }

    this.pacienteForm.patchValue({ etiquetas });
  }

  onSubmit(): void {
    if (this.pacienteForm.valid) {
      this.isLoading = true;
      this.error = null;

      const pacienteData = {
        ...this.pacienteForm.value,
        alergias: this.pacienteForm.value.alergias
          ? this.pacienteForm.value.alergias.split(',').map((a: string) => a.trim())
          : []
      };

      if (this.isEditing) {
        const pacienteId = this.route.snapshot.params['id'];
        this.pacientesService.actualizarPaciente(pacienteId, pacienteData).subscribe({
          next: () => this.router.navigate(['/pacientes']),
          error: (err) => {
            this.error = 'Error al actualizar el paciente';
            this.isLoading = false;
          }
        });
      } else {
        this.pacientesService.crearPaciente(pacienteData).subscribe({
          next: () => this.router.navigate(['/pacientes']),
          error: (err) => {
            this.error = 'Error al crear el paciente';
            this.isLoading = false;
          }
        });
      }
    }
  }
} 