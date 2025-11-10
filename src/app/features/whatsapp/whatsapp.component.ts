import { Component, OnInit, inject, signal, computed, OnDestroy } from '@angular/core';
import { NgClass, NgIf, NgFor, DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { WhatsAppService, WhatsAppConversacion, WhatsAppMensaje, WhatsAppEstadisticas } from './whatsapp.service';

@Component({
  selector: 'app-whatsapp',
  standalone: true,
  imports: [NgClass, NgIf, NgFor, ReactiveFormsModule, DatePipe],
  template: `
    <div class="flex h-[calc(100vh-4rem)] bg-gray-50">
      <!-- Sidebar - Lista de conversaciones -->
      <div class="w-1/3 border-r border-gray-200 flex flex-col">
        <!-- Header del sidebar -->
        <div class="p-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">WhatsApp Business</h2>
          
          <!-- Buscador -->
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600">
              <span class="material-icons-outlined text-sm">search</span>
            </span>
            <input
              type="text"
              [formControl]="searchControl"
              class="input-medical pl-9 w-full text-sm"
              placeholder="Buscar conversaciones..."
            >
          </div>

          <!-- Estadísticas rápidas -->
          <div *ngIf="estadisticas()" class="grid grid-cols-2 gap-2 mt-4">
            <div class="bg-white rounded-lg p-2 text-center">
              <p class="text-xs text-gray-600">Activas</p>
              <p class="text-sm font-semibold text-gray-900">{{estadisticas()?.conversacionesActivas}}</p>
            </div>
            <div class="bg-white rounded-lg p-2 text-center">
              <p class="text-xs text-gray-600">Tokens</p>
              <p class="text-sm font-semibold text-primary-400">{{estadisticas()?.tokensUtilizados}}</p>
            </div>
          </div>
        </div>

        <!-- Lista de conversaciones -->
        <div class="flex-1 overflow-y-auto">
          <div *ngIf="isLoadingConversaciones()" class="p-4">
            <div class="animate-pulse space-y-3">
              <div *ngFor="let i of [1,2,3]" class="h-16 bg-gray-100 rounded-lg"></div>
            </div>
          </div>

          <div *ngIf="!isLoadingConversaciones() && conversaciones().length === 0" 
               class="p-4 text-center">
            <div class="p-3 bg-primary-900 rounded-full inline-block mb-3">
              <span class="material-icons-outlined text-2xl text-primary-300">chat</span>
            </div>
            <p class="text-sm text-gray-600">No hay conversaciones</p>
          </div>

          <div *ngFor="let conversacion of conversaciones()" 
               class="border-b border-gray-200 cursor-pointer hover:bg-white transition-colors"
               [class.bg-white]="conversacionSeleccionada()?.id === conversacion.id"
               (click)="seleccionarConversacion(conversacion)">
            <div class="p-4">
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-medium text-gray-900 truncate flex-1">
                  {{conversacion.pacienteNombre}}
                </h3>
                <div class="flex items-center space-x-1">
                  <span *ngIf="conversacion.mensajesNoLeidos > 0" 
                        class="bg-success-500 text-gray-900 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {{conversacion.mensajesNoLeidos}}
                  </span>
                  <span *ngIf="conversacion.bloqueada" 
                        class="material-icons-outlined text-error-400 text-sm">
                    block
                  </span>
                </div>
              </div>
              
              <p class="text-xs text-gray-600 mb-2">{{conversacion.pacienteTelefono}}</p>
              
              <div class="flex items-center justify-between">
                <p *ngIf="conversacion.ultimoMensaje" 
                   class="text-sm text-gray-700 truncate flex-1">
                  {{conversacion.ultimoMensaje.contenido}}
                </p>
                <span class="text-xs text-gray-500 ml-2">
                  {{conversacion.ultimaActividad | date:'short'}}
                </span>
              </div>

              <!-- Etiquetas -->
              <div *ngIf="conversacion.etiquetas.length > 0" class="flex flex-wrap gap-1 mt-2">
                <span *ngFor="let etiqueta of conversacion.etiquetas" 
                      class="px-2 py-1 bg-primary-900 text-primary-200 text-xs rounded-full">
                  {{etiqueta}}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Área de conversación -->
      <div class="flex-1 flex flex-col">
        <!-- Header de conversación -->
        <div *ngIf="conversacionSeleccionada()" 
             class="p-4 border-b border-gray-200 bg-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="h-10 w-10 rounded-full bg-primary-900 flex items-center justify-center">
                <span class="material-icons-outlined text-primary-300">person</span>
              </div>
              <div>
                <h3 class="font-medium text-gray-900">
                  {{conversacionSeleccionada()?.pacienteNombre}}
                </h3>
                <p class="text-sm text-gray-600">
                  {{conversacionSeleccionada()?.pacienteTelefono}}
                </p>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <!-- Estado en línea -->
              <div class="flex items-center space-x-1">
                <div class="h-2 w-2 bg-success-400 rounded-full"></div>
                <span class="text-xs text-gray-600">En línea</span>
              </div>

              <!-- Acciones -->
              <button class="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <span class="material-icons-outlined">call</span>
              </button>
              <button class="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <span class="material-icons-outlined">more_vert</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Área de mensajes -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4" id="mensajesContainer">
          <!-- Estado sin conversación seleccionada -->
          <div *ngIf="!conversacionSeleccionada()" 
               class="flex items-center justify-center h-full">
            <div class="text-center">
              <div class="p-4 bg-primary-900 rounded-full inline-block mb-4">
                <span class="material-icons-outlined text-4xl text-primary-300">chat</span>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">
                WhatsApp Business
              </h3>
              <p class="text-gray-600">
                Seleccione una conversación para comenzar a chatear
              </p>
            </div>
          </div>

          <!-- Mensajes -->
          <div *ngFor="let mensaje of mensajesConversacion()" 
               class="flex"
               [class.justify-end]="mensaje.direccion === 'enviado'"
               [class.justify-start]="mensaje.direccion === 'recibido'">
            <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg"
                 [class.bg-primary-600]="mensaje.direccion === 'enviado'"
                 [class.bg-gray-100]="mensaje.direccion === 'recibido'">
              <p class="text-gray-900 text-sm break-words">{{mensaje.contenido}}</p>
              
              <div class="flex items-center justify-between mt-1">
                <span class="text-xs text-gray-700">
                  {{mensaje.timestamp | date:'short'}}
                </span>
                
                <!-- Estado del mensaje (solo para enviados) -->
                <div *ngIf="mensaje.direccion === 'enviado'" class="ml-2">
                  <span class="material-icons-outlined text-xs"
                        [class.text-gray-600]="mensaje.estado === 'enviando'"
                        [class.text-gray-700]="mensaje.estado === 'enviado'"
                        [class.text-success-400]="mensaje.estado === 'entregado'"
                        [class.text-blue-400]="mensaje.estado === 'leido'"
                        [class.text-error-400]="mensaje.estado === 'error'">
                    {{getEstadoIcon(mensaje.estado)}}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Input de mensaje -->
        <div *ngIf="conversacionSeleccionada()" 
             class="p-4 border-t border-gray-200 bg-white">
          <div class="flex items-center space-x-3">
            <!-- Plantillas -->
            <button 
              class="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              title="Plantillas de mensajes"
            >
              <span class="material-icons-outlined">template_add</span>
            </button>

            <!-- Input de texto -->
            <div class="flex-1 relative">
              <input
                type="text"
                [formControl]="mensajeControl"
                class="input-medical w-full pr-12"
                placeholder="Escriba su mensaje..."
                (keydown.enter)="enviarMensaje()"
              >
              <button 
                class="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-600 hover:text-gray-900 transition-colors"
                title="Emoji"
              >
                <span class="material-icons-outlined text-lg">emoji_emotions</span>
              </button>
            </div>

            <!-- Adjuntar archivo -->
            <button 
              class="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              title="Adjuntar archivo"
            >
              <span class="material-icons-outlined">attach_file</span>
            </button>

            <!-- Enviar -->
            <button 
              (click)="enviarMensaje()"
              [disabled]="!mensajeControl.value?.trim() || isEnviando()"
              class="p-2 bg-primary-600 text-gray-900 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span *ngIf="!isEnviando()" class="material-icons-outlined">send</span>
              <span *ngIf="isEnviando()" class="animate-spin material-icons-outlined">refresh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WhatsAppComponent implements OnInit, OnDestroy {
  private whatsappService = inject(WhatsAppService);
  private router = inject(Router);

  // Signals
  conversaciones = signal<WhatsAppConversacion[]>([]);
  conversacionSeleccionada = signal<WhatsAppConversacion | null>(null);
  mensajesConversacion = signal<WhatsAppMensaje[]>([]);
  estadisticas = signal<WhatsAppEstadisticas | null>(null);
  isLoadingConversaciones = signal(true);
  isEnviando = signal(false);

  // Form controls
  searchControl = new FormControl('');
  mensajeControl = new FormControl('');

  // Subscriptions
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.cargarConversaciones();
    this.cargarEstadisticas();
    this.configurarBusqueda();
    this.escucharNuevosMensajes();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private cargarConversaciones(): void {
    const sub = this.whatsappService.getConversaciones().subscribe({
      next: (conversaciones) => {
        this.conversaciones.set(conversaciones);
        this.isLoadingConversaciones.set(false);
      },
      error: () => {
        this.isLoadingConversaciones.set(false);
      }
    });
    this.subscriptions.push(sub);
  }

  private cargarEstadisticas(): void {
    const sub = this.whatsappService.getEstadisticas().subscribe({
      next: (stats) => this.estadisticas.set(stats)
    });
    this.subscriptions.push(sub);
  }

  private configurarBusqueda(): void {
    const sub = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      if (query) {
        this.whatsappService.buscarConversaciones(query).subscribe(
          conversaciones => this.conversaciones.set(conversaciones)
        );
      } else {
        this.cargarConversaciones();
      }
    });
    this.subscriptions.push(sub);
  }

  private escucharNuevosMensajes(): void {
    const sub = this.whatsappService.getNuevosMensajes().subscribe(mensaje => {
      // Actualizar mensajes si es la conversación activa
      const conversacionActiva = this.conversacionSeleccionada();
      if (conversacionActiva && mensaje.conversacionId === conversacionActiva.id) {
        this.cargarMensajesConversacion(conversacionActiva.id);
      }

      // Mostrar notificación (opcional)
      this.mostrarNotificacionNuevoMensaje(mensaje);
    });
    this.subscriptions.push(sub);
  }

  seleccionarConversacion(conversacion: WhatsAppConversacion): void {
    this.conversacionSeleccionada.set(conversacion);
    this.cargarMensajesConversacion(conversacion.id);
    
    // Marcar como leído
    if (conversacion.mensajesNoLeidos > 0) {
      this.whatsappService.marcarComoLeido(conversacion.id).subscribe();
    }
  }

  private cargarMensajesConversacion(conversacionId: string): void {
    const sub = this.whatsappService.getMensajesConversacion(conversacionId).subscribe({
      next: (mensajes) => {
        this.mensajesConversacion.set(mensajes);
        // Scroll al final después de un breve delay
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
    this.subscriptions.push(sub);
  }

  enviarMensaje(): void {
    const contenido = this.mensajeControl.value?.trim();
    const conversacion = this.conversacionSeleccionada();
    
    if (!contenido || !conversacion) return;

    this.isEnviando.set(true);
    
    const sub = this.whatsappService.enviarMensaje(conversacion.id, contenido).subscribe({
      next: (mensaje) => {
        // Agregar mensaje a la lista local
        const mensajesActuales = this.mensajesConversacion();
        this.mensajesConversacion.set([...mensajesActuales, mensaje]);
        
        // Limpiar input
        this.mensajeControl.setValue('');
        this.isEnviando.set(false);
        
        // Scroll al final
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: () => {
        this.isEnviando.set(false);
      }
    });
    this.subscriptions.push(sub);
  }

  getEstadoIcon(estado: string): string {
    switch (estado) {
      case 'enviando': return 'schedule';
      case 'enviado': return 'done';
      case 'entregado': return 'done_all';
      case 'leido': return 'done_all';
      case 'error': return 'error';
      default: return 'schedule';
    }
  }

  private scrollToBottom(): void {
    const container = document.querySelector('#mensajesContainer') as HTMLElement;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  private mostrarNotificacionNuevoMensaje(mensaje: WhatsAppMensaje): void {
    // Solo mostrar si no está en la conversación activa
    const conversacionActiva = this.conversacionSeleccionada();
    if (!conversacionActiva || mensaje.conversacionId !== conversacionActiva.id) {
      // Aquí podrías implementar una notificación toast
      console.log(`Nuevo mensaje de ${mensaje.pacienteNombre}: ${mensaje.contenido}`);
    }
  }
}