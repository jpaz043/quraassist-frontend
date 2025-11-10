import { Component, OnInit, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { UbicacionesService } from '../../../core/services/ubicaciones.service';
import { forkJoin } from 'rxjs';
import {
  Ubicacion,
  HorarioUbicacion,
  CreateHorarioUbicacionDto,
  UpdateHorarioUbicacionDto,
  DiaSemana,
  DIAS_SEMANA_LABELS
} from '../../../core/models';

@Component({
  selector: 'app-horarios-ubicacion-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
         (click)="onBackdropClick($event)">
      <div class="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto"
           (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Horarios de Atención</h2>
            <p class="text-sm text-gray-600 mt-1">{{ ubicacion?.nombre }}</p>
          </div>
          <button
            type="button"
            (click)="close()"
            class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="p-6">
          <!-- Horarios Existentes -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Horarios Configurados</h3>

            @if (loading()) {
              <div class="flex justify-center items-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            }

            @if (!loading() && horarios().length === 0) {
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-gray-600">No hay horarios configurados para esta ubicación</p>
                <p class="text-sm text-gray-500 mt-1">Usa "Inicialización Rápida" para agregar horarios a varios días a la vez</p>
              </div>
            }

            @if (!loading() && horarios().length > 0) {
              <div class="space-y-2">
                @for (horario of horarios(); track horario.id) {
                  <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                    <div class="flex items-center gap-4">
                      <div class="flex-shrink-0">
                        <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </div>
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <span class="font-semibold text-gray-900">{{ getDiaSemanaLabel(horario.diaSemana) }}</span>
                          <span [class]="horario.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                                class="px-2 py-0.5 text-xs font-medium rounded-full">
                            {{ horario.activo ? 'Activo' : 'Inactivo' }}
                          </span>
                        </div>
                        <div class="flex items-center gap-3 text-sm text-gray-600 mt-1">
                          <span class="flex items-center gap-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            {{ horario.horaInicio }} - {{ horario.horaFin }}
                          </span>
                          <span class="text-gray-400">•</span>
                          <span>{{ horario.duracionCitaMinutos }} min por cita</span>
                        </div>
                      </div>
                    </div>
                    <div class="flex gap-2">
                      <button
                        type="button"
                        (click)="editHorario(horario)"
                        class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button
                        type="button"
                        (click)="deleteHorario(horario)"
                        class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Formulario de Horario -->
          <div class="border-t border-gray-200 pt-6">
            <!-- Tabs -->
            <div class="flex border-b border-gray-200 mb-6">
              <button
                type="button"
                (click)="activeTab.set('individual')"
                [class]="activeTab() === 'individual'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'"
                class="px-6 py-3 font-medium text-sm transition-colors">
                Agregar Individual
              </button>
              <button
                type="button"
                (click)="activeTab.set('rapida')"
                [class]="activeTab() === 'rapida'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'"
                class="px-6 py-3 font-medium text-sm transition-colors">
                Inicialización Rápida
              </button>
            </div>

            <!-- Formulario Individual -->
            @if (activeTab() === 'individual') {
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                {{ editMode() ? 'Editar Horario' : 'Agregar Horario Individual' }}
              </h3>

              <form [formGroup]="horarioForm" (ngSubmit)="onSubmitHorario()" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Día de la Semana -->
                  <div>
                    <label for="diaSemana" class="block text-sm font-medium text-gray-700 mb-1">
                      Día de la semana <span class="text-red-500">*</span>
                    </label>
                    <select
                      id="diaSemana"
                      formControlName="diaSemana"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      [class.border-red-500]="horarioForm.get('diaSemana')?.invalid && horarioForm.get('diaSemana')?.touched">
                      <option value="">Seleccione un día</option>
                      @for (dia of diasSemana; track dia.value) {
                        <option [value]="dia.value">{{ dia.label }}</option>
                      }
                    </select>
                    @if (horarioForm.get('diaSemana')?.invalid && horarioForm.get('diaSemana')?.touched) {
                      <p class="mt-1 text-sm text-red-600">Seleccione un día de la semana</p>
                    }
                  </div>

                  <!-- Duración de Cita -->
                  <div>
                    <label for="duracionCitaMinutos" class="block text-sm font-medium text-gray-700 mb-1">
                      Duración por cita (minutos) <span class="text-red-500">*</span>
                    </label>
                    <select
                      id="duracionCitaMinutos"
                      formControlName="duracionCitaMinutos"
                      (change)="onDuracionChange()"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      [class.border-red-500]="horarioForm.get('duracionCitaMinutos')?.invalid && horarioForm.get('duracionCitaMinutos')?.touched">
                      <option value="">Seleccione duración</option>
                      <option [value]="15">15 minutos</option>
                      <option [value]="20">20 minutos</option>
                      <option [value]="30">30 minutos</option>
                      <option [value]="45">45 minutos</option>
                      <option [value]="60">60 minutos</option>
                    </select>
                    @if (horarioForm.get('duracionCitaMinutos')?.invalid && horarioForm.get('duracionCitaMinutos')?.touched) {
                      <p class="mt-1 text-sm text-red-600">Seleccione la duración</p>
                    }
                    <p class="mt-1 text-xs text-gray-500">Las horas se ajustarán en incrementos de esta duración</p>
                  </div>

                  <!-- Hora Inicio -->
                  <div>
                    <label for="horaInicio" class="block text-sm font-medium text-gray-700 mb-1">
                      Hora de inicio <span class="text-red-500">*</span>
                    </label>
                    <select
                      id="horaInicio"
                      formControlName="horaInicio"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      [class.border-red-500]="horarioForm.get('horaInicio')?.invalid && horarioForm.get('horaInicio')?.touched">
                      <option value="">Seleccione hora</option>
                      @for (hora of getAvailableHours(); track hora) {
                        <option [value]="hora">{{ hora }}</option>
                      }
                    </select>
                    @if (horarioForm.get('horaInicio')?.invalid && horarioForm.get('horaInicio')?.touched) {
                      <p class="mt-1 text-sm text-red-600">Seleccione la hora de inicio</p>
                    }
                  </div>

                  <!-- Hora Fin -->
                  <div>
                    <label for="horaFin" class="block text-sm font-medium text-gray-700 mb-1">
                      Hora de fin <span class="text-red-500">*</span>
                    </label>
                    <select
                      id="horaFin"
                      formControlName="horaFin"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      [class.border-red-500]="horarioForm.get('horaFin')?.invalid && horarioForm.get('horaFin')?.touched">
                      <option value="">Seleccione hora</option>
                      @for (hora of getAvailableHours(); track hora) {
                        <option [value]="hora">{{ hora }}</option>
                      }
                    </select>
                    @if (horarioForm.get('horaFin')?.invalid && horarioForm.get('horaFin')?.touched) {
                      <p class="mt-1 text-sm text-red-600">Seleccione la hora de fin</p>
                    }
                  </div>
                </div>

                <!-- Activo Checkbox -->
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    id="activo"
                    formControlName="activo"
                    class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                  <label for="activo" class="ml-2 text-sm text-gray-700">
                    Horario activo
                  </label>
                </div>

                <!-- Error Message -->
                @if (errorMessage()) {
                  <div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                    {{ errorMessage() }}
                  </div>
                }

                <!-- Form Actions -->
                <div class="flex gap-3 pt-4">
                  @if (editMode()) {
                    <button
                      type="button"
                      (click)="cancelEdit()"
                      class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">
                      Cancelar Edición
                    </button>
                  }
                  <button
                    type="submit"
                    [disabled]="horarioForm.invalid || saving()"
                    class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    @if (saving()) {
                      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Guardando...</span>
                    } @else {
                      <span>{{ editMode() ? 'Actualizar' : 'Agregar' }} Horario</span>
                    }
                  </button>
                </div>
              </form>
            }

            <!-- Formulario Rápido -->
            @if (activeTab() === 'rapida') {
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                Inicialización Rápida de Horarios
              </h3>
              <p class="text-sm text-gray-600 mb-4">Aplica el mismo horario a múltiples días de la semana</p>

              <form [formGroup]="rapidaForm" (ngSubmit)="onSubmitRapida()" class="space-y-4">
                <!-- Días de la semana (checkboxes) -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Selecciona los días <span class="text-red-500">*</span>
                  </label>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    @for (dia of diasSemana; track dia.value) {
                      <label class="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                             [class.bg-blue-50]="rapidaForm.get('dias')?.value?.includes(dia.value)"
                             [class.border-blue-500]="rapidaForm.get('dias')?.value?.includes(dia.value)">
                        <input
                          type="checkbox"
                          [value]="dia.value"
                          (change)="onDiaCheckChange($event, dia.value)"
                          [checked]="rapidaForm.get('dias')?.value?.includes(dia.value)"
                          class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                        <span class="ml-2 text-sm font-medium text-gray-900">{{ dia.label }}</span>
                      </label>
                    }
                  </div>
                  @if (rapidaForm.get('dias')?.invalid && rapidaForm.get('dias')?.touched) {
                    <p class="mt-1 text-sm text-red-600">Seleccione al menos un día</p>
                  }
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <!-- Duración de Cita -->
                  <div>
                    <label for="rapidaDuracion" class="block text-sm font-medium text-gray-700 mb-1">
                      Duración por cita <span class="text-red-500">*</span>
                    </label>
                    <select
                      id="rapidaDuracion"
                      formControlName="duracionCitaMinutos"
                      (change)="onDuracionRapidaChange()"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Seleccione</option>
                      <option [value]="15">15 min</option>
                      <option [value]="20">20 min</option>
                      <option [value]="30">30 min</option>
                      <option [value]="45">45 min</option>
                      <option [value]="60">60 min</option>
                    </select>
                  </div>

                  <!-- Hora Inicio -->
                  <div>
                    <label for="rapidaInicio" class="block text-sm font-medium text-gray-700 mb-1">
                      Hora de inicio <span class="text-red-500">*</span>
                    </label>
                    <select
                      id="rapidaInicio"
                      formControlName="horaInicio"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Seleccione</option>
                      @for (hora of getAvailableHoursRapida(); track hora) {
                        <option [value]="hora">{{ hora }}</option>
                      }
                    </select>
                  </div>

                  <!-- Hora Fin -->
                  <div>
                    <label for="rapidaFin" class="block text-sm font-medium text-gray-700 mb-1">
                      Hora de fin <span class="text-red-500">*</span>
                    </label>
                    <select
                      id="rapidaFin"
                      formControlName="horaFin"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Seleccione</option>
                      @for (hora of getAvailableHoursRapida(); track hora) {
                        <option [value]="hora">{{ hora }}</option>
                      }
                    </select>
                  </div>
                </div>

                <!-- Error Message -->
                @if (errorMessageRapida()) {
                  <div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                    {{ errorMessageRapida() }}
                  </div>
                }

                <!-- Success Message -->
                @if (successMessageRapida()) {
                  <div class="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
                    {{ successMessageRapida() }}
                  </div>
                }

                <!-- Form Actions -->
                <div class="flex gap-3 pt-4">
                  <button
                    type="submit"
                    [disabled]="rapidaForm.invalid || savingRapida()"
                    class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    @if (savingRapida()) {
                      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Aplicando Horarios...</span>
                    } @else {
                      <span>Aplicar a Días Seleccionados</span>
                    }
                  </button>
                </div>
              </form>
            }
          </div>
        </div>

        <!-- Footer -->
        <div class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            type="button"
            (click)="close()"
            class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  `
})
export class HorariosUbicacionModalComponent implements OnInit {
  @Input() ubicacion: Ubicacion | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly ubicacionesService = inject(UbicacionesService);

  horarioForm!: FormGroup;
  rapidaForm!: FormGroup;
  horarios = signal<HorarioUbicacion[]>([]);
  loading = signal<boolean>(false);
  saving = signal<boolean>(false);
  savingRapida = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  errorMessageRapida = signal<string | null>(null);
  successMessageRapida = signal<string | null>(null);
  editMode = signal<boolean>(false);
  editingHorarioId = signal<string | null>(null);
  activeTab = signal<'individual' | 'rapida'>('rapida');

  diasSemana = [
    { value: DiaSemana.LUNES, label: 'Lunes' },
    { value: DiaSemana.MARTES, label: 'Martes' },
    { value: DiaSemana.MIERCOLES, label: 'Miércoles' },
    { value: DiaSemana.JUEVES, label: 'Jueves' },
    { value: DiaSemana.VIERNES, label: 'Viernes' },
    { value: DiaSemana.SABADO, label: 'Sábado' },
    { value: DiaSemana.DOMINGO, label: 'Domingo' }
  ];

  ngOnInit(): void {
    this.initForms();
    this.loadHorarios();
  }

  private initForms(): void {
    this.horarioForm = this.fb.group({
      diaSemana: ['', Validators.required],
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],
      duracionCitaMinutos: [30, [Validators.required, Validators.min(15), Validators.max(120)]],
      activo: [true]
    });

    this.rapidaForm = this.fb.group({
      dias: [[], Validators.required],
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],
      duracionCitaMinutos: [30, [Validators.required, Validators.min(15), Validators.max(120)]]
    });
  }

  // Generar horas en incrementos de horas completas (:00)
  getAvailableHours(): string[] {
    const hours = [];
    for (let h = 0; h < 24; h++) {
      const hour = h.toString().padStart(2, '0');
      hours.push(`${hour}:00`);
    }
    return hours;
  }

  getAvailableHoursRapida(): string[] {
    return this.getAvailableHours();
  }

  onDuracionChange(): void {
    // Reset hours when duration changes
    this.horarioForm.patchValue({
      horaInicio: '',
      horaFin: ''
    });
  }

  onDuracionRapidaChange(): void {
    // Reset hours when duration changes
    this.rapidaForm.patchValue({
      horaInicio: '',
      horaFin: ''
    });
  }

  onDiaCheckChange(event: Event, dia: DiaSemana): void {
    const checkbox = event.target as HTMLInputElement;
    const currentDias: DiaSemana[] = this.rapidaForm.get('dias')?.value || [];

    if (checkbox.checked) {
      this.rapidaForm.patchValue({
        dias: [...currentDias, dia]
      });
    } else {
      this.rapidaForm.patchValue({
        dias: currentDias.filter(d => d !== dia)
      });
    }
  }

  loadHorarios(): void {
    if (!this.ubicacion) return;

    this.loading.set(true);
    this.ubicacionesService.getHorarios(this.ubicacion.id).subscribe({
      next: (horarios) => {
        this.horarios.set(horarios);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading horarios:', err);
        this.errorMessage.set('Error al cargar los horarios');
        this.loading.set(false);
      }
    });
  }

  onSubmitHorario(): void {
    if (this.horarioForm.invalid || !this.ubicacion) {
      this.horarioForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const formValue = this.horarioForm.value;

    if (this.editMode() && this.editingHorarioId()) {
      // Update existing horario
      const updateDto: UpdateHorarioUbicacionDto = {
        diaSemana: formValue.diaSemana,
        horaInicio: formValue.horaInicio,
        horaFin: formValue.horaFin,
        duracionCitaMinutos: formValue.duracionCitaMinutos,
        activo: formValue.activo
      };

      this.ubicacionesService
        .updateHorario(this.ubicacion.id, this.editingHorarioId()!, updateDto)
        .subscribe({
          next: () => {
            this.saving.set(false);
            this.loadHorarios();
            this.cancelEdit();
            this.saved.emit();
          },
          error: (err) => {
            this.saving.set(false);
            this.handleError(err);
          }
        });
    } else {
      // Create new horario
      const createDto: CreateHorarioUbicacionDto = {
        diaSemana: formValue.diaSemana,
        horaInicio: formValue.horaInicio,
        horaFin: formValue.horaFin,
        duracionCitaMinutos: formValue.duracionCitaMinutos,
        activo: formValue.activo
      };

      this.ubicacionesService.addHorario(this.ubicacion.id, createDto).subscribe({
        next: () => {
          this.saving.set(false);
          this.loadHorarios();
          this.horarioForm.reset({ activo: true, duracionCitaMinutos: 30 });
          this.saved.emit();
        },
        error: (err) => {
          this.saving.set(false);
          this.handleError(err);
        }
      });
    }
  }

  onSubmitRapida(): void {
    if (this.rapidaForm.invalid || !this.ubicacion) {
      this.rapidaForm.markAllAsTouched();
      return;
    }

    this.savingRapida.set(true);
    this.errorMessageRapida.set(null);
    this.successMessageRapida.set(null);

    const formValue = this.rapidaForm.value;
    const dias: DiaSemana[] = formValue.dias;

    // Create array of observables for parallel creation
    const createRequests = dias.map(dia => {
      const createDto: CreateHorarioUbicacionDto = {
        diaSemana: dia,
        horaInicio: formValue.horaInicio,
        horaFin: formValue.horaFin,
        duracionCitaMinutos: formValue.duracionCitaMinutos,
        activo: true
      };
      return this.ubicacionesService.addHorario(this.ubicacion!.id, createDto);
    });

    // Execute all requests in parallel
    forkJoin(createRequests).subscribe({
      next: () => {
        this.savingRapida.set(false);
        this.loadHorarios();
        this.rapidaForm.reset({ duracionCitaMinutos: 30, dias: [] });
        this.successMessageRapida.set(`Horarios aplicados exitosamente a ${dias.length} día(s)`);
        this.saved.emit();

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessageRapida.set(null);
        }, 3000);
      },
      error: (err) => {
        this.savingRapida.set(false);
        this.handleErrorRapida(err);
      }
    });
  }

  editHorario(horario: HorarioUbicacion): void {
    this.activeTab.set('individual');
    this.editMode.set(true);
    this.editingHorarioId.set(horario.id);
    this.horarioForm.patchValue({
      diaSemana: horario.diaSemana,
      horaInicio: horario.horaInicio,
      horaFin: horario.horaFin,
      duracionCitaMinutos: horario.duracionCitaMinutos,
      activo: horario.activo
    });

    // Scroll to form
    setTimeout(() => {
      const formElement = document.querySelector('form');
      formElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }

  cancelEdit(): void {
    this.editMode.set(false);
    this.editingHorarioId.set(null);
    this.horarioForm.reset({ activo: true, duracionCitaMinutos: 30 });
    this.errorMessage.set(null);
  }

  deleteHorario(horario: HorarioUbicacion): void {
    if (!this.ubicacion) return;

    const confirmMessage = `¿Está seguro de eliminar el horario de ${this.getDiaSemanaLabel(horario.diaSemana)} (${horario.horaInicio} - ${horario.horaFin})?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    this.ubicacionesService.deleteHorario(this.ubicacion.id, horario.id).subscribe({
      next: () => {
        this.loadHorarios();
        this.saved.emit();

        // If we were editing this horario, cancel the edit
        if (this.editingHorarioId() === horario.id) {
          this.cancelEdit();
        }
      },
      error: (err) => {
        console.error('Error deleting horario:', err);
        alert('Error al eliminar el horario');
      }
    });
  }

  getDiaSemanaLabel(dia: DiaSemana): string {
    return DIAS_SEMANA_LABELS[dia];
  }

  private handleError(err: any): void {
    console.error('Error saving horario:', err);

    // Check for conflict error from backend
    if (err.error?.message) {
      this.errorMessage.set(err.error.message);
    } else if (err.error?.error) {
      this.errorMessage.set(err.error.error);
    } else {
      this.errorMessage.set('Error al guardar el horario. Verifique que no haya conflictos con otros horarios.');
    }
  }

  private handleErrorRapida(err: any): void {
    console.error('Error saving horarios rapida:', err);

    // Check for conflict error from backend
    if (err.error?.message) {
      this.errorMessageRapida.set(err.error.message);
    } else if (err.error?.error) {
      this.errorMessageRapida.set(err.error.error);
    } else {
      this.errorMessageRapida.set('Error al aplicar horarios. Algunos días pueden tener conflictos.');
    }
  }

  close(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}
