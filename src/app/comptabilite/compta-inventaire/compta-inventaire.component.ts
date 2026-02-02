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
    RouterLink,
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
    netMouvement: 0
  };

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
      if (data && data.length > 0 && data[0].boutique) {
        this.boutiqueInfo = data[0].boutique;
      }
      this.spinne.hide();
    });

    // Recuperation des annees
    this.data.getAll(Env.ANNEEVENTE).subscribe((data: any) => {
      this.years = data;
    });
  }

  applyFilters(): void {
    let result = [...this.inventairesData];

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
        item.user?.name?.toLowerCase().includes(term)
      );
    }

    this.filteredInventaires = result;
    this.calculateStats();
  }

  getInventaireByDate() {
    if (!this.dateDebut || !this.dateFin) return;

    this.spinne.show();
    this.data.getByIntervalle(Env.INVENTAIRE, this.dateDebut, this.dateFin).subscribe((data: any) => {
      this.inventairesData = data;
      this.applyFilters();
      this.spinne.hide();
    });
  }

  calculateStats(): void {
    const s = {
      totalEntrees: 0,
      totalSorties: 0,
      valeurAchatEntrante: 0,
      valeurVenteSortante: 0,
      netMouvement: 0
    };

    this.filteredInventaires.forEach(item => {
      const pxAchat = item.produit?.stock?.prix_achat || 0;
      const pxVente = item.produit?.stock?.prix_vente || 0;
      const qte = item.quantite || 0;

      if (item.type === 'retrait') {
        s.totalSorties += qte;
        s.valeurVenteSortante += (qte * pxVente);
      } else {
        s.totalEntrees += qte;
        s.valeurAchatEntrante += (qte * pxAchat);
      }
    });

    s.netMouvement = s.totalEntrees - s.totalSorties;
    this.stats = s;
  }

  print() {
    this.exportService.printElement('#printable-inventaire');
  }

  exportPDF() {
    const filename = `Inventaire_${new Date().toISOString().split('T')[0]}`;
    this.exportService.exportToPdf('#printable-inventaire', filename, 'landscape');
  }

}
