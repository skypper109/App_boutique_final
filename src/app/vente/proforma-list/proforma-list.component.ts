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
}
