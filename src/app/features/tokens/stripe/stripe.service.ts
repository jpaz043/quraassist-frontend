import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';

export interface StripePaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'succeeded' | 'processing' | 'requires_confirmation';
  metadata: {
    paqueteId: string;
    medicoId: string;
    cantidad: number;
  };
}

export interface StripeCard {
  id: string;
  brand: string; // 'visa', 'mastercard', 'amex'
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export interface StripeCustomer {
  id: string;
  email: string;
  name: string;
  cards: StripeCard[];
  defaultPaymentMethod?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId: string;
  transactionId: string;
  amount: number;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private apiUrl = 'https://api.stripe.com/v1'; // En producción sería tu backend
  private stripe: any; // Stripe instance
  private isInitialized = false;

  // Mock data para desarrollo
  private mockCustomer: StripeCustomer = {
    id: 'cus_mockCustomer123',
    email: 'doctor@platformdoctor.hn',
    name: 'Dr. Juan Pérez',
    cards: [
      {
        id: 'card_visa123',
        brand: 'visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2027,
        isDefault: true
      },
      {
        id: 'card_master456',
        brand: 'mastercard',
        last4: '5555',
        expMonth: 8,
        expYear: 2026,
        isDefault: false
      }
    ],
    defaultPaymentMethod: 'card_visa123'
  };

  constructor() {
    this.initializeStripe();
  }

  private async initializeStripe(): Promise<void> {
    try {
      // En producción cargarías Stripe desde CDN
      // const stripe = await loadStripe('pk_test_...');
      // this.stripe = stripe;
      
      // Mock para desarrollo
      this.stripe = {
        createPaymentMethod: this.mockCreatePaymentMethod.bind(this),
        confirmCardPayment: this.mockConfirmCardPayment.bind(this),
        elements: () => ({
          create: () => ({
            mount: () => {},
            on: () => {},
            unmount: () => {}
          })
        })
      };
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Error inicializando Stripe:', error);
    }
  }

  // Crear PaymentIntent para compra de tokens
  crearPaymentIntent(paqueteId: string, cantidad: number, precio: number): Observable<StripePaymentIntent> {
    // En producción esto llamaría a tu backend
    const paymentIntent: StripePaymentIntent = {
      id: `pi_${Date.now()}_mock`,
      clientSecret: `pi_${Date.now()}_mock_secret_${Math.random().toString(36).substr(2, 9)}`,
      amount: precio * 100, // Stripe maneja centavos
      currency: 'hnl', // Lempiras hondureñas
      status: 'requires_payment_method',
      metadata: {
        paqueteId,
        medicoId: 'medico_123', // En producción vendría del auth
        cantidad
      }
    };

    return of(paymentIntent).pipe(delay(800));
  }

  // Confirmar pago con tarjeta existente
  confirmarPagoConTarjeta(
    paymentIntentId: string, 
    clientSecret: string, 
    cardId: string
  ): Observable<PaymentResult> {
    return this.mockProcessPayment(paymentIntentId, clientSecret, cardId);
  }

  // Procesar pago con nueva tarjeta
  procesarPagoConNuevaTarjeta(
    paymentIntentId: string,
    clientSecret: string,
    cardData: {
      number: string;
      expMonth: number;
      expYear: number;
      cvc: string;
      holderName: string;
    }
  ): Observable<PaymentResult> {
    // Validar datos de tarjeta
    const validation = this.validarTarjeta(cardData);
    if (!validation.valid) {
      return throwError(() => new Error(validation.error));
    }

    return this.mockProcessPayment(paymentIntentId, clientSecret, 'new_card', cardData);
  }

  // Obtener tarjetas guardadas del cliente
  obtenerTarjetasGuardadas(): Observable<StripeCard[]> {
    return of(this.mockCustomer.cards).pipe(delay(500));
  }

  // Agregar nueva tarjeta y guardarla
  agregarTarjeta(cardData: {
    number: string;
    expMonth: number;
    expYear: number;
    cvc: string;
    holderName: string;
  }): Observable<StripeCard> {
    const validation = this.validarTarjeta(cardData);
    if (!validation.valid) {
      return throwError(() => new Error(validation.error));
    }

    const nuevaTarjeta: StripeCard = {
      id: `card_${Date.now()}`,
      brand: this.detectarMarcaTarjeta(cardData.number),
      last4: cardData.number.slice(-4),
      expMonth: cardData.expMonth,
      expYear: cardData.expYear,
      isDefault: this.mockCustomer.cards.length === 0
    };

    this.mockCustomer.cards.push(nuevaTarjeta);
    return of(nuevaTarjeta).pipe(delay(1000));
  }

  // Eliminar tarjeta guardada
  eliminarTarjeta(cardId: string): Observable<void> {
    const index = this.mockCustomer.cards.findIndex(card => card.id === cardId);
    if (index === -1) {
      return throwError(() => new Error('Tarjeta no encontrada'));
    }

    this.mockCustomer.cards.splice(index, 1);
    return of(void 0).pipe(delay(600));
  }

  // Establecer tarjeta como predeterminada
  establecerTarjetaPredeterminada(cardId: string): Observable<void> {
    const tarjeta = this.mockCustomer.cards.find(card => card.id === cardId);
    if (!tarjeta) {
      return throwError(() => new Error('Tarjeta no encontrada'));
    }

    // Quitar default de todas las tarjetas
    this.mockCustomer.cards.forEach(card => card.isDefault = false);
    // Establecer nueva tarjeta predeterminada
    tarjeta.isDefault = true;
    this.mockCustomer.defaultPaymentMethod = cardId;

    return of(void 0).pipe(delay(400));
  }

  // Obtener información del cliente
  obtenerInformacionCliente(): Observable<StripeCustomer> {
    return of(this.mockCustomer).pipe(delay(300));
  }

  // --- Métodos Mock para Desarrollo ---

  private mockProcessPayment(
    paymentIntentId: string, 
    clientSecret: string, 
    cardId: string,
    cardData?: any
  ): Observable<PaymentResult> {
    // Simular diferentes resultados
    const random = Math.random();
    
    if (random < 0.05) {
      // 5% de probabilidad de fallo
      return of({
        success: false,
        paymentIntentId,
        transactionId: '',
        amount: 0,
        error: 'Pago rechazado por el banco. Verifique sus datos.'
      }).pipe(delay(2000));
    }

    if (random < 0.1) {
      // 5% de probabilidad de error de procesamiento
      return throwError(() => new Error('Error de red. Intente nuevamente.'));
    }

    // 90% de probabilidad de éxito
    return of({
      success: true,
      paymentIntentId,
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: 1500, // Mock amount
      error: undefined
    }).pipe(delay(1500));
  }

  private mockCreatePaymentMethod(cardData: any): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          paymentMethod: {
            id: `pm_${Date.now()}_mock`,
            card: {
              brand: this.detectarMarcaTarjeta(cardData.number),
              last4: cardData.number.slice(-4)
            }
          }
        });
      }, 800);
    });
  }

  private mockConfirmCardPayment(clientSecret: string, paymentMethod: any): Promise<any> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const random = Math.random();
        if (random < 0.1) {
          reject(new Error('Pago rechazado'));
        } else {
          resolve({
            paymentIntent: {
              status: 'succeeded',
              id: `pi_${Date.now()}_success`
            }
          });
        }
      }, 2000);
    });
  }

  private validarTarjeta(cardData: {
    number: string;
    expMonth: number;
    expYear: number;
    cvc: string;
    holderName: string;
  }): { valid: boolean; error?: string } {
    
    // Validar número de tarjeta (algoritmo de Luhn simplificado)
    const numero = cardData.number.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(numero)) {
      return { valid: false, error: 'Número de tarjeta inválido' };
    }

    // Validar fecha de expiración
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    if (cardData.expYear < currentYear || 
        (cardData.expYear === currentYear && cardData.expMonth < currentMonth)) {
      return { valid: false, error: 'Tarjeta expirada' };
    }

    // Validar CVC
    if (!/^\d{3,4}$/.test(cardData.cvc)) {
      return { valid: false, error: 'CVC inválido' };
    }

    // Validar nombre del titular
    if (!cardData.holderName || cardData.holderName.trim().length < 2) {
      return { valid: false, error: 'Nombre del titular requerido' };
    }

    return { valid: true };
  }

  private detectarMarcaTarjeta(numero: string): string {
    const num = numero.replace(/\s/g, '');
    
    if (/^4/.test(num)) return 'visa';
    if (/^5[1-5]/.test(num)) return 'mastercard';
    if (/^3[47]/.test(num)) return 'amex';
    if (/^6/.test(num)) return 'discover';
    
    return 'unknown';
  }

  // Utilidades para formatear números de tarjeta
  formatearNumeroTarjeta(numero: string): string {
    return numero.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
  }

  obtenerIconoMarca(marca: string): string {
    const iconos: Record<string, string> = {
      'visa': 'credit_card',
      'mastercard': 'credit_card',
      'amex': 'credit_card',
      'discover': 'credit_card',
      'unknown': 'credit_card'
    };
    return iconos[marca] || 'credit_card';
  }

  obtenerColorMarca(marca: string): string {
    const colores: Record<string, string> = {
      'visa': 'text-blue-500',
      'mastercard': 'text-red-500',
      'amex': 'text-green-500',
      'discover': 'text-orange-500',
      'unknown': 'text-gray-500'
    };
    return colores[marca] || 'text-gray-500';
  }
}