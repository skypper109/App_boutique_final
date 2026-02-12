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
    recettesCredit: 0,
    beneficeTheorique: 0
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
    this.data.getAll(Env.INVENTAIRE).subscribe((res: any) => {
      this.inventairesData = res.items || [];
      this.sortData();
      this.filteredInventaires = [...this.inventairesData];
      this.stats = res.stats;
      this.boutiqueInfo = res.boutique || this.boutiqueInfo;
      
      this.updatePagination();
      this.spinne.hide();
    });

    this.data.getAll(Env.ANNEEVENTE).subscribe((data: any) => {
      this.years = data;
    });
  }

  applyFilters(): void {
    let result = [...this.inventairesData];

    // Client-side search and type filtering remains for UI reactivity
    if (this.filterType !== 'all') {
      result = result.filter(item => item.type === this.filterType);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(item =>
        item.produit?.nom?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.produit?.reference?.toLowerCase().includes(term) ||
        item.user?.name?.toLowerCase().includes(term) ||
        item.vente_id?.toString().includes(term)
      );
    }

    this.filteredInventaires = result;
    this.sortDataOnFiltered();
    this.currentPage = 1;
    this.updatePagination();
  }

  sortData(): void {
    this.inventairesData.sort((a, b) => {
      const dateA = new Date(a.date || a.date_paiement || a.created_at || 0).getTime();
      const dateB = new Date(b.date || b.date_paiement || b.created_at || 0).getTime();
      return dateB - dateA;
    });
  }

  sortDataOnFiltered(): void {
    this.filteredInventaires.sort((a, b) => {
      const dateA = new Date(a.date || a.date_paiement || a.created_at || 0).getTime();
      const dateB = new Date(b.date || b.date_paiement || b.created_at || 0).getTime();
      return dateB - dateA;
    });
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
    this.data.getByIntervalle(Env.INVENTAIRE, this.dateDebut, this.dateFin).subscribe((res: any) => {
      this.inventairesData = res.items || [];
      this.stats = res.stats;
      this.sortData();
      this.applyFilters();
      this.spinne.hide();
    });
  }

  // getPayments is no longer needed separately as it's merged in backend
  
  print() {
    const boutiqueId = this.boutiqueInfo?.id || 1;
    const filters = {
      start_date: this.dateDebut,
      end_date: this.dateFin
    };
    this.exportService.printPdf('inventaire', boutiqueId, filters);
  }

  exportPDF() {
    const boutiqueId = this.boutiqueInfo?.id || 1;
    const filters = {
      start_date: this.dateDebut,
      end_date: this.dateFin
    };
    const filename = `Inventaire_${this.dateDebut || 'tous'}_${this.dateFin || ''}.pdf`;
    this.exportService.downloadPdf('inventaire', boutiqueId, filename, filters);
  }

}
