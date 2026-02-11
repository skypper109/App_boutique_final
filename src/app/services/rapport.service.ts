import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Env } from './env';

export interface DailyReport {
  id: number;
  boutique_id: number;
  date: string;
  total_ventes: number;
  total_depenses: number;
  benefice_net: number;
  nombre_ventes: number;
  nombre_depenses: number;
  pdf_path: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
  boutique?: {
    id: number;
    nom: string;
    devise: string;
  };
}

export interface ReportsResponse {
  current_page: number;
  data: DailyReport[];
  total: number;
  per_page: number;
  last_page: number;
}

@Injectable({
  providedIn: 'root'
})
export class RapportService {
  private apiUrl = `${Env.API_URL}/rapports`;

  constructor(private http: HttpClient) {}

   getHeaders() {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null;
      const boutiqueId = typeof localStorage !== 'undefined' ? localStorage.getItem('boutique_id') : null;
  
      const headers: any = {
        'Accept': 'application/json'
      };
  
      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
  
      // Add Boutique ID header if exists
      if (boutiqueId) {
        headers['X-Boutique-Id'] = boutiqueId;
      }
  
      // Identité de la plateforme (Tauri vs Navigateur)
      if (typeof window !== 'undefined' && (window as any).__TAURI__) {
        headers['X-Platform'] = 'tauri';
      }
  
      return new HttpHeaders(headers);
    }

  getRapports(page: number = 1, startDate?: string, endDate?: string, boutiqueId?: number): Observable<ReportsResponse> {
    let params = new HttpParams().set('page', page.toString());
    
    if (startDate) {
      params = params.set('start_date', startDate);
    }
    if (endDate) {
      params = params.set('end_date', endDate);
    }
    if (boutiqueId) {
      params = params.set('boutique_id', boutiqueId.toString());
    }

    return this.http.get<ReportsResponse>(this.apiUrl, { params, headers: this.getHeaders() });
  }

  generateRapport(date: string, boutiqueId?: number): Observable<{ success: boolean; message: string; report: DailyReport }> {
    const body: any = { date };
    if (boutiqueId) {
      body.boutique_id = boutiqueId;
    }
    return this.http.post<any>(`${this.apiUrl}/generer`, body, { headers: this.getHeaders() });
  }

  getRapport(id: number): Observable<DailyReport> {
    return this.http.get<DailyReport>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  downloadPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, {
      responseType: 'blob',
      headers: this.getHeaders()
    });
  }

  sendEmail(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.post<any>(`${this.apiUrl}/${id}/envoyer`, {}, { headers: this.getHeaders() });
  }
}
