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
  change: boolean = false;

  constructor(private data: DataService, private router: Router, private spinne: NgxSpinnerService) { }
  ngOnInit(): void {
    if (isPlatformBrowser(this.data.platformId)) {
      this.data.getAll(Env.ANNEEVENTE).subscribe((data: any) => {
        this.annees = data;
      });
      this.spinne.show();
      this.data.getAll(Env.FACTURATION).subscribe((data: any) => {
        this.factures = data;
        this.spinne.hide();
      });
    }
  }
  getClientAnnee(annee: any) {
    this.annee = annee;
    // Utilisation de Env.FACTURATIONDATE qui est /facturations/
    this.data.getByAnnee(Env.FACTURATIONDATE, annee).subscribe((data: any) => {
      this.factures = data;
      console.log(data);
    }
    );
  }
  accueil() {
    this.router.navigateByUrl('clients/index');
  }

}
