import { Component, inject, OnInit } from '@angular/core';
import { NgClass, NgIf, NgFor, TitleCasePipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService, DashboardStats, CitaPreview, ResumenIA } from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgClass, NgIf, NgFor, RouterLink, TitleCasePipe],
  template: `
    <!-- Modern Light Medical Dashboard - Professional & Clean -->
    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      <!-- Header - Responsive Professional Medical Style -->
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-8 space-y-4 sm:space-y-0 px-4 lg:px-0">
        <div>
          <div class="flex items-center mb-2">
            <div class="h-10 w-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
              <span class="material-icons-outlined text-white text-lg">medical_services</span>
            </div>
            <span class="text-gray-600 text-base sm:text-lg font-medium">Buenos días</span>
          </div>
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">
            Dashboard Médico
          </h1>
          <p class="text-gray-500 text-xs sm:text-sm">
            {{getCurrentDate()}} • Platform Doctor 🇭🇳
          </p>
        </div>

        <!-- Right side actions - Responsive -->
        <div class="flex items-center space-x-2 sm:space-x-4">
          <div class="relative flex-1 sm:flex-initial">
            <input type="text"
                   placeholder="Buscar..."
                   class="bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-400 w-full sm:w-48 md:w-64 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm text-sm">
            <span class="material-icons-outlined absolute right-3 top-2.5 text-gray-600 text-sm">search</span>
          </div>
          <div class="relative flex-shrink-0">
            <button class="bg-white p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm">
              <span class="material-icons-outlined text-gray-600">notifications</span>
            </button>
            <span class="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow">3</span>
          </div>
        </div>
      </div>

      <!-- Main Grid Layout - Mobile First Responsive -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <!-- Left Column: Main KPIs -->
        <div class="lg:col-span-8 space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">

            <!-- Loading state - Light theme -->
            <ng-container *ngIf="isLoadingStats">
              <div class="bg-white rounded-2xl p-6 animate-pulse border border-gray-200 shadow-sm" *ngFor="let i of [1,2,3,4]">
                <div class="h-4 bg-gray-200 rounded w-20 mb-4"></div>
                <div class="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div class="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </ng-container>

            <!-- Error state - Stats -->
            <ng-container *ngIf="!isLoadingStats && errorStats">
              <div class="bg-white rounded-2xl p-6 border border-red-200 shadow-sm col-span-full">
                <div class="flex items-center space-x-3 mb-4">
                  <div class="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <span class="material-icons-outlined text-red-600">error_outline</span>
                  </div>
                  <div class="flex-1">
                    <h3 class="text-gray-900 font-semibold">Error al cargar estadísticas</h3>
                    <p class="text-gray-600 text-sm">{{errorStats}}</p>
                  </div>
                </div>
                <button (click)="retryStats()" class="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  <span class="flex items-center justify-center space-x-2">
                    <span class="material-icons-outlined text-sm">refresh</span>
                    <span>Reintentar</span>
                  </span>
                </button>
              </div>
            </ng-container>

            <!-- Main KPIs - Light Medical Professional Theme -->
            <ng-container *ngIf="!isLoadingStats && !errorStats && stats">

              <!-- Citas Hoy - Primary Medical Card -->
              <div class="bg-white rounded-2xl p-6 border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                   routerLink="/agenda">
                <div class="mb-4 flex items-center justify-between">
                  <h3 class="text-gray-600 text-sm font-medium uppercase tracking-wide">Citas Hoy</h3>
                  <span class="material-icons-outlined text-primary-500 group-hover:scale-110 transition-transform">event</span>
                </div>

                <div class="mb-4">
                  <div class="text-4xl font-bold text-gray-900 mb-2">{{stats.citasHoy.total}}</div>
                  <div class="flex items-center space-x-1 text-sm">
                    <span class="text-emerald-600">↗</span>
                    <span class="text-emerald-600 font-medium">{{stats.citasHoy.porcentajeConfirmadas}}%</span>
                    <span class="text-gray-500">confirmadas</span>
                  </div>
                </div>

                <!-- Progress bar - Professional medical green -->
                <div class="w-full bg-gray-100 rounded-full h-2 mb-3">
                  <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-500 shadow-sm"
                       [style.width.%]="stats.citasHoy.porcentajeConfirmadas"></div>
                </div>

                <div class="flex justify-between items-center text-xs text-gray-600">
                  <span class="font-medium">{{stats.citasHoy.confirmadas}} confirmadas</span>
                  <span>{{stats.citasHoy.pendientes}} pendientes</span>
                </div>
              </div>

              <!-- Mensajes WhatsApp - Success Card -->
              <div class="bg-white rounded-2xl p-6 border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                   routerLink="/whatsapp">
                <div class="mb-4 flex items-center justify-between">
                  <h3 class="text-gray-600 text-sm font-medium uppercase tracking-wide">Mensajes</h3>
                  <span class="material-icons-outlined text-green-600 group-hover:scale-110 transition-transform">chat</span>
                </div>

                <div class="mb-4">
                  <div class="flex items-baseline space-x-2">
                    <span class="text-4xl font-bold text-gray-900">{{stats.mensajes.total}}</span>
                    <span class="text-green-600 text-lg font-medium">enviados</span>
                  </div>
                  <div class="flex items-center space-x-1 text-sm">
                    <span class="text-green-600">↗</span>
                    <span class="text-green-600 font-medium">{{stats.mensajes.porcentajeEntregados}}%</span>
                    <span class="text-gray-500">entregados</span>
                  </div>
                </div>

                <!-- WhatsApp branding -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <span class="text-green-600 text-sm">📱</span>
                    <span class="text-gray-600 text-sm font-medium">WhatsApp</span>
                  </div>
                  <span class="material-icons-outlined text-gray-600 text-sm">arrow_forward</span>
                </div>
              </div>

              <!-- Tokens - Warning/Financial Card -->
              <div class="bg-white rounded-2xl p-6 border border-gray-200 hover:border-amber-300 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                   routerLink="/tokens">
                <div class="mb-4 flex items-center justify-between">
                  <h3 class="text-gray-600 text-sm font-medium uppercase tracking-wide">Tokens</h3>
                  <span class="material-icons-outlined text-amber-600 group-hover:scale-110 transition-transform">toll</span>
                </div>

                <div class="mb-4">
                  <div class="text-4xl font-bold text-gray-900 mb-2">{{stats.tokens.disponibles}}</div>
                  <div class="flex items-center space-x-1 text-sm">
                    <span class="text-amber-600">⚡</span>
                    <span class="text-amber-600 font-medium">{{100 - stats.tokens.porcentajeUsado}}%</span>
                    <span class="text-gray-500">disponible</span>
                  </div>
                </div>

                <!-- Token usage bar -->
                <div class="w-full bg-gray-100 rounded-full h-2 mb-3">
                  <div class="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-500 shadow-sm"
                       [style.width.%]="stats.tokens.porcentajeUsado"></div>
                </div>

                <div class="flex justify-between items-center text-xs text-gray-600">
                  <span>{{stats.tokens.usados}} usados</span>
                  <span class="text-amber-600 font-medium group-hover:underline">Comprar más →</span>
                </div>
              </div>

              <!-- Pacientes - Growth/Info Card -->
              <div class="bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                   routerLink="/pacientes">
                <div class="mb-4 flex items-center justify-between">
                  <h3 class="text-gray-600 text-sm font-medium uppercase tracking-wide">Pacientes</h3>
                  <span class="material-icons-outlined text-blue-600 group-hover:scale-110 transition-transform">people</span>
                </div>

                <div class="mb-4">
                  <div class="text-4xl font-bold text-gray-900 mb-2">{{stats.pacientes.totalActivos}}</div>
                  <div class="flex items-center space-x-1 text-sm">
                    <span class="text-blue-600">↗</span>
                    <span class="text-blue-600 font-medium">{{stats.pacientes.nuevos}}</span>
                    <span class="text-gray-500">nuevos este mes</span>
                  </div>
                </div>

                <div class="flex justify-between items-center text-xs text-gray-600">
                  <span class="font-medium">Total activos</span>
                  <span class="flex items-center space-x-1">
                    <span>🇭🇳</span>
                    <span>Honduras</span>
                  </span>
                </div>
              </div>

            </ng-container>
          </div>
        </div>

        <!-- Right Sidebar - Professional Light Theme -->
        <div class="lg:col-span-4">
          <div class="space-y-6">

            <!-- Upcoming Appointments (Próximas Citas) -->
            <div class="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-gray-900 text-lg font-semibold">Próximas Citas</h3>
                <a routerLink="/agenda" class="text-primary-600 text-sm hover:text-primary-700 font-medium">Ver agenda →</a>
              </div>

              <!-- Loading state -->
              <div class="space-y-4" *ngIf="isLoadingCitas">
                <div class="animate-pulse" *ngFor="let i of [1,2,3]">
                  <div class="flex items-center space-x-3">
                    <div class="h-10 w-10 bg-gray-200 rounded-lg"></div>
                    <div class="flex-1">
                      <div class="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div class="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Error state - Citas -->
              <div *ngIf="!isLoadingCitas && errorCitas" class="text-center py-4">
                <div class="inline-flex items-center justify-center h-12 w-12 bg-red-100 rounded-full mb-3">
                  <span class="material-icons-outlined text-red-600">error_outline</span>
                </div>
                <p class="text-gray-900 font-medium mb-1">Error al cargar citas</p>
                <p class="text-gray-600 text-sm mb-3">{{errorCitas}}</p>
                <button (click)="retryCitas()" class="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                  Reintentar
                </button>
              </div>

              <!-- Appointments list -->
              <div class="space-y-3" *ngIf="!isLoadingCitas && !errorCitas && citas">
                <div *ngFor="let cita of citas; let i = index"
                     class="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer border"
                     [class.bg-blue-50]="i === 0"
                     [class.border-blue-200]="i === 0"
                     [class.border-transparent]="i !== 0">

                  <!-- Patient Avatar/Initial -->
                  <div class="h-10 w-10 rounded-lg flex items-center justify-center text-gray-900 font-semibold shadow-sm"
                       [class.bg-emerald-500]="cita.estado === 'confirmada'"
                       [class.bg-amber-500]="cita.estado === 'pendiente'"
                       [class.bg-gray-400]="cita.estado === 'cancelada'">
                    {{cita.paciente.iniciales}}
                  </div>

                  <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-2 mb-1">
                      <span class="text-gray-900 text-sm font-medium truncate">{{cita.paciente.nombre}}</span>
                      <span class="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                            [class.bg-emerald-100]="cita.estado === 'confirmada'"
                            [class.text-emerald-700]="cita.estado === 'confirmada'"
                            [class.bg-amber-100]="cita.estado === 'pendiente'"
                            [class.text-amber-700]="cita.estado === 'pendiente'">
                        {{cita.estado === 'confirmada' ? '✓ Confirmada' : '⏱ Pendiente'}}
                      </span>
                    </div>
                    <div class="flex items-center space-x-2 text-xs text-gray-500">
                      <span class="material-icons-outlined" style="font-size: 14px;">schedule</span>
                      <span>{{cita.hora}}</span>
                      <span>•</span>
                      <span class="truncate">{{cita.motivo}}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quick actions -->
              <div class="mt-6 pt-4 border-t border-gray-200">
                <button class="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-sm font-medium py-3 px-4 rounded-lg transition-all shadow-sm hover:shadow flex items-center justify-center space-x-2"
                        routerLink="/agenda">
                  <span class="material-icons-outlined text-sm">add</span>
                  <span>Agendar Nueva Cita</span>
                </button>
              </div>
            </div>

            <!-- Recommended Actions - Light Professional -->
            <div class="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 class="text-gray-900 text-lg font-semibold mb-6">Acciones Recomendadas</h3>

              <!-- IA Suggestion - Professional card -->
              <div class="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-4 mb-4 shadow-sm">
                <div class="flex items-center space-x-3 mb-3">
                  <div class="h-10 w-10 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <span class="text-white text-xl">🤖</span>
                  </div>
                  <div>
                    <p class="text-white text-sm font-semibold">Resumen IA</p>
                    <p class="text-primary-100 text-xs">Optimización diaria</p>
                  </div>
                </div>
                <button (click)="abrirModalInsights()"
                        class="w-full bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all hover:shadow-lg"
                        [disabled]="isLoadingResumen || !resumenIA">
                  <span *ngIf="isLoadingResumen">Cargando...</span>
                  <span *ngIf="!isLoadingResumen">Ver Insights →</span>
                </button>
              </div>

              <!-- Quick action buttons -->
              <div class="space-y-3">
                <button class="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-all text-left group">
                  <div class="flex items-center space-x-3">
                    <div class="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <span class="material-icons-outlined text-white text-sm">send</span>
                    </div>
                    <span class="text-gray-900 text-sm font-medium">Enviar Recordatorios</span>
                  </div>
                  <span class="text-amber-600 text-xs font-medium bg-amber-100 px-2 py-1 rounded-full">2 pendientes</span>
                </button>

                <button routerLink="/tokens" class="w-full flex items-center justify-between p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-all text-left group">
                  <div class="flex items-center space-x-3">
                    <div class="h-8 w-8 bg-amber-500 rounded-lg flex items-center justify-center">
                      <span class="material-icons-outlined text-white text-sm">toll</span>
                    </div>
                    <span class="text-gray-900 text-sm font-medium">Comprar Tokens</span>
                  </div>
                  <span class="text-gray-600 text-xs">{{stats?.tokens?.disponibles || 0}} restantes</span>
                </button>
              </div>
            </div>

            <!-- Daily Activity - Professional Stats -->
            <div class="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-gray-900 text-lg font-semibold">Actividad del Día</h3>
                <span class="material-icons-outlined text-gray-600 text-sm">timeline</span>
              </div>

              <!-- Activity metrics - Clean grid -->
              <div class="grid grid-cols-3 gap-4 mb-6">
                <div class="text-center">
                  <div class="text-2xl font-bold text-gray-900 mb-1">{{stats?.citasHoy?.total || 0}}</div>
                  <div class="text-xs text-gray-500 font-medium">Citas</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-gray-900 mb-1">{{stats?.mensajes?.total || 0}}</div>
                  <div class="text-xs text-gray-500 font-medium">Mensajes</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-gray-900 mb-1">{{calculateActiveTime()}}</div>
                  <div class="text-xs text-gray-500 font-medium">Min activo</div>
                </div>
              </div>

              <!-- Activity bars - Medical blue gradient -->
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-end justify-between space-x-1.5 h-20">
                  <div class="bg-gradient-to-t from-primary-600 to-primary-400 rounded-t flex-1" style="height: 60%;"></div>
                  <div class="bg-gradient-to-t from-primary-600 to-primary-400 rounded-t flex-1" style="height: 80%;"></div>
                  <div class="bg-gradient-to-t from-primary-600 to-primary-400 rounded-t flex-1" style="height: 40%;"></div>
                  <div class="bg-gradient-to-t from-primary-600 to-primary-400 rounded-t flex-1" style="height: 70%;"></div>
                  <div class="bg-gradient-to-t from-primary-600 to-primary-400 rounded-t flex-1" style="height: 90%;"></div>
                  <div class="bg-gradient-to-t from-primary-600 to-primary-400 rounded-t flex-1" style="height: 30%;"></div>
                  <div class="bg-gradient-to-t from-primary-600 to-primary-400 rounded-t flex-1" style="height: 55%;"></div>
                </div>
                <div class="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Lun</span>
                  <span>Mar</span>
                  <span>Mié</span>
                  <span>Jue</span>
                  <span>Vie</span>
                  <span>Sáb</span>
                  <span>Dom</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Insights IA -->
    <div *ngIf="mostrarModalInsights && resumenIA"
         class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
         (click)="cerrarModalInsights()">
      <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
           (click)="$event.stopPropagation()">

        <!-- Header del Modal -->
        <div class="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-5">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="h-10 w-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span class="text-2xl">🤖</span>
              </div>
              <div>
                <h3 class="text-xl font-bold text-white">Insights Inteligentes</h3>
                <p class="text-primary-100 text-sm">Optimización basada en IA</p>
              </div>
            </div>
            <button (click)="cerrarModalInsights()"
                    class="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all">
              <span class="material-icons-outlined">close</span>
            </button>
          </div>
        </div>

        <!-- Contenido del Modal - Scrollable -->
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">

          <!-- Resumen Principal -->
          <div class="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
            <div class="flex items-start space-x-3">
              <span class="text-2xl">📊</span>
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900 mb-2">Resumen del Día</h4>
                <p class="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{{resumenIA.resumen}}</p>
              </div>
            </div>
          </div>

          <!-- Prioridades -->
          <div *ngIf="resumenIA.prioridades.length > 0" class="mb-6">
            <h4 class="font-semibold text-gray-900 mb-3 flex items-center">
              <span class="material-icons-outlined text-red-500 mr-2">priority_high</span>
              Prioridades del Día
            </h4>
            <div class="space-y-2">
              <div *ngFor="let prioridad of resumenIA.prioridades"
                   class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <span class="text-red-500 text-xl">⚠️</span>
                <p class="text-gray-800 text-sm flex-1">{{prioridad}}</p>
              </div>
            </div>
          </div>

          <!-- Sugerencias Accionables -->
          <div *ngIf="resumenIA.sugerencias.length > 0">
            <h4 class="font-semibold text-gray-900 mb-3 flex items-center">
              <span class="material-icons-outlined text-green-500 mr-2">lightbulb</span>
              Sugerencias para Optimizar
            </h4>
            <div class="space-y-3">
              <div *ngFor="let sugerencia of resumenIA.sugerencias"
                   class="bg-green-50 border border-green-200 rounded-lg p-4">
                <div class="flex items-start justify-between">
                  <div class="flex items-start space-x-3 flex-1">
                    <span class="text-green-500 text-xl">💡</span>
                    <p class="text-gray-800 text-sm flex-1">{{sugerencia}}</p>
                  </div>
                  <button *ngIf="sugerencia.includes('recordatorios')"
                          routerLink="/citas"
                          (click)="cerrarModalInsights()"
                          class="ml-3 text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-all whitespace-nowrap">
                    Ir a Citas
                  </button>
                  <button *ngIf="sugerencia.includes('tokens') || sugerencia.includes('recargar')"
                          routerLink="/tokens"
                          (click)="cerrarModalInsights()"
                          class="ml-3 text-xs bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg transition-all whitespace-nowrap">
                    Comprar Tokens
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Mensaje cuando no hay sugerencias ni prioridades -->
          <div *ngIf="resumenIA.sugerencias.length === 0 && resumenIA.prioridades.length === 0"
               class="text-center py-8">
            <span class="text-6xl mb-4 block">🎉</span>
            <h4 class="text-xl font-semibold text-gray-900 mb-2">¡Todo en orden!</h4>
            <p class="text-gray-600">No hay acciones pendientes por ahora. Sigue así.</p>
          </div>
        </div>

        <!-- Footer con acciones -->
        <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <p class="text-xs text-gray-500">
              <span class="material-icons-outlined text-sm align-middle mr-1">info</span>
              Actualizado en tiempo real
            </p>
            <button (click)="cerrarModalInsights()"
                    class="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-sm hover:shadow-md">
              Entendido
            </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  // Estados de carga optimizados para UX médica
  isLoadingStats = true;
  isLoadingCitas = true;
  isLoadingResumen = true;

  // Estados de error para mejor UX
  errorStats: string | null = null;
  errorCitas: string | null = null;
  errorResumen: string | null = null;

  stats: DashboardStats | null = null;
  citas: CitaPreview[] | null = null;
  resumenIA: ResumenIA | null = null;
  mostrarModalInsights = false;

  ngOnInit(): void {
    // Tiempo a primer valor < 60 segundos según CLAUDE.md
    this.loadDashboardData();
  }

  getCurrentDate(): string {
    const today = new Date();
    return today.toLocaleDateString('es-HN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  calculateActiveTime(): string {
    // Calculate active time based on current time and working hours
    const now = new Date();
    const startWork = new Date();
    startWork.setHours(8, 0, 0, 0); // 8:00 AM
    
    if (now.getTime() < startWork.getTime()) {
      return '0';
    }
    
    const diffMs = now.getTime() - startWork.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    // Cap at reasonable work hours (10 hours = 600 minutes)
    return Math.min(diffMins, 600).toString();
  }

  retryStats(): void {
    this.isLoadingStats = true;
    this.errorStats = null;
    this.dashboardService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.isLoadingStats = false;
      },
      error: (error) => {
        console.error('Error cargando estadísticas:', error);
        this.errorStats = error.message || 'Error al cargar estadísticas';
        this.isLoadingStats = false;
      }
    });
  }

  retryCitas(): void {
    this.isLoadingCitas = true;
    this.errorCitas = null;
    this.dashboardService.getProximasCitas().subscribe({
      next: (citas) => {
        this.citas = citas;
        this.isLoadingCitas = false;
      },
      error: (error) => {
        console.error('Error cargando citas:', error);
        this.errorCitas = error.message || 'Error al cargar próximas citas';
        this.isLoadingCitas = false;
      }
    });
  }

  private loadDashboardData(): void {
    // Carga paralela para optimizar tiempo de respuesta

    // Estadísticas críticas (prioritarias)
    this.dashboardService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.isLoadingStats = false;
        this.errorStats = null;
      },
      error: (error) => {
        console.error('Error cargando estadísticas:', error);
        this.errorStats = error.message || 'Error al cargar estadísticas';
        this.isLoadingStats = false;
      }
    });

    // Próximas citas (alta prioridad)
    this.dashboardService.getProximasCitas().subscribe({
      next: (citas) => {
        this.citas = citas;
        this.isLoadingCitas = false;
        this.errorCitas = null;
      },
      error: (error) => {
        console.error('Error cargando citas:', error);
        this.errorCitas = error.message || 'Error al cargar próximas citas';
        this.isLoadingCitas = false;
      }
    });

    // Resumen IA (prioridad media) - Graceful fallback incluido en servicio
    this.dashboardService.getResumenIA().subscribe({
      next: (resumen) => {
        this.resumenIA = resumen;
        this.isLoadingResumen = false;
        this.errorResumen = null;
      },
      error: (error) => {
        console.error('Error cargando resumen IA:', error);
        this.errorResumen = error.message || 'Error al cargar resumen';
        this.isLoadingResumen = false;
      }
    });
  }

  abrirModalInsights(): void {
    if (this.resumenIA) {
      this.mostrarModalInsights = true;
    }
  }

  cerrarModalInsights(): void {
    this.mostrarModalInsights = false;
  }
} 