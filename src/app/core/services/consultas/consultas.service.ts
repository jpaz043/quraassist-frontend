import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Consulta,
  CreateConsultaDto,
  UpdateConsultaDto,
  ConsultasResponse,
  EstadoConsulta,
  SolicitarDiagnosticoIADto,
  DiagnosticoIAResponse,
  DiagnosticoProbableIA,
  HistoriaClinicaResponse,
  EstadisticasConsultasResponse,
} from '../../models/consulta';

@Injectable({
  providedIn: 'root'
})
export class ConsultasService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/api/v1/consultas`;

  // Estado reactivo para consultas activas
  private consultasSubject = new BehaviorSubject<Consulta[]>([]);
  public consultas$ = this.consultasSubject.asObservable();

  // Consulta actual en edición
  private consultaActualSubject = new BehaviorSubject<Consulta | null>(null);
  public consultaActual$ = this.consultaActualSubject.asObservable();

  /**
   * Crear nueva consulta
   */
  crear(dto: CreateConsultaDto): Observable<Consulta> {
    return this.http.post<Consulta>(this.API_URL, dto).pipe(
      tap(consulta => {
        // Actualizar lista local
        const consultas = this.consultasSubject.value;
        this.consultasSubject.next([consulta, ...consultas]);
      })
    );
  }

  /**
   * Obtener todas las consultas con paginación y filtros
   */
  obtenerTodas(
    page: number = 1,
    limit: number = 20,
    pacienteId?: string,
    estado?: EstadoConsulta
  ): Observable<ConsultasResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (pacienteId) {
      params = params.set('pacienteId', pacienteId);
    }

    if (estado) {
      params = params.set('estado', estado);
    }

    return this.http.get<ConsultasResponse>(this.API_URL, { params }).pipe(
      tap(response => {
        if (page === 1) {
          this.consultasSubject.next(response.data);
        }
      })
    );
  }

  /**
   * Obtener consulta por ID
   */
  obtenerPorId(id: string): Observable<Consulta> {
    return this.http.get<Consulta>(`${this.API_URL}/${id}`).pipe(
      tap(consulta => {
        this.consultaActualSubject.next(consulta);
      })
    );
  }

  /**
   * Actualizar consulta existente
   */
  actualizar(id: string, dto: UpdateConsultaDto): Observable<Consulta> {
    return this.http.put<Consulta>(`${this.API_URL}/${id}`, dto).pipe(
      tap(consulta => {
        // Actualizar en la lista local
        const consultas = this.consultasSubject.value;
        const index = consultas.findIndex(c => c.id === id);
        if (index !== -1) {
          consultas[index] = consulta;
          this.consultasSubject.next([...consultas]);
        }
        // Actualizar consulta actual si es la que se editó
        if (this.consultaActualSubject.value?.id === id) {
          this.consultaActualSubject.next(consulta);
        }
      })
    );
  }

  /**
   * Completar consulta
   */
  completar(id: string): Observable<Consulta> {
    return this.http.post<Consulta>(`${this.API_URL}/${id}/completar`, {}).pipe(
      tap(consulta => {
        this.actualizarConsultaLocal(consulta);
      })
    );
  }

  /**
   * Cancelar consulta
   */
  cancelar(id: string, motivo?: string): Observable<Consulta> {
    return this.http.post<Consulta>(`${this.API_URL}/${id}/cancelar`, { motivo }).pipe(
      tap(consulta => {
        this.actualizarConsultaLocal(consulta);
      })
    );
  }

  /**
   * Eliminar consulta
   */
  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        // Eliminar de la lista local
        const consultas = this.consultasSubject.value;
        this.consultasSubject.next(consultas.filter(c => c.id !== id));
        // Limpiar consulta actual si es la que se eliminó
        if (this.consultaActualSubject.value?.id === id) {
          this.consultaActualSubject.next(null);
        }
      })
    );
  }

  /**
   * Obtener sugerencias de diagnóstico de IA
   */
  obtenerSugerenciasIA(
    consultaId: string,
    dto?: SolicitarDiagnosticoIADto
  ): Observable<DiagnosticoIAResponse> {
    return this.http.post<DiagnosticoIAResponse>(
      `${this.API_URL}/${consultaId}/ia/sugerencias`,
      dto || {}
    );
  }

  /**
   * Agregar diagnósticos sugeridos por IA a la consulta
   */
  agregarDiagnosticosIA(
    consultaId: string,
    diagnosticos: DiagnosticoProbableIA[]
  ): Observable<Consulta> {
    return this.http.post<Consulta>(
      `${this.API_URL}/${consultaId}/ia/agregar-diagnosticos`,
      { diagnosticos }
    ).pipe(
      tap(consulta => {
        this.actualizarConsultaLocal(consulta);
      })
    );
  }

  /**
   * Obtener historia clínica completa de un paciente
   */
  obtenerHistoriaClinica(pacienteId: string): Observable<HistoriaClinicaResponse> {
    return this.http.get<HistoriaClinicaResponse>(
      `${this.API_URL}/paciente/${pacienteId}/historia-clinica`
    );
  }

  /**
   * Obtener estadísticas de consultas
   */
  obtenerEstadisticas(
    fechaInicio?: Date,
    fechaFin?: Date
  ): Observable<EstadisticasConsultasResponse> {
    let params = new HttpParams();

    if (fechaInicio) {
      params = params.set('fechaInicio', fechaInicio.toISOString());
    }

    if (fechaFin) {
      params = params.set('fechaFin', fechaFin.toISOString());
    }

    return this.http.get<EstadisticasConsultasResponse>(
      `${this.API_URL}/estadisticas/resumen`,
      { params }
    );
  }

  /**
   * Establecer consulta actual
   */
  setConsultaActual(consulta: Consulta | null): void {
    this.consultaActualSubject.next(consulta);
  }

  /**
   * Limpiar consulta actual
   */
  limpiarConsultaActual(): void {
    this.consultaActualSubject.next(null);
  }

  /**
   * Método auxiliar para actualizar consulta en la lista local
   */
  private actualizarConsultaLocal(consulta: Consulta): void {
    const consultas = this.consultasSubject.value;
    const index = consultas.findIndex(c => c.id === consulta.id);
    if (index !== -1) {
      consultas[index] = consulta;
      this.consultasSubject.next([...consultas]);
    }
    if (this.consultaActualSubject.value?.id === consulta.id) {
      this.consultaActualSubject.next(consulta);
    }
  }

  /**
   * Obtener consulta por citaId
   */
  obtenerPorCitaId(citaId: string): Observable<Consulta | null> {
    let params = new HttpParams()
      .set('citaId', citaId)
      .set('page', '1')
      .set('limit', '1');

    return this.http.get<ConsultasResponse>(this.API_URL, { params }).pipe(
      tap(response => console.log('Buscando consulta por citaId:', citaId, 'Response:', response)),
      map(response => {
        // Si hay resultados, devolver el primero (debería haber solo uno por cita)
        return response.data.length > 0 ? response.data[0] : null;
      })
    );
  }

  /**
   * Refrescar lista de consultas
   */
  refrescar(page: number = 1, limit: number = 20): Observable<ConsultasResponse> {
    return this.obtenerTodas(page, limit);
  }
}
