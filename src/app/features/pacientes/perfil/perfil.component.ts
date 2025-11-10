import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgClass, NgIf, NgFor, DatePipe } from '@angular/common';
import { PacientesService } from '../pacientes.service';
import { Paciente, HistorialMedico, MedicamentoActual, AntecedenteMedico } from '../../../core/models/paciente.model';
import { ConsultasService } from '../../../core/services/consultas';
import { HistoriaClinicaResponse, Consulta } from '../../../core/models/consulta';
import { AgendaService } from '../../agenda/agenda.service';
import { Cita } from '../../../core/models';

@Component({
  selector: 'app-perfil-paciente',
  standalone: true,
  imports: [NgClass, NgIf, NgFor, RouterLink, DatePipe],
  template: `
    <div class="page-container" *ngIf="paciente()">
      <!-- Header del Perfil -->
      <div class="page-header">
        <div class="flex items-center space-x-4">
          <button 
            routerLink="/pacientes"
            class="p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
          >
            <span class="material-icons-outlined">arrow_back</span>
          </button>
          <div>
            <h1 class="page-title">{{paciente()?.nombreCompleto}}</h1>
            <p class="page-subtitle">
              @if (paciente()?.numeroExpediente) {
                Expediente #{{paciente()?.numeroExpediente}} •
              }
              {{calcularEdad(paciente()?.fechaNacimiento)}} años
            </p>
          </div>
        </div>
        <div class="flex space-x-3">
          <button 
            [routerLink]="['/agenda/nueva']"
            [queryParams]="{pacienteId: paciente()?.id}"
            class="btn-secondary"
          >
            <span class="material-icons-outlined mr-2">event</span>
            Nueva Cita
          </button>
          <button 
            [routerLink]="['/pacientes/editar', paciente()?.id]"
            class="btn-primary"
          >
            <span class="material-icons-outlined mr-2">edit</span>
            Editar Perfil
          </button>
        </div>
      </div>

      <!-- Navegación de Tabs -->
      <div class="card-medical mb-6">
        <div class="border-b border-gray-200">
          <nav class="flex space-x-8">
            <button
              *ngFor="let tab of tabs"
              (click)="cambiarTab(tab.id)"
              [class]="getTabClasses(tab.id)"
            >
              <span class="material-icons-outlined mr-2">{{tab.icon}}</span>
              {{tab.label}}
            </button>
          </nav>
        </div>
      </div>

      <!-- Contenido por Tab -->
      
      <!-- Tab: Información General -->
      <div *ngIf="tabActivo() === 'general'" class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Información Básica -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Datos Personales -->
            <div class="card-medical">
              <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span class="material-icons-outlined mr-2">person</span>
                Datos Personales
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-sm text-gray-600">Nombre Completo</label>
                  <p class="text-gray-900 font-medium">{{paciente()?.nombreCompleto}}</p>
                </div>
                <div>
                  <label class="text-sm text-gray-600">Fecha de Nacimiento</label>
                  <p class="text-gray-900 font-medium">
                    {{paciente()?.fechaNacimiento | date:'longDate'}}
                  </p>
                </div>
                <div>
                  <label class="text-sm text-gray-600">Género</label>
                  <p class="text-gray-900 font-medium">
                    {{paciente()?.genero === 'M' ? 'Masculino' : 'Femenino'}}
                  </p>
                </div>
                <div>
                  <label class="text-sm text-gray-600">Tipo de Sangre</label>
                  <p class="text-gray-900 font-medium">{{paciente()?.tipoSangre || 'No especificado'}}</p>
                </div>
                <div>
                  <label class="text-sm text-gray-600">Teléfono</label>
                  <p class="text-gray-900 font-medium">{{paciente()?.telefono}}</p>
                </div>
                <div>
                  <label class="text-sm text-gray-600">Email</label>
                  <p class="text-gray-900 font-medium">{{paciente()?.email || 'No proporcionado'}}</p>
                </div>
              </div>
            </div>

            <!-- Contacto de Emergencia -->
            <div class="card-medical" *ngIf="paciente()?.contactoEmergencia">
              <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span class="material-icons-outlined mr-2">emergency</span>
                Contacto de Emergencia
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-sm text-gray-600">Nombre</label>
                  <p class="text-gray-900 font-medium">{{paciente()?.contactoEmergencia?.nombre}}</p>
                </div>
                <div>
                  <label class="text-sm text-gray-600">Parentesco</label>
                  <p class="text-gray-900 font-medium">{{paciente()?.contactoEmergencia?.parentesco}}</p>
                </div>
                <div>
                  <label class="text-sm text-gray-600">Teléfono</label>
                  <p class="text-gray-900 font-medium">{{paciente()?.contactoEmergencia?.telefono}}</p>
                </div>
                <div>
                  <label class="text-sm text-gray-600">Email</label>
                  <p class="text-gray-900 font-medium">{{paciente()?.contactoEmergencia?.email || 'No proporcionado'}}</p>
                </div>
              </div>
            </div>

            <!-- Seguro Médico -->
            <div class="card-medical" *ngIf="paciente()?.seguroMedico">
              <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span class="material-icons-outlined mr-2">health_and_safety</span>
                Seguro Médico
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-sm text-gray-600">Aseguradora</label>
                  <p class="text-gray-900 font-medium">{{paciente()?.seguroMedico?.aseguradora}}</p>
                </div>
                <div>
                  <label class="text-sm text-gray-600">Número de Póliza</label>
                  <p class="text-gray-900 font-medium">{{paciente()?.seguroMedico?.numeroPoliza}}</p>
                </div>
                <div>
                  <label class="text-sm text-gray-600">Vigencia</label>
                  <p class="text-gray-900 font-medium">
                    {{paciente()?.seguroMedico?.vigenciaDesde | date:'shortDate'}} - 
                    {{paciente()?.seguroMedico?.vigenciaHasta | date:'shortDate'}}
                  </p>
                </div>
                <div>
                  <label class="text-sm text-gray-600">Estado</label>
                  <span [class]="paciente()?.seguroMedico?.activo ? 'badge-confirmada' : 'badge-cancelada'">
                    {{paciente()?.seguroMedico?.activo ? 'Activo' : 'Inactivo'}}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar con Estadísticas -->
          <div class="space-y-6">
            <!-- Estadísticas Rápidas -->
            <div class="card-medical">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Resumen</h3>
              <div class="space-y-4">
                <div class="medical-stat">
                  <div class="medical-stat-number">{{paciente()?.totalCitas || 0}}</div>
                  <div class="medical-stat-label">Total Citas</div>
                </div>
                <div class="medical-stat">
                  <div class="medical-stat-number">{{paciente()?.citasCompletadas || 0}}</div>
                  <div class="medical-stat-label">Completadas</div>
                </div>
                <div class="medical-stat">
                  <div class="medical-stat-number">{{calcularPorcentajeAsistencia()}}%</div>
                  <div class="medical-stat-label">Asistencia</div>
                </div>
              </div>
            </div>

            <!-- Estados y Alertas -->
            <div class="card-medical">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Estados</h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-gray-700">WhatsApp</span>
                  <span [class]="paciente()?.consentimientoWhatsApp ? 'badge-confirmada' : 'badge-cancelada'">
                    {{paciente()?.consentimientoWhatsApp ? 'Autorizado' : 'No autorizado'}}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-700">Expediente</span>
                  <span [class]="paciente()?.expedienteActivo ? 'badge-confirmada' : 'badge-pendiente'">
                    {{paciente()?.expedienteActivo ? 'Activo' : 'Inactivo'}}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-700">Última Visita</span>
                  <span class="text-gray-600 text-sm">
                    {{paciente()?.ultimaVisita | date:'shortDate' || 'Nunca'}}
                  </span>
                </div>
              </div>
            </div>

            <!-- Etiquetas -->
            <div class="card-medical" *ngIf="paciente()?.etiquetas?.length">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Etiquetas</h3>
              <div class="flex flex-wrap gap-2">
                <span *ngFor="let etiqueta of paciente()?.etiquetas" 
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-900 text-primary-200 border border-primary-700">
                  {{etiqueta}}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Historial Médico -->
      <div *ngIf="tabActivo() === 'historial'" class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <!-- Antecedentes Personales -->
          <div class="card-medical">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span class="material-icons-outlined mr-2">medical_information</span>
              Antecedentes Personales
            </h3>
            <div class="space-y-4" *ngIf="paciente()?.historialMedico?.antecedentesPersonales?.length; else noAntecedentes">
              <div *ngFor="let antecedente of paciente()?.historialMedico?.antecedentesPersonales" 
                   class="p-4 bg-gray-100 rounded-lg border border-gray-300">
                <div class="flex justify-between items-start">
                  <div>
                    <h4 class="font-medium text-gray-900">{{antecedente.enfermedad}}</h4>
                    <p class="text-sm text-gray-600" *ngIf="antecedente.fechaDiagnostico">
                      Diagnóstico: {{antecedente.fechaDiagnostico | date:'shortDate'}}
                    </p>
                    <p class="text-sm text-gray-700" *ngIf="antecedente.tratamientoActual">
                      Tratamiento: {{antecedente.tratamientoActual}}
                    </p>
                  </div>
                  <span [class]="antecedente.controlado ? 'badge-confirmada' : 'badge-pendiente'">
                    {{antecedente.controlado ? 'Controlado' : 'Sin control'}}
                  </span>
                </div>
              </div>
            </div>
            <ng-template #noAntecedentes>
              <p class="text-gray-600 text-center py-4">No hay antecedentes registrados</p>
            </ng-template>
          </div>

          <!-- Medicamentos Actuales -->
          <div class="card-medical">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span class="material-icons-outlined mr-2">medication</span>
              Medicamentos Actuales
            </h3>
            <div class="space-y-4" *ngIf="paciente()?.historialMedico?.medicamentosActuales?.length; else noMedicamentos">
              <div *ngFor="let medicamento of getMedicamentosActivos()" 
                   class="p-4 bg-gray-100 rounded-lg border border-gray-300">
                <div class="flex justify-between items-start">
                  <div>
                    <h4 class="font-medium text-gray-900">{{medicamento.nombre}}</h4>
                    <p class="text-sm text-gray-600">
                      {{medicamento.dosis}} - {{medicamento.frecuencia}}
                    </p>
                    <p class="text-sm text-gray-700">
                      {{medicamento.indicacion}}
                    </p>
                  </div>
                  <div class="text-right">
                    <span class="badge-confirmada text-xs">{{medicamento.viaAdministracion}}</span>
                    <p class="text-xs text-gray-500 mt-1">
                      Desde: {{medicamento.fechaInicio | date:'shortDate'}}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <ng-template #noMedicamentos>
              <p class="text-gray-600 text-center py-4">No hay medicamentos registrados</p>
            </ng-template>
          </div>

          <!-- Alergias -->
          <div class="card-medical">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span class="material-icons-outlined mr-2">warning</span>
              Alergias Conocidas
            </h3>
            <div class="space-y-4" *ngIf="paciente()?.alergias?.length || paciente()?.historialMedico?.alergiasMedicamentos?.length; else noAlergias">
              <!-- Alergias generales -->
              <div *ngFor="let alergia of paciente()?.alergias" 
                   class="p-3 bg-warning-900 rounded-lg border border-warning-700">
                <span class="text-warning-200 font-medium">{{alergia}}</span>
              </div>
              <!-- Alergias a medicamentos -->
              <div *ngFor="let alergia of paciente()?.historialMedico?.alergiasMedicamentos" 
                   class="p-3 rounded-lg border"
                   [class.bg-error-900]="alergia.tipoReaccion === 'severa' || alergia.tipoReaccion === 'anafilaxia'"
                   [class.border-error-700]="alergia.tipoReaccion === 'severa' || alergia.tipoReaccion === 'anafilaxia'"
                   [class.bg-warning-900]="alergia.tipoReaccion === 'leve' || alergia.tipoReaccion === 'moderada'"
                   [class.border-warning-700]="alergia.tipoReaccion === 'leve' || alergia.tipoReaccion === 'moderada'">
                <div class="flex justify-between items-start">
                  <div>
                    <h4 class="font-medium" 
                        [class.text-error-200]="alergia.tipoReaccion === 'severa' || alergia.tipoReaccion === 'anafilaxia'"
                        [class.text-warning-200]="alergia.tipoReaccion === 'leve' || alergia.tipoReaccion === 'moderada'">
                      {{alergia.medicamento}}
                    </h4>
                    <p class="text-sm text-gray-600">{{alergia.sintomas.join(', ')}}</p>
                  </div>
                  <span class="text-xs px-2 py-1 rounded"
                        [class.bg-error-700]="alergia.tipoReaccion === 'severa' || alergia.tipoReaccion === 'anafilaxia'"
                        [class.text-error-200]="alergia.tipoReaccion === 'severa' || alergia.tipoReaccion === 'anafilaxia'"
                        [class.bg-warning-700]="alergia.tipoReaccion === 'leve' || alergia.tipoReaccion === 'moderada'"
                        [class.text-warning-200]="alergia.tipoReaccion === 'leve' || alergia.tipoReaccion === 'moderada'">
                    {{alergia.tipoReaccion}}
                  </span>
                </div>
              </div>
            </div>
            <ng-template #noAlergias>
              <p class="text-gray-600 text-center py-4">No hay alergias registradas</p>
            </ng-template>
          </div>

          <!-- Antecedentes Familiares -->
          <div class="card-medical">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span class="material-icons-outlined mr-2">family_restroom</span>
              Antecedentes Familiares
            </h3>
            <div class="space-y-4" *ngIf="paciente()?.historialMedico?.antecedentesFamiliares?.length; else noFamiliares">
              <div *ngFor="let antecedente of paciente()?.historialMedico?.antecedentesFamiliares" 
                   class="p-4 bg-gray-100 rounded-lg border border-gray-300">
                <div class="flex justify-between items-start">
                  <div>
                    <h4 class="font-medium text-gray-900">{{antecedente.enfermedad}}</h4>
                    <p class="text-sm text-gray-600">{{getParentescoLabel(antecedente.parentesco)}}</p>
                    <p class="text-sm text-gray-700" *ngIf="antecedente.edadDiagnostico">
                      Edad de diagnóstico: {{antecedente.edadDiagnostico}} años
                    </p>
                  </div>
                  <span *ngIf="antecedente.fallecido" class="badge-cancelada text-xs">
                    Fallecido
                  </span>
                </div>
              </div>
            </div>
            <ng-template #noFamiliares>
              <p class="text-gray-600 text-center py-4">No hay antecedentes familiares registrados</p>
            </ng-template>
          </div>
        </div>
      </div>

      <!-- Tab: Citas -->
      <div *ngIf="tabActivo() === 'citas'" class="space-y-6">
        <!-- Loading State -->
        <div *ngIf="isLoadingCitas" class="card-medical">
          <div class="animate-pulse space-y-4">
            <div class="h-4 bg-gray-100 rounded w-1/3"></div>
            <div class="h-4 bg-gray-100 rounded"></div>
            <div class="h-4 bg-gray-100 rounded w-3/4"></div>
          </div>
        </div>

        <!-- Lista de Citas -->
        <div *ngIf="!isLoadingCitas && citas().length > 0" class="space-y-4">
          <!-- Estadísticas rápidas -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="card-medical">
              <div class="text-center">
                <p class="text-3xl font-bold text-primary-400">{{citas().length}}</p>
                <p class="text-sm text-gray-600 mt-1">Total Citas</p>
              </div>
            </div>
            <div class="card-medical">
              <div class="text-center">
                <p class="text-3xl font-bold text-success-400">{{getCitasConfirmadas()}}</p>
                <p class="text-sm text-gray-600 mt-1">Confirmadas</p>
              </div>
            </div>
            <div class="card-medical">
              <div class="text-center">
                <p class="text-3xl font-bold text-purple-400">{{getCitasCompletadasCount()}}</p>
                <p class="text-sm text-gray-600 mt-1">Completadas</p>
              </div>
            </div>
            <div class="card-medical">
              <div class="text-center">
                <p class="text-3xl font-bold text-error-400">{{getCitasCanceladas()}}</p>
                <p class="text-sm text-gray-600 mt-1">Canceladas</p>
              </div>
            </div>
          </div>

          <!-- Lista de Citas con indicador de consulta -->
          <div class="card-medical">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span class="material-icons-outlined mr-2">event</span>
              Historial de Citas
            </h3>
            <div class="space-y-4">
              <div *ngFor="let cita of citas()"
                   [routerLink]="['/agenda/citas', cita.id]"
                   class="p-4 border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                <div class="flex justify-between items-start mb-2">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <p class="font-medium text-gray-900">{{cita.motivo || 'Consulta médica'}}</p>
                      <!-- Indicador de consulta asociada -->
                      <span *ngIf="tieneConsulta(cita)"
                            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-300"
                            title="Esta cita tiene una consulta registrada">
                        <span class="material-icons-outlined text-xs mr-1">description</span>
                        Consulta
                      </span>
                    </div>
                    <div class="flex items-center gap-4 text-sm text-gray-600">
                      <span class="flex items-center">
                        <span class="material-icons-outlined text-sm mr-1">calendar_today</span>
                        {{cita.fechaHora | date:'mediumDate'}}
                      </span>
                      <span class="flex items-center">
                        <span class="material-icons-outlined text-sm mr-1">schedule</span>
                        {{cita.fechaHora | date:'shortTime'}}
                      </span>
                      <span *ngIf="cita.ubicacion" class="flex items-center">
                        <span class="material-icons-outlined text-sm mr-1">location_on</span>
                        {{cita.ubicacion.nombre}}
                      </span>
                    </div>
                  </div>
                  <span [class]="getEstadoCitaClasses(cita.estado)">
                    {{getEstadoCitaTexto(cita.estado)}}
                  </span>
                </div>
                <div *ngIf="cita.notas" class="mt-2">
                  <p class="text-sm text-gray-700">{{cita.notas}}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoadingCitas && citas().length === 0" class="card-medical">
          <div class="text-center py-12">
            <div class="p-3 bg-primary-50 rounded-full inline-block mb-4">
              <span class="material-icons-outlined text-3xl text-primary-600">event_busy</span>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              No hay citas registradas
            </h3>
            <p class="text-gray-600 mb-4">
              Este paciente aún no tiene citas programadas.
            </p>
            <button
              [routerLink]="['/agenda/citas/nueva']"
              [queryParams]="{pacienteId: paciente()?.id}"
              class="btn-primary">
              <span class="material-icons-outlined mr-2">add</span>
              Agendar Primera Cita
            </button>
          </div>
        </div>
      </div>

      <!-- Tab: Consultas -->
      <div *ngIf="tabActivo() === 'consultas'" class="space-y-6">
        <!-- Loading State -->
        <div *ngIf="isLoadingConsultas" class="card-medical">
          <div class="animate-pulse space-y-4">
            <div class="h-4 bg-gray-100 rounded w-1/3"></div>
            <div class="h-4 bg-gray-100 rounded"></div>
            <div class="h-4 bg-gray-100 rounded w-3/4"></div>
          </div>
        </div>

        <!-- Lista de Consultas -->
        <div *ngIf="!isLoadingConsultas && consultas().length > 0" class="space-y-4">
          <!-- Estadísticas rápidas -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="card-medical">
              <div class="text-center">
                <p class="text-3xl font-bold text-primary-400">{{consultas().length}}</p>
                <p class="text-sm text-gray-600 mt-1">Total Consultas</p>
              </div>
            </div>
            <div class="card-medical">
              <div class="text-center">
                <p class="text-3xl font-bold text-success-400">{{getConsultasCompletadasCount()}}</p>
                <p class="text-sm text-gray-600 mt-1">Completadas</p>
              </div>
            </div>
            <div class="card-medical">
              <div class="text-center">
                <p class="text-3xl font-bold text-warning-400">{{getConsultasEnCursoCount()}}</p>
                <p class="text-sm text-gray-600 mt-1">En Curso</p>
              </div>
            </div>
          </div>

          <!-- Filtros de Consultas -->
          <div class="card-medical">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-medium text-gray-700">Filtrar por estado:</h3>
              <div class="flex gap-2">
                <button
                  (click)="filtrarConsultas('TODAS')"
                  [class]="filtroEstadoConsulta() === 'TODAS' ? 'px-3 py-1 rounded-full text-xs font-medium bg-primary-400 text-white' : 'px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300'">
                  Todas
                </button>
                <button
                  (click)="filtrarConsultas('COMPLETADA')"
                  [class]="filtroEstadoConsulta() === 'COMPLETADA' ? 'px-3 py-1 rounded-full text-xs font-medium bg-success-400 text-white' : 'px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300'">
                  Completadas
                </button>
                <button
                  (click)="filtrarConsultas('EN_CURSO')"
                  [class]="filtroEstadoConsulta() === 'EN_CURSO' ? 'px-3 py-1 rounded-full text-xs font-medium bg-warning-400 text-white' : 'px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300'">
                  En Curso
                </button>
                <button
                  (click)="filtrarConsultas('CANCELADA')"
                  [class]="filtroEstadoConsulta() === 'CANCELADA' ? 'px-3 py-1 rounded-full text-xs font-medium bg-error-400 text-white' : 'px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300'">
                  Canceladas
                </button>
              </div>
            </div>
          </div>

          <!-- Lista de Consultas -->
          <div class="card-medical">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
              <div class="flex items-center">
                <span class="material-icons-outlined mr-2">description</span>
                Historial de Consultas
              </div>
              <span class="text-sm font-normal text-gray-600">
                Mostrando {{consultasFiltradas().length}} de {{consultas().length}}
              </span>
            </h3>
            <div class="space-y-4">
              <div *ngFor="let consulta of consultasFiltradas()"
                   [routerLink]="['/consultas', consulta.id]"
                   class="p-4 border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                <div class="flex justify-between items-start mb-3">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <h4 class="font-semibold text-gray-900">{{consulta.motivoConsulta}}</h4>
                      <span [class]="getEstadoConsultaClasses(consulta.estado)">
                        {{getEstadoConsultaTexto(consulta.estado)}}
                      </span>
                    </div>
                    <div class="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span class="flex items-center">
                        <span class="material-icons-outlined text-sm mr-1">calendar_today</span>
                        {{consulta.createdAt | date:'mediumDate'}}
                      </span>
                      <span class="flex items-center">
                        <span class="material-icons-outlined text-sm mr-1">schedule</span>
                        {{consulta.createdAt | date:'shortTime'}}
                      </span>
                    </div>
                    <p class="text-sm text-gray-700 line-clamp-2" *ngIf="consulta.padecimientoActual">
                      {{consulta.padecimientoActual}}
                    </p>
                  </div>
                </div>

                <!-- Cita Asociada -->
                <div *ngIf="consulta.cita" class="mt-3 pt-3 border-t border-gray-200">
                  <div class="flex items-start gap-2">
                    <span class="material-icons-outlined text-sm text-gray-600">event</span>
                    <div class="flex-1">
                      <p class="text-xs text-gray-600 mb-1">Asociada a cita:</p>
                      <button
                        [routerLink]="['/agenda/citas', consulta.cita.id]"
                        class="text-xs text-primary-400 hover:text-primary-300 underline"
                        (click)="$event.stopPropagation()">
                        {{consulta.cita.fechaHora | date:'mediumDate'}} - {{consulta.cita.motivo || 'Ver detalles'}}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Diagnósticos -->
                <div *ngIf="consulta.diagnosticos && consulta.diagnosticos.length > 0" class="mt-3 pt-3 border-t border-gray-200">
                  <div class="flex items-start gap-2">
                    <span class="material-icons-outlined text-sm text-gray-600">medical_services</span>
                    <div class="flex-1">
                      <p class="text-xs text-gray-600 mb-1">Diagnósticos:</p>
                      <div class="flex flex-wrap gap-2">
                        <span *ngFor="let diagnostico of consulta.diagnosticos"
                              class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                              [ngClass]="{
                                'bg-error-900 text-error-200 border border-error-700': diagnostico.severidad === 'CRITICO' || diagnostico.severidad === 'GRAVE',
                                'bg-warning-900 text-warning-200 border border-warning-700': diagnostico.severidad === 'MODERADO',
                                'bg-success-900 text-success-200 border border-success-700': diagnostico.severidad === 'LEVE'
                              }">
                          {{diagnostico.descripcion}}
                          <span *ngIf="diagnostico.codigoCIE10" class="ml-1 opacity-75">({{diagnostico.codigoCIE10}})</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Signos Vitales -->
                <div *ngIf="consulta.signosVitales" class="mt-3 pt-3 border-t border-gray-200">
                  <div class="flex items-start gap-2">
                    <span class="material-icons-outlined text-sm text-gray-600">monitor_heart</span>
                    <div class="flex-1">
                      <p class="text-xs text-gray-600 mb-1">Signos Vitales:</p>
                      <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div *ngIf="consulta.signosVitales.presionSistolica && consulta.signosVitales.presionDiastolica">
                          <span class="text-gray-600">PA:</span>
                          <span class="font-medium text-gray-900 ml-1">
                            {{consulta.signosVitales.presionSistolica}}/{{consulta.signosVitales.presionDiastolica}} mmHg
                          </span>
                        </div>
                        <div *ngIf="consulta.signosVitales.frecuenciaCardiaca">
                          <span class="text-gray-600">FC:</span>
                          <span class="font-medium text-gray-900 ml-1">{{consulta.signosVitales.frecuenciaCardiaca}} bpm</span>
                        </div>
                        <div *ngIf="consulta.signosVitales.temperatura">
                          <span class="text-gray-600">Temp:</span>
                          <span class="font-medium text-gray-900 ml-1">{{consulta.signosVitales.temperatura}} °C</span>
                        </div>
                        <div *ngIf="consulta.signosVitales.saturacionOxigeno">
                          <span class="text-gray-600">SpO2:</span>
                          <span class="font-medium text-gray-900 ml-1">{{consulta.signosVitales.saturacionOxigeno}}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Receta -->
                <div *ngIf="consulta.receta && consulta.receta.medicamentos && consulta.receta.medicamentos.length > 0"
                     class="mt-3 pt-3 border-t border-gray-200">
                  <div class="flex items-start gap-2">
                    <span class="material-icons-outlined text-sm text-gray-600">medication</span>
                    <div class="flex-1">
                      <p class="text-xs text-gray-600 mb-1">Medicamentos prescritos: {{consulta.receta.medicamentos.length}}</p>
                      <div class="flex flex-wrap gap-1">
                        <span *ngFor="let med of consulta.receta.medicamentos.slice(0, 3)"
                              class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                          {{med.nombre}}
                        </span>
                        <span *ngIf="consulta.receta.medicamentos.length > 3"
                              class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                          +{{consulta.receta.medicamentos.length - 3}} más
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoadingConsultas && consultas().length === 0" class="card-medical">
          <div class="text-center py-12">
            <div class="p-3 bg-primary-50 rounded-full inline-block mb-4">
              <span class="material-icons-outlined text-3xl text-primary-600">description</span>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              No hay consultas registradas
            </h3>
            <p class="text-gray-600 mb-4">
              Este paciente aún no tiene consultas médicas registradas.
            </p>
            <button
              [routerLink]="['/consultas/nueva']"
              [queryParams]="{pacienteId: paciente()?.id}"
              class="btn-primary">
              <span class="material-icons-outlined mr-2">add</span>
              Registrar Primera Consulta
            </button>
          </div>
        </div>
      </div>

      <!-- Tab: Documentos (placeholder for now) -->
      <div *ngIf="tabActivo() === 'documentos'" class="space-y-6">
        <div class="card-medical">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Documentos Médicos</h3>
          <p class="text-gray-600 text-center py-8">Próximamente: Gestión de documentos, recetas y estudios</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div *ngIf="!paciente() && isLoading" class="page-container">
      <div class="card-medical">
        <div class="animate-pulse space-y-4">
          <div class="h-8 bg-gray-100 rounded w-1/3"></div>
          <div class="h-4 bg-gray-100 rounded w-1/2"></div>
          <div class="space-y-2">
            <div class="h-4 bg-gray-100 rounded"></div>
            <div class="h-4 bg-gray-100 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div *ngIf="!paciente() && !isLoading" class="page-container">
      <div class="card-medical text-center py-12">
        <div class="p-3 bg-error-900 rounded-full inline-block mb-4">
          <span class="material-icons-outlined text-3xl text-error-300">error</span>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Paciente no encontrado</h3>
        <p class="text-gray-600 mb-4">El paciente solicitado no existe o no tienes permisos para verlo</p>
        <button routerLink="/pacientes" class="btn-primary">
          Volver a Pacientes
        </button>
      </div>
    </div>
  `
})
export class PerfilPacienteComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private pacientesService = inject(PacientesService);
  private consultasService = inject(ConsultasService);
  private agendaService = inject(AgendaService);

  paciente = signal<Paciente | null>(null);
  historiaClinica = signal<HistoriaClinicaResponse | null>(null);
  citas = signal<Cita[]>([]);
  consultas = signal<Consulta[]>([]);
  consultasFiltradas = signal<Consulta[]>([]);
  filtroEstadoConsulta = signal<string>('TODAS');
  isLoading = true;
  isLoadingHistoria = false;
  isLoadingCitas = false;
  isLoadingConsultas = false;
  tabActivo = signal<string>('general');

  tabs = [
    { id: 'general', label: 'General', icon: 'person' },
    { id: 'historial', label: 'Historial Médico', icon: 'medical_information' },
    { id: 'citas', label: 'Citas', icon: 'event' },
    { id: 'consultas', label: 'Consultas', icon: 'description' },
    { id: 'documentos', label: 'Documentos', icon: 'folder' }
  ];

  ngOnInit(): void {
    const pacienteId = this.route.snapshot.params['id'];
    if (pacienteId) {
      this.cargarPaciente(pacienteId);
    }
  }

  private cargarPaciente(id: string): void {
    this.pacientesService.getPaciente(id).subscribe({
      next: (paciente) => {
        this.paciente.set(paciente);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  calcularEdad(fechaNacimiento?: string): number {
    if (!fechaNacimiento) return 0;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  calcularPorcentajeAsistencia(): number {
    const pacienteData = this.paciente();
    if (!pacienteData) return 0;

    const total = pacienteData.totalCitas || 0;
    const completadas = pacienteData.citasCompletadas || 0;

    if (total === 0) return 0;

    return Math.round((completadas / total) * 100);
  }

  getMedicamentosActivos(): MedicamentoActual[] {
    return this.paciente()?.historialMedico?.medicamentosActuales?.filter(m => m.activo) || [];
  }

  getParentescoLabel(parentesco: string): string {
    const labels: Record<string, string> = {
      'padre': 'Padre',
      'madre': 'Madre',
      'hermano': 'Hermano',
      'hermana': 'Hermana',
      'abuelo': 'Abuelo',
      'abuela': 'Abuela',
      'otro': 'Otro'
    };
    return labels[parentesco] || parentesco;
  }

  getTabClasses(tabId: string): string {
    const baseClasses = 'flex items-center px-4 py-3 text-sm font-medium transition-colors border-b-2';
    if (this.tabActivo() === tabId) {
      return `${baseClasses} text-primary-400 border-primary-400`;
    }
    return `${baseClasses} text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-500`;
  }

  cambiarTab(tabId: string): void {
    this.tabActivo.set(tabId);

    // Cargar citas cuando se accede al tab de citas
    if (tabId === 'citas' && this.citas().length === 0 && this.paciente()?.id) {
      this.cargarCitas(this.paciente()!.id);
    }

    // Cargar consultas cuando se accede al tab de consultas
    if (tabId === 'consultas' && this.consultas().length === 0 && this.paciente()?.id) {
      this.cargarConsultas(this.paciente()!.id);
    }
  }

  private cargarCitas(pacienteId: string): void {
    this.isLoadingCitas = true;
    this.agendaService.getCitasPaciente(pacienteId).subscribe({
      next: (response) => {
        this.citas.set(response.data);
        this.isLoadingCitas = false;
      },
      error: (error) => {
        console.error('Error al cargar citas del paciente:', error);
        this.isLoadingCitas = false;
      }
    });
  }

  private cargarConsultas(pacienteId: string): void {
    this.isLoadingConsultas = true;
    this.consultasService.obtenerTodas(1, 50, pacienteId).subscribe({
      next: (response) => {
        this.consultas.set(response.data);
        this.consultasFiltradas.set(response.data); // Inicialmente sin filtro
        this.isLoadingConsultas = false;
      },
      error: (error) => {
        console.error('Error al cargar consultas del paciente:', error);
        this.isLoadingConsultas = false;
      }
    });
  }

  filtrarConsultas(estado: string): void {
    this.filtroEstadoConsulta.set(estado);
    const todasConsultas = this.consultas();

    if (estado === 'TODAS') {
      this.consultasFiltradas.set(todasConsultas);
    } else {
      this.consultasFiltradas.set(todasConsultas.filter(c => c.estado === estado));
    }
  }

  getConsultasCompletadas(): number {
    const historia = this.historiaClinica();
    if (!historia || !historia.consultas) return 0;
    return historia.consultas.filter(c => c.estado === 'COMPLETADA').length;
  }

  getEstadoConsultaClasses(estado: string): string {
    switch (estado) {
      case 'COMPLETADA':
        return 'badge-confirmada'; // Verde
      case 'EN_CURSO':
        return 'badge-pendiente';  // Amarillo
      case 'CANCELADA':
        return 'badge-cancelada';  // Rojo
      default:
        console.warn('Estado de consulta desconocido:', estado);
        return 'badge-cancelada';  // Rojo por defecto para estados desconocidos
    }
  }

  getEstadoConsultaTexto(estado: string): string {
    switch (estado) {
      case 'COMPLETADA':
        return 'Completada';
      case 'EN_CURSO':
        return 'En Curso';
      case 'CANCELADA':
        return 'Cancelada';
      default:
        console.warn('Estado de consulta desconocido:', estado);
        return estado || 'Desconocido';
    }
  }

  // Helper methods para citas
  getEstadoCitaClasses(estado: string): string {
    const estadoLower = estado?.toLowerCase() || '';
    switch (estadoLower) {
      case 'confirmada':
        return 'badge-confirmada'; // Verde
      case 'pendiente':
        return 'badge-pendiente';  // Amarillo
      case 'completada':
        return 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-900 text-purple-200 border border-purple-700'; // Morado
      case 'cancelada':
        return 'badge-cancelada';  // Rojo
      case 'no_asistio':
        return 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-200 border border-gray-600'; // Gris
      default:
        console.warn('Estado de cita desconocido:', estado);
        return 'badge-pendiente';
    }
  }

  getEstadoCitaTexto(estado: string): string {
    const estadoLower = estado?.toLowerCase() || '';
    switch (estadoLower) {
      case 'confirmada':
        return 'Confirmada';
      case 'pendiente':
        return 'Pendiente';
      case 'completada':
        return 'Completada';
      case 'cancelada':
        return 'Cancelada';
      case 'no_asistio':
        return 'No Asistió';
      default:
        console.warn('Estado de cita desconocido:', estado);
        return estado || 'Desconocido';
    }
  }

  tieneConsulta(cita: Cita): boolean {
    // Si la cita tiene una consulta asociada (el backend hace join con consulta)
    return !!(cita as any).consulta;
  }

  // Helper methods para contar citas por estado
  getCitasConfirmadas(): number {
    return this.citas().filter(c => c.estado.toLowerCase() === 'confirmada').length;
  }

  getCitasCompletadasCount(): number {
    return this.citas().filter(c => c.estado.toLowerCase() === 'completada').length;
  }

  getCitasCanceladas(): number {
    return this.citas().filter(c => c.estado.toLowerCase() === 'cancelada').length;
  }

  // Helper methods para contar consultas por estado
  getConsultasCompletadasCount(): number {
    return this.consultas().filter(c => c.estado === 'COMPLETADA').length;
  }

  getConsultasEnCursoCount(): number {
    return this.consultas().filter(c => c.estado === 'EN_CURSO').length;
  }
}