export interface Paciente {
  id: string;
  nombreCompleto: string;
  telefono: string;
  email?: string;
  fechaNacimiento: string;
  genero?: 'M' | 'F';
  tipoSangre?: string;
  alergias?: string[];
  consentimientoWhatsApp: boolean;
  fechaConsentimiento?: string;
  ultimaVisita?: string;
  proximaCita?: string;
  notas?: string;
  etiquetas?: string[];
  
  // Información médica extendida
  historialMedico?: HistorialMedico;
  expedienteActivo: boolean;
  numeroExpediente?: string;
  contactoEmergencia?: ContactoEmergencia;
  seguroMedico?: SeguroMedico;
  
  // Estadísticas del paciente
  totalCitas: number;
  citasCompletadas: number;
  citasCanceladas: number;
  ultimaModificacionExpediente?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface HistorialMedico {
  antecedentesPersonales?: AntecedenteMedico[];
  antecedentesFamiliares?: AntecedenteFamiliar[];
  medicamentosActuales?: MedicamentoActual[];
  alergiasMedicamentos?: AlergiaMedicamento[];
  habitosToxicos?: HabitoToxico[];
  antecedentesCirugicos?: AntecedenteCirugico[];
  hospitalizacionesPrevias?: Hospitalizacion[];
  vacunas?: RegistroVacuna[];
  signosVitalesBaseline?: SignosVitales;
  observacionesGenerales?: string;
  fechaUltimaActualizacion: string;
}

export interface AntecedenteMedico {
  id: string;
  enfermedad: string;
  fechaDiagnostico?: string;
  tratamientoActual?: string;
  controlado: boolean;
  notas?: string;
}

export interface AntecedenteFamiliar {
  id: string;
  parentesco: 'padre' | 'madre' | 'hermano' | 'hermana' | 'abuelo' | 'abuela' | 'otro';
  enfermedad: string;
  edadDiagnostico?: number;
  fallecido?: boolean;
  causaFallecimiento?: string;
}

export interface MedicamentoActual {
  id: string;
  nombre: string;
  dosis: string;
  frecuencia: string;
  viaAdministracion: 'oral' | 'topica' | 'inyectable' | 'inhalatoria' | 'otra';
  fechaInicio: string;
  fechaFin?: string;
  indicacion: string;
  medicoPrescriptor?: string;
  activo: boolean;
}

export interface AlergiaMedicamento {
  id: string;
  medicamento: string;
  tipoReaccion: 'leve' | 'moderada' | 'severa' | 'anafilaxia';
  sintomas: string[];
  fechaReaccion?: string;
  confirmada: boolean;
}

export interface HabitoToxico {
  id: string;
  tipo: 'tabaco' | 'alcohol' | 'drogas' | 'otro';
  frecuencia: 'diaria' | 'semanal' | 'mensual' | 'ocasional' | 'exfumador';
  cantidad?: string;
  fechaInicio?: string;
  fechaCese?: string;
  notas?: string;
}

export interface AntecedenteCirugico {
  id: string;
  procedimiento: string;
  fecha: string;
  hospital: string;
  cirujano?: string;
  complicaciones?: string;
  tipoAnestesia?: string;
  notas?: string;
}

export interface Hospitalizacion {
  id: string;
  motivo: string;
  fechaIngreso: string;
  fechaEgreso?: string;
  hospital: string;
  diagnosticoPrincipal: string;
  tratamiento?: string;
  complicaciones?: string;
}

export interface RegistroVacuna {
  id: string;
  vacuna: string;
  fechaAplicacion: string;
  lote?: string;
  lugarAplicacion: string;
  reaccionesAdversas?: string;
  refuerzo?: boolean;
  proximaDosis?: string;
}

export interface SignosVitales {
  presionArterial?: string;
  frecuenciaCardiaca?: number;
  frecuenciaRespiratoria?: number;
  temperatura?: number;
  peso?: number;
  altura?: number;
  imc?: number;
  fechaMedicion: string;
}

export interface ContactoEmergencia {
  nombre: string;
  parentesco: string;
  telefono: string;
  email?: string;
  direccion?: string;
}

export interface SeguroMedico {
  aseguradora: string;
  numeroPoliza: string;
  vigenciaDesde: string;
  vigenciaHasta: string;
  tipoCobertura: string;
  activo: boolean;
}

export interface CreatePacienteDto {
  nombreCompleto: string;
  telefono: string;
  email?: string;
  fechaNacimiento: string;
  genero?: 'M' | 'F';
  tipoSangre?: string;
  alergias?: string[];
  consentimientoWhatsApp: boolean;
  notas?: string;
  etiquetas?: string[];
}

export interface UpdatePacienteDto {
  nombreCompleto?: string;
  telefono?: string;
  email?: string;
  fechaNacimiento?: string;
  genero?: 'M' | 'F';
  tipoSangre?: string;
  alergias?: string[];
  consentimientoWhatsApp?: boolean;
  notas?: string;
  etiquetas?: string[];
}

export interface ConsentimientoWhatsAppDto {
  consentimiento: boolean;
  fechaConsentimiento: string;
}