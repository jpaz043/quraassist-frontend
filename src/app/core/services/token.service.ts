import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import {
  TokenBalance,
  TokenTransaction,
  ConsumeTokenDto,
  PurchaseTokenDto,
  TokenPurchaseResult,
  TokenPackage,
  PaginatedResponse
} from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/api/v1/tokens`;

  private tokenBalanceSubject = new BehaviorSubject<TokenBalance | null>(null);
  public tokenBalance$ = this.tokenBalanceSubject.asObservable();

  constructor() {
    this.loadTokenBalance();
  }

  getTokenBalance(): Observable<TokenBalance> {
    return this.http.get<TokenBalance>(`${this.API_URL}/balance`).pipe(
      tap(balance => this.tokenBalanceSubject.next(balance))
    );
  }

  getTokenTransactions(page = 1, limit = 20): Observable<PaginatedResponse<TokenTransaction>> {
    const params = { page: page.toString(), limit: limit.toString() };
    return this.http.get<PaginatedResponse<TokenTransaction>>(
      `${this.API_URL}/transactions`,
      { params }
    );
  }

  getTokenPackages(): Observable<TokenPackage[]> {
    return this.http.get<TokenPackage[]>(`${this.API_URL}/packages`);
  }

  checkSufficientTokens(required: number): Observable<{ hasSufficient: boolean; current: number }> {
    const params = { required: required.toString() };
    return this.http.get<{ hasSufficient: boolean; current: number }>(
      `${this.API_URL}/check`,
      { params }
    );
  }

  consumeTokens(consumeDto: ConsumeTokenDto): Observable<{ success: boolean; newBalance: number; message?: string }> {
    return this.http.post<{ success: boolean; newBalance: number; message?: string }>(
      `${this.API_URL}/consume`,
      consumeDto
    ).pipe(
      tap(result => {
        if (result.success) {
          const currentBalance = this.tokenBalanceSubject.value;
          if (currentBalance) {
            this.tokenBalanceSubject.next({
              ...currentBalance,
              disponibles: result.newBalance,
              consumidosEsteMes: currentBalance.consumidosEsteMes + consumeDto.cantidad
            });
          }
        }
      })
    );
  }

  purchaseTokens(purchaseDto: PurchaseTokenDto): Observable<TokenPurchaseResult> {
    return this.http.post<TokenPurchaseResult>(`${this.API_URL}/purchase`, purchaseDto).pipe(
      tap(result => {
        if (result.success) {
          const currentBalance = this.tokenBalanceSubject.value;
          if (currentBalance) {
            this.tokenBalanceSubject.next({
              ...currentBalance,
              disponibles: result.newBalance,
              recargadosEsteMes: currentBalance.recargadosEsteMes + result.tokensAdded
            });
          }
        }
      })
    );
  }

  private loadTokenBalance(): void {
    this.getTokenBalance().subscribe({
      error: (error) => console.error('Failed to load token balance:', error)
    });
  }

  // Helper method to check if user has sufficient tokens
  hasSufficientTokens(required: number): boolean {
    const balance = this.tokenBalanceSubject.value;
    return balance ? balance.disponibles >= required : false;
  }

  // Get current token balance synchronously
  getCurrentBalance(): number {
    return this.tokenBalanceSubject.value?.disponibles || 0;
  }

  // Calculate tokens needed for an operation
  calculateTokensNeeded(operation: 'whatsapp_reminder' | 'bulk_reminder' | 'ia_consulta', quantity: number = 1): number {
    const tokenCosts = {
      whatsapp_reminder: 1,
      bulk_reminder: 1, // per message
      ia_consulta: 5 // IA consultation costs 5 tokens
    };

    return (tokenCosts[operation] || 1) * quantity;
  }

  // Force refresh token balance
  refreshBalance(): void {
    this.loadTokenBalance();
  }
}