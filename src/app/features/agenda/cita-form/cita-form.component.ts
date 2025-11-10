import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { AgendaService } from '../agenda.service';
import { PacienteAutocompleteComponent, PacienteSeleccionado } from '../../../shared/components/paciente-autocomplete/paciente-autocomplete.component';
import { DateTimePickerComponent, DateTimeSelection } from '../../../shared/components/date-time-picker/date-time-picker.component';
import { UbicacionesService } from '../../../core/services/ubicaciones.service';
import { Ubicacion, UbicacionConHorarios, HorarioUbicacion, DIAS_SEMANA_ES } from '../../../core/models';

@Component({
  selector: 'app-cita-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, RouterLink, PacienteAutocompleteComponent, DateTimePickerComponent],
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
        <div class="flex items-center space-x-3">
          <!-- Botón Atender Consulta - Solo visible cuando se está editando -->
          <button
            *ngIf="isEditing && citaId"
            type="button"
            (click)="atenderConsulta()"
            class="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg font-semibold flex items-center space-x-2"
          >
            <span class="material-icons-outlined text-xl">medical_services</span>
            <span>Atender Consulta</span>
          </button>

          <button
            routerLink="/agenda"
            class="btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </div>

      <!-- Resumen de Ubicaciones y Horarios -->
      <div *ngIf="ubicacionesConHorarios.length > 0" class="mb-6">
        <div class="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-lg p-5">
          <div class="flex items-center space-x-2 mb-4">
            <span class="material-icons-outlined text-primary-600">location_on</span>
            <h3 class="text-lg font-semibold text-gray-900">Ubicaciones Disponibles</h3>
          </div>
          <p class="text-sm text-gray-600 mb-4">
            Seleccione la ubicación donde se realizará la cita. Los horarios disponibles varían según la ubicación.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              *ngFor="let item of ubicacionesConHorarios"
              (click)="seleccionarUbicacion(item.ubicacion.id)"
              class="bg-white border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md"
              [class.border-primary-500]="citaForm.value.ubicacionId === item.ubicacion.id"
              [class.bg-primary-50]="citaForm.value.ubicacionId === item.ubicacion.id"
              [class.border-gray-200]="citaForm.value.ubicacionId !== item.ubicacion.id"
            >
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center space-x-2">
                  <span class="material-icons-outlined text-primary-600">business</span>
                  <h4 class="font-semibold text-gray-900">{{ item.ubicacion.nombre }}</h4>
                </div>
                <span
                  *ngIf="citaForm.value.ubicacionId === item.ubicacion.id"
                  class="material-icons-outlined text-primary-600 text-xl"
                >
                  check_circle
                </span>
              </div>

              <p *ngIf="item.ubicacion.direccion" class="text-sm text-gray-600 mb-3 flex items-center">
                <span class="material-icons-outlined text-xs mr-1">place</span>
                {{ item.ubicacion.direccion }}
              </p>

              <div class="bg-gray-50 rounded p-3 border border-gray-200">
                <p class="text-xs font-medium text-gray-700 mb-2 flex items-center">
                  <span class="material-icons-outlined text-xs mr-1">schedule</span>
                  Horarios de Atención:
                </p>
                <p class="text-xs text-gray-600">
                  {{ formatearHorariosResumen(item.horarios) }}
                </p>
              </div>
            </div>
          </div>

          <p *ngIf="ubicacionesConHorarios.length === 0" class="text-sm text-gray-500 text-center py-4">
            No hay ubicaciones con horarios configurados. Configure ubicaciones y horarios en su perfil.
          </p>
        </div>
      </div>

      <!-- Formulario -->
      <div class="card-medical">
        <form [formGroup]="citaForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Selector de Fecha y Hora Interactivo -->
          <div class="space-y-2">
            <h3 class="text-lg font-medium text-gray-900 flex items-center gap-2">
              <span class="material-icons-outlined text-primary-500">event</span>
              Seleccione Fecha y Hora
            </h3>
            <app-date-time-picker
              [availableSlots]="horariosDisponibles"
              (dateSelected)="onDateChanged($event)"
              (dateTimeSelected)="onDateTimeSelected($event)"
            ></app-date-time-picker>
            <p *ngIf="showError('fecha') || showError('hora')" class="form-error mt-2">
              Por favor seleccione una fecha y hora para la cita
            </p>
          </div>

          <!-- Búsqueda/Selección de Paciente -->
          <div class="space-y-6">
            <h3 class="text-lg font-medium text-gray-900">
              Paciente
            </h3>

            <div class="form-group">
              <label class="form-label">
                Buscar o crear paciente
              </label>
              <app-paciente-autocomplete
                formControlName="pacienteData"
                [class.border-error-500]="showError('pacienteData')"
              ></app-paciente-autocomplete>
              <p *ngIf="showError('pacienteData')" class="form-error">
                Debe seleccionar o crear un paciente
              </p>
            </div>

            <!-- Campos adicionales si es paciente nuevo -->
            <div *ngIf="pacienteSeleccionado?.esNuevo" class="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-success-50 border border-success-200 rounded-lg">
              <div class="form-group">
                <label class="form-label">
                  Teléfono <span class="text-error-500">*</span>
                </label>
                <input
                  type="tel"
                  formControlName="telefonoPaciente"
                  class="input-medical w-full"
                  [class.border-error-500]="showError('telefonoPaciente')"
                  placeholder="+504 9999-9999"
                >
                <p *ngIf="showError('telefonoPaciente')" class="form-error">
                  El teléfono es requerido para nuevos pacientes
                </p>
              </div>

              <div class="form-group">
                <label class="form-label">
                  Email (opcional)
                </label>
                <input
                  type="email"
                  formControlName="emailPaciente"
                  class="input-medical w-full"
                  placeholder="paciente@example.com"
                >
              </div>

              <div class="md:col-span-2">
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    formControlName="consentimientoWhatsApp"
                    class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  >
                  <span class="text-sm text-gray-700">
                    Tiene consentimiento para recibir mensajes por WhatsApp
                  </span>
                </label>
              </div>
            </div>
          </div>

          <!-- Detalles de la Cita -->
          <div class="space-y-6">
            <h3 class="text-lg font-medium text-gray-900">
              Detalles de la Cita
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Ubicación - Ahora muestra la ubicación seleccionada arriba -->
              <div class="form-group">
                <label class="form-label">
                  <span class="material-icons-outlined text-sm align-middle mr-1">location_on</span>
                  Ubicación Seleccionada
                </label>
                <div
                  *ngIf="citaForm.value.ubicacionId"
                  class="px-4 py-3 bg-primary-50 border border-primary-200 rounded-lg text-sm text-gray-700 flex items-center"
                >
                  <span class="material-icons-outlined text-primary-600 mr-2">check_circle</span>
                  <span class="font-medium">
                    {{ getNombreUbicacionSeleccionada() }}
                  </span>
                </div>
                <div
                  *ngIf="!citaForm.value.ubicacionId"
                  class="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500"
                >
                  <span class="material-icons-outlined text-gray-400 mr-2 align-middle">info</span>
                  Seleccione una ubicación arriba
                </div>
                <p class="text-xs text-gray-500 mt-1">
                  La ubicación determina los horarios disponibles
                </p>
              </div>

              <div class="form-group">
                <label class="form-label">
                  Tipo de Cita
                </label>
                <select
                  formControlName="tipo"
                  class="input-medical w-full"
                >
                  <option value="PRIMERA_VEZ">Primera Vez</option>
                  <option value="SEGUIMIENTO">Seguimiento</option>
                  <option value="CONTROL">Control</option>
                  <option value="EMERGENCIA">Emergencia</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">
                  Duración (minutos)
                </label>
                <select
                  formControlName="duracionMinutos"
                  class="input-medical w-full"
                >
                  <option [value]="15">15 minutos</option>
                  <option [value]="30">30 minutos</option>
                  <option [value]="45">45 minutos</option>
                  <option [value]="60">1 hora</option>
                </select>
              </div>
            </div>

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
          <p *ngIf="error" class="text-sm text-error-400 text-center p-3 bg-error-50 rounded-lg">
            {{error}}
          </p>

          <!-- Submit -->
          <div class="flex justify-end gap-3">
            <button
              type="button"
              routerLink="/agenda"
              class="btn-secondary"
            >
              Cancelar
            </button>
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
  private ubicacionesService = inject(UbicacionesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  citaForm: FormGroup;
  isLoading = false;
  isEditing = false;
  citaId: string | null = null;
  error: string | null = null;
  horariosDisponibles: string[] = [];
  pacienteSeleccionado: PacienteSeleccionado | null = null;
  ubicacionesActivas: Ubicacion[] = [];
  ubicacionesConHorarios: UbicacionConHorarios[] = [];
  diasSemanaEs = DIAS_SEMANA_ES;

  constructor() {
    this.citaForm = this.fb.group({
      fecha: ['', [Validators.required]],
      hora: ['', [Validators.required]],
      pacienteData: [null, [Validators.required]],
      telefonoPaciente: [''],
      emailPaciente: [''],
      consentimientoWhatsApp: [false],
      ubicacionId: [null],  // Ubicación opcional
      tipo: ['PRIMERA_VEZ'],
      duracionMinutos: [30],
      motivo: ['', [Validators.required]],
      notas: ['']
    });

    // Observar cambios en pacienteData
    this.citaForm.get('pacienteData')?.valueChanges.subscribe((value: PacienteSeleccionado | null) => {
      this.pacienteSeleccionado = value;

      // Si es paciente nuevo, hacer el teléfono requerido
      const telefonoControl = this.citaForm.get('telefonoPaciente');
      if (value?.esNuevo) {
        telefonoControl?.setValidators([Validators.required]);
      } else {
        telefonoControl?.clearValidators();
      }
      telefonoControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    // Cargar ubicaciones activas
    this.cargarUbicaciones();

    this.citaId = this.route.snapshot.params['id'];
    if (this.citaId) {
      this.isEditing = true;
      this.cargarCita(this.citaId);
    } else {
      // Inicializar con la fecha actual y cargar horarios
      const hoy = new Date().toISOString().split('T')[0];
      this.citaForm.patchValue({
        fecha: hoy
      });
      this.cargarHorariosDisponibles();
    }
  }

  cargarUbicaciones(): void {
    // Cargar ubicaciones activas para el dropdown
    this.ubicacionesService.getUbicacionesActivas().subscribe({
      next: (ubicaciones) => {
        this.ubicacionesActivas = ubicaciones;
      },
      error: (err) => {
        console.error('Error cargando ubicaciones:', err);
        // No bloqueamos el formulario si falla la carga de ubicaciones
      }
    });

    // Cargar resumen consolidado de horarios para mostrar en la UI
    this.ubicacionesService.getResumenHorariosConsolidado().subscribe({
      next: (resumen) => {
        this.ubicacionesConHorarios = resumen;
        console.log('📍 Resumen de horarios cargado:', resumen);
      },
      error: (err) => {
        console.error('Error cargando resumen de horarios:', err);
      }
    });
  }

  cargarCita(id: string): void {
    this.isLoading = true;
    this.agendaService.getCita(id).subscribe({
      next: (cita) => {
        if (cita) {
          // Convertir la fecha ISO string a Date en zona horaria local
          const fechaHoraDate = new Date(cita.fechaHora);

          // Formatear fecha en formato YYYY-MM-DD
          const year = fechaHoraDate.getFullYear();
          const month = String(fechaHoraDate.getMonth() + 1).padStart(2, '0');
          const day = String(fechaHoraDate.getDate()).padStart(2, '0');
          const fecha = `${year}-${month}-${day}`;

          // Formatear hora en formato HH:MM (24 horas)
          const hours = String(fechaHoraDate.getHours()).padStart(2, '0');
          const minutes = String(fechaHoraDate.getMinutes()).padStart(2, '0');
          const hora = `${hours}:${minutes}`;

          this.citaForm.patchValue({
            fecha,
            hora,
            pacienteData: {
              id: cita.paciente.id,
              nombreCompleto: cita.paciente.nombreCompleto,
              telefono: cita.paciente.telefono,
              esNuevo: false
            },
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
      console.log('📅 Cargando horarios disponibles para fecha:', fecha);
      this.agendaService.getHorariosDisponibles(fecha).subscribe({
        next: (horarios) => {
          console.log('✅ Horarios disponibles recibidos del backend:', horarios);
          this.horariosDisponibles = horarios;

          // Si estamos editando, incluir la hora actual de la cita
          const horaActual = this.citaForm.get('hora')?.value;
          if (this.isEditing && horaActual && !horarios.includes(horaActual)) {
            this.horariosDisponibles.push(horaActual);
            this.horariosDisponibles.sort();
          }
          console.log('📋 Horarios finales a mostrar:', this.horariosDisponibles);
        },
        error: (err) => {
          console.error('❌ Error al cargar horarios disponibles:', err);
        }
      });
    }
  }

  onDateChanged(date: Date): void {
    // Formatear fecha a YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const fecha = `${year}-${month}-${day}`;

    // Actualizar formulario y cargar horarios
    this.citaForm.patchValue({ fecha });
    this.cargarHorariosDisponibles();
  }

  onDateTimeSelected(selection: DateTimeSelection): void {
    // Formatear fecha a YYYY-MM-DD
    const year = selection.date.getFullYear();
    const month = String(selection.date.getMonth() + 1).padStart(2, '0');
    const day = String(selection.date.getDate()).padStart(2, '0');
    const fecha = `${year}-${month}-${day}`;

    // Actualizar formulario
    this.citaForm.patchValue({
      fecha,
      hora: selection.time
    });

    // Marcar campos como touched para validación
    this.citaForm.get('fecha')?.markAsTouched();
    this.citaForm.get('hora')?.markAsTouched();
  }

  showError(field: string): boolean {
    const control = this.citaForm.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  onSubmit(): void {
    if (this.citaForm.valid) {
      this.isLoading = true;
      this.error = null;

      const pacienteData: PacienteSeleccionado = this.citaForm.value.pacienteData;

      // Crear la fecha en la zona horaria local (Honduras)
      const [year, month, day] = this.citaForm.value.fecha.split('-').map(Number);
      const [hours, minutes] = this.citaForm.value.hora.split(':').map(Number);
      const fechaHoraLocal = new Date(year, month - 1, day, hours, minutes, 0);

      // Convertir a formato ISO string
      const fechaHora = fechaHoraLocal.toISOString();

      const citaData: any = {
        fechaHora,
        duracionMinutos: this.citaForm.value.duracionMinutos,
        tipo: this.citaForm.value.tipo,
        motivo: this.citaForm.value.motivo,
        notas: this.citaForm.value.notas,
        ubicacionId: this.citaForm.value.ubicacionId || undefined  // Solo incluir si tiene valor
      };

      // Decidir si usar pacienteId o paciente
      if (pacienteData.esNuevo) {
        // Paciente nuevo: enviar datos para crear
        citaData.paciente = {
          nombreCompleto: pacienteData.nombreCompleto,
          telefono: this.citaForm.value.telefonoPaciente,
          email: this.citaForm.value.emailPaciente,
          consentimientoWhatsApp: this.citaForm.value.consentimientoWhatsApp
        };
      } else {
        // Paciente existente: enviar ID
        citaData.pacienteId = pacienteData.id;
      }

      if (this.isEditing) {
        const citaId = this.route.snapshot.params['id'];
        this.agendaService.actualizarCita(citaId, citaData).subscribe({
          next: () => this.router.navigate(['/agenda']),
          error: (err) => {
            this.error = err.error?.message || 'Error al actualizar la cita';
            this.isLoading = false;
          }
        });
      } else {
        this.agendaService.crearCita(citaData).subscribe({
          next: () => this.router.navigate(['/agenda']),
          error: (err) => {
            this.error = err.error?.message || 'Error al crear la cita';
            this.isLoading = false;
          }
        });
      }
    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.citaForm.controls).forEach(key => {
        this.citaForm.get(key)?.markAsTouched();
      });
    }
  }

  atenderConsulta(): void {
    // Obtener el pacienteId de la cita actual
    const pacienteData: PacienteSeleccionado = this.citaForm.value.pacienteData;

    if (this.citaId && pacienteData?.id) {
      // Navegar al formulario de consulta con el pacienteId y citaId
      this.router.navigate(['/consultas/nueva'], {
        queryParams: {
          citaId: this.citaId,
          pacienteId: pacienteData.id
        }
      });
    } else {
      this.error = 'No se pudo obtener la información de la cita';
    }
  }

  /**
   * Formatear horarios de una ubicación para mostrar en resumen
   * Ejemplo: "Lunes-Viernes: 8:00 AM - 12:00 PM, Sábado: 9:00 AM - 1:00 PM"
   */
  formatearHorariosResumen(horarios: HorarioUbicacion[]): string {
    if (!horarios || horarios.length === 0) {
      return 'Sin horarios configurados';
    }

    // Agrupar horarios consecutivos con el mismo rango de horas
    const grupos: {[key: string]: string[]} = {};

    horarios.forEach(h => {
      const rango = `${h.horaInicio} - ${h.horaFin}`;
      if (!grupos[rango]) {
        grupos[rango] = [];
      }
      // Asegurar que h.diaSemana es válido antes de acceder al objeto
      const diaNombre = this.diasSemanaEs[h.diaSemana as keyof typeof this.diasSemanaEs];
      if (diaNombre) {
        grupos[rango].push(diaNombre);
      }
    });

    // Formatear cada grupo
    return Object.entries(grupos).map(([rango, dias]) => {
      return `${dias.join(', ')}: ${rango}`;
    }).join(' | ');
  }

  /**
   * Seleccionar una ubicación (actualiza el form control)
   */
  seleccionarUbicacion(ubicacionId: string): void {
    this.citaForm.patchValue({ ubicacionId });
    console.log('📍 Ubicación seleccionada:', ubicacionId);
  }

  /**
   * Obtener el nombre de la ubicación seleccionada
   */
  getNombreUbicacionSeleccionada(): string {
    const ubicacionId = this.citaForm.value.ubicacionId;
    if (!ubicacionId) {
      return 'Ubicación seleccionada';
    }
    const ubicacion = this.ubicacionesActivas.find(u => u.id === ubicacionId);
    return ubicacion?.nombre || 'Ubicación seleccionada';
  }
}
