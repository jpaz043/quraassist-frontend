import { Component, OnInit, inject } from '@angular/core';
import { NgClass, NgIf, NgFor, DatePipe, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MensajesService, Mensaje, PlantillaMensaje } from './mensajes.service';

@Component({
  selector: 'app-mensajes',
  standalone: true,
  imports: [NgClass, NgIf, NgFor, RouterLink, DatePipe, TitleCasePipe],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">
            Mensajes
          </h1>
          <p class="page-subtitle">
            Gestione sus recordatorios y comunicaciones
          </p>
        </div>
        <div class="flex space-x-3">
          <button routerLink="plantillas" class="btn-secondary">
            <span class="material-icons-outlined mr-2">description</span>
            Plantillas
          </button>
          <button routerLink="nuevo" class="btn-primary">
            <span class="material-icons-outlined mr-2">send</span>
            Nuevo Mensaje
          </button>
        </div>
      </div>

      <!-- Mensajes -->
      <div class="card-medical">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">
          Mensajes Recientes
        </h2>

        <!-- Loading state -->
        <div *ngIf="isLoadingMensajes" class="space-y-4">
          <div class="animate-pulse" *ngFor="let i of [1,2,3]">
            <div class="h-24 bg-gray-100 rounded-xl"></div>
          </div>
        </div>

        <!-- Empty state -->
        <div *ngIf="!isLoadingMensajes && (!mensajes || mensajes.length === 0)" class="text-center py-12">
          <div class="p-3 bg-primary-900 rounded-full inline-block mb-4">
            <span class="material-icons-outlined text-3xl text-primary-300">chat</span>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            No hay mensajes
          </h3>
          <p class="text-gray-600 mb-4">
            Comience enviando recordatorios a sus pacientes
          </p>
          <button routerLink="nuevo" class="btn-primary">
            Enviar Mensaje
          </button>
        </div>

        <!-- Mensajes list -->
        <div *ngIf="!isLoadingMensajes && mensajes && mensajes.length > 0" class="space-y-4">
          <div *ngFor="let mensaje of mensajes" 
               class="flex items-start justify-between p-4 bg-gray-100 rounded-xl hover:bg-gray-600 transition-colors">
            <!-- Info básica -->
            <div class="flex items-center space-x-4">
              <div class="h-10 w-10 rounded-full bg-primary-900 flex items-center justify-center">
                <span class="material-icons-outlined text-primary-300">
                  {{getIconoTipo(mensaje.template)}}
                </span>
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <h3 class="font-medium text-gray-900">
                    {{mensaje.telefono}}
                  </h3>
                  <span [class]="'badge-' + getEstadoClass(mensaje.status)">
                    {{mensaje.status | titlecase}}
                  </span>
                </div>
                <p class="text-sm text-gray-700">{{mensaje.mensaje}}</p>
                <p class="text-xs text-gray-600">
                  {{mensaje.createdAt | date:'medium'}}
                </p>
              </div>
            </div>

            <!-- Respuesta - No disponible en la API actual -->
            <!-- <div *ngIf="mensaje.respuesta" class="text-right">
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-900 text-success-200 border border-success-700">
                Respuesta: {{mensaje.respuesta}}
              </span>
            </div> -->
          </div>
        </div>
      </div>

      <!-- Plantillas -->
      <div class="card-medical">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-semibold text-gray-900">
            Plantillas Disponibles
          </h2>
          <button routerLink="plantillas/nueva" class="btn-secondary text-sm">
            Nueva Plantilla
          </button>
        </div>

        <!-- Loading state -->
        <div *ngIf="isLoadingPlantillas" class="space-y-4">
          <div class="animate-pulse" *ngFor="let i of [1,2]">
            <div class="h-16 bg-gray-100 rounded-xl"></div>
          </div>
        </div>

        <!-- Empty state -->
        <div *ngIf="!isLoadingPlantillas && (!plantillas || plantillas.length === 0)" class="text-center py-12">
          <div class="p-3 bg-primary-900 rounded-full inline-block mb-4">
            <span class="material-icons-outlined text-3xl text-primary-300">description</span>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            No hay plantillas
          </h3>
          <p class="text-gray-600 mb-4">
            Cree plantillas para agilizar sus comunicaciones
          </p>
          <button routerLink="plantillas/nueva" class="btn-primary">
            Crear Plantilla
          </button>
        </div>

        <!-- Plantillas list -->
        <div *ngIf="!isLoadingPlantillas && plantillas && plantillas.length > 0" class="space-y-4">
          <div *ngFor="let plantilla of plantillas" 
               class="flex items-start justify-between p-4 bg-gray-100 rounded-xl hover:bg-gray-600 transition-colors">
            <!-- Info básica -->
            <div>
              <div class="flex items-center space-x-2">
                <h3 class="font-medium text-gray-900">
                  {{plantilla.nombre}}
                </h3>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-900 text-primary-200 border border-primary-700">
                  {{plantilla.especialidad}}
                </span>
              </div>
              <p class="text-sm text-gray-700 mt-1">{{plantilla.contenido}}</p>
              <div class="flex items-center space-x-2 mt-2">
                <span *ngFor="let variable of plantilla.variables" 
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-600 text-gray-700">
                  {{variable}}
                </span>
              </div>
            </div>

            <!-- Acciones -->
            <div class="flex items-center space-x-2">
              <button 
                [routerLink]="['plantillas/editar', plantilla.id]"
                class="p-2 text-gray-600 hover:text-primary-400 transition-colors"
                title="Editar plantilla"
              >
                <span class="material-icons-outlined">edit</span>
              </button>

              <button 
                (click)="eliminarPlantilla(plantilla.id)"
                class="p-2 text-gray-600 hover:text-error-400 transition-colors"
                title="Eliminar plantilla"
              >
                <span class="material-icons-outlined">delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MensajesComponent implements OnInit {
  private mensajesService = inject(MensajesService);

  isLoadingMensajes = true;
  isLoadingPlantillas = true;
  mensajes: Mensaje[] | null = null;
  plantillas: PlantillaMensaje[] | null = null;

  ngOnInit(): void {
    // Cargar mensajes
    this.mensajesService.getMensajes().subscribe({
      next: (mensajes) => {
        this.mensajes = mensajes;
        this.isLoadingMensajes = false;
      },
      error: () => {
        this.isLoadingMensajes = false;
      }
    });

    // Cargar plantillas
    this.mensajesService.getPlantillas().subscribe({
      next: (plantillas) => {
        this.plantillas = plantillas;
        this.isLoadingPlantillas = false;
      },
      error: () => {
        this.isLoadingPlantillas = false;
      }
    });
  }

  getIconoTipo(tipo: string): string {
    switch (tipo) {
      case 'recordatorio':
        return 'notifications';
      case 'confirmacion':
        return 'check_circle';
      case 'cancelacion':
        return 'cancel';
      default:
        return 'chat';
    }
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'enviado':
        return 'pendiente';
      case 'entregado':
        return 'confirmada';
      case 'leido':
        return 'completada';
      case 'fallido':
        return 'cancelada';
      default:
        return 'pendiente';
    }
  }

  eliminarPlantilla(id: string): void {
    if (confirm('¿Está seguro de que desea eliminar esta plantilla?')) {
      this.mensajesService.eliminarPlantilla(id).subscribe({
        next: () => {
          this.plantillas = this.plantillas?.filter(p => p.id !== id) || null;
        }
      });
    }
  }
} 