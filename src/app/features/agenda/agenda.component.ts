import { Component, OnInit, inject } from '@angular/core';
import { NgClass, NgIf, NgFor, DatePipe, TitleCasePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AgendaService, CitaLegacy as Cita } from './agenda.service';
import { EstadoCita, QuienCancelo, CancelarCitaDto } from '../../core/models';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [NgClass, NgIf, NgFor, RouterLink, DatePipe, TitleCasePipe, ReactiveFormsModule],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">
            Agenda
          </h1>
          <p class="page-subtitle">
            Gestione sus citas y horarios
          </p>
        </div>
        <div class="flex space-x-3">
          <button routerLink="calendario" class="btn-secondary">
            <span class="material-icons-outlined mr-2">calendar_view_month</span>
            Vista Calendario
          </button>
          <button routerLink="citas/nueva" class="btn-primary">
            <span class="material-icons-outlined mr-2">add</span>
            Nueva Cita
          </button>
        </div>
      </div>

      <!-- Selector de fecha -->
      <div class="card-medical">
        <div class="flex items-center space-x-4">
          <button
            (click)="cambiarFecha(-1)"
            class="p-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <span class="material-icons-outlined">chevron_left</span>
          </button>

          <input
            type="date"
            [formControl]="fechaControl"
            class="input-medical"
          >

          <button
            (click)="cambiarFecha(1)"
            class="p-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <span class="material-icons-outlined">chevron_right</span>
          </button>

          <button
            (click)="irAHoy()"
            class="btn-secondary"
          >
            Hoy
          </button>
        </div>
      </div>

      <!-- Lista de Citas -->
      <div class="card-medical">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">
          Citas del día {{fechaControl.value | date:'longDate'}}
        </h2>

        <!-- Loading state -->
        <div *ngIf="isLoading" class="space-y-4">
          <div class="animate-pulse" *ngFor="let i of [1,2,3]">
            <div class="h-20 bg-gray-200 rounded-xl"></div>
          </div>
        </div>

        <!-- Empty state -->
        <div *ngIf="!isLoading && (!citas || citas.length === 0)" class="text-center py-12">
          <div class="p-3 bg-primary-50 rounded-full inline-block mb-4">
            <span class="material-icons-outlined text-3xl text-primary-600">event_busy</span>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            No hay citas programadas
          </h3>
          <p class="text-gray-600 mb-4">
            Este día no tiene citas agendadas.
          </p>
          <button routerLink="citas/nueva" class="btn-primary">
            Agendar Nueva Cita
          </button>
        </div>

        <!-- Citas list -->
        <div *ngIf="!isLoading && citas && citas.length > 0" class="space-y-4">
          <div *ngFor="let cita of citas" 
               class="appointment-card">
            <!-- Hora y estado -->
            <div class="w-24 text-center">
              <p class="text-lg font-semibold text-gray-900">{{cita.hora}}</p>
              <span [class]="'badge-' + cita.estado">
                {{cita.estado | titlecase}}
              </span>
            </div>

            <!-- Paciente info -->
            <div class="flex-1 ml-6">
              <p class="font-medium text-gray-900">{{cita.paciente.nombre}}</p>
              <p class="text-sm text-gray-600">{{cita.motivo}}</p>
              <div class="flex items-center gap-3 mt-1">
                <p class="text-sm text-gray-500">{{cita.paciente.telefono}}</p>
                <p *ngIf="cita.ubicacion" class="text-sm text-blue-600 flex items-center gap-1">
                  <span class="material-icons-outlined text-sm">location_on</span>
                  {{cita.ubicacion.nombre}}
                </p>
              </div>
            </div>

            <!-- Acciones -->
            <div class="flex items-center space-x-2">
              <!-- Ver Detalles (siempre visible) -->
              <button
                [routerLink]="['/agenda/citas', cita.id]"
                class="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium flex items-center space-x-1"
                title="Ver detalles de la cita"
              >
                <span class="material-icons-outlined text-lg">visibility</span>
                <span>Ver Detalles</span>
              </button>

              <!-- Atender Ahora (solo si está pendiente o confirmada) -->
              <button
                *ngIf="cita.estado === 'confirmada' || cita.estado === 'pendiente'"
                (click)="iniciarConsulta(cita)"
                class="px-3 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-sm hover:shadow-md text-sm font-medium flex items-center space-x-1"
                title="Atender paciente ahora"
              >
                <span class="material-icons-outlined text-lg">medical_services</span>
                <span>Atender Ahora</span>
              </button>

              <!-- Confirmar (solo si está pendiente) -->
              <button
                *ngIf="cita.estado === 'pendiente'"
                (click)="confirmarCita(cita.id)"
                class="p-2 text-gray-500 hover:text-emerald-600 transition-colors"
                title="Confirmar cita"
              >
                <span class="material-icons-outlined">check_circle</span>
              </button>

              <!-- Cancelar (solo si NO está completada ni cancelada) -->
              <button
                *ngIf="cita.estado !== 'completada' && cita.estado !== 'cancelada'"
                (click)="cancelarCita(cita.id)"
                class="p-2 text-gray-500 hover:text-red-600 transition-colors"
                title="Cancelar cita"
              >
                <span class="material-icons-outlined">cancel</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AgendaComponent implements OnInit {
  private agendaService = inject(AgendaService);
  private router = inject(Router);

  isLoading = true;
  citas: Cita[] | null = null;
  fechaControl = new FormControl(new Date().toISOString().split('T')[0]);

  ngOnInit(): void {
    // Cargar citas cuando cambie la fecha
    this.fechaControl.valueChanges.subscribe(fecha => {
      if (fecha) {
        this.cargarCitas(fecha);
      }
    });

    // Cargar citas iniciales
    this.cargarCitas(this.fechaControl.value!);
  }

  cargarCitas(fecha: string): void {
    this.isLoading = true;
    this.agendaService.getCitas(fecha).subscribe({
      next: (citas) => {
        this.citas = citas;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.citas = null;
      }
    });
  }

  cambiarFecha(dias: number): void {
    const fecha = new Date(this.fechaControl.value!);
    fecha.setDate(fecha.getDate() + dias);
    this.fechaControl.setValue(fecha.toISOString().split('T')[0]);
  }

  irAHoy(): void {
    this.fechaControl.setValue(new Date().toISOString().split('T')[0]);
  }

  enviarRecordatorio(id: string): void {
    this.agendaService.enviarRecordatorio(id).subscribe({
      next: () => this.cargarCitas(this.fechaControl.value!)
    });
  }

  confirmarCita(id: string): void {
    this.agendaService.actualizarCita(id, { estado: EstadoCita.CONFIRMADA }).subscribe({
      next: () => this.cargarCitas(this.fechaControl.value!)
    });
  }

  cancelarCita(id: string): void {
    const motivo = prompt('¿Por qué se cancela la cita? (Opcional)');

    if (confirm('¿Está seguro de que desea cancelar esta cita?')) {
      const dto: CancelarCitaDto = {
        motivo: motivo || undefined,
        canceladoPor: QuienCancelo.MEDICO, // El médico está cancelando desde su interfaz
        observaciones: `Cancelada por el médico desde la agenda web el ${new Date().toLocaleDateString('es-HN')}`
      };

      this.agendaService.cancelarCita(id, dto).subscribe({
        next: () => {
          this.cargarCitas(this.fechaControl.value!);
        },
        error: (error) => {
          alert(error.message || 'Error al cancelar la cita. Intente nuevamente.');
        }
      });
    }
  }

  iniciarConsulta(cita: Cita): void {
    // Navegar al formulario de consulta con el pacienteId y citaId pre-cargados
    this.router.navigate(['/consultas/nueva'], {
      queryParams: {
        pacienteId: cita.paciente.id,
        citaId: cita.id
      }
    });
  }
} 