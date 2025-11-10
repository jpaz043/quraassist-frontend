import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgClass, NgIf, NgFor } from '@angular/common';
import { MensajesService, PlantillaMensaje } from '../mensajes.service';
import { PacientesService, Paciente } from '../../pacientes/pacientes.service';

@Component({
  selector: 'app-mensaje-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, NgIf, NgFor, RouterLink],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">
            Nuevo Mensaje
          </h1>
          <p class="page-subtitle">
            Envíe un mensaje o recordatorio a sus pacientes
          </p>
        </div>
        <button 
          routerLink="/mensajes"
          class="btn-secondary"
        >
          Cancelar
        </button>
      </div>

      <!-- Formulario -->
      <div class="card-medical">
        <form [formGroup]="mensajeForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Paciente -->
          <div class="form-group">
            <label class="form-label">
              Paciente
            </label>
            <select
              formControlName="pacienteId"
              class="input-medical w-full"
              [class.border-error-500]="showError('pacienteId')"
              (change)="onPacienteChange()"
            >
              <option value="">Seleccione un paciente...</option>
              <option *ngFor="let paciente of pacientes" [value]="paciente.id">
                {{paciente.nombreCompleto}} - {{paciente.telefono}}
              </option>
            </select>
            <p *ngIf="showError('pacienteId')" class="form-error">
              Seleccione un paciente
            </p>
            <p *ngIf="!pacienteSeleccionado?.consentimientoWhatsApp" class="mt-1 text-sm text-warning-400">
              Este paciente no ha autorizado comunicaciones por WhatsApp
            </p>
          </div>

          <!-- Tipo de mensaje -->
          <div class="form-group">
            <label class="form-label">
              Tipo de Mensaje
            </label>
            <select
              formControlName="tipo"
              class="input-medical w-full"
              [class.border-error-500]="showError('tipo')"
              (change)="onTipoChange()"
            >
              <option value="">Seleccione...</option>
              <option value="recordatorio">Recordatorio de Cita</option>
              <option value="confirmacion">Confirmación de Cita</option>
              <option value="cancelacion">Cancelación de Cita</option>
              <option value="personalizado">Mensaje Personalizado</option>
            </select>
            <p *ngIf="showError('tipo')" class="form-error">
              Seleccione el tipo de mensaje
            </p>
          </div>

          <!-- Plantilla -->
          <div *ngIf="mensajeForm.get('tipo')?.value && mensajeForm.get('tipo')?.value !== 'personalizado'" class="form-group">
            <label class="form-label">
              Plantilla
            </label>
            <select
              formControlName="plantillaId"
              class="input-medical w-full"
              [class.border-error-500]="showError('plantillaId')"
              (change)="onPlantillaChange()"
            >
              <option value="">Seleccione una plantilla...</option>
              <option *ngFor="let plantilla of plantillasFiltradas" [value]="plantilla.id">
                {{plantilla.nombre}}
              </option>
            </select>
            <p *ngIf="showError('plantillaId')" class="form-error">
              Seleccione una plantilla
            </p>
          </div>

          <!-- Variables de plantilla -->
          <div *ngIf="plantillaSeleccionada" class="space-y-4">
            <h3 class="text-sm font-medium text-gray-900">
              Variables de la Plantilla
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div *ngFor="let variable of plantillaSeleccionada.variables" class="form-group">
                <label class="form-label">
                  {{variable}}
                </label>
                <input
                  type="text"
                  [formControlName]="'var_' + variable"
                  class="input-medical w-full"
                  [class.border-error-500]="showError('var_' + variable)"
                >
              </div>
            </div>
          </div>

          <!-- Mensaje personalizado -->
          <div *ngIf="mensajeForm.get('tipo')?.value === 'personalizado'" class="form-group">
            <label class="form-label">
              Mensaje
            </label>
            <textarea
              formControlName="contenido"
              rows="4"
              class="input-medical w-full"
              [class.border-error-500]="showError('contenido')"
              placeholder="Escriba su mensaje..."
            ></textarea>
            <p *ngIf="showError('contenido')" class="form-error">
              El mensaje es requerido
            </p>
          </div>

          <!-- Vista previa -->
          <div *ngIf="mensajeForm.get('contenido')?.value" class="card-medical-light">
            <h3 class="text-sm font-medium text-gray-900 mb-2">
              Vista Previa
            </h3>
            <p class="text-sm text-gray-700">
              {{mensajeForm.get('contenido')?.value}}
            </p>
          </div>

          <!-- Error general -->
          <p *ngIf="error" class="text-sm text-error-400 text-center">
            {{error}}
          </p>

          <!-- Submit -->
          <div class="flex justify-end">
            <button
              type="submit"
              [disabled]="mensajeForm.invalid || isLoading || !pacienteSeleccionado?.consentimientoWhatsApp"
              class="btn-primary"
              [class.opacity-50]="mensajeForm.invalid || isLoading || !pacienteSeleccionado?.consentimientoWhatsApp"
            >
              <span *ngIf="!isLoading">
                Enviar Mensaje
              </span>
              <span *ngIf="isLoading">
                Enviando...
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class MensajeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private mensajesService = inject(MensajesService);
  private pacientesService = inject(PacientesService);
  private router = inject(Router);

  mensajeForm: FormGroup;
  isLoading = false;
  error: string | null = null;

  pacientes: Paciente[] = [];
  plantillas: PlantillaMensaje[] = [];
  plantillasFiltradas: PlantillaMensaje[] = [];
  
  pacienteSeleccionado: Paciente | null = null;
  plantillaSeleccionada: PlantillaMensaje | null = null;

  constructor() {
    this.mensajeForm = this.fb.group({
      pacienteId: ['', [Validators.required]],
      tipo: ['', [Validators.required]],
      plantillaId: [''],
      contenido: ['']
    });
  }

  ngOnInit(): void {
    // Cargar pacientes
    this.pacientesService.getPacientes().subscribe({
      next: (pacientes) => {
        this.pacientes = pacientes;
      }
    });

    // Cargar plantillas
    this.mensajesService.getPlantillas().subscribe({
      next: (plantillas) => {
        this.plantillas = plantillas;
      }
    });
  }

  showError(field: string): boolean {
    const control = this.mensajeForm.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  onPacienteChange(): void {
    const pacienteId = this.mensajeForm.get('pacienteId')?.value;
    this.pacienteSeleccionado = this.pacientes.find(p => p.id === pacienteId) || null;
  }

  onTipoChange(): void {
    const tipo = this.mensajeForm.get('tipo')?.value;
    
    // Limpiar campos relacionados
    this.mensajeForm.patchValue({
      plantillaId: '',
      contenido: ''
    });

    // Filtrar plantillas por tipo
    if (tipo && tipo !== 'personalizado') {
      this.plantillasFiltradas = this.plantillas.filter(p => p.tipo === tipo);
    } else {
      this.plantillasFiltradas = [];
    }

    // Actualizar validadores
    if (tipo === 'personalizado') {
      this.mensajeForm.get('contenido')?.setValidators([Validators.required]);
      this.mensajeForm.get('plantillaId')?.clearValidators();
    } else {
      this.mensajeForm.get('plantillaId')?.setValidators([Validators.required]);
      this.mensajeForm.get('contenido')?.clearValidators();
    }

    this.mensajeForm.get('contenido')?.updateValueAndValidity();
    this.mensajeForm.get('plantillaId')?.updateValueAndValidity();
  }

  onPlantillaChange(): void {
    const plantillaId = this.mensajeForm.get('plantillaId')?.value;
    this.plantillaSeleccionada = this.plantillas.find(p => p.id === plantillaId) || null;

    if (this.plantillaSeleccionada) {
      // Agregar controles dinámicos para las variables
      this.plantillaSeleccionada.variables.forEach(variable => {
        if (!this.mensajeForm.contains('var_' + variable)) {
          this.mensajeForm.addControl('var_' + variable, this.fb.control('', [Validators.required]));
        }
      });

      // Actualizar contenido al cambiar cualquier variable
      Object.keys(this.mensajeForm.controls)
        .filter(key => key.startsWith('var_'))
        .forEach(key => {
          this.mensajeForm.get(key)?.valueChanges.subscribe(() => {
            this.actualizarContenido();
          });
        });

      this.actualizarContenido();
    }
  }

  actualizarContenido(): void {
    if (this.plantillaSeleccionada) {
      let contenido = this.plantillaSeleccionada.contenido;
      this.plantillaSeleccionada.variables.forEach(variable => {
        const valor = this.mensajeForm.get('var_' + variable)?.value || '';
        contenido = contenido.replace(`{${variable}}`, valor);
      });
      this.mensajeForm.patchValue({ contenido });
    }
  }

  onSubmit(): void {
    if (this.mensajeForm.valid && this.pacienteSeleccionado) {
      this.isLoading = true;
      this.error = null;

      this.mensajesService.enviarMensaje(
        this.pacienteSeleccionado.id,
        this.pacienteSeleccionado.nombreCompleto,
        this.pacienteSeleccionado.telefono,
        this.mensajeForm.value.tipo,
        this.mensajeForm.value.contenido
      ).subscribe({
        next: () => {
          this.router.navigate(['/mensajes']);
        },
        error: (err) => {
          this.error = 'Error al enviar el mensaje';
          this.isLoading = false;
        }
      });
    }
  }
} 