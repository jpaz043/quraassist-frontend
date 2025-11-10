import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { AgendaService, CitaLegacy as Cita } from '../agenda.service';

@Component({
  selector: 'app-cita-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, RouterLink],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">
            {{isEditing ? 'Editar' : 'Nueva'}} Cita
          </h1>
          <p class="page-subtitle">
            {{isEditing ? 'Modifique los datos de la cita' : 'Complete los datos para agendar la cita'}}
          </p>
        </div>
        <button 
          routerLink="/agenda"
          class="btn-secondary"
        >
          Cancelar
        </button>
      </div>

      <!-- Formulario -->
      <div class="card-medical">
        <form [formGroup]="citaForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Fecha y Hora -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="form-group">
              <label class="form-label">
                Fecha
              </label>
              <input
                type="date"
                formControlName="fecha"
                class="input-medical w-full"
                [class.border-error-500]="showError('fecha')"
                (change)="onFechaChange()"
              >
              <p *ngIf="showError('fecha')" class="form-error">
                La fecha es requerida
              </p>
            </div>

            <div class="form-group">
              <label class="form-label">
                Hora
              </label>
              <select
                formControlName="hora"
                class="input-medical w-full"
                [class.border-error-500]="showError('hora')"
              >
                <option value="">Seleccione una hora</option>
                <option *ngFor="let hora of horariosDisponibles" [value]="hora">
                  {{hora}}
                </option>
              </select>
              <p *ngIf="showError('hora')" class="form-error">
                La hora es requerida
              </p>
            </div>
          </div>

          <!-- Datos del Paciente -->
          <div class="space-y-6">
            <h3 class="text-lg font-medium text-gray-900">
              Datos del Paciente
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="form-group">
                <label class="form-label">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  formControlName="nombrePaciente"
                  class="input-medical w-full"
                  [class.border-error-500]="showError('nombrePaciente')"
                  placeholder="Juan Pérez"
                >
                <p *ngIf="showError('nombrePaciente')" class="form-error">
                  El nombre es requerido
                </p>
              </div>

              <div class="form-group">
                <label class="form-label">
                  Teléfono
                </label>
                <input
                  type="tel"
                  formControlName="telefonoPaciente"
                  class="input-medical w-full"
                  [class.border-error-500]="showError('telefonoPaciente')"
                  placeholder="+504 9999-9999"
                >
                <p *ngIf="showError('telefonoPaciente')" class="form-error">
                  El teléfono es requerido
                </p>
              </div>
            </div>
          </div>

          <!-- Detalles de la Cita -->
          <div class="space-y-6">
            <h3 class="text-lg font-medium text-gray-900">
              Detalles de la Cita
            </h3>

            <div class="form-group">
              <label class="form-label">
                Motivo
              </label>
              <input
                type="text"
                formControlName="motivo"
                class="input-medical w-full"
                [class.border-error-500]="showError('motivo')"
                placeholder="Control mensual"
              >
              <p *ngIf="showError('motivo')" class="form-error">
                El motivo es requerido
              </p>
            </div>

            <div class="form-group">
              <label class="form-label">
                Notas Adicionales
              </label>
              <textarea
                formControlName="notas"
                rows="3"
                class="input-medical w-full"
                placeholder="Instrucciones o notas importantes..."
              ></textarea>
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
              [disabled]="citaForm.invalid || isLoading"
              class="btn-primary"
              [class.opacity-50]="citaForm.invalid || isLoading"
            >
              <span *ngIf="!isLoading">
                {{isEditing ? 'Guardar Cambios' : 'Agendar Cita'}}
              </span>
              <span *ngIf="isLoading">
                {{isEditing ? 'Guardando...' : 'Agendando...'}}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class CitaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private agendaService = inject(AgendaService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  citaForm: FormGroup;
  isLoading = false;
  isEditing = false;
  error: string | null = null;
  horariosDisponibles: string[] = [];

  constructor() {
    this.citaForm = this.fb.group({
      fecha: ['', [Validators.required]],
      hora: ['', [Validators.required]],
      nombrePaciente: ['', [Validators.required]],
      telefonoPaciente: ['', [Validators.required]],
      motivo: ['', [Validators.required]],
      notas: ['']
    });
  }

  ngOnInit(): void {
    const citaId = this.route.snapshot.params['id'];
    if (citaId) {
      this.isEditing = true;
      this.cargarCita(citaId);
    } else {
      // Inicializar con la fecha actual
      this.citaForm.patchValue({
        fecha: new Date().toISOString().split('T')[0]
      });
      this.cargarHorariosDisponibles();
    }
  }

  cargarCita(id: string): void {
    this.isLoading = true;
    this.agendaService.getCita(id).subscribe({
      next: (cita) => {
        if (cita) {
          this.citaForm.patchValue({
            fecha: cita.fechaHora.split('T')[0],
            hora: cita.fechaHora.split('T')[1]?.substring(0, 5) || '',
            nombrePaciente: cita.paciente.nombreCompleto,
            telefonoPaciente: cita.paciente.telefono,
            motivo: cita.motivo,
            notas: cita.notas
          });
          this.cargarHorariosDisponibles();
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar la cita';
        this.isLoading = false;
      }
    });
  }

  onFechaChange(): void {
    this.cargarHorariosDisponibles();
  }

  cargarHorariosDisponibles(): void {
    const fecha = this.citaForm.get('fecha')?.value;
    if (fecha) {
      this.agendaService.getHorariosDisponibles(fecha).subscribe({
        next: (horarios) => {
          this.horariosDisponibles = horarios;
          
          // Si estamos editando, incluir la hora actual de la cita
          const horaActual = this.citaForm.get('hora')?.value;
          if (this.isEditing && horaActual && !horarios.includes(horaActual)) {
            this.horariosDisponibles.push(horaActual);
            this.horariosDisponibles.sort();
          }
        }
      });
    }
  }

  showError(field: string): boolean {
    const control = this.citaForm.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  onSubmit(): void {
    if (this.citaForm.valid) {
      this.isLoading = true;
      this.error = null;

      // Crear fechaHora combinando fecha y hora
      const fechaHora = `${this.citaForm.value.fecha}T${this.citaForm.value.hora}:00`;

      const citaData = {
        pacienteId: 'temp-id', // TODO: Obtener ID real del paciente seleccionado
        fechaHora: fechaHora,
        duracionMinutos: 30, // Duración por defecto
        motivo: this.citaForm.value.motivo,
        notas: this.citaForm.value.notas
      };

      if (this.isEditing) {
        const citaId = this.route.snapshot.params['id'];
        this.agendaService.actualizarCita(citaId, citaData).subscribe({
          next: () => this.router.navigate(['/agenda']),
          error: (err) => {
            this.error = 'Error al actualizar la cita';
            this.isLoading = false;
          }
        });
      } else {
        this.agendaService.crearCita(citaData).subscribe({
          next: () => this.router.navigate(['/agenda']),
          error: (err) => {
            this.error = 'Error al crear la cita';
            this.isLoading = false;
          }
        });
      }
    }
  }
} 