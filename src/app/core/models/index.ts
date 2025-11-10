// Export all models from a single entry point
export * from './usuario.model';
export * from './medico.model';
export * from './paciente.model';
export * from './cita.model';
export * from './mensaje.model';
export * from './token.model';
export * from './suscripcion.model';
export * from './horario.model';
export * from './ubicacion.model';

// Common interfaces
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  citasHoy: number;
  citasConfirmadas: number;
  citasPendientes: number;
  mensajesEnviados: number;
  tokensDisponibles: number;
  porcentajeConfirmacion: number;
  proximasCitas: Array<{
    id: string;
    paciente: string;
    hora: string;
    estado: string;
  }>;
}