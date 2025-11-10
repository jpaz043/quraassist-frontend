import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TokenService } from '../../../core/services/token.service';

@Component({
  selector: 'app-token-alert',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Alert cuando tokens están bajos (< 10) -->
    <div *ngIf="showLowTokenAlert"
         class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded-r-lg shadow-sm">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3 flex-1">
          <h3 class="text-sm font-medium text-yellow-800">
            Saldo de tokens bajo
          </h3>
          <div class="mt-2 text-sm text-yellow-700">
            <p>
              Te quedan <span class="font-bold">{{ currentBalance }}</span> tokens disponibles.
              Considera recargar para continuar enviando mensajes y usando el asistente de IA.
            </p>
          </div>
          <div class="mt-4">
            <div class="-mx-2 -my-1.5 flex">
              <a [routerLink]="['/tokens']"
                 class="rounded-md bg-yellow-50 px-3 py-2 text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-yellow-50 transition-colors">
                Ver paquetes
              </a>
              <button type="button"
                      (click)="dismissAlert()"
                      class="ml-3 rounded-md bg-yellow-50 px-3 py-2 text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-yellow-50 transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Alert crítico cuando no hay tokens (0) -->
    <div *ngIf="showCriticalAlert"
         class="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded-r-lg shadow-sm">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3 flex-1">
          <h3 class="text-sm font-medium text-red-800">
            Sin tokens disponibles
          </h3>
          <div class="mt-2 text-sm text-red-700">
            <p>
              No tienes tokens disponibles. Recarga tu cuenta para continuar enviando recordatorios
              por WhatsApp y usando el asistente de IA.
            </p>
          </div>
          <div class="mt-4">
            <a [routerLink]="['/tokens']"
               class="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition-colors">
              Recargar tokens ahora
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class TokenAlertComponent implements OnInit, OnDestroy {
  private readonly tokenService = inject(TokenService);
  private readonly destroy$ = new Subject<void>();

  currentBalance = 0;
  showLowTokenAlert = false;
  showCriticalAlert = false;
  private alertDismissed = false;

  ngOnInit(): void {
    this.tokenService.tokenBalance$
      .pipe(takeUntil(this.destroy$))
      .subscribe(balance => {
        if (balance) {
          this.currentBalance = balance.disponibles;
          this.updateAlertState();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateAlertState(): void {
    // No mostrar alerta si el usuario la cerró manualmente
    if (this.alertDismissed) {
      return;
    }

    // Alert crítico cuando no hay tokens
    if (this.currentBalance === 0) {
      this.showCriticalAlert = true;
      this.showLowTokenAlert = false;
      return;
    }

    // Alert de advertencia cuando quedan menos de 10 tokens
    if (this.currentBalance < 10 && this.currentBalance > 0) {
      this.showLowTokenAlert = true;
      this.showCriticalAlert = false;
      return;
    }

    // Ocultar alertas si hay suficientes tokens
    this.showLowTokenAlert = false;
    this.showCriticalAlert = false;
  }

  dismissAlert(): void {
    this.alertDismissed = true;
    this.showLowTokenAlert = false;
    this.showCriticalAlert = false;

    // Resetear el flag después de 1 hora para volver a mostrar la alerta
    setTimeout(() => {
      this.alertDismissed = false;
      this.updateAlertState();
    }, 60 * 60 * 1000); // 1 hour
  }
}
