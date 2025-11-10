// Este archivo se mantiene por compatibilidad con código legacy
// Usar las interfaces de usuario.model.ts para nuevas funcionalidades

export interface UpdateMedicoDto {
  nombreCompleto?: string;
  especialidades?: string[];
  numeroLicencia?: string;
}