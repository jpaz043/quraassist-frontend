import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Ubicacion,
  CreateUbicacionDto,
  UpdateUbicacionDto,
  HorarioUbicacion,
  CreateHorarioUbicacionDto,
  UpdateHorarioUbicacionDto,
  SlotDisponible,
  UbicacionConHorarios
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class UbicacionesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/ubicaciones`;

  // ====== Gestión de Ubicaciones ======

  /**
   * Obtener todas las ubicaciones del médico
   */
  getUbicaciones(): Observable<Ubicacion[]> {
    return this.http.get<Ubicacion[]>(this.apiUrl);
  }

  /**
   * Obtener una ubicación específica
   */
  getUbicacion(id: string): Observable<Ubicacion> {
    return this.http.get<Ubicacion>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear nueva ubicación
   */
  createUbicacion(data: CreateUbicacionDto): Observable<Ubicacion> {
    return this.http.post<Ubicacion>(this.apiUrl, data);
  }

  /**
   * Actualizar ubicación existente
   */
  updateUbicacion(id: string, data: UpdateUbicacionDto): Observable<Ubicacion> {
    return this.http.put<Ubicacion>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Eliminar ubicación (soft delete)
   */
  deleteUbicacion(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Activar ubicación
   */
  activarUbicacion(id: string): Observable<Ubicacion> {
    return this.http.put<Ubicacion>(`${this.apiUrl}/${id}/activar`, {});
  }

  /**
   * Desactivar ubicación
   */
  desactivarUbicacion(id: string): Observable<Ubicacion> {
    return this.http.put<Ubicacion>(`${this.apiUrl}/${id}/desactivar`, {});
  }

  // ====== Gestión de Horarios ======

  /**
   * Obtener horarios de una ubicación
   */
  getHorarios(ubicacionId: string): Observable<HorarioUbicacion[]> {
    return this.http.get<HorarioUbicacion[]>(`${this.apiUrl}/${ubicacionId}/horarios`);
  }

  /**
   * Agregar horario a una ubicación
   */
  addHorario(ubicacionId: string, data: CreateHorarioUbicacionDto): Observable<HorarioUbicacion> {
    return this.http.post<HorarioUbicacion>(`${this.apiUrl}/${ubicacionId}/horarios`, data);
  }

  /**
   * Actualizar horario de una ubicación
   */
  updateHorario(
    ubicacionId: string,
    horarioId: string,
    data: UpdateHorarioUbicacionDto
  ): Observable<HorarioUbicacion> {
    return this.http.put<HorarioUbicacion>(
      `${this.apiUrl}/${ubicacionId}/horarios/${horarioId}`,
      data
    );
  }

  /**
   * Eliminar horario de una ubicación
   */
  deleteHorario(ubicacionId: string, horarioId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${ubicacionId}/horarios/${horarioId}`);
  }

  /**
   * Obtener slots de disponibilidad para una ubicación en una fecha
   */
  getDisponibilidad(ubicacionId: string, fecha: string): Observable<SlotDisponible[]> {
    return this.http.get<SlotDisponible[]>(
      `${this.apiUrl}/${ubicacionId}/disponibilidad`,
      {
        params: { fecha }
      }
    );
  }

  // ====== Métodos Helper ======

  /**
   * Obtener solo ubicaciones activas
   */
  getUbicacionesActivas(): Observable<Ubicacion[]> {
    return new Observable(observer => {
      this.getUbicaciones().subscribe({
        next: (ubicaciones) => {
          const activas = ubicaciones.filter(u => u.activo);
          observer.next(activas);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  /**
   * Obtener resumen consolidado de horarios de todas las ubicaciones
   * Retorna solo ubicaciones activas con sus horarios agrupados
   * Útil para mostrar en formularios de citas
   */
  getResumenHorariosConsolidado(): Observable<UbicacionConHorarios[]> {
    return this.http.get<UbicacionConHorarios[]>(`${this.apiUrl}/horarios/consolidado`);
  }
}
