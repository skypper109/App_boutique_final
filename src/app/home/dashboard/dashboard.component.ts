import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { Env } from '../../services/env';
import { DataService } from '../../services/data.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser, SlicePipe } from '@angular/common';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { LoginService } from '../../login/Guard/login.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NgxSpinnerModule,
    SlicePipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DashboardComponent implements OnInit {
  // Filters and Data
  filtre1: String = 'Aujourd\'hui';
  venteNombre: number = 0;
  annee: any;
  mois: any;
  jour: any;
  clientNombre: number = 0;
  montant: number = 0;
  complet: any;
  filtre2: String = 'Les 5 Meilleurs Ventes';
  produits: any[] = [];
  userRole: string | null = null;
  topProduits: any[] = [];

  // Dropdown states
  salesDrop = false;
  revenueDrop = false;
  clientDrop = false;
  topDrop = false;

  // Stats Counters
  produitStockCount: number = 0;
  categorieCount: number = 0;
  totalStockValue: number = 0;
  ventesJour: number = 0;

  // Boutique Hub State
  boutiques: any[] = [];
  selectedBoutiqueId: string | null = null;
  isInitialLoading = true;

  constructor(private data: DataService, private router: Router, private spinne: NgxSpinnerService,
      private dataLog: LoginService) {
  }

  ngOnInit(): void {
    this.userRole = this.dataLog.getRole();
    if (isPlatformBrowser(this.data.platformId)) {
      this.selectedBoutiqueId = localStorage.getItem('boutique_id');

      if (!this.selectedBoutiqueId) {
        this.fetchBoutiques();
      } else {
        this.loadDashboardData();
      }
    }
  }

  fetchBoutiques() {
    this.isInitialLoading = true;
    this.spinne.show();
    this.data.getAll(Env.BOUTIQUES).subscribe({
      next: (res: any) => {
        this.boutiques = res;
        this.isInitialLoading = false;
        this.spinne.hide();

        // Auto-select if only one boutique exists for professional efficiency
        if (this.boutiques && this.boutiques.length === 1) {
          this.selectBoutique(this.boutiques[0]);
        }
      },
      error: (err) => {
        console.error(err);
        this.isInitialLoading = false;
        this.spinne.hide();
      }
    });
  }

  selectBoutique(boutique: any) {
    if (isPlatformBrowser(this.data.platformId)) {
      localStorage.setItem('boutique_id', boutique.id);
      localStorage.setItem('boutique_nom', boutique.nom);
      this.selectedBoutiqueId = boutique.id.toString();
      this.loadDashboardData();
      // Force a page reload or event to update the sidebar boutique name
      window.location.reload();
    }
  }

  loadDashboardData() {
    this.isInitialLoading = true;
    this.spinne.show();

    this.annee = new Date().getFullYear();
    this.mois = new Date().getMonth() + 1;
    this.jour = new Date().getDate();
    this.complet = this.annee + '-' + this.mois + '-' + this.jour;

    // Ventes par jour
    this.data.getByJour(Env.VENTESPARJOUR, this.annee, this.mois, this.jour).subscribe((data: any) => {
      if (data && data.length > 0) {
        this.venteNombre = data[0].nombre;
        this.montant = data[0].total;
      } else {
        this.venteNombre = 0;
        this.montant = 0;
      }
    });

    // Top ventes
    this.data.getAll(Env.TOPVENTE).subscribe({
      next: (data: any) => {
        this.topProduits = data;
        console.log(data)
      },
      error(err) {
        console.log(err)
      },

    });

    // Ventes récentes
    this.data.getAll(Env.VENTERECENTE).subscribe({
      next: (data: any) => {
        this.produits = data;
        this.isInitialLoading = false;
        this.spinne.hide();
      },
      error: (err) => {
        console.error('Erreur Ventes Récentes:', err);
        this.isInitialLoading = false;
        this.spinne.hide();
      }
    });

    // Clients
    this.data.getAll(Env.CLIENT).subscribe({
      next: (data: any) => {
        this.clientNombre = data?.length || 0;
      },
      error: (err) => console.error('Erreur Client Count:', err)
    });

    // Résumé
    this.data.getAll(Env.SUMMARY).subscribe({
      next: (data: any) => {
        if (data) {
          this.produitStockCount = data.produit_count || 0;
          this.categorieCount = data.categorie_count || 0;
          this.totalStockValue = data.total_stock || 0;
          this.ventesJour = data.ventes_jour || 0;
          this.annee = data.annee_active || this.annee;
        }
      },
      error: (err) => console.error('Erreur Summary:', err)
    });
  }

  changeFiltre1(filtre: String) {
    if (filtre === 'jour') {
      this.filtre1 = 'Aujourd\'hui';
      this.data.getByJour(Env.VENTESPARJOUR, this.annee, this.mois, this.jour).subscribe((data: any) => {
        if (data && data.length > 0) {
          this.venteNombre = data[0].nombre;
          this.montant = data[0].total;
        }
      });
    } else if (filtre === 'mois') {
      this.filtre1 = 'Ce mois';
      this.data.getByIntervalle(Env.VENTESPARMOIS, this.annee, this.mois).subscribe((data: any) => {
        if (data && data.length > 0) {
          this.venteNombre = data[0].nombre;
          this.montant = data[0].total;
        }
      });
    } else {
      this.filtre1 = 'Cette année';
      this.data.getByAnnee(Env.VENTESPARANNEE, this.annee).subscribe((data: any) => {
        if (data && data.length > 0) {
          this.venteNombre = data[0].nombre;
          this.montant = data[0].total;
        }
      });
    }
  }

  changeFiltre2(limite: number) {
    if (limite === 5) {
      this.filtre2 = 'Les 5 Meilleures Ventes';
      this.data.getAll(Env.TOPVENTE).subscribe((data: any) => {
        this.topProduits = data;
      });
    } else if (limite === 10) {
      this.filtre2 = 'Les 10 Meilleures Ventes';
      this.data.getByLimit(Env.TOPVENTE, 10).subscribe((data: any) => {
        this.topProduits = data;
      });
    } else {
      this.filtre2 = 'Les 15 Meilleures Ventes';
      this.data.getByLimit(Env.TOPVENTE, 15).subscribe((data: any) => {
        this.topProduits = data;
      });
    }
  }

  filtre3: string = 'En fonction de jour';
  changeFiltre3(filtre: string) {
    if (filtre === 'jour') {
      this.filtre3 = 'En fonction de jour'
    } else if (filtre === 'mois') {
      this.filtre3 = 'En fonction de Mois'
    } else {
      this.filtre3 = 'En fonction de Année'
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
}
