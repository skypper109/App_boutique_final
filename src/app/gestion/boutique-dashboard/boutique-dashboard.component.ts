import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Env } from '../../services/env';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-boutique-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NgxSpinnerModule],
  template: `
    <ngx-spinner bdColor="rgba(0,0,0,0.8)" size="medium" color="#fff" type="square-jelly-box" [fullScreen]="false">
      <p class="text-white mt-4 font-medium italic text-sm">Analyse des données...</p>
    </ngx-spinner>

    <div class="p-6 space-y-8 animate-fade-in" *ngIf="boutique">
       <!-- Header Section -->
       <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 class="text-3xl font-black text-secondary-900 tracking-tight italic">
              Tableau de Bord <span class="text-primary-600">{{ boutique.nom }}</span>
            </h1>
            <p class="text-secondary-500 font-medium italic">Gestion centralisée de l'établissement</p>
          </div>
          <div class="flex gap-2">
            <button (click)="takeControl()" class="px-6 py-3 bg-secondary-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-600 transition-all shadow-elegant">
              Prendre le contrôle
            </button>
          </div>
       </div>

       <!-- Stats Grid -->
       <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="bg-white p-6 rounded-[2rem] shadow-elegant border border-secondary-100 group hover:border-primary-200 transition-all">
            <div class="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mb-4 group-hover:scale-110 transition-transform">
              <i class="bi bi-cart-check text-xl"></i>
            </div>
            <p class="text-xs font-black text-secondary-400 uppercase tracking-widest mb-1">Total Ventes</p>
            <h3 class="text-2xl font-black text-secondary-900">{{ stats.sales_count }}</h3>
          </div>

          <div class="bg-white p-6 rounded-[2rem] shadow-elegant border border-secondary-100 group hover:border-green-200 transition-all">
            <div class="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform">
              <i class="bi bi-currency-dollar text-xl"></i>
            </div>
            <p class="text-xs font-black text-secondary-400 uppercase tracking-widest mb-1">Chiffre d'Affaires</p>
            <h3 class="text-2xl font-black text-secondary-900">{{ stats.total_revenue | number }} FCFA</h3>
          </div>

          <div class="bg-white p-6 rounded-[2rem] shadow-elegant border border-secondary-100 group hover:border-blue-200 transition-all">
            <div class="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
              <i class="bi bi-people text-xl"></i>
            </div>
            <p class="text-xs font-black text-secondary-400 uppercase tracking-widest mb-1">Membres Staff</p>
            <h3 class="text-2xl font-black text-secondary-900">{{ stats.users_count }}</h3>
          </div>

          <div class="bg-white p-6 rounded-[2rem] shadow-elegant border border-secondary-100 group hover:border-purple-200 transition-all">
            <div class="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
              <i class="bi bi-geo-alt text-xl"></i>
            </div>
            <p class="text-xs font-black text-secondary-400 uppercase tracking-widest mb-1">Localisation</p>
            <h3 class="text-sm font-black text-secondary-900 truncate">{{ boutique.adresse }}</h3>
          </div>
       </div>

       <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Top Products -->
          <div class="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-elegant border border-secondary-50">
            <h3 class="text-xl font-black text-secondary-900 mb-6 flex items-center italic">
              <i class="bi bi-star-fill text-yellow-400 mr-3"></i> Top Produits de la Boutique
            </h3>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="text-left border-b border-secondary-50">
                    <th class="pb-4 text-[10px] font-black text-secondary-400 uppercase tracking-widest">Produit</th>
                    <th class="pb-4 text-[10px] font-black text-secondary-400 uppercase tracking-widest text-center">Quantité Vendu</th>
                    <th class="pb-4 text-[10px] font-black text-secondary-400 uppercase tracking-widest text-right">Total CA</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-secondary-50">
                  <tr *ngFor="let p of stats.top_products" class="group transition-colors">
                    <td class="py-4">
                      <div class="flex items-center">
                        <div class="w-10 h-10 rounded-xl bg-secondary-50 flex items-center justify-center mr-3 font-black text-secondary-400 text-xs">
                           {{ p.produit.nom.substring(0,2).toUpperCase() }}
                        </div>
                        <span class="font-bold text-secondary-700">{{ p.produit.nom }}</span>
                      </div>
                    </td>
                    <td class="py-4 text-center font-black text-secondary-900">{{ p.total_qty }}</td>
                    <td class="py-4 text-right font-black text-primary-600">{{ p.total_amount | number }} FCFA</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Shortcuts -->
          <div class="space-y-6">
             <div class="bg-secondary-900 rounded-[2.5rem] p-8 text-white shadow-elegant-dark relative overflow-hidden">
                <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <h3 class="text-xl font-black mb-4 italic">Actions Rapides</h3>
                <div class="space-y-3 relative z-10">
                   <a [routerLink]="['/users/list']" [queryParams]="{boutiqueId: boutique.id}" class="flex items-center justify-between p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all group">
                      <span class="text-sm font-bold">Gérer le Personnel</span>
                      <i class="bi bi-arrow-right group-hover:translate-x-1 transition-transform"></i>
                   </a>
                   <a [routerLink]="['/ventes/historique']" class="flex items-center justify-between p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all group">
                      <span class="text-sm font-bold">Historique Ventes</span>
                      <i class="bi bi-arrow-right group-hover:translate-x-1 transition-transform"></i>
                   </a>
                   <a [routerLink]="['/produits/list']" class="flex items-center justify-between p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all group">
                      <span class="text-sm font-bold">Inventaire Stock</span>
                      <i class="bi bi-arrow-right group-hover:translate-x-1 transition-transform"></i>
                   </a>
                </div>
             </div>

             <div class="bg-primary-50 rounded-[2.5rem] p-8 border border-primary-100">
                <h4 class="text-primary-900 font-black mb-3 text-sm italic">Configuration Boutique</h4>
                <p class="text-primary-700 text-xs font-medium leading-relaxed mb-6">
                  Modifiez les informations de l'établissement ou changez le statut opérationnel.
                </p>
                <div class="flex gap-2">
                   <button class="px-4 py-2 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-700 transition-colors">Modifier</button>
                   <button class="px-4 py-2 bg-white text-secondary-900 rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary-100 hover:bg-primary-100 transition-colors">Paramètres</button>
                </div>
             </div>
          </div>
       </div>
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class BoutiqueDashboardComponent implements OnInit {
  boutique: any;
  stats: any;
  boutiqueId: any;

  constructor(
    private route: ActivatedRoute,
    private data: DataService,
    private spinner: NgxSpinnerService,
    private toast: ToastrService
  ) { }

  ngOnInit(): void {
    this.boutiqueId = this.route.snapshot.paramMap.get('id');
    if (this.boutiqueId) {
      this.fetchStats();
    }
  }

  fetchStats() {
    this.spinner.show();
    this.data.getById(Env.BOUTIQUES, this.boutiqueId + '/stats').subscribe({
      next: (res: any) => {
        this.boutique = res.boutique;
        this.stats = res.stats;
        this.spinner.hide();
      },
      error: () => {
        this.toast.error("Impossible de charger les statistiques", "Erreur");
        this.spinner.hide();
      }
    });
  }

  takeControl() {
    localStorage.setItem('boutique_id', this.boutique.id);
    localStorage.setItem('boutique_nom', this.boutique.nom);
    this.toast.success(`Direction : ${this.boutique.nom}`, "Accès Boutique");
    window.location.href = '/';
  }
}
