import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Produit } from '../produit/produit';
import { Categorie } from '../categorie/categorie';
import { Observable } from 'rxjs';
import { Env } from '../services/env';
import { DataService } from '../services/data.service';

@Injectable({
  providedIn: 'root'
})
export class ProduitsService {
  constructor(
    private http: HttpClient,
    private dataService: DataService
  ) { }

  private getHeaders(isFormData: boolean = false) {
    let headers = this.dataService.getHeaders();
    if (!isFormData) {
      headers = headers.set('Content-Type', 'application/json');
    }
    return headers;
  }
  //Gestion  Pour les produits avec api
  apiUrl = Env.API_URL + '/';

  editProd(id: number) {
    return this.http.get(this.apiUrl + 'produits/editProd/' + id, { headers: this.getHeaders() });
  }
  update(id: any, element: any) {
    return this.http.put(this.apiUrl + 'produits/' + id, element, { headers: this.getHeaders() });
  }
  updateProd(id: any, element: FormData) {
    return this.http.post(this.apiUrl + 'produits/' + id, element, { headers: this.getHeaders(true) });
  }
  createProduit(dir: any, element: FormData) {
    return this.http.post(dir, element, { headers: this.getHeaders(true) });
  }

  deleteProduit(id: number) {
    return this.http.delete(this.apiUrl + 'produits/' + id, { headers: this.getHeaders() });
  }

  //Gestion  Pour les categories avec api
  getCategories() {
    return this.http.get(this.apiUrl + 'categories', { headers: this.getHeaders() });
  }
  getCategorie(id: number) {
    return this.http.get(this.apiUrl + 'categories/' + id, { headers: this.getHeaders() });
  }


  addCategorie(categorie: Categorie): Observable<any> {

    return this.http.post(this.apiUrl + 'categories', categorie, { headers: this.getHeaders() });
  }
  updateCategorie(categorie: Categorie) {
    return this.http.put(this.apiUrl + 'categories/' + categorie.id, categorie, { headers: this.getHeaders() });
  }
  deleteCategorie(id: number) {
    return this.http.delete(this.apiUrl + 'categories/' + id, { headers: this.getHeaders() });
  }


  // Pour le reapprovisionnement des produits:
  postReappro(dir: string, element: any) {
    return this.http.post(dir, element, { headers: this.getHeaders() });
  }

}
