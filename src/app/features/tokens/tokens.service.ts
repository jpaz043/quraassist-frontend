import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { TokenService } from '../../core/services/token.service';
import { TokenPackage, TokenTransaction, TokenBalance, TokenPurchaseResult } from '../../core/models';

// Interfaces para compatibilidad con componentes existentes
export interface TokenPaquete {
  id: string;
  nombre: string;
  tipo: 'basico' | 'profesional' | 'premium' | 'empresarial' | 'emergencia';
  tokens: number;
  precio: number;
  descripcion: string;
  popular?: boolean;
  ahorro?: number;
  validezDias?: number;
}

export interface TokenTransaccion {
  id: string;
  tipo: 'compra' | 'uso' | 'regalo' | 'expiracion' | 'reembolso';
  cantidad: number;
  descripcion: string;
  pacienteRelacionado?: string;
  metodoPago?: string;
  referencia?: string;
  createdAt: string;
}

export interface TokenEstadisticas {
  disponibles: number;
  usadosHoy: number;
  usadosMes: number;
  promedioMensual: number;
  proximoVencimiento?: string;
  tokensVencimiento?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TokensService {
  private readonly tokenService = inject(TokenService);

  /**
   * Obtener paquetes de tokens desde el backend
   */
  getPaquetes(): Observable<TokenPaquete[]> {
    return this.tokenService.getTokenPackages().pipe(
      map(packages => packages.map(pkg => this.mapPackageToLocal(pkg)))
    );
  }

  /**
   * Obtener transacciones de tokens desde el backend
   */
  getTransacciones(page: number = 1, limit: number = 20): Observable<TokenTransaccion[]> {
    return this.tokenService.getTokenTransactions(page, limit).pipe(
      map(response => response.data.map(tx => this.mapTransactionToLocal(tx)))
    );
  }

  /**
   * Obtener estadísticas de tokens desde el backend
   */
  getEstadisticas(): Observable<TokenEstadisticas> {
    return this.tokenService.getTokenBalance().pipe(
      map(balance => this.mapBalanceToStats(balance))
    );
  }

  /**
   * Comprar tokens - llama al backend para registrar la compra
   */
  comprarTokens(
    packageType: 'basico' | 'profesional' | 'premium' | 'empresarial' | 'emergencia',
    metodoPago: string
  ): Observable<TokenPurchaseResult> {
    return this.tokenService.purchaseTokens({ packageType, metodoPago });
  }

  /**
   * Usar un token
   */
  usarToken(descripcion: string, paciente?: string): Observable<{
    transaccion: TokenTransaccion;
    tokensRestantes: number;
  }> {
    return this.tokenService.consumeTokens({
      cantidad: 1,
      concepto: descripcion
    }).pipe(
      map(result => ({
        transaccion: {
          id: 'new',
          tipo: 'uso' as const,
          cantidad: -1,
          descripcion,
          pacienteRelacionado: paciente,
          createdAt: new Date().toISOString()
        },
        tokensRestantes: result.newBalance
      }))
    );
  }

  /**
   * Obtener historial de uso por período
   */
  getHistorialUso(fechaInicio: string, fechaFin: string): Observable<{
    totalUsados: number;
    porDia: { fecha: string; cantidad: number }[];
    porTipo: { tipo: string; cantidad: number }[];
    pacientesMasContactados: { nombre: string; cantidad: number }[];
  }> {
    return this.getTransacciones(1, 100).pipe(
      map(transacciones => {
        const transaccionesEnRango = transacciones.filter(t =>
          t.createdAt >= fechaInicio && t.createdAt <= fechaFin && t.tipo === 'uso'
        );

        const totalUsados = transaccionesEnRango.reduce((sum, t) => sum + Math.abs(t.cantidad), 0);

        // Agrupar por día
        const porDia: { [fecha: string]: number } = {};
        transaccionesEnRango.forEach(t => {
          const fecha = t.createdAt.split('T')[0];
          porDia[fecha] = (porDia[fecha] || 0) + Math.abs(t.cantidad);
        });

        // Agrupar por tipo de mensaje
        const porTipo: { [tipo: string]: number } = {};
        transaccionesEnRango.forEach(t => {
          const tipo = t.descripcion.includes('Recordatorio') ? 'Recordatorio' :
                       t.descripcion.includes('educativo') ? 'Educativo' :
                       t.descripcion.includes('urgente') ? 'Urgente' :
                       t.descripcion.includes('Resultado') ? 'Resultado' : 'Otro';
          porTipo[tipo] = (porTipo[tipo] || 0) + 1;
        });

        // Pacientes más contactados
        const pacientes: { [nombre: string]: number } = {};
        transaccionesEnRango.forEach(t => {
          if (t.pacienteRelacionado) {
            pacientes[t.pacienteRelacionado] = (pacientes[t.pacienteRelacionado] || 0) + 1;
          }
        });

        return {
          totalUsados,
          porDia: Object.entries(porDia).map(([fecha, cantidad]) => ({ fecha, cantidad })),
          porTipo: Object.entries(porTipo).map(([tipo, cantidad]) => ({ tipo, cantidad })),
          pacientesMasContactados: Object.entries(pacientes)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([nombre, cantidad]) => ({ nombre, cantidad }))
        };
      })
    );
  }

  /**
   * Obtener saldo de tokens
   */
  getSaldoTokens(): Observable<number> {
    return this.tokenService.getTokenBalance().pipe(
      map(balance => balance.disponibles)
    );
  }

  /**
   * Agregar tokens después de compra exitosa
   * @deprecated Use comprarTokens() instead which calls the backend purchase endpoint
   */
  agregarTokens(cantidad: number): Observable<void> {
    // Refresh balance to reflect any changes
    this.tokenService.refreshBalance();
    return new Observable(observer => {
      observer.next();
      observer.complete();
    });
  }

  /**
   * Calcular costo de envío de mensajes
   */
  calcularCostoMensaje(tipoMensaje: 'recordatorio' | 'educativo' | 'urgente' | 'resultado'): Observable<{
    tokensRequeridos: number;
    descripcion: string;
  }> {
    const costos = {
      recordatorio: { tokens: 1, desc: 'Recordatorio estándar de cita' },
      educativo: { tokens: 1, desc: 'Mensaje educativo personalizado' },
      urgente: { tokens: 2, desc: 'Mensaje urgente prioritario' },
      resultado: { tokens: 1, desc: 'Entrega de resultados médicos' }
    };

    const costo = costos[tipoMensaje] || costos.recordatorio;

    return new Observable(observer => {
      observer.next({
        tokensRequeridos: costo.tokens,
        descripcion: costo.desc
      });
      observer.complete();
    });
  }

  /**
   * Verificar tokens próximos a vencer
   */
  getTokensProximosVencer(): Observable<{
    cantidad: number;
    fechaVencimiento: string;
    diasRestantes: number;
  }> {
    // TODO: Implement expiration logic when backend supports it
    return new Observable(observer => {
      observer.next({
        cantidad: 0,
        fechaVencimiento: '2025-12-31',
        diasRestantes: 365
      });
      observer.complete();
    });
  }

  // Private helper methods to map backend models to local interfaces

  private mapPackageToLocal(pkg: TokenPackage): TokenPaquete {
    return {
      id: pkg.id,
      nombre: pkg.nombre,
      tipo: pkg.tipo, // Include tipo for backend purchase calls
      tokens: pkg.tokens,
      precio: pkg.precio,
      descripcion: pkg.descripcion || '',
      popular: pkg.popular,
      ahorro: pkg.ahorroPorcentaje,
      validezDias: 90 // Default, can be added to backend later
    };
  }

  private mapTransactionToLocal(tx: TokenTransaction): TokenTransaccion {
    // Map backend transaction types to local types
    const tipoMap: { [key: string]: 'compra' | 'uso' | 'regalo' | 'expiracion' | 'reembolso' } = {
      'recarga': 'compra',
      'consumo': 'uso',
      'bonus': 'regalo',
      'ajuste': 'reembolso'
    };

    return {
      id: tx.id,
      tipo: tipoMap[tx.tipo] || 'uso',
      cantidad: tx.tipo === 'consumo' ? -tx.cantidad : tx.cantidad,
      descripcion: tx.concepto,
      createdAt: tx.createdAt
    };
  }

  private mapBalanceToStats(balance: TokenBalance): TokenEstadisticas {
    return {
      disponibles: balance.disponibles,
      usadosHoy: 0, // TODO: Calculate from today's transactions
      usadosMes: balance.consumidosEsteMes,
      promedioMensual: balance.consumidosEsteMes, // Rough estimate
      proximoVencimiento: balance.proximaRecarga,
      tokensVencimiento: 0
    };
  }
}
