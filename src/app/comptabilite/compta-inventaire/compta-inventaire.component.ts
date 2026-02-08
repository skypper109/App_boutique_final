import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Env } from '../../services/env';
import { DataService } from '../../services/data.service';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { RouterLink } from '@angular/router';
import { ExportService } from '../../services/export.service';

@Component({
  selector: 'app-compta-inventaire',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxSpinnerModule
  ],
  templateUrl: './compta-inventaire.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrl: './compta-inventaire.component.scss'
})
export class ComptaInventaireComponent implements OnInit {
  years: any;
  inventairesData: any[] = [];
  filteredInventaires: any[] = [];

  dateDebut: string = '';
  dateFin: string = '';
  searchTerm: string = '';
  filterType: string = 'all';
  date: Date = new Date();
  boutiqueInfo: any = { nom: 'Ma Boutique', adresse: '-----', telephone: '-----' };

  stats = {
    totalEntrees: 0,
    totalSorties: 0,
    valeurAchatEntrante: 0,
    valeurVenteSortante: 0,
    netMouvement: 0,
    recettesCredit: 0
  };
  paymentsData: any[] = [];
  
  // Pagination
  paginatedInventaires: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  pages: number[] = [];

  constructor(
    private data: DataService,
    private spinne: NgxSpinnerService,
    private exportService: ExportService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.spinne.show();
    // Recuperation des inventaires
    this.data.getAll(Env.INVENTAIRE).subscribe((data: any) => {
      this.inventairesData = data;
      this.filteredInventaires = data;
      this.calculateStats();
      console.log(data);
      if (data && data.length > 0 && data[0].boutique) {
        this.boutiqueInfo = data[0].boutique;
      }
      this.getPayments();
      // this.spinne.hide(); // Hide spinner when payments are loaded? Or just let it be. 
      // Actually getPayments is async so spinner might hide too early if we hide here.
      // But for now let's keep it simple.
      this.spinne.hide();
    });

    // Recuperation des annees
    this.data.getAll(Env.ANNEEVENTE).subscribe((data: any) => {
      this.years = data;
    });
  }

  applyFilters(): void {
    // Start with inventory data
    let result = [...this.inventairesData];

    // Merge with payments (map to compatible structure if needed, or just use union type array)
    // We'll mark payments with a specific type so we can filter/sort
    const payments = this.paymentsData.map(p => ({
        ...p,
        type: 'paiement',
        date: p.date_paiement,
        description: `Reglement Credit #${p.vente_id} (${p.vente?.client?.nom || 'Client'})`
    }));
    
    result = [...result, ...payments];
    
    // Sort by date desc
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Filter by type
    if (this.filterType !== 'all') {
      result = result.filter(item => item.type === this.filterType);
    }

    // Filter by search term (Product name)
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(item =>
        item.produit?.nom?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.produit.reference?.toLowerCase().includes(term) ||
        item.user?.name?.toLowerCase().includes(term)
      );
    }

    this.filteredInventaires = result;
    this.calculateStats();
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredInventaires.length / this.itemsPerPage);
    this.pages = Array(this.totalPages).fill(0).map((x, i) => i + 1);
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedInventaires = this.filteredInventaires.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;
      this.updatePagination();
  }

  getInventaireByDate() {
    if (!this.dateDebut || !this.dateFin) return;

    this.spinne.show();
    this.data.getByIntervalle(Env.INVENTAIRE, this.dateDebut, this.dateFin).subscribe((data: any) => {
      this.inventairesData = data;
      this.getPayments(this.dateDebut, this.dateFin);
      this.applyFilters();
      this.spinne.hide();
    });
  }

  getPayments(start: string | null = null, end: string | null = null) {
      let url = `${Env.CREDIT_PAYMENTS}/all`;
      if (start && end) {
          url += `?date_debut=${start}&date_fin=${end}`;
      }
      this.data.getAll(url).subscribe((res: any) => {
          this.paymentsData = res;
          // Merge logic if needed, or just store separately
          // For now, we will merge them for display if they match filter criteria
          this.applyFilters();
      });
  }

  // Override calculateStats to include payments
  calculateStats(): void {
    const s = {
      totalEntrees: 0,
      totalSorties: 0,
      valeurAchatEntrante: 0,
      valeurVenteSortante: 0,
      netMouvement: 0,
      recettesCredit: 0
    };

    // 1. Process Inventaire
    this.filteredInventaires.forEach(item => {
      // Check if item is a payment or inventory
      if (item.type === 'paiement') {
          // It's a payment
          s.recettesCredit += Number(item.montant);
          return;
      }

      const pxAchat = item.produit?.stock?.prix_achat || 0;
      const pxVente = item.produit?.stock?.prix_vente || 0;
      const qte = item.quantite || 0;

      if (item.type === 'retrait') {
        s.totalSorties += qte;
        
        // EXCLUDE CREDIT SALES FROM REVENUE
        const isCreditSale = item.description?.toLowerCase().includes('credit');
        if (!isCreditSale) {
            s.valeurVenteSortante += (qte * pxVente);
        }
      } else {
        s.totalEntrees += qte;
        s.valeurAchatEntrante += (qte * pxAchat);
      }
    });

    s.netMouvement = s.totalEntrees - s.totalSorties;
    this.stats = s;
  }

  print() {
    // For inventaire, we use boutique ID (or 1 as default)
    const boutiqueId = this.boutiqueInfo?.id || 1;
    this.exportService.printPdf('inventaire', boutiqueId);
  }

  exportPDF() {
    const boutiqueId = this.boutiqueInfo?.id || 1;
    const filename = `Inventaire_${new Date().toISOString().split('T')[0]}.pdf`;
    this.exportService.downloadPdf('inventaire', boutiqueId, filename);
  }

}
