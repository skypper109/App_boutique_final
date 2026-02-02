import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Env } from '../../services/env';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-vente-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule
  ],
  templateUrl: './vente-create.component.html',
  styleUrl: './vente-create.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class VenteCreateComponent implements OnInit {
  produits: any[] = [];
  produitsOriginal: any[] = [];
  produitsVente: any[] = [];
  factureInformation: FormGroup;
  montantTotal: number = 0;
  reduction: number = 0;
  reduit: boolean = false;
  montantInter: number = 0;
  date = new Date().toISOString();

  typePaiement: string = 'contant';
  montantAvance: number = 0;

  // UI State Controls
  isCartModalVisible: boolean = false;
  isConfirmModalVisible: boolean = false;
  confirmConfig: { title: string, message: string, action: () => void } = {
    title: '',
    message: '',
    action: () => { }
  };

  constructor(
    private data: DataService,
    private fb: FormBuilder,
    private router: Router,
    private toast: ToastrService,
    private spinner: NgxSpinnerService
  ) {
    this.factureInformation = this.fb.group({
      client_nom: [''],
      adresse: [''],
      numero: ['']
    });
  }

  ngOnInit(): void {
    this.loadProduits();
  }

  loadProduits(): void {
    this.spinner.show();
    this.data.getAll(Env.PRODUITS).subscribe({
      next: (data: any) => {
        this.produits = data;
        this.produitsOriginal = [...data];
        this.spinner.hide();
      },
      error: (err) => {
        this.spinner.hide();
        this.toast.error("Erreur de chargement des produits");
      }
    });
  }

  toggleCart(): void {
    this.isCartModalVisible = !this.isCartModalVisible;
  }

  openConfirm(title: string, message: string, action: () => void) {
    this.confirmConfig = { title, message, action };
    this.isConfirmModalVisible = true;
  }

  closeConfirm() {
    this.isConfirmModalVisible = false;
  }

  executeConfirm() {
    this.confirmConfig.action();
    this.closeConfirm();
  }

  onAdd(produit: any): void {
    const item = this.produitsVente.find(i => i.produits.id === produit.id);
    if (item) {
      if (item.quantite < (produit.stock?.quantite || 0)) {
        item.quantite++;
        this.calculateTotal();
      } else {
        this.toast.warning('Stock insuffisant');
      }
    }
  }

  onRemove(produit: any): void {
    const index = this.produitsVente.findIndex(i => i.produits.id === produit.id);
    if (index > -1) {
      if (this.produitsVente[index].quantite > 1) {
        this.produitsVente[index].quantite--;
      } else {
        this.produitsVente.splice(index, 1);
      }
      this.calculateTotal();
    }
  }

  onDelete(produit: any): void {
    const index = this.produitsVente.findIndex(i => i.produits.id === produit.id);
    if (index > -1) {
      this.produitsVente.splice(index, 1);
      this.calculateTotal();
    }
  }

  onStock(produit: any): void {
    const existing = this.produitsVente.find(i => i.produits.id === produit.id);
    if (existing) {
      this.onAdd(produit);
    } else {
      if (produit.stock?.quantite > 0) {
        this.produitsVente.push({
          produits: produit,
          prix: produit.stock.prix_vente,
          quantite: 1,
          montant: produit.stock.prix_vente
        });
        this.calculateTotal();
        this.toast.success(`${produit.nom} ajouté au panier`);
      } else {
        this.toast.error('Rupture de stock');
      }
    }
  }

  calculateTotal(): void {
    this.montantTotal = this.produitsVente.reduce((acc, item) => acc + (item.prix * item.quantite), 0);
    this.updateReduction();
  }

  updateReduction(): void {
    if (this.reduction > 0) {
      this.reduit = true;
      this.montantInter = this.montantTotal - this.reduction;
    } else {
      this.reduit = false;
      this.montantInter = this.montantTotal;
    }
  }

  onVente(valid: boolean): void {
    if (this.produitsVente.length === 0) {
      this.toast.error("Le panier est vide");
      return;
    }

    this.spinner.show();
    const payload = {
      produits: this.produitsVente,
      montant_total: this.reduit ? this.montantInter : this.montantTotal,
      date: this.date,
      remise: this.reduction,
      client_nom: this.factureInformation.value.client_nom || 'Anonyme',
      client_numero: this.factureInformation.value.numero,
      adresse: this.factureInformation.value.adresse,
      type_paiement: this.typePaiement,
      montant_avance: this.typePaiement === 'credit' ? this.montantAvance : 0,
      is_proforma: false
    };

    this.data.add(Env.VENTES, payload).subscribe({
      next: (data: any) => {
        this.spinner.hide();
        this.isCartModalVisible = false;

        if (this.typePaiement === 'contant') {
          this.openConfirm(
            "Vente Réussie",
            "La transaction a été enregistrée. Voulez-vous générer la facture client maintenant ?",
            () => this.router.navigate(['/clients/facture', data.factID])
          );
        } else {
          this.router.navigate(['/credits/detail', data.venteID]);
        }
        this.resetForm();
      },
      error: (err) => {
        this.spinner.hide();
        this.toast.error('Erreur lors de la validation');
      }
    });
  }

  onProforma(): void {
    if (this.produitsVente.length === 0) {
      this.toast.error("Le panier est vide");
      return;
    }

    this.spinner.show();
    const payload = {
      produits: this.produitsVente,
      montant_total: this.reduit ? this.montantInter : this.montantTotal,
      date: this.date,
      remise: this.reduction,
      client_nom: this.factureInformation.value.client_nom || 'Anonyme',
      client_numero: this.factureInformation.value.numero,
      adresse: this.factureInformation.value.adresse,
      is_proforma: true
    };

    this.data.add(Env.VENTES, payload).subscribe({
      next: (data: any) => {
        this.spinner.hide();
        this.toast.success('Bordereau / Pro-forma généré');
        this.isCartModalVisible = false;
        this.router.navigate(['/credits/detail', data.venteID]);
        this.resetForm();
      },
      error: () => {
        this.spinner.hide();
        this.toast.error('Erreur génération pro-forma');
      }
    });
  }

  resetForm(): void {
    this.produitsVente = [];
    this.montantTotal = 0;
    this.reduction = 0;
    this.reduit = false;
    this.montantInter = 0;
    this.factureInformation.reset();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    if (!filterValue) {
      this.produits = [...this.produitsOriginal];
    } else {
      this.produits = this.produitsOriginal.filter(p =>
        p.nom.toLowerCase().includes(filterValue) ||
        p.description?.toLowerCase().includes(filterValue) ||
        p.categorie.nom.toLowerCase().includes(filterValue)
      );
    }
  }

  isInCart(produitId: number): boolean {
    return this.produitsVente.some(item => item.produits.id === produitId);
  }
}
