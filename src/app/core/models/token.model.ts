export enum TokenTransactionType {
  CONSUMO = 'consumo',
  RECARGA = 'recarga',
  BONUS = 'bonus',
  AJUSTE = 'ajuste'
}

export interface TokenTransaction {
  id: string;
  cantidad: number;
  concepto: string;
  tipo: TokenTransactionType;
  saldoAnterior: number;
  saldoNuevo: number;
  createdAt: string;
}

export interface TokenBalance {
  disponibles: number;
  consumidosEsteMes: number;
  recargadosEsteMes: number;
  proximaRecarga?: string;
}

export interface ConsumeTokenDto {
  cantidad: number;
  concepto: string;
}

export interface PurchaseTokenDto {
  packageType: 'basico' | 'profesional' | 'premium' | 'empresarial' | 'emergencia';
  metodoPago: string; // 'stripe' | 'transferencia' | etc
}

export interface TokenPurchaseResult {
  success: boolean;
  transactionId: string;
  packageType: string;
  tokensAdded: number;
  newBalance: number;
  price: number;
  paymentMethod: string;
  message: string;
}

// Token Package from backend
export interface TokenPackage {
  id: string;
  nombre: string;
  tipo: 'basico' | 'profesional' | 'premium' | 'empresarial' | 'emergencia';
  tokens: number;
  precio: number;
  descripcion?: string;
  ahorroPorcentaje: number;
  activo: boolean;
  popular: boolean;
  createdAt: string;
}