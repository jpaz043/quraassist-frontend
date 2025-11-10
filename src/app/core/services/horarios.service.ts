import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  HorarioMedico,
  BloqueoHorario,
  CreateHorarioDto,
  UpdateHorarioDto,
  InitializeHorariosDto,
  CreateBloqueoDto,
  UpdateBloqueoDto
} from '../models/horario.model';

@Injectable({
  providedIn: 'root'
})
export class HorariosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/horarios`;

  // ========== HORARIOS MÉDICOS ==========

  /**
   * Obtener todos los horarios del médico actual
   */
  obtenerHorarios(): Observable<HorarioMedico[]> {
    return this.http.get<HorarioMedico[]>(this.apiUrl);
  }

  /**
   * Crear un nuevo horario para un día específico
   */
  crearHorario(horario: CreateHorarioDto): Observable<HorarioMedico> {
    return this.http.post<HorarioMedico>(this.apiUrl, horario);
  }

  /**
   * Actualizar un horario existente
   */
  actualizarHorario(id: string, horario: UpdateHorarioDto): Observable<HorarioMedico> {
    return this.http.put<HorarioMedico>(`${this.apiUrl}/${id}`, horario);
  }

  /**
   * Eliminar un horario
   */
  eliminarHorario(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Inicializar horarios por defecto (Lunes a Viernes)
   */
  inicializarHorarios(config: InitializeHorariosDto): Observable<HorarioMedico[]> {
    return this.http.post<HorarioMedico[]>(`${this.apiUrl}/initialize`, config);
  }

  // ========== BLOQUEOS DE HORARIOS ==========

  /**
   * Obtener bloqueos del médico en un rango de fechas
   */
  obtenerBloqueos(fechaInicio: Date, fechaFin: Date): Observable<BloqueoHorario[]> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio.toISOString())
      .set('fechaFin', fechaFin.toISOString());

    return this.http.get<BloqueoHorario[]>(`${this.apiUrl}/bloqueos`, { params });
  }

  /**
   * Crear un nuevo bloqueo de horario
   */
  crearBloqueo(bloqueo: CreateBloqueoDto): Observable<BloqueoHorario> {
    return this.http.post<BloqueoHorario>(`${this.apiUrl}/bloqueos`, bloqueo);
  }

  /**
   * Actualizar un bloqueo existente
   */
  actualizarBloqueo(id: string, bloqueo: UpdateBloqueoDto): Observable<BloqueoHorario> {
    return this.http.put<BloqueoHorario>(`${this.apiUrl}/bloqueos/${id}`, bloqueo);
  }

  /**
   * Eliminar un bloqueo
   */
  eliminarBloqueo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/bloqueos/${id}`);
  }
}
