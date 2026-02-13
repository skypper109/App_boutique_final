import { CommonModule, registerLocaleData } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID, numberAttribute, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Env } from '../../services/env';
import localeFr from '@angular/common/locales/fr';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { Produit } from '../../produit/produit';

registerLocaleData(localeFr, 'fr');

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule
  ],
  templateUrl: './historique.component.html',
  styleUrl: './historique.component.scss',
  providers: [{ provide: LOCALE_ID, useValue: 'fr' }],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HistoriqueComponent implements OnInit {
  ventes: any[] = [];
  filteredVentes: any[] = [];

  // Advanced Filters
  searchTerm: string = '';
  startDate: string = new Date().toISOString().split('T')[0];
  endDate: string = new Date().toISOString().split('T')[0];
  statusFilter: string = '';
  annee: any;
  mois: any;

  // Pagination
  paginatedVentes: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  pages: number[] = [];

  // Status controls
  change: boolean = false;
  selectedMois: boolean = false;
  isModalVisible: boolean = false;
  isDetailsVisible: boolean = false;
  isConfirmModalVisible: boolean = false;

  // Confirmation state
  confirmConfig: { title: string, message: string, action: () => void } = {
    title: '',
    message: '',
    action: () => { }
  };

  // Selection state
  years: any = [];
  selectedVentes: any;
  selectedVentesMois: any;
  moisContent: any;

  // Sale Detail / Return state
  produitsVente: any[] = [];
  originalProduitsVente: any[] = [];
  montantTotal: number = 0;
  selectedVenteId: number = 0;
  selectedVenteDetails: any = null;
  remise: number = 0;
  extraReduction: number = 0;
  originalRemise: number = 0;
  selectedMontantTotal: number = 0;

  constructor(private data: DataService, private toastr: ToastrService, private spinne: NgxSpinnerService) { }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.spinne.show();

    // Concurrent loading
    this.data.getAll(Env.ANNEEVENTE).subscribe({
      next: (data) => this.years = data,
      error: (err) => console.error('Erreur années :', err)
    });

    this.data.getAll(Env.VENTEHISTORIQUE).subscribe({
      next: (data) => {
        this.ventes = data;
        this.applyAdvancedFilters(); // Apply today's filter immediately
        this.venteDate();
        this.spinne.hide();
      },
      error: (err) => {
        this.spinne.hide();
        console.error('Erreur ventes :', err);
      }
    });
  }

  applyAdvancedFilters(): void {
    let result = [...this.ventes];

    // Search term (Product name, Client, User, ID)
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(v =>
        (v.id && v.id.toString().includes(term)) ||
        (v.client_nom && v.client_nom.toLowerCase().includes(term)) ||
        (v.user?.name && v.user.name.toLowerCase().includes(term)) ||
        v.detail_ventes?.some((d: any) => d.produit?.nom?.toLowerCase().includes(term))
      );
    }

    // Date Range
    if (this.startDate) {
      const start = new Date(this.startDate);
      result = result.filter(v => new Date(v.date_vente) >= start);
    }
    if (this.endDate) {
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59); // End of day
      result = result.filter(v => new Date(v.date_vente) <= end);
    }

    // Status Filter
    if (this.statusFilter) {
      result = result.filter(v => v.statut === this.statusFilter);
    }

    this.filteredVentes = result;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredVentes.length / this.itemsPerPage);
    this.pages = Array(this.totalPages).fill(0).map((x, i) => i + 1);
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedVentes = this.filteredVentes.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  venteDate() {
    this.years = [];
    this.ventes.forEach((vente: any) => {
      const annee = new Date(vente.date_vente).getFullYear();
      const mois = new Date(vente.date_vente).getMonth() + 1;
      const jour = new Date(vente.date_vente).getDate();

      let annees = this.years.find((year: any) => year.annee === annee);
      if (!annees) {
        this.years.push({
          annee: annee,
          mois: [{
            mois: vente.date_vente,
            moisNum: mois,
            vente: [{ jours: jour, details: vente.detail_ventes }]
          }]
        });
      } else {
        const index = this.years.findIndex((y: any) => y.annee === annee);
        const i = this.years[index].mois.findIndex((m: any) => m.moisNum === mois);

        if (i >= 0) {
          this.years[index].mois[i].vente.push({ jours: jour, details: vente.detail_ventes });
        } else {
          this.years[index].mois.push({
            mois: vente.date_vente,
            moisNum: mois,
            vente: [{ jours: jour, details: vente.detail_ventes }]
          });
        }
      }
    });
  }

  getVentesByYear(year: any) {
    this.selectedMois = false;
    this.change = true;
    let element = this.years.find((item: any) => item.annee == year);

    if (element && element.mois.length > 0) {
      this.selectedVentes = [{ ventes: element.mois }];
      this.selectedVentesMois = [{ ventes: element.mois }];
    } else {
      this.selectedVentes = [{ ventes: [] }];
      this.toastr.info("Aucune donnée pour " + year);
    }
  }

  getVentesByMonth(mois: any) {
    this.selectedMois = true;
    let element = this.selectedVentesMois[0].ventes.find((item: any) => item.moisNum == mois);

    if (element) {
      this.moisContent = [{ ventes: element.vente }];
    } else {
      this.moisContent = [{ ventes: [] }];
    }
  }

  openConfirm(title: string, message: string, action: () => void) {
    // Ensure modal is closed first to reset state
    this.isConfirmModalVisible = false;
    // Use setTimeout to ensure change detection picks up the state change
    setTimeout(() => {
      this.confirmConfig = { title, message, action };
      this.isConfirmModalVisible = true;
    }, 0);
  }

  closeConfirm() {
    this.isConfirmModalVisible = false;
  }

  executeConfirm() {
    this.confirmConfig.action();
    this.closeConfirm();
  }

  retourVente(id: any) {
    this.selectedVenteId = id;
    this.spinne.show();
    this.data.getById(Env.VENTEHISTORIQUE, id).subscribe({
      next: (data: any) => {
        this.produitsVente = JSON.parse(JSON.stringify(data[0].detail_ventes));
        this.originalProduitsVente = JSON.parse(JSON.stringify(data[0].detail_ventes));
        const totalLineRemises = this.produitsVente.reduce((acc, item) => acc + (Number(item.remise) || 0), 0);
        this.remise = Number(data[0].remise || 0);
        this.extraReduction = Math.max(0, this.remise - totalLineRemises);
        this.originalRemise = this.remise;
        this.calculateTotal();
        this.isModalVisible = true;
        this.spinne.hide();
      },
      error: (err) => {
        this.spinne.hide();
        this.toastr.error("Erreur détails vente");
      }
    });
  }

  calculateTotal() {
    const grossTotal = this.produitsVente.reduce((acc, item) => {
      return acc + (item.prix_unitaire * item.quantite);
    }, 0);

    const lineRemises = this.produitsVente.reduce((acc, item) => {
      if (item.quantite <= 0) return acc;
      return acc + (Number(item.remise) || 0);
    }, 0);

    this.remise = lineRemises + this.extraReduction;
    this.montantTotal = grossTotal; 
    // Usually montantTotal in this component is the GROSS total used for the display "Valeur Brute"
  }

  onGlobalReductionChange(newTotalReduction: number): void {
    const lineRemises = this.produitsVente.reduce((acc, item) => {
      if (item.quantite <= 0) return acc;
      return acc + (Number(item.remise) || 0);
    }, 0);
    this.extraReduction = Math.max(0, newTotalReduction - lineRemises);
    this.calculateTotal();
  }

  updateQuantity(item: any, event: any) {
    const val = parseInt(event.target.value);
    const original = this.originalProduitsVente.find(o => o.id === item.id);

    if (val > original.quantite) {
      item.quantite = original.quantite;
      event.target.value = original.quantite;
      this.toastr.warning(`Maximum: ${original.quantite}`);
    } else if (val < 0) {
      item.quantite = 0;
      event.target.value = 0;
    } else {
      item.quantite = val;
      if (val === 0) item.remise = 0; // Reset remise if quantity is 0
    }
    this.calculateTotal();
  }

  onDelete(id: any) {
    this.openConfirm(
      "Retrait d'article",
      "Voulez-vous retirer cet article de la transaction ?",
      () => {
        const index = this.produitsVente.findIndex(p => p.id === id);
        if (index > -1) {
          this.produitsVente[index].quantite = 0;
          this.produitsVente[index].remise = 0; // Reset remise for deleted item
          this.calculateTotal();
        }
      }
    );
  }

  onUpdateProd() {
    this.spinne.show();
    const vente = {
      vente_id: this.selectedVenteId,
      produits: this.produitsVente.map(p => ({
        produit: { id: p.produit_id },
        quantite: p.quantite,
        prix_unitaire: p.prix_unitaire,
        remise: p.remise // sending per-item remise
      })),
      montant_total: this.montantTotal,
      remise: this.remise,
      date: new Date().toISOString(),
    };

    this.data.add(Env.RETOURVENTE, vente).subscribe({
      next: () => {
        this.spinne.hide();
        this.toastr.success("Audit de retour validé");
        this.isModalVisible = false;
        this.loadInitialData();
      },
      error: () => {
        this.spinne.hide();
        this.toastr.error("Erreur audit retour");
      }
    });
  }

  deleteVente(id: any) {
    this.openConfirm(
      "Annulation Totale",
      "Cette action est irréversible. Restaurer tout le stock de cette vente ?",
      () => {
        this.spinne.show();
        this.data.getById(Env.ANNULEVENTE, id).subscribe({
          next: () => {
            this.spinne.hide();
            this.toastr.success("Vente annulée avec succès");
            this.loadInitialData();
          },
          error: () => {
            this.spinne.hide();
            this.toastr.error("Erreur annulation");
          }
        }); 
      }
    );
  }

  closeModal() { this.isModalVisible = false; }

  openDetails(vente: any) {
    this.selectedVenteDetails = vente;
    this.isDetailsVisible = true;
    // selectedMontantTotal is the gross total before any discounts
    this.selectedMontantTotal = vente.detail_ventes.reduce((acc: number, item: any) => {
      return acc + (Number(item.prix_unitaire) * Number(item.quantite));
    }, 0);
  }

  closeDetails() {
    this.isDetailsVisible = false;
    this.selectedVenteDetails = null;
  }
}
