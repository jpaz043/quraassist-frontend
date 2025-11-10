import { Component, inject, OnInit, signal } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { TokensService } from '../tokens.service';

@Component({
  selector: 'app-pago-exito',
  standalone: true,
  imports: [NgIf, NgClass, RouterLink],
  template: `
    <div class="page-container">
      <div class="max-w-md mx-auto text-center py-12">
        <!-- Icono de éxito -->
        <div class="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-success-900 mb-8">
          <span class="material-icons-outlined text-4xl text-success-300">
            check_circle
          </span>
        </div>

        <!-- Título -->
        <h1 class="text-2xl font-bold text-gray-900 mb-4">
          ¡Pago Exitoso!
        </h1>
        
        <p class="text-gray-600 mb-8">
          Su compra de tokens se ha procesado correctamente
        </p>

        <!-- Detalles de la compra -->
        <div class="card-medical text-left mb-8">
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Tokens adquiridos:</span>
              <span class="text-gray-900 font-semibold">{{tokens()}} tokens</span>
            </div>
            
            <div class="flex justify-between items-center">
              <span class="text-gray-600">ID de transacción:</span>
              <span class="text-gray-900 font-mono text-sm">{{transactionId()}}</span>
            </div>
            
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Fecha:</span>
              <span class="text-gray-900">{{fechaActual}}</span>
            </div>

            <hr class="border-gray-200">
            
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Saldo actual:</span>
              <span class="text-primary-400 font-semibold text-lg">
                {{saldoActual()}} tokens
              </span>
            </div>
          </div>
        </div>

        <!-- Información adicional -->
        <div class="bg-primary-900 rounded-lg p-4 mb-8">
          <div class="flex items-start space-x-3">
            <span class="material-icons-outlined text-primary-300 mt-1">
              info
            </span>
            <div class="text-left">
              <h3 class="font-medium text-primary-200 mb-1">
                Tokens activados
              </h3>
              <p class="text-primary-300 text-sm">
                Sus tokens ya están disponibles para usar en consultas de IA médica.
                Puede verificar su saldo en cualquier momento desde el panel principal.
              </p>
            </div>
          </div>
        </div>

        <!-- Acciones -->
        <div class="space-y-3">
          <button routerLink="/dashboard" class="btn-primary w-full">
            Ir al Dashboard
          </button>
          
          <button routerLink="/tokens" class="btn-secondary w-full">
            Ver mis Tokens
          </button>
          
          <button (click)="descargarRecibo()" class="btn-ghost w-full">
            <span class="material-icons-outlined mr-2">download</span>
            Descargar Recibo
          </button>
        </div>

        <!-- Link al historial -->
        <p class="text-gray-500 text-sm mt-8">
          Puede ver el historial completo de sus compras en
          <a routerLink="/tokens/historial" class="text-primary-400 hover:text-primary-300">
            Historial de Compras
          </a>
        </p>
      </div>
    </div>
  `
})
export class ExitoComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private tokensService = inject(TokensService);

  tokens = signal<number>(0);
  transactionId = signal<string>('');
  saldoActual = signal<number>(0);
  fechaActual = new Date().toLocaleDateString('es-HN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  ngOnInit(): void {
    // Obtener parámetros de la URL
    const tokensParam = this.route.snapshot.queryParams['tokens'];
    const transactionParam = this.route.snapshot.queryParams['transactionId'];
    
    if (!tokensParam || !transactionParam) {
      this.router.navigate(['/tokens']);
      return;
    }

    this.tokens.set(parseInt(tokensParam));
    this.transactionId.set(transactionParam);

    // Obtener saldo actual
    this.tokensService.getSaldoTokens().subscribe(saldo => {
      this.saldoActual.set(saldo);
    });
  }

  descargarRecibo(): void {
    // Generar recibo PDF (implementación mock)
    const reciboData = {
      tokens: this.tokens(),
      transactionId: this.transactionId(),
      fecha: this.fechaActual,
      saldo: this.saldoActual()
    };

    // Simular descarga
    const blob = new Blob([JSON.stringify(reciboData, null, 2)], {
      type: 'application/json'
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recibo-tokens-${this.transactionId()}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}