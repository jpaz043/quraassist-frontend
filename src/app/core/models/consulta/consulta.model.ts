import { Paciente } from '../paciente.model';
import { Cita } from '../cita.model';

export enum EstadoConsulta {
  EN_CURSO = 'EN_CURSO',
  COMPLETADA = 'COMPLETADA',
  CANCELADA = 'CANCELADA',
}

export enum TipoDiagnostico {
  PRESUNTIVO = 'PRESUNTIVO',
  DEFINITIVO = 'DEFINITIVO',
  DIFERENCIAL = 'DIFERENCIAL',
}

export enum SeveridadDiagnostico {
  LEVE = 'LEVE',
  MODERADO = 'MODERADO',
  GRAVE = 'GRAVE',
  CRITICO = 'CRITICO',
}

export interface SignosVitales {
  id?: string;
  presionSistolica?: number;
  presionDiastolica?: number;
  frecuenciaCardiaca?: number;
  frecuenciaRespiratoria?: number;
  temperatura?: number;
  saturacionOxigeno?: number;
  peso?: number;
  talla?: number;
  imc?: number;
  perimetroCefalico?: number;
  perimetroAbdominal?: number;
  glucosa?: number;
  observaciones?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Diagnostico {
  id?: string;
  codigoCIE10?: string;
  descripcion: string;
  tipo: TipoDiagnostico;
  severidad: SeveridadDiagnostico;
  notas?: string;
  sugeridoPorIA?: boolean;
  confianzaIA?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Medicamento {
  nombre: string;
  principioActivo?: string;
  dosis: string;
  via: string;
  frecuencia: string;
  duracion: string;
  indicaciones?: string;
}

export interface Receta {
  id?: string;
  medicamentos: Medicamento[];
  indicacionesGenerales?: string;
  recomendaciones?: string;
  estudiosLaboratorio?: string;
  proximaRevision?: string;
  fechaEmision?: Date;
  firmaDigital?: string;
  enviada?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SugerenciasIA {
  diagnosticosDiferenciales?: string[];
  examenes?: string[];
  tratamientos?: string[];
  confianza?: number;
}

export interface Consulta {
  id?: string;
  paciente?: Paciente;
  pacienteId: string;
  medicoId?: string;
  citaId?: string;
  cita?: Cita;
  motivoConsulta: string;
  padecimientoActual: string;
  antecedentesFamiliares?: string;
  antecedentesPersonales?: string;
  alergias?: string;
  exploracionFisica?: string;
  planTratamiento?: string;
  indicacionesRecomendaciones?: string;
  proximaConsulta?: string;
  notas?: string;
  estado: EstadoConsulta;
  fechaConsulta?: Date;
  completadaAt?: Date;
  signosVitales?: SignosVitales;
  diagnosticos?: Diagnostico[];
  receta?: Receta;
  sugerenciasIA?: SugerenciasIA;
  createdAt?: Date;
  updatedAt?: Date;
}

// DTOs para crear y actualizar consultas
export interface CreateSignosVitalesDto {
  presionSistolica?: number;
  presionDiastolica?: number;
  frecuenciaCardiaca?: number;
  frecuenciaRespiratoria?: number;
  temperatura?: number;
  saturacionOxigeno?: number;
  peso?: number;
  talla?: number;
  perimetroCefalico?: number;
  perimetroAbdominal?: number;
  glucosa?: number;
  observaciones?: string;
}

export interface CreateDiagnosticoDto {
  codigoCIE10?: string;
  descripcion: string;
  tipo: TipoDiagnostico;
  severidad: SeveridadDiagnostico;
  notas?: string;
  sugeridoPorIA?: boolean;
  confianzaIA?: number;
}

export interface CreateRecetaDto {
  medicamentos: Medicamento[];
  indicacionesGenerales?: string;
  recomendaciones?: string;
  estudiosLaboratorio?: string;
  proximaRevision?: string;
}

export interface CreateConsultaDto {
  pacienteId: string;
  citaId?: string;
  motivoConsulta: string;
  padecimientoActual: string;
  antecedentesFamiliares?: string;
  antecedentesPersonales?: string;
  alergias?: string;
  exploracionFisica?: string;
  planTratamiento?: string;
  indicacionesRecomendaciones?: string;
  proximaConsulta?: string;
  signosVitales?: CreateSignosVitalesDto;
  diagnosticos?: CreateDiagnosticoDto[];
  receta?: CreateRecetaDto;
}

export interface UpdateConsultaDto extends Partial<CreateConsultaDto> {}

// DTOs para IA
export interface SolicitarDiagnosticoIADto {
  sintomas: string;
  edad?: number;
  sexo?: string;
  antecedentes?: string;
  exploracionFisica?: string;
  signosVitales?: string;
}

export interface DiagnosticoProbableIA {
  nombre: string;
  codigoCIE10?: string;
  probabilidad: number;
  justificacion: string;
}

export interface DiagnosticoIAResponse {
  diagnosticosProbables: DiagnosticoProbableIA[];
  diagnosticosDiferenciales: string[];
  examenesRecomendados: string[];
  tratamientosSugeridos: string[];
  advertencias: string[];
}

// Response types
export interface ConsultasResponse {
  data: Consulta[];
  total: number;
  page: number;
  totalPages: number;
}

export interface HistoriaClinicaResponse {
  paciente: Paciente;
  totalConsultas: number;
  consultas: Consulta[];
  ultimaConsulta?: Consulta;
  primeraConsulta?: Date;
  diagnosticosRecurrentes: Array<{
    descripcion: string;
    codigoCIE10?: string;
    frecuencia: number;
  }>;
  alergiasConocidas?: string[];
  resumenIA?: string;
}

export interface EstadisticasConsultasResponse {
  totalConsultas: number;
  consultasCompletadas: number;
  consultasEnCurso: number;
  consultasCanceladas: number;
  diagnosticosMasComunes: Array<{
    descripcion: string;
    total: number;
  }>;
  promedioConsultasPorDia: number;
}
