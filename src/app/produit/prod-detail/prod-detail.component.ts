import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Env } from '../../services/env';
import { CommonModule } from '@angular/common';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-prod-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, NgxSpinnerModule],
  templateUrl: './prod-detail.component.html',
  styleUrl: './prod-detail.component.scss'
})
export class ProdDetailComponent implements OnInit {
  produit: any;
  inventaires: any[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private data: DataService,
    private spinne: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.params['desc']; // Route is /detail/:desc but desc is likely ID
    this.fetchDetails(id);
  }

  fetchDetails(id: any) {
    this.loading = true;
    // Use the optimized editProd route which returns product + stock + category + inventaires
    this.data.getById(Env.PRODUITS + '/editProd', id).subscribe({
      next: (res: any) => {
        this.produit = res;
        this.inventaires = res.inventaires || [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'ajout': return 'Réapprovisionnement';
      case 'vente': return 'Vente';
      case 'retour': return 'Retour';
      default: return type;
    }
  }
}
