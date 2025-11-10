import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap, catchError, throwError, map } from 'rxjs';
import { Cita, PaginatedResponse, EstadoCita, CancelarCitaDto, QuienCancelo } from '../../core/models';
import { environment } from '../../../environments/environment';

// Interfaz de compatibilidad para los componentes existentes
export interface CitaLegacy {
  id: string;
  paciente: {
    id: string;
    nombre: string;
    telefono: string;
  };
  fecha: string;
  hora: string;
  duracion: number;
  motivo: string;
  tipoConsulta: 'primera_vez' | 'control' | 'emergencia' | 'procedimiento';
  estado: 'confirmada' | 'pendiente' | 'completada' | 'cancelada' | 'no_asistio';
  notas?: string;
  recordatorioEnviado: boolean;
  confirmadaPor?: 'medico' | 'paciente' | 'whatsapp';
  fechaCreacion: string;
  ultimaModificacion: string;
  ubicacion?: {
    id: string;
    nombre: string;
  };
}

// Función helper para convertir Cita a CitaLegacy
function convertirACitaLegacy(cita: Cita): CitaLegacy {
  // Convertir la fecha ISO string a Date y extraer fecha/hora en zona horaria local
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

  return {
    id: cita.id,
    fecha,
    hora,
    duracion: cita.duracionMinutos,
    motivo: cita.motivo || '',
    tipoConsulta: 'control' as any, // Valor por defecto
    estado: cita.estado as any, // Convertir enum a string
    notas: cita.notas,
    recordatorioEnviado: cita.recordatorioEnviado,
    confirmadaPor: undefined, // No tenemos esta info en la API
    fechaCreacion: cita.createdAt,
    ultimaModificacion: cita.updatedAt,
    paciente: {
      id: cita.paciente.id,
      nombre: cita.paciente.nombreCompleto,
      telefono: cita.paciente.telefono
    },
    ubicacion: cita.ubicacion ? {
      id: cita.ubicacion.id,
      nombre: cita.ubicacion.nombre
    } : undefined
  };
}

export { Cita } from '../../core/models';

@Injectable({
  providedIn: 'root'
})
export class AgendaService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/api/v1/citas`;

  getCitas(fecha?: string, estado?: string, page = 1, limit = 20): Observable<CitaLegacy[]> {
    // Si se proporciona una fecha, usar el endpoint de agenda del día
    if (fecha) {
      return this.http.get<Cita[]>(`${this.API_URL}/agenda/dia?fecha=${fecha}`).pipe(
        map(citas => {
          let citasFiltradas = citas;

          // Filtrar por estado si se proporciona
          if (estado) {
            citasFiltradas = citas.filter(c => c.estado === estado);
          }

          return citasFiltradas.map(convertirACitaLegacy);
        })
      );
    }

    // Si no hay fecha, usar el endpoint paginado general
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (estado) {
      params = params.set('estado', estado);
    }

    return this.http.get<PaginatedResponse<Cita>>(this.API_URL, { params }).pipe(
      map(response => response.data.map(convertirACitaLegacy))
    );
  }

  getCita(id: string): Observable<Cita> {
    return this.http.get<Cita>(`${this.API_URL}/${id}`);
  }

  crearCita(citaData: any): Observable<Cita> {
    return this.http.post<Cita>(this.API_URL, citaData);
  }

  actualizarCita(id: string, updates: Partial<Cita>): Observable<Cita> {
    return this.http.put<Cita>(`${this.API_URL}/${id}`, updates);
  }

  actualizarEstadoCita(id: string, estado: string): Observable<Cita> {
    return this.http.put<Cita>(`${this.API_URL}/${id}/estado`, { estado });
  }

  // DEPRECATED: No usar eliminación física. Usar cancelarCita() en su lugar
  // Se mantiene solo por compatibilidad temporal con código legacy
  // TODO: Remover completamente en próxima versión
  private eliminarCitaFisica(id: string): Observable<void> {
    console.warn('⚠️ ADVERTENCIA: eliminarCitaFisica() está deprecated. Use cancelarCita() en su lugar.');
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  getCitasAgenda(fecha: string): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.API_URL}/agenda/week?fecha=${fecha}`);
  }

  getCitasMes(year: number, month: number): Observable<CitaLegacy[]> {
    return this.http.get<Cita[]>(`${this.API_URL}/agenda/mes?year=${year}&month=${month}`).pipe(
      map(citas => citas.map(convertirACitaLegacy))
    );
  }

  enviarRecordatorio(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.API_URL}/${id}/recordatorio`, {});
  }

  getHorariosDisponibles(fecha: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/disponibilidad?fecha=${fecha}`);
  }

  moverCita(id: string, nuevaFecha: string, nuevaHora: string): Observable<Cita> {
    return this.http.put<Cita>(`${this.API_URL}/${id}/mover`, {
      fecha: nuevaFecha,
      hora: nuevaHora
    });
  }

  // Cancelar cita con tracking de quién canceló (médico vs paciente)
  cancelarCita(id: string, dto: CancelarCitaDto): Observable<Cita> {
    return this.http.put<Cita>(`${this.API_URL}/${id}/cancelar`, dto).pipe(
      catchError(error => {
        console.error('Error al cancelar cita:', error);
        let errorMessage = 'Error al cancelar la cita';

        if (error.status === 401) {
          errorMessage = 'Sesión expirada. Inicie sesión nuevamente';
        } else if (error.status === 403) {
          errorMessage = 'No tiene permisos para cancelar citas';
        } else if (error.status === 404) {
          errorMessage = 'Cita no encontrada';
        } else if (error.status === 0) {
          errorMessage = 'Error de conexión con el servidor';
        }

        return throwError(() => ({ ...error, message: errorMessage }));
      })
    );
  }

  // Obtener historial de cancelaciones de una cita
  getHistorialCancelaciones(citaId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/${citaId}/cancelaciones`).pipe(
      catchError(error => {
        console.error('Error al obtener historial de cancelaciones:', error);
        return throwError(() => ({ ...error, message: 'Error al obtener historial' }));
      })
    );
  }

  confirmarCita(id: string): Observable<Cita> {
    return this.http.put<Cita>(`${this.API_URL}/${id}/confirmar`, {});
  }

  completarCita(id: string): Observable<Cita> {
    return this.http.put<Cita>(`${this.API_URL}/${id}/completar`, {});
  }

  buscarCitas(termino: string, fechaInicio?: string, fechaFin?: string): Observable<Cita[]> {
    let params = new HttpParams().set('search', termino);

    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);

    return this.http.get<Cita[]>(`${this.API_URL}/buscar`, { params });
  }

  /**
   * Obtener citas de un paciente específico
   * @param pacienteId ID del paciente
   * @param page Número de página (default: 1)
   * @param limit Resultados por página (default: 50 para mostrar todas en perfil)
   */
  getCitasPaciente(pacienteId: string, page = 1, limit = 50): Observable<PaginatedResponse<Cita>> {
    let params = new HttpParams()
      .set('pacienteId', pacienteId)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedResponse<Cita>>(this.API_URL, { params });
  }

  getEstadisticas(fechaInicio: string, fechaFin: string): Observable<{
    total: number;
    confirmadas: number;
    pendientes: number;
    completadas: number;
    canceladas: number;
  }> {
    const params = new HttpParams()
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);

    return this.http.get<{
      total: number;
      confirmadas: number;
      pendientes: number;
      completadas: number;
      canceladas: number;
    }>(`${this.API_URL}/estadisticas`, { params });
  }
}