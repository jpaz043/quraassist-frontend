import { Component, inject, OnInit, signal } from '@angular/core';
import { NgClass, NgIf, NgFor, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { StripeService, StripePaymentIntent, StripeCard, PaymentResult } from '../stripe/stripe.service';
import { TokensService } from '../tokens.service';

@Component({
  selector: 'app-pago',
  standalone: true,
  imports: [NgClass, NgIf, NgFor, ReactiveFormsModule, FormsModule, RouterLink, CurrencyPipe],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Finalizar Compra</h1>
          <p class="page-subtitle">Complete su compra de tokens con seguridad</p>
        </div>
        <button routerLink="/tokens" class="btn-secondary">
          Cancelar
        </button>
      </div>

      <!-- Resumen de compra -->
      <div class="card-medical">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Resumen de Compra</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center p-4 bg-white rounded-lg">
            <div>
              <h4 class="font-medium text-gray-900">{{paqueteSeleccionado()?.nombre}}</h4>
              <p class="text-sm text-gray-600">{{paqueteSeleccionado()?.tokens}} tokens</p>
            </div>
            <div class="text-right">
              <p class="text-lg font-semibold text-gray-900">{{paqueteSeleccionado()?.precio | currency:'L '}}</p>
              <p class="text-sm text-gray-600">Lempiras hondureñas</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Métodos de pago -->
      <div class="card-medical">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Método de Pago</h3>
        
        <!-- Selector de método -->
        <div class="space-y-3 mb-6">
          <label class="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="metodo"
              value="tarjeta_guardada"
              [(ngModel)]="metodoSeleccionado"
              class="text-primary-500 bg-white border-gray-300"
              [disabled]="!tarjetasGuardadas() || tarjetasGuardadas()!.length === 0"
            >
            <span class="text-gray-900">Usar tarjeta guardada</span>
          </label>
          
          <label class="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="metodo"
              value="nueva_tarjeta"
              [(ngModel)]="metodoSeleccionado"
              class="text-primary-500 bg-white border-gray-300"
            >
            <span class="text-gray-900">Nueva tarjeta</span>
          </label>
        </div>

        <!-- Tarjetas guardadas -->
        <div *ngIf="metodoSeleccionado === 'tarjeta_guardada' && tarjetasGuardadas() && tarjetasGuardadas()!.length > 0" 
             class="space-y-3 mb-6">
          <h4 class="font-medium text-gray-700">Seleccione una tarjeta:</h4>
          <div class="space-y-2">
            <label *ngFor="let tarjeta of tarjetasGuardadas()" 
                   class="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors"
                   [class.border-primary-500]="tarjetaSeleccionada === tarjeta.id"
                   [class.bg-primary-900]="tarjetaSeleccionada === tarjeta.id">
              <input
                type="radio"
                name="tarjeta"
                [value]="tarjeta.id"
                [(ngModel)]="tarjetaSeleccionada"
                class="text-primary-500 bg-white border-gray-300 mr-3"
              >
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center space-x-3">
                  <span class="material-icons-outlined text-gray-600">
                    {{stripeService.obtenerIconoMarca(tarjeta.brand)}}
                  </span>
                  <div>
                    <p class="font-medium text-gray-900">
                      •••• •••• •••• {{tarjeta.last4}}
                    </p>
                    <p class="text-sm text-gray-600">
                      {{tarjeta.brand.toUpperCase()}} • Exp: {{tarjeta.expMonth}}/{{tarjeta.expYear}}
                    </p>
                  </div>
                </div>
                <span *ngIf="tarjeta.isDefault" 
                      class="px-2 py-1 bg-success-900 text-success-200 text-xs rounded">
                  Predeterminada
                </span>
              </div>
            </label>
          </div>
        </div>

        <!-- Formulario nueva tarjeta -->
        <div *ngIf="metodoSeleccionado === 'nueva_tarjeta'">
          <form [formGroup]="tarjetaForm" class="space-y-6">
            <!-- Número de tarjeta -->
            <div class="form-group">
              <label class="form-label">Número de tarjeta</label>
              <input
                type="text"
                formControlName="numero"
                class="input-medical w-full"
                [class.border-error-500]="showError('numero')"
                placeholder="1234 5678 9012 3456"
                maxlength="19"
                (input)="formatearNumero($event)"
              >
              <p *ngIf="showError('numero')" class="form-error">
                Número de tarjeta inválido
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Mes -->
              <div class="form-group">
                <label class="form-label">Mes</label>
                <select
                  formControlName="expMonth"
                  class="input-medical w-full"
                  [class.border-error-500]="showError('expMonth')"
                >
                  <option value="">MM</option>
                  <option *ngFor="let mes of meses" [value]="mes.value">{{mes.label}}</option>
                </select>
              </div>

              <!-- Año -->
              <div class="form-group">
                <label class="form-label">Año</label>
                <select
                  formControlName="expYear"
                  class="input-medical w-full"
                  [class.border-error-500]="showError('expYear')"
                >
                  <option value="">AAAA</option>
                  <option *ngFor="let year of years" [value]="year">{{year}}</option>
                </select>
              </div>

              <!-- CVC -->
              <div class="form-group">
                <label class="form-label">CVC</label>
                <input
                  type="text"
                  formControlName="cvc"
                  class="input-medical w-full"
                  [class.border-error-500]="showError('cvc')"
                  placeholder="123"
                  maxlength="4"
                >
              </div>
            </div>

            <!-- Nombre del titular -->
            <div class="form-group">
              <label class="form-label">Nombre del titular</label>
              <input
                type="text"
                formControlName="holderName"
                class="input-medical w-full"
                [class.border-error-500]="showError('holderName')"
                placeholder="Juan Pérez"
              >
            </div>

            <!-- Guardar tarjeta -->
            <div class="flex items-center">
              <input
                type="checkbox"
                formControlName="guardarTarjeta"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 bg-white rounded"
              >
              <label class="ml-2 text-sm text-gray-700">
                Guardar esta tarjeta para futuras compras
              </label>
            </div>
          </form>
        </div>
      </div>

      <!-- Error -->
      <div *ngIf="error()" class="card-medical border-error-500">
        <div class="flex items-center space-x-3">
          <span class="material-icons-outlined text-error-400">error</span>
          <p class="text-error-400">{{error()}}</p>
        </div>
      </div>

      <!-- Procesando pago -->
      <div *ngIf="procesandoPago()" class="card-medical">
        <div class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Procesando pago...</h3>
          <p class="text-gray-600">Por favor no cierre esta ventana</p>
        </div>
      </div>

      <!-- Botón pagar -->
      <div class="flex justify-end space-x-3">
        <button
          routerLink="/tokens"
          class="btn-secondary"
          [disabled]="procesandoPago()"
        >
          Cancelar
        </button>
        
        <button
          (click)="procesarPago()"
          [disabled]="!puedeProceserPago() || procesandoPago()"
          class="btn-primary"
          [class.opacity-50]="!puedeProceserPago() || procesandoPago()"
        >
          <span *ngIf="!procesandoPago()">
            Pagar {{paqueteSeleccionado()?.precio | currency:'L '}}
          </span>
          <span *ngIf="procesandoPago()">
            Procesando...
          </span>
        </button>
      </div>
    </div>
  `
})
export class PagoComponent implements OnInit {
  private fb = inject(FormBuilder);
  stripeService = inject(StripeService);
  private tokensService = inject(TokensService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Signals
  paqueteSeleccionado = signal<any>(null);
  tarjetasGuardadas = signal<StripeCard[] | null>(null);
  paymentIntent = signal<StripePaymentIntent | null>(null);
  procesandoPago = signal(false);
  error = signal<string | null>(null);

  // Form state
  metodoSeleccionado = 'tarjeta_guardada';
  tarjetaSeleccionada = '';
  tarjetaForm: FormGroup;

  // Datos para formulario
  meses = [
    { value: 1, label: '01 - Enero' },
    { value: 2, label: '02 - Febrero' },
    { value: 3, label: '03 - Marzo' },
    { value: 4, label: '04 - Abril' },
    { value: 5, label: '05 - Mayo' },
    { value: 6, label: '06 - Junio' },
    { value: 7, label: '07 - Julio' },
    { value: 8, label: '08 - Agosto' },
    { value: 9, label: '09 - Septiembre' },
    { value: 10, label: '10 - Octubre' },
    { value: 11, label: '11 - Noviembre' },
    { value: 12, label: '12 - Diciembre' }
  ];

  years: number[] = [];

  constructor() {
    this.tarjetaForm = this.fb.group({
      numero: ['', [Validators.required, Validators.pattern(/^\d{13,19}$/)]],
      expMonth: ['', [Validators.required]],
      expYear: ['', [Validators.required]],
      cvc: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      holderName: ['', [Validators.required, Validators.minLength(2)]],
      guardarTarjeta: [false]
    });

    // Generar años (actual + 15 años)
    const currentYear = new Date().getFullYear();
    for (let i = 0; i <= 15; i++) {
      this.years.push(currentYear + i);
    }
  }

  ngOnInit(): void {
    // Obtener datos del paquete seleccionado
    const paqueteId = this.route.snapshot.queryParams['paquete'];
    if (!paqueteId) {
      this.router.navigate(['/tokens']);
      return;
    }

    this.cargarDatosPago(paqueteId);
  }

  cargarDatosPago(paqueteId: string): void {
    // Cargar paquete seleccionado
    this.tokensService.getPaquetes().subscribe(paquetes => {
      const paquete = paquetes.find(p => p.id === paqueteId);
      if (!paquete) {
        this.router.navigate(['/tokens']);
        return;
      }
      
      this.paqueteSeleccionado.set(paquete);
      
      // Crear PaymentIntent
      this.stripeService.crearPaymentIntent(paqueteId, paquete.tokens, paquete.precio)
        .subscribe(intent => {
          this.paymentIntent.set(intent);
        });
    });

    // Cargar tarjetas guardadas
    this.stripeService.obtenerTarjetasGuardadas().subscribe({
      next: (tarjetas) => {
        this.tarjetasGuardadas.set(tarjetas);
        if (tarjetas.length > 0) {
          // Seleccionar tarjeta predeterminada
          const defaultCard = tarjetas.find(t => t.isDefault);
          this.tarjetaSeleccionada = defaultCard?.id || tarjetas[0].id;
        } else {
          this.metodoSeleccionado = 'nueva_tarjeta';
        }
      },
      error: () => {
        this.tarjetasGuardadas.set([]);
        this.metodoSeleccionado = 'nueva_tarjeta';
      }
    });
  }

  formatearNumero(event: any): void {
    const input = event.target;
    let value = input.value.replace(/\s/g, '');
    const formattedValue = this.stripeService.formatearNumeroTarjeta(value);
    input.value = formattedValue;
    this.tarjetaForm.patchValue({ numero: value });
  }

  showError(field: string): boolean {
    const control = this.tarjetaForm.get(field);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  puedeProceserPago(): boolean {
    const intent = this.paymentIntent();
    if (!intent) return false;

    if (this.metodoSeleccionado === 'tarjeta_guardada') {
      return !!this.tarjetaSeleccionada;
    } else {
      return this.tarjetaForm.valid;
    }
  }

  procesarPago(): void {
    if (!this.puedeProceserPago()) return;

    this.procesandoPago.set(true);
    this.error.set(null);

    const intent = this.paymentIntent()!;

    if (this.metodoSeleccionado === 'tarjeta_guardada') {
      this.pagarConTarjetaGuardada(intent);
    } else {
      this.pagarConNuevaTarjeta(intent);
    }
  }

  private pagarConTarjetaGuardada(intent: StripePaymentIntent): void {
    this.stripeService.confirmarPagoConTarjeta(
      intent.id,
      intent.clientSecret,
      this.tarjetaSeleccionada
    ).subscribe({
      next: (result) => this.manejarResultadoPago(result),
      error: (err) => this.manejarErrorPago(err)
    });
  }

  private pagarConNuevaTarjeta(intent: StripePaymentIntent): void {
    const formData = this.tarjetaForm.value;
    const cardData = {
      number: formData.numero.replace(/\s/g, ''),
      expMonth: formData.expMonth,
      expYear: formData.expYear,
      cvc: formData.cvc,
      holderName: formData.holderName
    };

    this.stripeService.procesarPagoConNuevaTarjeta(
      intent.id,
      intent.clientSecret,
      cardData
    ).subscribe({
      next: (result) => {
        if (result.success && formData.guardarTarjeta) {
          // Guardar tarjeta para futuras compras
          this.stripeService.agregarTarjeta(cardData).subscribe();
        }
        this.manejarResultadoPago(result);
      },
      error: (err) => this.manejarErrorPago(err)
    });
  }

  private manejarResultadoPago(result: PaymentResult): void {
    if (result.success) {
      // Pago exitoso - registrar compra en backend
      const paquete = this.paqueteSeleccionado()!;

      // Llamar al backend para registrar la compra de tokens
      this.tokensService.comprarTokens(paquete.tipo, 'stripe').subscribe({
        next: (purchaseResult) => {
          // Navegar a página de éxito con información de la compra
          this.router.navigate(['/tokens/exito'], {
            queryParams: {
              tokens: purchaseResult.tokensAdded,
              transactionId: purchaseResult.transactionId,
              newBalance: purchaseResult.newBalance
            }
          });
        },
        error: (err) => {
          console.error('Error registering token purchase:', err);
          this.error.set('Pago procesado pero hubo un error registrando los tokens. Contacte soporte.');
          this.procesandoPago.set(false);
        }
      });
    } else {
      this.error.set(result.error || 'Error procesando el pago');
      this.procesandoPago.set(false);
    }
  }

  private manejarErrorPago(error: any): void {
    this.error.set(error.message || 'Error de conexión. Intente nuevamente.');
    this.procesandoPago.set(false);
  }
}