import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { DataService } from '../../services/data.service';
import { Env } from '../../services/env';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-compta-facture',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    FormsModule,
    NgxSpinnerModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './compta-facture.component.html',
  styleUrl: './compta-facture.component.scss'
})
export class ComptaFactureComponent implements OnInit {

  annees: any = [];
  dataS: any;
  annee: any;
  factures: any = [];
  paginatedFactures: any = [];
  
  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  pages: number[] = [];

  constructor(private data: DataService, private router: Router, private spinne: NgxSpinnerService) { }
  
  ngOnInit(): void {
    if (isPlatformBrowser(this.data.platformId)) {
      this.data.getAll(Env.ANNEEVENTE).subscribe((data: any) => {
        this.annees = data;
      });
      this.spinne.show();
      this.data.getAll(Env.FACTURATION).subscribe((data: any) => {
        this.factures = data;
        this.currentPage = 1;
        this.updatePagination();
        this.spinne.hide();
      });
    }
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.factures.length / this.itemsPerPage);
    this.pages = Array(this.totalPages).fill(0).map((x, i) => i + 1);
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedFactures = this.factures.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  getClientAnnee(annee: any) {
    this.annee = annee;
    this.spinne.show();
    this.data.getByAnnee(Env.FACTURATIONDATE, annee).subscribe((data: any) => {
      this.factures = data;
      this.currentPage = 1;
      this.updatePagination();
      this.spinne.hide();
      console.log(data);
    });
  }

  accueil() {
    this.router.navigateByUrl('clients/index');
  }

}
