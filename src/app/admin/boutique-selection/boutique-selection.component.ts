import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Env } from '../../services/env';
import { HttpClient } from '@angular/common/http';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-boutique-selection',
  standalone: true,
  imports: [CommonModule, NgxSpinnerModule],
  template: `
    <ngx-spinner bdColor="rgba(0,0,0,0.8)" size="medium" color="#fff" type="square-jelly-box" [fullScreen]="true">
      <p class="text-white mt-4 font-medium italic text-sm">Chargement du réseau...</p>
    </ngx-spinner>

    <div class="min-h-screen bg-secondary-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div class="max-w-4xl w-full space-y-12">
        <div class="text-center animate-fade-in">
          <div class="inline-block p-4 bg-white rounded-3xl shadow-elegant mb-6">
            <img src="logo.svg" alt="Logo" class="h-12 w-auto">
          </div>
          <h2 class="text-4xl font-black text-secondary-900 tracking-tight italic">
            Portail <span class="text-primary-600">Multi-Boutique</span>
          </h2>
          <p class="mt-4 text-secondary-500 font-medium text-lg italic">
            Sélectionnez un établissement pour commencer la gestion.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
          <div *ngFor="let boutique of boutiques" 
               (click)="selectBoutique(boutique)"
               class="bg-white rounded-[2.5rem] p-8 shadow-elegant border border-secondary-100 cursor-pointer group hover:shadow-elegant-lg hover:-translate-y-2 transition-all relative overflow-hidden">
            
            <div class="absolute -top-12 -right-12 w-32 h-32 bg-primary-100/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div class="w-14 h-14 bg-secondary-900 rounded-2xl flex items-center justify-center text-white mb-6 shadow-elegant-dark group-hover:scale-110 transition-transform">
              <i class="bi bi-shop text-2xl"></i>
            </div>
            
            <h3 class="text-xl font-black text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">{{ boutique.nom }}</h3>
            
            <div class="space-y-2 mb-8">
              <p class="text-xs text-secondary-400 font-medium flex items-center">
                <i class="bi bi-geo-alt mr-2"></i> {{ boutique.adresse }}
              </p>
              <p class="text-xs text-secondary-400 font-medium flex items-center">
                <i class="bi bi-telephone mr-2"></i> {{ boutique.telephone }}
              </p>
            </div>

            <div class="pt-6 border-t border-secondary-50">
               <span class="text-[10px] font-black text-secondary-900 uppercase tracking-widest flex items-center">
                 Accéder au tableau de bord
                 <i class="bi bi-arrow-right ml-2 text-primary-500 group-hover:translate-x-1 transition-transform"></i>
               </span>
            </div>
          </div>
        </div>

        <div class="text-center">
          <p class="text-xs text-secondary-400 font-bold uppercase tracking-[0.2em]">MaBoutique Pro v2.0</p>
        </div>
      </div>
    </div>
  `
})
export class BoutiqueSelectionComponent implements OnInit {
  boutiques: any[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private spinner: NgxSpinnerService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadBoutiques();
    }
  }

  loadBoutiques() {
    this.spinner.show();
    // Use Env.BOUTIQUES directly
    this.http.get<any[]>(Env.BOUTIQUES).subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.boutiques = data;
        } else if (data['data']) { // Handle pagination or resource wrapper
          this.boutiques = data['data'];
        }
        this.spinner.hide();
      },
      error: (err) => {
        console.error(err);
        this.spinner.hide();
      }
    });
  }

  selectBoutique(boutique: any) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('boutique_id', boutique.id);
      localStorage.setItem('boutique_nom', boutique.nom);
      // this.toast.success(`Direction : ${boutique.nom}`, "Accès Boutique");
      this.router.navigate(['/accueil']).then(() => {
        window.location.reload(); // Reload to ensure all components refetch with new ID
      });
    }
  }
}
