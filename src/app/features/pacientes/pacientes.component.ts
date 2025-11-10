import { Component, inject, OnInit } from '@angular/core';
import { NgClass, NgIf, NgFor, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PacientesService } from './pacientes.service';
import { Paciente } from '../../core/models/paciente.model';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [NgClass, NgIf, NgFor, RouterLink, ReactiveFormsModule, DatePipe],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">
            Pacientes
          </h1>
          <p class="page-subtitle">
            Gestione su lista de pacientes
          </p>
        </div>
        <div class="flex space-x-3">
          <button routerLink="nuevo" class="btn-primary">
            <span class="material-icons-outlined mr-2">person_add</span>
            Nuevo Paciente
          </button>
        </div>
      </div>

      <!-- Buscador -->
      <div class="card-medical">
        <div class="relative">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600">
            <span class="material-icons-outlined">search</span>
          </span>
          <input
            type="text"
            [formControl]="searchControl"
            class="input-medical pl-10 w-full"
            placeholder="Buscar por nombre, teléfono o email..."
          >
        </div>
      </div>

      <!-- Lista de Pacientes -->
      <div class="card-medical">
        <!-- Loading state - Professional Skeleton -->
        <div *ngIf="isLoading" class="space-y-4">
          <div class="animate-pulse flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200" *ngFor="let i of [1,2,3,4,5]">
            <!-- Avatar + Info -->
            <div class="flex items-center space-x-4 flex-1">
              <div class="h-12 w-12 bg-gray-200 rounded-full flex-shrink-0"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-gray-200 rounded w-48"></div>
                <div class="h-3 bg-gray-200 rounded w-32"></div>
                <div class="h-3 bg-gray-200 rounded w-40"></div>
              </div>
            </div>

            <!-- Actions placeholder -->
            <div class="flex items-center space-x-2">
              <div class="h-8 w-8 bg-gray-200 rounded"></div>
              <div class="h-8 w-8 bg-gray-200 rounded"></div>
              <div class="h-8 w-8 bg-gray-200 rounded"></div>
              <div class="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div *ngIf="!isLoading && (!pacientes || pacientes.length === 0)" class="text-center py-12">
          <div class="p-3 bg-primary-900 rounded-full inline-block mb-4">
            <span class="material-icons-outlined text-3xl text-primary-300">
              {{searchControl.value ? 'search_off' : 'people'}}
            </span>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            {{searchControl.value ? 'No se encontraron resultados' : 'No hay pacientes registrados'}}
          </h3>
          <p class="text-gray-600 mb-4">
            {{searchControl.value ? 
              'Intente con otros términos de búsqueda' : 
              'Comience agregando su primer paciente'}}
          </p>
          <button *ngIf="!searchControl.value" routerLink="nuevo" class="btn-primary">
            Agregar Paciente
          </button>
        </div>

        <!-- Pacientes list -->
        <div *ngIf="!isLoading && pacientes && pacientes.length > 0" class="space-y-4">
          <div *ngFor="let paciente of pacientes" 
               class="patient-card">
            <!-- Info básica -->
            <div class="flex items-center space-x-4">
              <div class="h-12 w-12 rounded-full bg-primary-900 flex items-center justify-center">
                <span class="material-icons-outlined text-primary-300">
                  {{paciente.genero === 'F' ? 'face_3' : 'face_6'}}
                </span>
              </div>
              <div>
                <h3 class="font-medium text-gray-900">
                  {{paciente.nombreCompleto}}
                </h3>
                <p class="text-sm text-gray-700">{{paciente.telefono}}</p>
                <p class="text-sm text-gray-600">{{paciente.email}}</p>
              </div>
            </div>

            <!-- Etiquetas y acciones -->
            <div class="text-right">
              <!-- Etiquetas -->
              <div class="space-x-2 mb-2">
                <span *ngFor="let etiqueta of paciente.etiquetas" 
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-900 text-primary-200">
                  {{etiqueta}}
                </span>
              </div>

              <!-- Acciones -->
              <div class="flex items-center space-x-2">
                <!-- WhatsApp -->
                <button 
                  *ngIf="paciente.consentimientoWhatsApp"
                  class="p-2 text-gray-600 hover:text-success-400 transition-colors"
                  title="Enviar mensaje por WhatsApp"
                >
                  <span class="material-icons-outlined">whatsapp</span>
                </button>

                <!-- Ver perfil -->
                <button 
                  [routerLink]="['/pacientes/perfil', paciente.id]"
                  class="p-2 text-gray-600 hover:text-primary-400 transition-colors"
                  title="Ver perfil completo"
                >
                  <span class="material-icons-outlined">person</span>
                </button>

                <!-- Editar -->
                <button 
                  [routerLink]="['/pacientes/editar', paciente.id]"
                  class="p-2 text-gray-600 hover:text-primary-400 transition-colors"
                  title="Editar paciente"
                >
                  <span class="material-icons-outlined">edit</span>
                </button>

                <!-- Desactivar -->
                <button
                  (click)="desactivarPaciente(paciente.id)"
                  class="p-2 text-gray-600 hover:text-warning-600 transition-colors"
                  title="Desactivar paciente"
                >
                  <span class="material-icons-outlined">block</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PacientesComponent implements OnInit {
  private pacientesService = inject(PacientesService);

  isLoading = true;
  pacientes: Paciente[] | null = null;
  searchControl = new FormControl('');

  ngOnInit(): void {
    // Configurar búsqueda
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.cargarPacientes(query || '');
    });

    // Cargar pacientes iniciales
    this.cargarPacientes();
  }

  cargarPacientes(query?: string): void {
    this.isLoading = true;
    this.pacientesService.getPacientes(query).subscribe({
      next: (response) => {
        this.pacientes = response.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.pacientes = null;
      }
    });
  }

  desactivarPaciente(id: string): void {
    if (confirm('¿Está seguro de que desea desactivar este paciente? El paciente y su historial se preservarán pero no aparecerá en búsquedas activas.')) {
      this.isLoading = true;
      this.pacientesService.desactivarPaciente(id).subscribe({
        next: () => {
          this.cargarPacientes(this.searchControl.value || '');
        },
        error: (error) => {
          this.isLoading = false;
          alert(error.message || 'Error al desactivar el paciente. Intente nuevamente.');
        }
      });
    }
  }
} 