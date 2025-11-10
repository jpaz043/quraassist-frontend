import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UbicacionesService } from '../../../core/services/ubicaciones.service';
import { Ubicacion } from '../../../core/models';
import { UbicacionFormModalComponent } from './ubicacion-form-modal.component';
import { HorariosUbicacionModalComponent } from './horarios-ubicacion-modal.component';

@Component({
  selector: 'app-ubicaciones',
  standalone: true,
  imports: [CommonModule, UbicacionFormModalComponent, HorariosUbicacionModalComponent],
  templateUrl: './ubicaciones.component.html',
  styleUrl: './ubicaciones.component.css'
})
export class UbicacionesComponent implements OnInit {
  private readonly ubicacionesService = inject(UbicacionesService);

  // Signals para manejo de estado
  ubicaciones = signal<Ubicacion[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  showForm = signal<boolean>(false);
  selectedUbicacion = signal<Ubicacion | null>(null);
  showHorariosModal = signal<boolean>(false);
  selectedUbicacionForHorarios = signal<Ubicacion | null>(null);

  ngOnInit(): void {
    this.loadUbicaciones();
  }

  /**
   * Cargar ubicaciones del médico
   */
  loadUbicaciones(): void {
    this.loading.set(true);
    this.error.set(null);

    this.ubicacionesService.getUbicaciones().subscribe({
      next: (ubicaciones) => {
        this.ubicaciones.set(ubicaciones);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar ubicaciones');
        this.loading.set(false);
        console.error('Error cargando ubicaciones:', err);
      }
    });
  }

  /**
   * Abrir formulario para nueva ubicación
   */
  openNewForm(): void {
    this.selectedUbicacion.set(null);
    this.showForm.set(true);
  }

  /**
   * Abrir formulario para editar ubicación
   */
  openEditForm(ubicacion: Ubicacion): void {
    this.selectedUbicacion.set(ubicacion);
    this.showForm.set(true);
  }

  /**
   * Cerrar formulario
   */
  closeForm(): void {
    this.showForm.set(false);
    this.selectedUbicacion.set(null);
  }

  /**
   * Callback cuando se guarda una ubicación
   */
  onUbicacionSaved(): void {
    this.closeForm();
    this.loadUbicaciones();
  }

  /**
   * Activar/Desactivar ubicación
   */
  toggleActivo(ubicacion: Ubicacion): void {
    const service = ubicacion.activo
      ? this.ubicacionesService.desactivarUbicacion(ubicacion.id)
      : this.ubicacionesService.activarUbicacion(ubicacion.id);

    service.subscribe({
      next: () => {
        this.loadUbicaciones();
      },
      error: (err) => {
        console.error('Error al cambiar estado:', err);
        alert('Error al cambiar el estado de la ubicación');
      }
    });
  }

  /**
   * Eliminar ubicación
   */
  deleteUbicacion(ubicacion: Ubicacion): void {
    if (!confirm(`¿Está seguro de eliminar la ubicación "${ubicacion.nombre}"?`)) {
      return;
    }

    this.ubicacionesService.deleteUbicacion(ubicacion.id).subscribe({
      next: () => {
        this.loadUbicaciones();
      },
      error: (err) => {
        console.error('Error al eliminar ubicación:', err);
        alert('Error al eliminar la ubicación');
      }
    });
  }

  /**
   * Abrir modal de gestión de horarios
   */
  openHorariosModal(ubicacion: Ubicacion): void {
    this.selectedUbicacionForHorarios.set(ubicacion);
    this.showHorariosModal.set(true);
  }

  /**
   * Cerrar modal de horarios
   */
  closeHorariosModal(): void {
    this.showHorariosModal.set(false);
    this.selectedUbicacionForHorarios.set(null);
  }

  /**
   * Callback cuando se guardan horarios
   */
  onHorariosSaved(): void {
    this.loadUbicaciones(); // Recargar para actualizar el contador de horarios
  }
}
