import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay, catchError, throwError, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  citasHoy: {
    total: number;
    confirmadas: number;
    pendientes: number;
    porcentajeConfirmadas: number;
  };
  mensajes: {
    total: number;
    entregados: number;
    porcentajeEntregados: number;
  };
  tokens: {
    disponibles: number;
    usados: number;
    porcentajeUsado: number;
  };
  pacientes: {
    nuevos: number;
    totalActivos: number;
    porcentajeCrecimiento: number;
  };
}

export interface CitaPreview {
  id: string;
  paciente: {
    nombre: string;
    iniciales: string;
  };
  motivo: string;
  hora: string;
  estado: 'confirmada' | 'pendiente' | 'completada' | 'cancelada';
}

export interface ResumenIA {
  resumen: string;
  sugerencias: string[];
  prioridades: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/api/v1`;

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.API_URL}/dashboard/stats`).pipe(
      catchError(error => {
        console.error('Error al obtener estadísticas del dashboard:', error);
        let errorMessage = 'Error al cargar estadísticas';

        if (error.status === 401) {
          errorMessage = 'Sesión expirada. Inicie sesión nuevamente';
        } else if (error.status === 403) {
          errorMessage = 'No tiene permisos para ver el dashboard';
        } else if (error.status === 0) {
          errorMessage = 'Error de conexión con el servidor';
        }

        return throwError(() => ({ ...error, message: errorMessage }));
      })
    );
  }

  getProximasCitas(): Observable<CitaPreview[]> {
    const params = new HttpParams().set('limit', '5');

    return this.http.get<any[]>(`${this.API_URL}/citas/proximas`, { params }).pipe(
      catchError(error => {
        console.error('Error al obtener próximas citas:', error);
        let errorMessage = 'Error al cargar próximas citas';

        if (error.status === 401) {
          errorMessage = 'Sesión expirada. Inicie sesión nuevamente';
        } else if (error.status === 0) {
          errorMessage = 'Error de conexión con el servidor';
        }

        return throwError(() => ({ ...error, message: errorMessage }));
      })
    );
  }

  getResumenIA(): Observable<ResumenIA> {
    return this.http.get<ResumenIA>(`${this.API_URL}/dashboard/resumen-ia`).pipe(
      catchError(error => {
        console.error('Error al obtener resumen IA:', error);

        // Si falla el endpoint de IA, devolver un resumen básico generado localmente
        const resumenFallback: ResumenIA = {
          resumen: `📊 RESUMEN DEL DÍA - ${new Date().toLocaleDateString('es-HN')}\n\n🏥 El resumen personalizado no está disponible temporalmente.\n\n💡 Puede ver las estadísticas y próximas citas arriba.`,
          sugerencias: [],
          prioridades: []
        };

        return of(resumenFallback);
      })
    );
  }
} 