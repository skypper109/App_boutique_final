import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Env } from '../../services/env';
import { CfaPipe } from '../../pipes/cfa.pipe';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import tinymce from '../../../assets/vendor/tinymce/tinymce';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { LoginService } from '../../login/Guard/login.service';
declare var $: any;

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    RouterLinkActive
  ],
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AccueilComponent {
  isSidebarOpen = true;
  isHeaderScrolled = false;

  stockOpen = false;
  venteOpen = false;
  comptaOpen = false;
  userOpen = false;
  isProfileOpen = false;
  userRole: string | null = null;
  boutiqueNom: string | null = null;

  user:any = [];

  constructor(
    private data: DataService,
    private router: Router,
    private toast: ToastrService,
    private spinner: NgxSpinnerService,
    private dataLog: LoginService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.userRole = this.dataLog.getRole();
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('scroll', () => {
        this.isHeaderScrolled = window.scrollY > 20;
      });
      this.boutiqueNom = localStorage.getItem('boutique_nom');
      this.user = this.dataLog.userConnect;
    }
  }

  get isAdmin(): boolean {
    return this.userRole?.toLowerCase() === 'admin';
  }

  get isVendeur(): boolean {
    return this.userRole?.toLowerCase() === 'vendeur';
  }

  get isComptable(): boolean {
    return this.userRole?.toLowerCase() === 'comptable';
  }

  get isGestionnaire(): boolean {
    return this.userRole?.toLowerCase() === 'gestionnaire';
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  scrollToTop() {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async openAdminPanel() {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('open_admin_panel');
    } catch (error) {
      console.error('Failed to open admin panel:', error);
      // Fallback: window.open as a last resort if running in browser
      window.open('http://127.0.0.1:8000/loginAdmin', '_blank');
    }
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('boutique_id');
      localStorage.removeItem('boutique_nom');
    }
    this.router.navigateByUrl('/login');
    this.toast.error('Vous êtes déconnecté.', 'Déconnexion', {
      timeOut: 1000,
      progressBar: true,
      progressAnimation: 'increasing',
      positionClass: 'toast-top-center'
    });
  }

  switchBoutique() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('boutique_id');
      localStorage.removeItem('boutique_nom');
      this.boutiqueNom = null;
      this.router.navigateByUrl('/').then(() => {
        window.location.reload();
      });
    }
  }

  toggleProfile(event: Event) {
    event.stopPropagation();
    this.isProfileOpen = !this.isProfileOpen;
  }

  toggleMenu(menu: string, event: Event) {
    event.stopPropagation();
    if (menu === 'stock') {
      this.stockOpen = !this.stockOpen;
      this.venteOpen = false;
      this.comptaOpen = false;
      this.userOpen = false;
    } else if (menu === 'vente') {
      this.venteOpen = !this.venteOpen;
      this.stockOpen = false;
      this.comptaOpen = false;
      this.userOpen = false;
    } else if (menu === 'user') {
      this.userOpen = !this.userOpen;
      this.stockOpen = false;
      this.venteOpen = false;
      this.comptaOpen = false;
    } else if (menu === 'compta') {
      this.comptaOpen = !this.comptaOpen;
      this.stockOpen = false;
      this.venteOpen = false;
      this.userOpen = false;
    }
    this.isProfileOpen = false;
  }

}
