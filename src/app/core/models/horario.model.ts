// Enums
export enum DiaSemana {
  LUNES = 'LUNES',
  MARTES = 'MARTES',
  MIERCOLES = 'MIERCOLES',
  JUEVES = 'JUEVES',
  VIERNES = 'VIERNES',
  SABADO = 'SABADO',
  DOMINGO = 'DOMINGO'
}

export enum TipoBloqueo {
  ALMUERZO = 'ALMUERZO',
  REUNION = 'REUNION',
  CAPACITACION = 'CAPACITACION',
  VACACIONES = 'VACACIONES',
  PERSONAL = 'PERSONAL',
  OTRO = 'OTRO'
}

// Entidades
export interface HorarioMedico {
  id: string;
  medicoId: string;
  diaSemana: DiaSemana;
  activo: boolean;
  horaInicio: string; // formato "HH:mm"
  horaFin: string; // formato "HH:mm"
  duracionCitaMinutos: number;
  permiteEmergencias: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BloqueoHorario {
  id: string;
  medicoId: string;
  tipo: TipoBloqueo;
  fechaHoraInicio: Date;
  fechaHoraFin: Date;
  motivo?: string;
  recurrente: boolean;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// DTOs para HorarioMedico
export interface CreateHorarioDto {
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFin: string;
  duracionCitaMinutos: number;
  activo?: boolean;
  permiteEmergencias?: boolean;
}

export interface UpdateHorarioDto {
  horaInicio?: string;
  horaFin?: string;
  duracionCitaMinutos?: number;
  activo?: boolean;
  permiteEmergencias?: boolean;
}

export interface InitializeHorariosDto {
  horaInicio: string;
  horaFin: string;
  duracionCitaMinutos: number;
}

// DTOs para BloqueoHorario
export interface CreateBloqueoDto {
  tipo: TipoBloqueo;
  fechaHoraInicio: string | Date;
  fechaHoraFin: string | Date;
  motivo?: string;
  recurrente?: boolean;
  activo?: boolean;
}

export interface UpdateBloqueoDto {
  tipo?: TipoBloqueo;
  fechaHoraInicio?: string | Date;
  fechaHoraFin?: string | Date;
  motivo?: string;
  recurrente?: boolean;
  activo?: boolean;
}

// Utilidades
export const DIAS_SEMANA_LABELS: Record<DiaSemana, string> = {
  [DiaSemana.LUNES]: 'Lunes',
  [DiaSemana.MARTES]: 'Martes',
  [DiaSemana.MIERCOLES]: 'Miércoles',
  [DiaSemana.JUEVES]: 'Jueves',
  [DiaSemana.VIERNES]: 'Viernes',
  [DiaSemana.SABADO]: 'Sábado',
  [DiaSemana.DOMINGO]: 'Domingo'
};

export const TIPO_BLOQUEO_LABELS: Record<TipoBloqueo, string> = {
  [TipoBloqueo.ALMUERZO]: 'Almuerzo',
  [TipoBloqueo.REUNION]: 'Reunión',
  [TipoBloqueo.CAPACITACION]: 'Capacitación',
  [TipoBloqueo.VACACIONES]: 'Vacaciones',
  [TipoBloqueo.PERSONAL]: 'Personal',
  [TipoBloqueo.OTRO]: 'Otro'
};

export const TIPO_BLOQUEO_ICONS: Record<TipoBloqueo, string> = {
  [TipoBloqueo.ALMUERZO]: '🍽️',
  [TipoBloqueo.REUNION]: '👥',
  [TipoBloqueo.CAPACITACION]: '📚',
  [TipoBloqueo.VACACIONES]: '🏖️',
  [TipoBloqueo.PERSONAL]: '👤',
  [TipoBloqueo.OTRO]: '📌'
};
