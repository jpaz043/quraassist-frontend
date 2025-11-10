import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { NgIf, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, DateSelectArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';
import { AgendaService, CitaLegacy as Cita } from '../agenda.service';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [NgIf, RouterLink, DatePipe, FullCalendarModule],
  template: `
    <div class="page-container">
      <!-- Header del Calendario -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Calendario Médico</h1>
          <p class="page-subtitle">Vista completa de su agenda médica</p>
        </div>
        <button routerLink="/agenda/citas/nueva" class="btn-primary">
          <span class="material-icons-outlined mr-2">add</span>
          Nueva Cita
        </button>
      </div>

      <!-- Loading Indicator -->
      <div *ngIf="isLoadingCitas" class="card-medical">
        <div class="flex items-center justify-center py-8">
          <div class="flex items-center space-x-3">
            <div class="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
            <span class="text-gray-600 font-medium">Cargando citas...</span>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="!isLoadingCitas && errorCitas" class="card-medical mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
              <span class="material-icons-outlined text-red-600">error_outline</span>
            </div>
            <div>
              <h3 class="text-gray-900 font-semibold">Error al cargar citas</h3>
              <p class="text-gray-600 text-sm">{{errorCitas}}</p>
            </div>
          </div>
          <button (click)="cargarCitas()" class="btn-secondary">
            <span class="material-icons-outlined mr-2">refresh</span>
            Reintentar
          </button>
        </div>
      </div>

      <!-- FullCalendar -->
      <div class="card-medical">
        <full-calendar [options]="calendarOptions"></full-calendar>
      </div>

      <!-- Leyenda -->
      <div class="card-medical mt-6">
        <h3 class="text-sm font-medium text-gray-900 mb-4">Leyenda de Estados</h3>
        <div class="flex flex-wrap gap-4">
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-warning-600 rounded"></div>
            <span class="text-sm text-gray-700">Pendiente</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-success-600 rounded"></div>
            <span class="text-sm text-gray-700">Confirmada</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-purple-600 rounded"></div>
            <span class="text-sm text-gray-700">Completada (Atendida)</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-error-600 rounded"></div>
            <span class="text-sm text-gray-700">Cancelada</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-4 h-4 bg-gray-600 rounded"></div>
            <span class="text-sm text-gray-700">No Asistió</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep {
      /* Estilos generales del calendario */
      .fc {
        font-family: inherit;
      }

      /* Header del calendario */
      .fc-toolbar {
        padding: 1rem;
        background: white;
        border-radius: 0.75rem;
        margin-bottom: 1rem !important;
      }

      .fc-toolbar-title {
        font-size: 1.5rem !important;
        font-weight: 600;
        color: #111827;
      }

      .fc-button {
        background-color: #26A8DB !important;
        border-color: #26A8DB !important;
        color: white !important;
        text-transform: capitalize;
        padding: 0.5rem 1rem !important;
        border-radius: 0.5rem !important;
        font-weight: 500;
      }

      .fc-button:hover {
        background-color: #1f8db5 !important;
        border-color: #1f8db5 !important;
      }

      .fc-button:disabled {
        background-color: #d1d5db !important;
        border-color: #d1d5db !important;
        opacity: 0.6;
      }

      .fc-button-active {
        background-color: #1f8db5 !important;
        border-color: #1f8db5 !important;
      }

      /* Grid del calendario */
      .fc-theme-standard td,
      .fc-theme-standard th {
        border-color: #e5e7eb;
      }

      .fc-theme-standard .fc-scrollgrid {
        border-color: #e5e7eb;
      }

      /* Header de días */
      .fc-col-header-cell {
        background-color: #f9fafb;
        padding: 0.75rem 0.5rem;
        font-weight: 600;
        color: #6b7280;
        text-transform: uppercase;
        font-size: 0.75rem;
      }

      /* Días del mes */
      .fc-daygrid-day-number {
        color: #111827;
        padding: 0.5rem;
        font-weight: 500;
      }

      .fc-day-today {
        background-color: rgba(38, 168, 219, 0.1) !important;
      }

      .fc-day-today .fc-daygrid-day-number {
        background-color: #26A8DB;
        color: white;
        border-radius: 50%;
        width: 2rem;
        height: 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* Días de otros meses */
      .fc-day-other .fc-daygrid-day-number {
        color: #9ca3af;
      }

      /* Eventos */
      .fc-event {
        border: none !important;
        border-left: 4px solid currentColor !important;
        padding: 0.25rem 0.5rem;
        margin: 2px 4px;
        border-radius: 0.375rem;
        cursor: pointer;
        font-size: 0.875rem;
        transition: all 0.2s;
      }

      .fc-event:hover {
        opacity: 0.9;
        transform: translateY(-1px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }

      .fc-event-time {
        font-weight: 600;
      }

      .fc-event-title {
        font-weight: 400;
      }

      /* Vista de lista */
      .fc-list-event:hover td {
        background-color: #f9fafb;
      }

      /* Vista de tiempo */
      .fc-timegrid-slot {
        height: 3rem;
      }

      .fc-timegrid-slot-label {
        color: #6b7280;
        font-size: 0.75rem;
      }

      .fc-timegrid-event {
        border-radius: 0.375rem;
        border-left-width: 4px !important;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .fc-toolbar {
          flex-direction: column;
          gap: 1rem;
        }

        .fc-toolbar-chunk {
          display: flex;
          justify-content: center;
        }
      }
    }
  `]
})
export class CalendarioComponent implements OnInit {
  private agendaService = inject(AgendaService);
  private router = inject(Router);

  isLoadingCitas = false;
  errorCitas: string | null = null;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    initialView: 'dayGridMonth',
    locale: esLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día',
      list: 'Lista'
    },
    height: 'auto',
    contentHeight: 650,
    slotMinTime: '07:00:00',
    slotMaxTime: '19:00:00',
    slotDuration: '00:30:00',
    allDaySlot: false,
    expandRows: true,
    nowIndicator: true,
    navLinks: true,
    editable: false, // Deshabilitado por ahora, se puede habilitar con drag&drop
    selectable: true,
    selectMirror: true,
    weekends: true,
    dayMaxEvents: true, // Auto: ajusta según el espacio disponible
    eventClick: this.handleEventClick.bind(this),
    select: this.handleDateSelect.bind(this),
    datesSet: this.handleDatesSet.bind(this),
    events: []
  };

  ngOnInit(): void {
    this.cargarCitas();
  }

  handleEventClick(clickInfo: EventClickArg): void {
    const citaId = clickInfo.event.id;

    if (!citaId) return;

    // NUEVO FLUJO: Siempre navegar a vista de detalles primero
    // El médico decide qué hacer desde ahí (atender, editar, cancelar, etc.)
    this.router.navigate(['/agenda/citas', citaId]);
  }

  handleDateSelect(selectInfo: DateSelectArg): void {
    // Navegar a nueva cita con la fecha pre-seleccionada
    const fecha = selectInfo.startStr.split('T')[0];
    this.router.navigate(['/agenda/citas/nueva'], {
      queryParams: { fecha }
    });
  }

  handleDatesSet(dateInfo: any): void {
    // Este evento se dispara cuando cambia el rango de fechas visible
    // Obtener el mes central del rango visible
    const mesInicio: Date = dateInfo.start;
    const year = mesInicio.getFullYear();
    const month = mesInicio.getMonth() + 1; // getMonth() devuelve 0-11, backend espera 1-12

    this.cargarCitasDelMes(year, month);
  }

  cargarCitas(): void {
    // Método de respaldo para carga inicial
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = hoy.getMonth() + 1; // getMonth() devuelve 0-11, backend espera 1-12
    this.cargarCitasDelMes(year, month);
  }

  private cargarCitasDelMes(year: number, month: number): void {
    this.isLoadingCitas = true;
    this.errorCitas = null;

    // Usar el endpoint optimizado del mes - UNA SOLA petición HTTP
    this.agendaService.getCitasMes(year, month).subscribe({
      next: (citas) => {
        const events: EventInput[] = citas.map(cita => this.convertirCitaAEvento(cita));
        this.calendarOptions = {
          ...this.calendarOptions,
          events
        };
        this.isLoadingCitas = false;
      },
      error: (error) => {
        console.error('Error cargando citas del mes:', error);
        this.errorCitas = error.message || 'Error al cargar las citas';
        this.isLoadingCitas = false;
      }
    });
  }

  private convertirCitaAEvento(cita: Cita): EventInput {
    // Combinar fecha y hora para crear el timestamp completo
    const [hours, minutes] = cita.hora.split(':').map(Number);
    const [year, month, day] = cita.fecha.split('-').map(Number);

    // Crear fecha en zona horaria local
    const start = new Date(year, month - 1, day, hours, minutes);

    // Calcular fecha de fin basada en duración
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + cita.duracion);

    // Determinar color según estado
    let backgroundColor: string;
    let borderColor: string;

    switch (cita.estado) {
      case 'confirmada':
        backgroundColor = '#10B981'; // success-600 - Verde (confirmada)
        borderColor = '#059669'; // success-700
        break;
      case 'pendiente':
        backgroundColor = '#F59E0B'; // warning-600 - Amarillo (pendiente)
        borderColor = '#D97706'; // warning-700
        break;
      case 'completada':
        backgroundColor = '#8B5CF6'; // purple-600 - Morado (atendida/completada)
        borderColor = '#7C3AED'; // purple-700
        break;
      case 'cancelada':
        backgroundColor = '#EF4444'; // error-600 - Rojo (cancelada)
        borderColor = '#DC2626'; // error-700
        break;
      case 'no_asistio':
        backgroundColor = '#6B7280'; // gray-600 - Gris (no asistió)
        borderColor = '#4B5563'; // gray-700
        break;
      default:
        backgroundColor = '#6B7280'; // gray-600
        borderColor = '#4B5563'; // gray-700
    }

    // Construir título con ubicación si está disponible
    let title = `${cita.paciente.nombre} - ${cita.motivo}`;
    if (cita.ubicacion) {
      title += ` 📍 ${cita.ubicacion.nombre}`;
    }

    return {
      id: cita.id,
      title,
      start: start.toISOString(),
      end: end.toISOString(),
      backgroundColor,
      borderColor,
      extendedProps: {
        paciente: cita.paciente,
        estado: cita.estado,
        motivo: cita.motivo,
        notas: cita.notas,
        recordatorioEnviado: cita.recordatorioEnviado,
        ubicacion: cita.ubicacion
      }
    };
  }
}
