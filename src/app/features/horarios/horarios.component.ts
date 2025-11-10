import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HorariosService } from '../../core/services/horarios.service';
import {
  HorarioMedico,
  DiaSemana,
  DIAS_SEMANA_LABELS,
  CreateHorarioDto,
  UpdateHorarioDto,
  InitializeHorariosDto
} from '../../core/models/horario.model';

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-4 md:p-8">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">⏰ Configuración de Horarios</h1>
              <p class="text-gray-600 mt-1">Gestiona tus horarios de atención y disponibilidad</p>
            </div>
            <button
              (click)="mostrarFormularioInicializacion()"
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              ⚡ Configuración Rápida
            </button>
          </div>
        </div>

        <!-- Formulario de Inicialización Rápida -->
        @if (mostrandoInicializacion()) {
          <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">⚡ Configuración Rápida (Lunes a Viernes)</h2>
            <form [formGroup]="formInicializacion" (ngSubmit)="inicializarHorarios()" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    formControlName="horaInicio"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Hora Fin</label>
                  <input
                    type="time"
                    formControlName="horaFin"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Duración Cita (min)</label>
                  <select
                    formControlName="duracionCitaMinutos"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option [value]="15">15 minutos</option>
                    <option [value]="30">30 minutos</option>
                    <option [value]="45">45 minutos</option>
                    <option [value]="60">60 minutos</option>
                  </select>
                </div>
              </div>
              <div class="flex gap-3">
                <button
                  type="submit"
                  [disabled]="formInicializacion.invalid || cargando()"
                  class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  @if (cargando()) {
                    <span>Configurando...</span>
                  } @else {
                    <span>✓ Aplicar Configuración</span>
                  }
                </button>
                <button
                  type="button"
                  (click)="cancelarInicializacion()"
                  class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        }

        <!-- Lista de Horarios por Día -->
        <div class="space-y-4">
          @for (dia of diasSemana; track dia) {
            <div class="bg-white rounded-lg shadow-sm p-6">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{{ getDiaLabel(dia) }}</h3>
                  @if (getHorarioPorDia(dia); as horario) {
                    <p class="text-sm text-gray-600 mt-1">
                      {{ horario.horaInicio }} - {{ horario.horaFin }}
                      ({{ horario.duracionCitaMinutos }} min/cita)
                      @if (!horario.activo) {
                        <span class="text-red-600 font-medium"> - Inactivo</span>
                      }
                    </p>
                  } @else {
                    <p class="text-sm text-gray-500 mt-1">Sin horario configurado</p>
                  }
                </div>
                <div class="flex gap-2">
                  @if (getHorarioPorDia(dia); as horario) {
                    <button
                      (click)="editarHorario(horario)"
                      class="text-blue-600 hover:text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      (click)="eliminarHorario(horario.id)"
                      class="text-red-600 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      🗑️ Eliminar
                    </button>
                  } @else {
                    <button
                      (click)="crearNuevoHorario(dia)"
                      class="text-green-600 hover:text-green-700 px-3 py-1 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      ➕ Agregar Horario
                    </button>
                  }
                </div>
              </div>

              <!-- Formulario de edición/creación -->
              @if (horarioEnEdicion()?.diaSemana === dia || nuevoHorarioDia() === dia) {
                <div class="border-t pt-4 mt-4">
                  <form [formGroup]="formHorario" (ngSubmit)="guardarHorario()" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
                        <input
                          type="time"
                          formControlName="horaInicio"
                          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Hora Fin</label>
                        <input
                          type="time"
                          formControlName="horaFin"
                          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Duración Cita</label>
                        <select
                          formControlName="duracionCitaMinutos"
                          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option [value]="15">15 min</option>
                          <option [value]="30">30 min</option>
                          <option [value]="45">45 min</option>
                          <option [value]="60">60 min</option>
                        </select>
                      </div>
                      <div class="flex items-end">
                        <label class="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            formControlName="activo"
                            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span class="text-sm font-medium text-gray-700">Activo</span>
                        </label>
                      </div>
                    </div>
                    <div class="flex gap-3">
                      <button
                        type="submit"
                        [disabled]="formHorario.invalid || cargando()"
                        class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        @if (cargando()) {
                          <span>Guardando...</span>
                        } @else {
                          <span>✓ Guardar</span>
                        }
                      </button>
                      <button
                        type="button"
                        (click)="cancelarEdicion()"
                        class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              }
            </div>
          }
        </div>

        <!-- Botón para gestionar bloqueos -->
        <div class="mt-8 text-center">
          <button
            (click)="irABloqueos()"
            class="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
          >
            <span>📅</span>
            <span>Gestionar Bloqueos (Almuerzos, Vacaciones, etc.)</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class HorariosComponent implements OnInit {
  private readonly horariosService = inject(HorariosService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  // State signals
  horarios = signal<HorarioMedico[]>([]);
  cargando = signal(false);
  horarioEnEdicion = signal<HorarioMedico | null>(null);
  nuevoHorarioDia = signal<DiaSemana | null>(null);
  mostrandoInicializacion = signal(false);

  // Forms
  formHorario!: FormGroup;
  formInicializacion!: FormGroup;

  // Días de la semana en orden
  diasSemana: DiaSemana[] = [
    DiaSemana.LUNES,
    DiaSemana.MARTES,
    DiaSemana.MIERCOLES,
    DiaSemana.JUEVES,
    DiaSemana.VIERNES,
    DiaSemana.SABADO,
    DiaSemana.DOMINGO
  ];

  ngOnInit() {
    this.inicializarFormularios();
    this.cargarHorarios();
  }

  inicializarFormularios() {
    this.formHorario = this.fb.group({
      horaInicio: ['08:00', Validators.required],
      horaFin: ['18:00', Validators.required],
      duracionCitaMinutos: [30, [Validators.required, Validators.min(15)]],
      activo: [true]
    });

    this.formInicializacion = this.fb.group({
      horaInicio: ['08:00', Validators.required],
      horaFin: ['18:00', Validators.required],
      duracionCitaMinutos: [30, [Validators.required, Validators.min(15)]]
    });
  }

  cargarHorarios() {
    this.cargando.set(true);
    this.horariosService.obtenerHorarios().subscribe({
      next: (horarios) => {
        this.horarios.set(horarios);
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error cargando horarios:', error);
        this.cargando.set(false);
        alert('Error al cargar los horarios');
      }
    });
  }

  getDiaLabel(dia: DiaSemana): string {
    return DIAS_SEMANA_LABELS[dia];
  }

  getHorarioPorDia(dia: DiaSemana): HorarioMedico | undefined {
    return this.horarios().find(h => h.diaSemana === dia);
  }

  crearNuevoHorario(dia: DiaSemana) {
    this.nuevoHorarioDia.set(dia);
    this.horarioEnEdicion.set(null);
    this.formHorario.reset({
      horaInicio: '08:00',
      horaFin: '18:00',
      duracionCitaMinutos: 30,
      activo: true
    });
  }

  editarHorario(horario: HorarioMedico) {
    this.horarioEnEdicion.set(horario);
    this.nuevoHorarioDia.set(null);
    this.formHorario.patchValue({
      horaInicio: horario.horaInicio,
      horaFin: horario.horaFin,
      duracionCitaMinutos: horario.duracionCitaMinutos,
      activo: horario.activo
    });
  }

  guardarHorario() {
    if (this.formHorario.invalid) return;

    this.cargando.set(true);
    const valores = this.formHorario.value;

    if (this.horarioEnEdicion()) {
      // Actualizar horario existente
      const dto: UpdateHorarioDto = valores;
      this.horariosService.actualizarHorario(this.horarioEnEdicion()!.id, dto).subscribe({
        next: () => {
          this.cargarHorarios();
          this.cancelarEdicion();
        },
        error: (error) => {
          console.error('Error actualizando horario:', error);
          this.cargando.set(false);
          alert('Error al actualizar el horario');
        }
      });
    } else if (this.nuevoHorarioDia()) {
      // Crear nuevo horario
      const dto: CreateHorarioDto = {
        ...valores,
        diaSemana: this.nuevoHorarioDia()!
      };
      this.horariosService.crearHorario(dto).subscribe({
        next: () => {
          this.cargarHorarios();
          this.cancelarEdicion();
        },
        error: (error) => {
          console.error('Error creando horario:', error);
          this.cargando.set(false);
          alert('Error al crear el horario');
        }
      });
    }
  }

  eliminarHorario(id: string) {
    if (!confirm('¿Estás seguro de eliminar este horario?')) return;

    this.cargando.set(true);
    this.horariosService.eliminarHorario(id).subscribe({
      next: () => {
        this.cargarHorarios();
      },
      error: (error) => {
        console.error('Error eliminando horario:', error);
        this.cargando.set(false);
        alert('Error al eliminar el horario');
      }
    });
  }

  cancelarEdicion() {
    this.horarioEnEdicion.set(null);
    this.nuevoHorarioDia.set(null);
    this.formHorario.reset();
  }

  mostrarFormularioInicializacion() {
    this.mostrandoInicializacion.set(true);
  }

  cancelarInicializacion() {
    this.mostrandoInicializacion.set(false);
    this.formInicializacion.reset({
      horaInicio: '08:00',
      horaFin: '18:00',
      duracionCitaMinutos: 30
    });
  }

  inicializarHorarios() {
    if (this.formInicializacion.invalid) return;

    if (!confirm('¿Deseas configurar automáticamente los horarios de Lunes a Viernes con estos valores?')) return;

    this.cargando.set(true);
    const dto: InitializeHorariosDto = this.formInicializacion.value;

    this.horariosService.inicializarHorarios(dto).subscribe({
      next: () => {
        this.cargarHorarios();
        this.cancelarInicializacion();
        alert('Horarios configurados exitosamente');
      },
      error: (error) => {
        console.error('Error inicializando horarios:', error);
        this.cargando.set(false);
        alert('Error al inicializar los horarios');
      }
    });
  }

  irABloqueos() {
    this.router.navigate(['/bloqueos']);
  }
}
