export enum EstadoCita {
  PENDIENTE = 'pendiente',
  CONFIRMADA = 'confirmada', 
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
  NO_ASISTIO = 'no_asistio'
}

export interface Cita {
  id: string;
  fechaHora: string;
  duracionMinutos: number;
  estado: EstadoCita;
  motivo?: string;
  notas?: string;
  paciente: {
    id: string;
    nombreCompleto: string;
    telefono: string;
  };
  ubicacion?: {
    id: string;
    nombre: string;
    direccion?: string;
    ciudad?: string;
  };
  recordatorioEnviado: boolean;
  fechaRecordatorio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PacienteRapidoDto {
  nombreCompleto: string;
  telefono: string;
  email?: string;
  consentimientoWhatsApp?: boolean;
}

export interface CreateCitaDto {
  pacienteId?: string;  // Opcional: UUID del paciente existente
  paciente?: PacienteRapidoDto;  // Opcional: Datos para buscar/crear paciente
  fechaHora: string;
  duracionMinutos?: number;
  tipo?: string;
  motivo?: string;
  notas?: string;
  ubicacionId?: string;  // Opcional: ID de la ubicación donde se realizará la cita
}

export interface UpdateCitaDto {
  fechaHora?: string;
  duracionMinutos?: number;
  motivo?: string;
  notas?: string;
  estado?: EstadoCita;
}

export interface CitaCalendar {
  id: string;
  title: string;
  start: string;
  end: string;
  color: string;
  estado: EstadoCita;
  paciente: string;
  telefono: string;
}

export interface AgendaWeekResponse {
  citas: Cita[];
  stats: {
    total: number;
    confirmadas: number;
    pendientes: number;
    completadas: number;
  };
}

export enum QuienCancelo {
  MEDICO = 'medico',
  PACIENTE = 'paciente',
  SISTEMA = 'sistema'
}

export interface CancelarCitaDto {
  motivo?: string;
  canceladoPor: QuienCancelo;
  observaciones?: string;
}

export interface HistorialCancelacion {
  citaId: string;
  fechaCancelacion: string;
  motivo?: string;
  canceladoPor: QuienCancelo;
  observaciones?: string;
  usuarioId: string;
}