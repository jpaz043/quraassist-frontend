import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HorariosService } from '../../core/services/horarios.service';
import {
  BloqueoHorario,
  TipoBloqueo,
  TIPO_BLOQUEO_LABELS,
  TIPO_BLOQUEO_ICONS,
  CreateBloqueoDto,
  UpdateBloqueoDto
} from '../../core/models/horario.model';

@Component({
  selector: 'app-bloqueos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-4 md:p-8">
      <div class="max-w-5xl mx-auto">
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">📅 Bloqueos de Horario</h1>
              <p class="text-gray-600 mt-1">Gestiona almuerzos, vacaciones y tiempo no disponible</p>
            </div>
            <button
              (click)="mostrarFormulario = !mostrarFormulario"
              class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              ➕ Nuevo Bloqueo
            </button>
          </div>
        </div>

        @if (mostrarFormulario) {
          <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 class="text-lg font-semibold mb-4">{{ bloqueoEnEdicion() ? 'Editar Bloqueo' : 'Nuevo Bloqueo' }}</h2>
            <form [formGroup]="formBloqueo" (ngSubmit)="guardarBloqueo()" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Bloqueo</label>
                  <select formControlName="tipo" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    @for (tipo of tiposBloqueo; track tipo) {
                      <option [value]="tipo">{{ getTipoIcon(tipo) }} {{ getTipoLabel(tipo) }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                  <input type="text" formControlName="motivo" placeholder="Ej: Almuerzo, Reunión con equipo..." class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Fecha y Hora Inicio</label>
                  <input type="datetime-local" formControlName="fechaHoraInicio" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Fecha y Hora Fin</label>
                  <input type="datetime-local" formControlName="fechaHoraFin" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div class="flex items-center space-x-4">
                  <label class="flex items-center space-x-2">
                    <input type="checkbox" formControlName="recurrente" class="w-4 h-4 text-blue-600 rounded" />
                    <span class="text-sm font-medium">Recurrente (semanal)</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input type="checkbox" formControlName="activo" class="w-4 h-4 text-blue-600 rounded" />
                    <span class="text-sm font-medium">Activo</span>
                  </label>
                </div>
              </div>
              <div class="flex gap-3">
                <button type="submit" [disabled]="formBloqueo.invalid || cargando()" class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium">
                  {{ cargando() ? 'Guardando...' : '✓ Guardar' }}
                </button>
                <button type="button" (click)="cancelar()" class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium">Cancelar</button>
              </div>
            </form>
          </div>
        }

        <div class="space-y-4">
          @if (bloqueos().length === 0) {
            <div class="bg-white rounded-lg shadow-sm p-12 text-center">
              <p class="text-gray-500 text-lg">No tienes bloqueos configurados</p>
              <p class="text-gray-400 mt-2">Crea un bloqueo para indicar tiempo no disponible</p>
            </div>
          } @else {
            @for (bloqueo of bloqueos(); track bloqueo.id) {
              <div class="bg-white rounded-lg shadow-sm p-6">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-2xl">{{ getTipoIcon(bloqueo.tipo) }}</span>
                      <h3 class="text-lg font-semibold">{{ getTipoLabel(bloqueo.tipo) }}</h3>
                      @if (!bloqueo.activo) {
                        <span class="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm">Inactivo</span>
                      }
                      @if (bloqueo.recurrente) {
                        <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">🔁 Recurrente</span>
                      }
                    </div>
                    @if (bloqueo.motivo) {
                      <p class="text-gray-600 mb-2">{{ bloqueo.motivo }}</p>
                    }
                    <div class="text-sm text-gray-500">
                      <p>📅 {{ formatearFecha(bloqueo.fechaHoraInicio) }}</p>
                      <p>🕐 {{ formatearHora(bloqueo.fechaHoraInicio) }} - {{ formatearHora(bloqueo.fechaHoraFin) }}</p>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button (click)="editarBloqueo(bloqueo)" class="text-blue-600 hover:text-blue-700 px-3 py-1 rounded hover:bg-blue-50">✏️</button>
                    <button (click)="eliminarBloqueo(bloqueo.id)" class="text-red-600 hover:text-red-700 px-3 py-1 rounded hover:bg-red-50">🗑️</button>
                  </div>
                </div>
              </div>
            }
          }
        </div>
      </div>
    </div>
  `
})
export class BloqueosComponent implements OnInit {
  private readonly horariosService = inject(HorariosService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  bloqueos = signal<BloqueoHorario[]>([]);
  cargando = signal(false);
  bloqueoEnEdicion = signal<BloqueoHorario | null>(null);
  mostrarFormulario = false;

  formBloqueo!: FormGroup;

  tiposBloqueo = Object.values(TipoBloqueo);

  ngOnInit() {
    this.inicializarFormulario();
    this.cargarBloqueos();
  }

  inicializarFormulario() {
    const ahora = new Date();
    const enUnaHora = new Date(ahora.getTime() + 60 * 60 * 1000);

    this.formBloqueo = this.fb.group({
      tipo: [TipoBloqueo.ALMUERZO, Validators.required],
      fechaHoraInicio: [this.formatearParaInput(ahora), Validators.required],
      fechaHoraFin: [this.formatearParaInput(enUnaHora), Validators.required],
      motivo: [''],
      recurrente: [false],
      activo: [true]
    });
  }

  cargarBloqueos() {
    this.cargando.set(true);
    const inicio = new Date();
    const fin = new Date();
    fin.setMonth(fin.getMonth() + 3); // Próximos 3 meses

    this.horariosService.obtenerBloqueos(inicio, fin).subscribe({
      next: (bloqueos) => {
        this.bloqueos.set(bloqueos);
        this.cargando.set(false);
      },
      error: () => {
        alert('Error al cargar bloqueos');
        this.cargando.set(false);
      }
    });
  }

  guardarBloqueo() {
    if (this.formBloqueo.invalid) return;

    this.cargando.set(true);
    const valores = this.formBloqueo.value;

    if (this.bloqueoEnEdicion()) {
      const dto: UpdateBloqueoDto = valores;
      this.horariosService.actualizarBloqueo(this.bloqueoEnEdicion()!.id, dto).subscribe({
        next: () => {
          this.cargarBloqueos();
          this.cancelar();
        },
        error: () => {
          alert('Error al actualizar el bloqueo');
          this.cargando.set(false);
        }
      });
    } else {
      const dto: CreateBloqueoDto = valores;
      this.horariosService.crearBloqueo(dto).subscribe({
        next: () => {
          this.cargarBloqueos();
          this.cancelar();
        },
        error: () => {
          alert('Error al crear el bloqueo');
          this.cargando.set(false);
        }
      });
    }
  }

  editarBloqueo(bloqueo: BloqueoHorario) {
    this.bloqueoEnEdicion.set(bloqueo);
    this.mostrarFormulario = true;
    this.formBloqueo.patchValue({
      tipo: bloqueo.tipo,
      fechaHoraInicio: this.formatearParaInput(new Date(bloqueo.fechaHoraInicio)),
      fechaHoraFin: this.formatearParaInput(new Date(bloqueo.fechaHoraFin)),
      motivo: bloqueo.motivo || '',
      recurrente: bloqueo.recurrente,
      activo: bloqueo.activo
    });
  }

  eliminarBloqueo(id: string) {
    if (!confirm('¿Eliminar este bloqueo?')) return;

    this.cargando.set(true);
    this.horariosService.eliminarBloqueo(id).subscribe({
      next: () => this.cargarBloqueos(),
      error: () => {
        alert('Error al eliminar');
        this.cargando.set(false);
      }
    });
  }

  cancelar() {
    this.mostrarFormulario = false;
    this.bloqueoEnEdicion.set(null);
    this.inicializarFormulario();
  }

  getTipoLabel(tipo: TipoBloqueo): string {
    return TIPO_BLOQUEO_LABELS[tipo];
  }

  getTipoIcon(tipo: TipoBloqueo): string {
    return TIPO_BLOQUEO_ICONS[tipo];
  }

  formatearFecha(fecha: Date | string): string {
    const d = new Date(fecha);
    return d.toLocaleDateString('es-HN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  formatearHora(fecha: Date | string): string {
    const d = new Date(fecha);
    return d.toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit' });
  }

  formatearParaInput(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
