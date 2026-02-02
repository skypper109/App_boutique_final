import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { Env } from '../../services/env';
import { Router, RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-credit-list',
    standalone: true,
    imports: [CommonModule, RouterModule, NgxSpinnerModule],
    templateUrl: './credit-list.component.html',
})
export class CreditListComponent implements OnInit {
    credits: any[] = [];

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
                this.spinner.hide();
            },
            error: (err) => {
                this.spinner.hide();
                this.toast.error("Erreur de chargement des crédits");
            }
        });
    }

    viewDetail(id: number): void {
        this.router.navigate(['/credits/detail', id]);
    }
}
