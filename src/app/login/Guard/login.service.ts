import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Env } from '../../services/env';
import { routes } from '../../app.routes';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../../services/data.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  headers: any;
  error: any;
  loged !: boolean;

  verification: boolean = true;
  stop: boolean = false;
  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastrService,
    private admin: DataService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.headers = new Headers({
      'content-type': 'application/json',
      'accept': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Allow': 'GET, POST, PUT, DELETE',

    });

  }

  data1 = ['diallo0102', 'diallo0201', 'diallo0304', 'diallo0403', 'diallo0405', 'diallo0504', 'diallo0506', 'diallo0605', 'diallo0607', 'diallo0708', 'diallo0807', 'diallo0809'];
  login(login: any) {
    if (!isPlatformBrowser(this.platformId)) return;

    const httpOptions = {
      headers: this.admin.getHeaders()
    };

    this.http.post(Env.LOGIN, login, httpOptions).subscribe(
      (data: any) => {
        this.loged = true
        console.log(data);
        this.toast.success('Connexion réussie.', 'Bienvenue', {
          timeOut: 2000,
          progressBar: true,
          progressAnimation: 'increasing',
          positionClass: 'toast-top-center'
        });
        // if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('user_id', data.user.id);
          localStorage.setItem('user_role', data.user.role);
          localStorage.setItem('boutique_id', data.boutique_id || '');
          localStorage.setItem('active_token','yes');
        // }
        if (data.user.role == "admin") {
          return this.router.navigateByUrl('/home');
        }

        return this.router.navigateByUrl('/');
      },
      (error) => {
        this.error = error.error
        this.loged = false
        this.toast.error('Information Invalide : Veuillez reasseyer!!.', 'Erreur', {
          timeOut: 3000,
          progressBar: true,
          progressAnimation: 'increasing',
          positionClass: 'toast-top-center'

        });
      }
    )
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
    }
    this.router.navigateByUrl('/login');
  }




  getRole(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('user_role');
    }
    return null;
  }

  hasRole(allowedRoles: string[]): boolean {
    const userRole = this.getRole();
    return userRole ? allowedRoles.includes(userRole) : false;
  }

  isGestionnaire(): boolean {
    return this.hasRole(['gestionnaire', 'admin']); // Assuming 'admin' (if used here) can also act as gestionnaire
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    const token = localStorage.getItem('access_token');
    const expirationTime = localStorage.getItem('token_expiration');

    if (token) {
      // Simple token existence check or add expiration logic if desired
      return token;
    }
    return null;
  }

  isActiveCompte(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;

    const token = localStorage.getItem('access_token');
    const expirationTime = localStorage.getItem('token_expiration');

    if (!token) return false;

    // if (expirationTime && Number(expirationTime) <= Date.now()) {
    //   localStorage.clear();
    //   return false;
    // }

    return true;
  }

  getUserId(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem('user_id');
  }

  get userConnect$() {
    const token = this.getToken();
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    if (!isPlatformBrowser(this.platformId)) return null;
    return this.http.get(Env.USER + '/' + localStorage.getItem('user_id'), { headers });
  }


  getBoutiqueId(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem('boutique_id');
  }

  checkUserActiveStatus() {
    const token = this.getToken();
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    return this.http.get(Env.CHECK_USER_STATUS, { headers });
  }

  checkBoutiqueStatus() {
    const token = this.getToken();
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    return this.http.get(Env.CHECK_BOUTIQUE_STATUS, { headers });
  }
}

