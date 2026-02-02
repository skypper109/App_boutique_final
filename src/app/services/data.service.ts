import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Users } from '../model/users';
import { Observable } from 'rxjs';
import { LoginService } from '../login/Guard/login.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  token: any;
  user!: Users;



  constructor(
    // private verifCompte: LoginService,
    private http: HttpClient,
    @Inject(PLATFORM_ID) public platformId: Object,
    private route: Router
  ) {
    // const token = localStorage.getItem('access_token');

    const headers = new HttpHeaders({
      'content-type': 'application/json',
      'accept': 'application/json',
      // 'Authorization': 'Bearer ' + token
    });
  }

  isActiveCompte(): boolean {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null;
    const expirationTime = typeof localStorage !== 'undefined' ? localStorage.getItem('token_expiration') : null;

    if (!token) return false;

    if (expirationTime != null && Number(expirationTime) <= Date.now()) {
      localStorage.clear();
      return false;
    }
    return true;
  }

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
  // Pour afficher la liste globale :
  getAll(dir: string): Observable<any> {
    return this.http.get(dir, { headers: this.getHeaders() });
  }
  // Pour afficher un élément en particulier :
  getById(dir: string, id: any): Observable<any> {
    return this.http.get(dir + '/' + id, { headers: this.getHeaders() });
  }
  // Pour ajouter un élément :
  add(dir: string, element: any) {
    let headers = this.getHeaders();
    if (!(element instanceof FormData)) {
      headers = headers.set('Content-Type', 'application/json');
    }
    return this.http.post(dir, element, { headers });
  }

  // Pour modifier un élément :
  update(dir: string, element: any) {
    let headers = this.getHeaders();
    if (!(element instanceof FormData)) {
      headers = headers.set('Content-Type', 'application/json');
    }
    return this.http.put(dir + '/' + element.id, element, { headers });
  }

  // Pour modifier un élément :
  updateCat(dir: string, id: any, element: any) {
    let headers = this.getHeaders();
    if (!(element instanceof FormData)) {
      headers = headers.set('Content-Type', 'application/json');
    }
    return this.http.put(dir + '/' + id, element, { headers });
  }

  // Pour supprimer un élément :
  delete(dir: string, id: any) {
    return this.http.delete(dir + '/' + id, { headers: this.getHeaders() });
  }

  // Pour modifier partiellement un élément :
  patch(dir: string, element: any) {
    let headers = this.getHeaders();
    if (!(element instanceof FormData)) {
      headers = headers.set('Content-Type', 'application/json');
    }
    return this.http.patch(dir, element, { headers });
  }

  getByAnnee(dir: string, annee: any) {
    return this.http.get(dir + '/' + annee, { headers: this.getHeaders() });
  }

  getByMois(dir: string, annee: any, mois: any) {
    return this.http.get(dir + '/' + annee + '/' + mois, { headers: this.getHeaders() });
  }

  getByJour(dir: string, annee: any, mois: any, jour: any) {
    return this.http.get(dir + '/' + annee + '/' + mois + '/' + jour, { headers: this.getHeaders() });
  }

  getByIntervalle(dir: string, dateDebut: any, dateFin: any) {
    return this.http.get(dir + '/' + dateDebut + '/' + dateFin, { headers: this.getHeaders() });
  }

  getByLimit(dir: string, limit: any) {
    return this.http.get(dir + '/' + limit, { headers: this.getHeaders() });
  }

}
