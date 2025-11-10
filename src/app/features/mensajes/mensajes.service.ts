import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap, catchError, throwError, map } from 'rxjs';
import { Mensaje, PaginatedResponse } from '../../core/models';
import { environment } from '../../../environments/environment';

export { Mensaje } from '../../core/models';

export interface PlantillaMensaje {
  id: string;
  nombre: string;
  tipo: 'recordatorio' | 'confirmacion' | 'educativo' | 'urgente' | 'resultado';
  especialidad: string;
  contenido: string;
  variables: string[];
}

@Injectable({
  providedIn: 'root'
})
export class MensajesService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/api/v1/mensajes`;

  enviarRecordatorio(citaId: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.API_URL}/send-reminder`, {
      citaId: citaId
    });
  }

  enviarRecordatoriosMasivos(citasIds: string[]): Observable<{ success: boolean; message: string; enviados: number }> {
    return this.http.post<{ success: boolean; message: string; enviados: number }>(`${this.API_URL}/bulk-reminders`, {
      citasIds: citasIds
    });
  }

  getHistorialMensajes(pacienteId: string, page = 1, limit = 20): Observable<PaginatedResponse<Mensaje>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedResponse<Mensaje>>(`${this.API_URL}/history/${pacienteId}`, { params });
  }

  getPlantillas(especialidad?: string): Observable<PlantillaMensaje[]> {
    let params = new HttpParams();
    if (especialidad) {
      params = params.set('especialidad', especialidad);
    }

    return this.http.get<PlantillaMensaje[]>(`${this.API_URL}/templates`, { params });
  }

  getPlantillasPorEspecialidad(especialidad: string): Observable<PlantillaMensaje[]> {
    return this.http.get<PlantillaMensaje[]>(`${this.API_URL}/templates/${especialidad}`);
  }

  enviarMensajePersonalizado(data: {
    pacienteId: string;
    contenido: string;
    tipo: 'recordatorio' | 'confirmacion' | 'educativo' | 'urgente' | 'resultado';
  }): Observable<Mensaje> {
    return this.http.post<Mensaje>(`${this.API_URL}/send`, data);
  }

  procesarWebhookTwilio(data: any): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.API_URL}/webhook/twilio`, data);
  }

  getEstadisticasMensajes(fechaInicio?: string, fechaFin?: string): Observable<{
    totalEnviados: number;
    entregados: number;
    respondidos: number;
    tasaRespuesta: number;
    porTipo: { [tipo: string]: number };
  }> {
    let params = new HttpParams();
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);

    return this.http.get<{
      totalEnviados: number;
      entregados: number;
      respondidos: number;
      tasaRespuesta: number;
      porTipo: { [tipo: string]: number };
    }>(`${this.API_URL}/estadisticas`, { params });
  }

  // Métodos de compatibilidad con la interfaz anterior
  getMensajes(): Observable<Mensaje[]> {
    return this.http.get<Mensaje[]>(`${this.API_URL}/history`);
  }

  getMensajesPorPaciente(pacienteId: string): Observable<Mensaje[]> {
    return this.getHistorialMensajes(pacienteId).pipe(
      map(response => response.data)
    );
  }

  enviarMensaje(data: { pacienteId: string; contenido: string; tipo: string }): Observable<Mensaje> {
    return this.enviarMensajePersonalizado({
      pacienteId: data.pacienteId,
      contenido: data.contenido,
      tipo: data.tipo as any
    });
  }

  crearPlantilla(plantilla: Omit<PlantillaMensaje, 'id'>): Observable<PlantillaMensaje> {
    return this.http.post<PlantillaMensaje>(`${this.API_URL}/templates`, plantilla);
  }

  actualizarPlantilla(id: string, updates: Partial<PlantillaMensaje>): Observable<PlantillaMensaje> {
    return this.http.put<PlantillaMensaje>(`${this.API_URL}/templates/${id}`, updates);
  }

  eliminarPlantilla(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/templates/${id}`);
  }
}