import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Env } from '../services/env';
import { DataService } from '../services/data.service';

@Injectable({
  providedIn: 'root'
})
export class ExpensesService {

  constructor(private http: HttpClient, private dataService: DataService) { }

  private getOptions() {
    return {
      headers: this.dataService.getHeaders()
    };
  }

  getExpenses(params?: any): Observable<any> {
    return this.http.get(Env.EXPENSES, {
      ...this.getOptions(),
      params: params
    });
  }

  getExpense(id: number): Observable<any> {
    return this.http.get(`${Env.EXPENSES}/${id}`, this.getOptions());
  }

  createExpense(expense: any): Observable<any> {
    return this.http.post(Env.EXPENSES, expense, this.getOptions());
  }

  updateExpense(id: number, expense: any): Observable<any> {
    return this.http.put(`${Env.EXPENSES}/${id}`, expense, this.getOptions());
  }

  deleteExpense(id: number): Observable<any> {
    return this.http.delete(`${Env.EXPENSES}/${id}`, this.getOptions());
  }

  getDashboard(params?: any): Observable<any> {
    return this.http.get(Env.EXPENSES_DASHBOARD, {
      ...this.getOptions(),
      params: params
    });
  }
}
