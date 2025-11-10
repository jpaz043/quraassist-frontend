// Importar DiaSemana desde horario.model para evitar duplicación
import { DiaSemana } from './horario.model';

// Re-exportar para conveniencia en otros archivos que importen ubicacion.model
export { DiaSemana } from './horario.model';

// Interfaz para horarios de ubicación
export interface HorarioUbicacion {
  id: string;
  diaSemana: DiaSemana;
  horaInicio: string; // formato HH:MM
  horaFin: string; // formato HH:MM
  duracionCitaMinutos: number;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Interfaz para ubicaciones/consultorios
export interface Ubicacion {
  id: string;
  nombre: string;
  direccion?: string;
  ciudad?: string;
  telefono?: string;
  notas?: string;
  activo: boolean;
  coordenadas?: {
    lat: number;
    lng: number;
  };
  googlePlaceId?: string;
  horarios?: HorarioUbicacion[];
  createdAt: Date;
  updatedAt: Date;
}

// DTO para crear ubicación
export interface CreateUbicacionDto {
  nombre: string;
  direccion?: string;
  ciudad?: string;
  telefono?: string;
  notas?: string;
  coordenadas?: {
    lat: number;
    lng: number;
  };
  googlePlaceId?: string;
}

// DTO para actualizar ubicación
export interface UpdateUbicacionDto {
  nombre?: string;
  direccion?: string;
  ciudad?: string;
  telefono?: string;
  notas?: string;
  activo?: boolean;
  coordenadas?: {
    lat: number;
    lng: number;
  };
  googlePlaceId?: string;
}

// DTOs para crear/actualizar horarios de ubicación (renombrados para evitar conflictos con horario.model)
export interface CreateHorarioUbicacionDto {
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFin: string;
  duracionCitaMinutos?: number;
  activo?: boolean;
}

export interface UpdateHorarioUbicacionDto {
  diaSemana?: DiaSemana;
  horaInicio?: string;
  horaFin?: string;
  duracionCitaMinutos?: number;
  activo?: boolean;
}

// Interfaz para slots de disponibilidad
export interface SlotDisponible {
  hora: string;
  disponible: boolean;
}

// Interfaz para resumen consolidado de horarios por ubicación
export interface UbicacionConHorarios {
  ubicacion: Ubicacion;
  horarios: HorarioUbicacion[];
}

// Re-exportar helper de traducción desde horario.model
export { DIAS_SEMANA_LABELS as DIAS_SEMANA_ES } from './horario.model';
