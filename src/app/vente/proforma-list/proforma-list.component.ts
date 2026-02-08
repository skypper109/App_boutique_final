import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { Env } from '../../services/env';
import { Router, RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-proforma-list',
    standalone: true,
    imports: [CommonModule, RouterModule, NgxSpinnerModule],
    templateUrl: './proforma-list.component.html',
})
export class ProformaListComponent implements OnInit {
    proformas: any[] = [];
    paginatedProformas: any[] = [];

    // Pagination
    currentPage: number = 1;
    itemsPerPage: number = 10;
    totalPages: number = 0;
    pages: number[] = [];

    constructor(
        private data: DataService,
        private spinner: NgxSpinnerService,
        private toast: ToastrService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadProformas();
    }

    loadProformas(): void {
        this.spinner.show();
        this.data.getAll(Env.PROFORMAS).subscribe({
            next: (res: any) => {
                this.proformas = res;
                this.currentPage = 1;
                this.updatePagination();
                this.spinner.hide();
            },
            error: (err) => {
                this.spinner.hide();
                console.log(err)
                this.toast.error("Erreur de chargement des pro-formas");
            }
        });
    }

    viewDetail(id: number): void {
        this.router.navigate(['/credits/detail', id]);
    }

    updatePagination(): void {
        this.totalPages = Math.ceil(this.proformas.length / this.itemsPerPage);
        this.pages = Array(this.totalPages).fill(0).map((x, i) => i + 1);
        
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.paginatedProformas = this.proformas.slice(startIndex, endIndex);
    }

    changePage(page: number): void {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.updatePagination();
    }
}
