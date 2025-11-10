import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AgendaService } from '../agenda.service';
import { Cita, EstadoCita, QuienCancelo } from '../../../core/models';

@Component({
  selector: 'app-cita-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cita-detalle.component.html',
  styleUrl: './cita-detalle.component.scss'
})
export class CitaDetalleComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly agendaService = inject(AgendaService);

  cita = signal<Cita | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  // Estados para modales de confirmación
  showCancelarModal = signal(false);
  showConfirmarModal = signal(false);
  processingAction = signal(false);

  EstadoCita = EstadoCita;

  ngOnInit(): void {
    const citaId = this.route.snapshot.paramMap.get('id');
    if (citaId) {
      this.cargarCita(citaId);
    } else {
      this.router.navigate(['/agenda']);
    }
  }

  cargarCita(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.agendaService.getCita(id).subscribe({
      next: (cita) => {
        this.cita.set(cita);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar cita:', err);
        this.error.set('No se pudo cargar la cita');
        this.loading.set(false);
      }
    });
  }

  // Navegar a atender paciente (crear consulta)
  atenderCita(): void {
    const cita = this.cita();
    if (!cita) return;

    // Navegar al formulario de consulta con datos pre-cargados
    this.router.navigate(['/consultas/nueva'], {
      queryParams: {
        citaId: cita.id,
        pacienteId: cita.paciente.id
      }
    });
  }

  // Verificar si la cita tiene consulta asociada
  tieneConsulta(): boolean {
    const cita = this.cita();
    return !!(cita && (cita as any).consulta);
  }

  // Obtener la consulta asociada
  getConsulta(): any {
    const cita = this.cita();
    return cita ? (cita as any).consulta : null;
  }

  // Ver detalle completo de la consulta
  verConsulta(): void {
    const consulta = this.getConsulta();
    if (!consulta) return;

    this.router.navigate(['/consultas', consulta.id]);
  }

  // Navegar a editar cita
  editarCita(): void {
    const cita = this.cita();
    if (!cita) return;

    this.router.navigate(['/agenda/citas/editar', cita.id]);
  }

  // Confirmar cita
  confirmarCita(): void {
    const cita = this.cita();
    if (!cita) return;

    this.processingAction.set(true);
    this.agendaService.confirmarCita(cita.id).subscribe({
      next: (citaActualizada) => {
        this.cita.set(citaActualizada);
        this.processingAction.set(false);
        this.showConfirmarModal.set(false);
      },
      error: (err) => {
        console.error('Error al confirmar cita:', err);
        alert('Error al confirmar la cita');
        this.processingAction.set(false);
      }
    });
  }

  // Cancelar cita
  cancelarCita(motivo?: string): void {
    const cita = this.cita();
    if (!cita) return;

    this.processingAction.set(true);
    this.agendaService.cancelarCita(cita.id, {
      motivo: motivo || 'Cancelada por el médico',
      canceladoPor: QuienCancelo.MEDICO,
      observaciones: motivo
    }).subscribe({
      next: (citaActualizada) => {
        this.cita.set(citaActualizada);
        this.processingAction.set(false);
        this.showCancelarModal.set(false);
      },
      error: (err) => {
        console.error('Error al cancelar cita:', err);
        alert('Error al cancelar la cita');
        this.processingAction.set(false);
      }
    });
  }

  // Enviar recordatorio por WhatsApp
  enviarRecordatorio(): void {
    const cita = this.cita();
    if (!cita) return;

    if (confirm('¿Enviar recordatorio por WhatsApp al paciente?')) {
      this.processingAction.set(true);
      this.agendaService.enviarRecordatorio(cita.id).subscribe({
        next: (response) => {
          alert(response.message || 'Recordatorio enviado correctamente');
          this.cargarCita(cita.id); // Recargar para actualizar estado
          this.processingAction.set(false);
        },
        error: (err) => {
          console.error('Error al enviar recordatorio:', err);
          alert('Error al enviar el recordatorio');
          this.processingAction.set(false);
        }
      });
    }
  }

  // Ver historial del paciente (navegar a su perfil)
  verHistorial(): void {
    const cita = this.cita();
    if (!cita) return;

    this.router.navigate(['/pacientes/perfil', cita.paciente.id]);
  }

  // Volver a la agenda
  volver(): void {
    this.router.navigate(['/agenda']);
  }

  // Helpers para el template
  getEstadoColor(estado: EstadoCita): string {
    switch (estado) {
      case EstadoCita.CONFIRMADA:
        return 'text-green-600 bg-green-50';
      case EstadoCita.PENDIENTE:
        return 'text-yellow-600 bg-yellow-50';
      case EstadoCita.COMPLETADA:
        return 'text-blue-600 bg-blue-50';
      case EstadoCita.CANCELADA:
        return 'text-red-600 bg-red-50';
      case EstadoCita.NO_ASISTIO:
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  }

  getEstadoTexto(estado: EstadoCita): string {
    switch (estado) {
      case EstadoCita.CONFIRMADA:
        return 'Confirmada';
      case EstadoCita.PENDIENTE:
        return 'Pendiente';
      case EstadoCita.COMPLETADA:
        return 'Completada';
      case EstadoCita.CANCELADA:
        return 'Cancelada';
      case EstadoCita.NO_ASISTIO:
        return 'No Asistió';
      default:
        return estado;
    }
  }

  getEstadoIcon(estado: EstadoCita): string {
    switch (estado) {
      case EstadoCita.CONFIRMADA:
        return 'check_circle';
      case EstadoCita.PENDIENTE:
        return 'schedule';
      case EstadoCita.COMPLETADA:
        return 'task_alt';
      case EstadoCita.CANCELADA:
        return 'cancel';
      case EstadoCita.NO_ASISTIO:
        return 'event_busy';
      default:
        return 'help_outline';
    }
  }

  formatFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-HN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatHora(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-HN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Verificar si se pueden realizar acciones según el estado
  puedeAtender(): boolean {
    const cita = this.cita();
    if (!cita) return false;

    // No se puede atender si ya tiene consulta asociada
    if (this.tieneConsulta()) return false;

    // Normalizar estado a minúsculas para comparación
    const estado = cita.estado.toLowerCase();

    // Solo se puede atender si está PENDIENTE o CONFIRMADA (no atendida aún)
    return estado === 'pendiente' || estado === 'confirmada';
  }

  puedeEditar(): boolean {
    const cita = this.cita();
    if (!cita) return false;

    // Normalizar estado a minúsculas para comparación
    const estado = cita.estado.toLowerCase();

    // Solo se puede editar si NO está COMPLETADA ni CANCELADA
    return estado !== 'completada' && estado !== 'cancelada';
  }

  puedeCancelar(): boolean {
    const cita = this.cita();
    if (!cita) return false;

    // Normalizar estado a minúsculas para comparación
    const estado = cita.estado.toLowerCase();

    // Solo se puede cancelar si NO está COMPLETADA ni ya CANCELADA
    return estado !== 'completada' && estado !== 'cancelada';
  }

  puedeConfirmar(): boolean {
    const cita = this.cita();
    if (!cita) return false;

    // Normalizar estado a minúsculas para comparación
    const estado = cita.estado.toLowerCase();

    // Solo se puede confirmar si está PENDIENTE
    return estado === 'pendiente';
  }

  puedeEnviarRecordatorio(): boolean {
    const cita = this.cita();
    if (!cita) return false;

    // Normalizar estado a minúsculas para comparación
    const estado = cita.estado.toLowerCase();

    // Se puede enviar recordatorio si está PENDIENTE o CONFIRMADA
    return estado === 'pendiente' || estado === 'confirmada';
  }
}
