import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay, tap, catchError, throwError } from 'rxjs';
import { Paciente, CreatePacienteDto, PaginatedResponse } from '../../core/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PacientesService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/api/v1/pacientes`;

  getPacientes(query?: string, page = 1, limit = 20): Observable<PaginatedResponse<Paciente>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (query) {
      params = params.set('search', query);
    }

    return this.http.get<PaginatedResponse<Paciente>>(this.API_URL, { params }).pipe(
      catchError(error => {
        console.error('Error al obtener pacientes:', error);
        let errorMessage = 'Error al cargar pacientes';

        if (error.status === 401) {
          errorMessage = 'Sesión expirada. Inicie sesión nuevamente';
        } else if (error.status === 403) {
          errorMessage = 'No tiene permisos para ver pacientes';
        } else if (error.status === 0) {
          errorMessage = 'Error de conexión con el servidor';
        }

        return throwError(() => ({ ...error, message: errorMessage }));
      })
    );
  }

  getPaciente(id: string): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.API_URL}/${id}`);
  }

  crearPaciente(pacienteData: CreatePacienteDto): Observable<Paciente> {
    return this.http.post<Paciente>(this.API_URL, pacienteData);
  }

  actualizarPaciente(id: string, updates: Partial<Paciente>): Observable<Paciente> {
    return this.http.put<Paciente>(`${this.API_URL}/${id}`, updates);
  }

  // Eliminación lógica (soft delete) - Desactiva el paciente sin borrar datos
  desactivarPaciente(id: string): Observable<Paciente> {
    return this.http.put<Paciente>(`${this.API_URL}/${id}/deactivate`, {}).pipe(
      catchError(error => {
        console.error('Error al desactivar paciente:', error);
        let errorMessage = 'Error al desactivar paciente';

        if (error.status === 401) {
          errorMessage = 'Sesión expirada. Inicie sesión nuevamente';
        } else if (error.status === 403) {
          errorMessage = 'No tiene permisos para desactivar pacientes';
        } else if (error.status === 404) {
          errorMessage = 'Paciente no encontrado';
        } else if (error.status === 0) {
          errorMessage = 'Error de conexión con el servidor';
        }

        return throwError(() => ({ ...error, message: errorMessage }));
      })
    );
  }

  // Reactivar paciente previamente desactivado
  reactivarPaciente(id: string): Observable<Paciente> {
    return this.http.put<Paciente>(`${this.API_URL}/${id}/reactivate`, {}).pipe(
      catchError(error => {
        console.error('Error al reactivar paciente:', error);
        return throwError(() => ({ ...error, message: 'Error al reactivar paciente' }));
      })
    );
  }

  getEtiquetasComunes(): Observable<string[]> {
    const etiquetas = ['Hipertenso', 'Diabético', 'Control Mensual', 'Primera Consulta', 'VIP', 'Urgente'];
    return of(etiquetas);
  }

  darConsentimientoWhatsApp(id: string): Observable<Paciente> {
    return this.http.post<Paciente>(`${this.API_URL}/${id}/consent-whatsapp`, {});
  }

  /**
   * Búsqueda rápida de pacientes para autocomplete
   * @param query Término de búsqueda
   * @param limit Máximo número de resultados (default: 10)
   */
  searchPacientesQuick(query: string, limit = 10): Observable<PaginatedResponse<Paciente>> {
    let params = new HttpParams()
      .set('q', query)
      .set('limit', limit.toString());

    return this.http.get<PaginatedResponse<Paciente>>(`${this.API_URL}/search/quick`, { params }).pipe(
      catchError(error => {
        console.error('Error en búsqueda rápida:', error);
        return throwError(() => ({ ...error, message: 'Error al buscar pacientes' }));
      })
    );
  }
}
