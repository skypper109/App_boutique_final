import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { Env } from '../../services/env';
import { Router, RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-credit-list',
    standalone: true,
    imports: [CommonModule, RouterModule, NgxSpinnerModule, FormsModule],
    templateUrl: './credit-list.component.html',
})
export class CreditListComponent implements OnInit {
    credits: any[] = [];
    filteredCredits: any[] = [];
    paginatedCredits: any[] = [];

    // Pagination & Filter
    searchText: string = '';
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
        this.loadCredits();
    }

    loadCredits(): void {
        this.spinner.show();
        this.data.getAll(Env.CREDITS).subscribe({
            next: (res: any) => {
                this.credits = res;
                this.applyFilter();
                this.spinner.hide();
            },
            error: (err) => {
                this.spinner.hide();
                this.toast.error("Erreur de chargement des crédits");
            }
        });
    }

    applyFilter(): void {
        if (this.searchText) {
            const lowerInfo = this.searchText.toLowerCase();
            this.filteredCredits = this.credits.filter(c => 
                (c.client?.nom?.toLowerCase().includes(lowerInfo)) ||
                (c.client?.telephone?.includes(lowerInfo)) ||
                ('Credit').toLowerCase().includes(lowerInfo)
            );
        } else {
            this.filteredCredits = [...this.credits];
        }
        
        this.currentPage = 1;
        this.updatePagination();
    }

    updatePagination(): void {
        this.totalPages = Math.ceil(this.filteredCredits.length / this.itemsPerPage);
        this.pages = Array(this.totalPages).fill(0).map((x, i) => i + 1);
        
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.paginatedCredits = this.filteredCredits.slice(startIndex, endIndex);
    }

    changePage(page: number): void {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.updatePagination();
    }

    viewDetail(id: number): void {
        this.router.navigate(['/credits/detail', id]);
    }
}
