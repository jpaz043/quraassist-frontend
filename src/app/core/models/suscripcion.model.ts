export enum PlanType {
  BASICO = 'basico',
  PREMIUM = 'premium'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  UNPAID = 'unpaid',
  TRIALING = 'trialing'
}

export interface Plan {
  id: string;
  name: string;
  type: PlanType;
  precio: number;
  tokensIncluidos: number;
  stripeProductId: string;
  stripePriceId: string;
  features: string[];
}

export interface Suscripcion {
  id: string;
  plan: Plan;
  status: SubscriptionStatus;
  stripeSubscriptionId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionDto {
  planId: string;
  paymentMethodId: string;
}

export interface SubscriptionResult {
  success: boolean;
  subscription?: Suscripcion;
  clientSecret?: string;
  error?: string;
}

export interface BillingHistory {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  paidAt?: string;
  createdAt: string;
}