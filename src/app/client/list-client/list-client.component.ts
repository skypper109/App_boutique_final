import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Env } from '../../services/env';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-list-client',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NgxSpinnerModule
  ],
  templateUrl: './list-client.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrl: './list-client.component.scss'
})
export class ListClientComponent implements OnInit {


  annees: any = [];
  dataS: any;
  annee: any;
  clients: any[] = [];
  change: boolean = false;
  boutique: any;

  // Pagination
  paginatedClients: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  pages: number[] = [];

  constructor(private data: DataService, private router: Router, private spinne: NgxSpinnerService) { }
  ngOnInit(): void {
    this.data.getAll(Env.ANNEEVENTE).subscribe((data: any) => {
      this.annees = data;
    });
    this.spinne.show();
    this.data.getAll(Env.CLIENT).subscribe((data: any) => {
      this.clients = data;
      this.currentPage = 1;
      this.updatePagination();
      this.spinne.hide();
      console.log(this.clients);
    });


    this.data.getById(Env.BOUTIQUES,localStorage.getItem("boutique_id")).subscribe((data: any) => {
      this.boutique = data;
    });

  }
  getClientAnnee(annee: any) {
    this.annee = annee;
    this.data.getByAnnee(Env.CLIENT, annee).subscribe((data: any) => {
      this.clients = data;
      this.currentPage = 1;
      this.updatePagination();
      console.log(data);
    });
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.clients.length / this.itemsPerPage);
    this.pages = Array(this.totalPages).fill(0).map((x, i) => i + 1);
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedClients = this.clients.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }
  accueil() {
    this.router.navigateByUrl('clients/index');
  }

}
