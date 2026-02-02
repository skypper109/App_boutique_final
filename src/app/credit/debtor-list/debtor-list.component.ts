import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { Env } from '../../services/env';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-debtor-list',
    standalone: true,
    imports: [CommonModule, NgxSpinnerModule, RouterModule],
    templateUrl: './debtor-list.component.html',
})
export class DebtorListComponent implements OnInit {
    debtors: any[] = [];

    constructor(
        private data: DataService,
        private spinner: NgxSpinnerService,
        private toast: ToastrService
    ) { }

    ngOnInit(): void {
        this.loadDebtors();
    }

    loadDebtors(): void {
        this.spinner.show();
        this.data.getAll(Env.CREDIT_DEBTORS).subscribe({
            next: (res: any) => {
                this.debtors = res;
                this.spinner.hide();
            },
            error: (err) => {
                this.spinner.hide();
                this.toast.error("Erreur de chargement des débiteurs");
            }
        });
    }
}
