import { Component, OnInit, inject } from '@angular/core';
import { NgClass, NgIf, NgFor, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { TokensService, TokenPaquete, TokenTransaccion, TokenEstadisticas } from './tokens.service';

@Component({
  selector: 'app-tokens',
  standalone: true,
  imports: [NgClass, NgIf, NgFor, DatePipe],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">
            Tokens
          </h1>
          <p class="page-subtitle">
            Gestione sus tokens para recordatorios y mensajes
          </p>
        </div>
      </div>

      <!-- Estadísticas -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Loading state -->
        <div *ngIf="isLoadingStats" class="animate-pulse" [ngClass]="{'lg:col-span-4': !stats}">
          <div class="h-24 bg-gray-100 rounded-xl"></div>
        </div>

        <!-- Stats -->
        <ng-container *ngIf="!isLoadingStats && stats">
          <!-- Tokens Disponibles -->
          <div class="card-medical">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm font-medium text-gray-700">Tokens Disponibles</p>
                <p class="mt-2 text-3xl font-semibold text-gray-900">
                  {{stats.disponibles}}
                </p>
              </div>
              <div class="p-2 bg-primary-900 rounded-full">
                <span class="material-icons-outlined text-primary-300">toll</span>
              </div>
            </div>
          </div>

          <!-- Usados Hoy -->
          <div class="card-medical">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm font-medium text-gray-700">Usados Hoy</p>
                <p class="mt-2 text-3xl font-semibold text-gray-900">
                  {{stats.usadosHoy}}
                </p>
              </div>
              <div class="p-2 bg-primary-900 rounded-full">
                <span class="material-icons-outlined text-primary-300">today</span>
              </div>
            </div>
          </div>

          <!-- Usados este Mes -->
          <div class="card-medical">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm font-medium text-gray-700">Usados este Mes</p>
                <p class="mt-2 text-3xl font-semibold text-gray-900">
                  {{stats.usadosMes}}
                </p>
              </div>
              <div class="p-2 bg-primary-900 rounded-full">
                <span class="material-icons-outlined text-primary-300">calendar_month</span>
              </div>
            </div>
          </div>

          <!-- Promedio Mensual -->
          <div class="card-medical">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-sm font-medium text-gray-700">Promedio Mensual</p>
                <p class="mt-2 text-3xl font-semibold text-gray-900">
                  {{stats.promedioMensual}}
                </p>
              </div>
              <div class="p-2 bg-primary-900 rounded-full">
                <span class="material-icons-outlined text-primary-300">analytics</span>
              </div>
            </div>
          </div>
        </ng-container>
      </div>

      <!-- Paquetes -->
      <div class="card-medical">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">
          Comprar Tokens
        </h2>

        <!-- Loading state -->
        <div *ngIf="isLoadingPaquetes" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="animate-pulse" *ngFor="let i of [1,2,3]">
            <div class="h-64 bg-gray-100 rounded-xl"></div>
          </div>
        </div>

        <!-- Paquetes grid -->
        <div *ngIf="!isLoadingPaquetes && paquetes" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div *ngFor="let paquete of paquetes" 
               class="relative flex flex-col p-6 bg-gray-100 border rounded-xl shadow-sm"
               [class.border-primary-500]="paquete.popular"
               [class.border-gray-300]="!paquete.popular">
            <!-- Popular badge -->
            <div *ngIf="paquete.popular" 
                 class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary-500 text-gray-900 text-sm font-medium rounded-full">
              Más Popular
            </div>

            <!-- Header -->
            <div class="text-center mb-6">
              <h3 class="text-xl font-semibold text-gray-900">
                {{paquete.nombre}}
              </h3>
              <div class="mt-2">
                <span class="text-4xl font-bold text-gray-900">L.{{paquete.precio}}</span>
              </div>
            </div>

            <!-- Features -->
            <ul class="space-y-4 flex-1">
              <li class="flex items-center">
                <span class="material-icons-outlined text-success-400 mr-2">toll</span>
                <span class="text-gray-700">{{paquete.tokens}} tokens</span>
              </li>
              <li class="flex items-center">
                <span class="material-icons-outlined text-success-400 mr-2">check_circle</span>
                <span class="text-gray-700">Sin vencimiento</span>
              </li>
              <li class="flex items-center">
                <span class="material-icons-outlined text-success-400 mr-2">check_circle</span>
                <span class="text-gray-700">Uso inmediato</span>
              </li>
              <li *ngIf="paquete.ahorro" class="flex items-center">
                <span class="material-icons-outlined text-success-400 mr-2">savings</span>
                <span class="text-gray-700">Ahorro: {{paquete.ahorro}}%</span>
              </li>
            </ul>

            <!-- Action -->
            <button
              (click)="comprarPaquete(paquete)"
              [disabled]="isComprando"
              class="mt-6 w-full btn-primary"
              [class.opacity-50]="isComprando"
            >
              <span *ngIf="!isComprando">Comprar Ahora</span>
              <span *ngIf="isComprando">Procesando...</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Historial -->
      <div class="card-medical">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">
          Historial de Transacciones
        </h2>

        <!-- Loading state -->
        <div *ngIf="isLoadingTransacciones" class="space-y-4">
          <div class="animate-pulse" *ngFor="let i of [1,2,3]">
            <div class="h-16 bg-gray-100 rounded-xl"></div>
          </div>
        </div>

        <!-- Empty state -->
        <div *ngIf="!isLoadingTransacciones && (!transacciones || transacciones.length === 0)" 
             class="text-center py-12">
          <div class="p-3 bg-primary-900 rounded-full inline-block mb-4">
            <span class="material-icons-outlined text-3xl text-primary-300">receipt_long</span>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            No hay transacciones
          </h3>
          <p class="text-gray-600">
            Aún no ha realizado ninguna transacción
          </p>
        </div>

        <!-- Transactions list -->
        <div *ngIf="!isLoadingTransacciones && transacciones && transacciones.length > 0" 
             class="space-y-4">
          <div *ngFor="let transaccion of transacciones" 
               class="flex items-center justify-between p-4 bg-gray-100 rounded-xl hover:bg-gray-600 transition-colors">
            <div class="flex items-center space-x-4">
              <div class="h-10 w-10 rounded-full flex items-center justify-center"
                   [class.bg-success-900]="transaccion.tipo === 'compra'"
                   [class.bg-primary-900]="transaccion.tipo === 'uso'">
                <span class="material-icons-outlined"
                      [class.text-success-300]="transaccion.tipo === 'compra'"
                      [class.text-primary-300]="transaccion.tipo === 'uso'">
                  {{transaccion.tipo === 'compra' ? 'add_circle' : 'remove_circle'}}
                </span>
              </div>
              <div>
                <p class="font-medium text-gray-900">
                  {{transaccion.descripcion}}
                </p>
                <p class="text-sm text-gray-600">
                  {{transaccion.createdAt | date:'medium'}}
                </p>
              </div>
            </div>
            <div>
              <span class="text-lg font-semibold"
                    [class.text-success-400]="transaccion.tipo === 'compra'"
                    [class.text-error-400]="transaccion.tipo === 'uso'">
                {{transaccion.tipo === 'compra' ? '+' : ''}}{{transaccion.cantidad}}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TokensComponent implements OnInit {
  private tokensService = inject(TokensService);
  private router = inject(Router);

  isLoadingStats = true;
  isLoadingPaquetes = true;
  isLoadingTransacciones = true;
  isComprando = false;

  stats: TokenEstadisticas | null = null;
  paquetes: TokenPaquete[] | null = null;
  transacciones: TokenTransaccion[] | null = null;

  ngOnInit(): void {
    // Cargar estadísticas
    this.tokensService.getEstadisticas().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.isLoadingStats = false;
      },
      error: () => {
        this.isLoadingStats = false;
      }
    });

    // Cargar paquetes
    this.tokensService.getPaquetes().subscribe({
      next: (paquetes) => {
        this.paquetes = paquetes;
        this.isLoadingPaquetes = false;
      },
      error: () => {
        this.isLoadingPaquetes = false;
      }
    });

    // Cargar transacciones
    this.tokensService.getTransacciones().subscribe({
      next: (transacciones) => {
        this.transacciones = transacciones;
        this.isLoadingTransacciones = false;
      },
      error: () => {
        this.isLoadingTransacciones = false;
      }
    });
  }

  comprarPaquete(paquete: TokenPaquete): void {
    // Navegar al componente de pago con Stripe
    this.router.navigate(['/tokens/pago'], {
      queryParams: { paquete: paquete.id }
    });
  }
} 