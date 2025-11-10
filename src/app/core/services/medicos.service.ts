import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medico, DashboardStats } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MedicosService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/api/v1/medicos`;

  getProfile(): Observable<Medico> {
    return this.http.get<Medico>(`${this.API_URL}/profile`);
  }

  updateProfile(profileData: Partial<Medico>): Observable<Medico> {
    return this.http.put<Medico>(`${this.API_URL}/profile`, profileData);
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.API_URL}/dashboard-stats`);
  }

  getTokenBalance(): Observable<{ balance: number; transactions: any[] }> {
    return this.http.get<{ balance: number; transactions: any[] }>(`${this.API_URL}/tokens/balance`);
  }
}