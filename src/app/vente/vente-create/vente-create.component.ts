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
  date: string = new Date().toISOString().slice(0, 19).replace('T', ' ');
  extraReduction: number = 0;

  typePaiement: string = 'contant';
  montantAvance: number = 0;
  pricingMode: 'detail' | 'gros' = 'detail'; 

  // UI State Controls
  isCartModalVisible: boolean = false;
  isConfirmModalVisible: boolean = false;
  confirmConfig: { title: string, message: string, action: () => void } = {
    title: '',
    message: '',
    action: () => { }
  };

  // Pagination properties
  paginatedProduits: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  pages: number[] = [];

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

  isDateModalVisible: boolean = false;

  ngOnInit(): void {
    this.loadProduits();
  }

  toggleDate(): void {
    this.isDateModalVisible = !this.isDateModalVisible;
  }

  loadProduits(): void {
    this.spinner.show();
    this.data.getAll(Env.PRODUITS).subscribe({
      next: (data: any) => {
        this.produits = data;
        this.produitsOriginal = [...data];
        this.currentPage = 1;
        this.updatePagination();
        this.spinner.hide();
      },
      error: (err) => {
        this.spinner.hide();
        this.toast.error("Erreur de chargement des produits");
      }
    });
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.produits.length / this.itemsPerPage);
    this.pages = Array(this.totalPages).fill(0).map((x, i) => i + 1);
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedProduits = this.produits.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
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

  getPrice(product: any): number {
    if (this.pricingMode === 'gros') {
      return product.prix_master || product.stock?.prix_vente || 0;
    }
    return product.prix_detail || product.stock?.prix_vente || 0;
  }

  changePricingMode(mode: 'detail' | 'gros'): void {
    this.pricingMode = mode;
    this.produitsVente.forEach(item => {
      const basePrice = this.getPrice(item.produits);
      item.prix = basePrice;
      item.prix_vendu = basePrice;
      item.montant = basePrice;
    });
    this.calculateTotal();
    this.toast.info(`Mode tarification : ${mode === 'gros' ? 'Grossiste' : 'Détail'}`);
  }

  onQuantityChange(produit: any, newQuantity: number): void {
    if (newQuantity <= 0) {
      this.onDelete(produit);
      return;
    }

    const stockDisponible = produit.stock?.quantite || 0;
    if (newQuantity > stockDisponible) {
      this.toast.warning(`Stock insuffisant. Disponible : ${stockDisponible}`);
      // Reset to max available or last valid
      const item = this.produitsVente.find(i => i.produits.id === produit.id);
      if (item) {
        item.quantite = stockDisponible;
      }
    }

    this.calculateTotal();
  }

  onPriceChange(item: any, newPrice: number): void {
    const basePrice = item.prix; 
    if (newPrice < basePrice) {
      this.toast.warning(`Le prix ne peut pas être inférieur au prix de base (${basePrice} FCFA)`);
      item.prix_vendu = basePrice;
    }
    this.calculateTotal();
  }

  onDiscountChange(): void {
    this.calculateTotal();
  }

  onGlobalReductionChange(newTotalReduction: number): void {
    const lineRemises = this.produitsVente.reduce((acc, item) => acc + (item.remise_unitaire * item.quantite), 0);
    this.extraReduction = Math.max(0, newTotalReduction - lineRemises);
    this.calculateTotal();
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
        const price = this.getPrice(produit);
        this.produitsVente.push({
          produits: produit,
          prix: price, 
          prix_vendu: price, 
          remise_unitaire: 0,
          quantite: 1,
          montant: price
        });
        this.calculateTotal();
        this.toast.success(`${produit.nom} ajouté au panier`);
      } else {
        this.toast.error('Rupture de stock');
      }
    }
  }

  calculateTotal(): void {
    const lineRemises = this.produitsVente.reduce((acc, item) => {
      return acc + (item.remise_unitaire * item.quantite);
    }, 0);
    
    this.reduction = lineRemises + this.extraReduction;

    const grossTotal = this.produitsVente.reduce((acc, item) => {
      return acc + (item.prix_vendu * item.quantite);
    }, 0);

    this.montantTotal = grossTotal - this.reduction;

    this.updateReduction();
  }

  updateReduction(): void {
    if (this.reduction > 0) {
      this.reduit = true;
      this.montantInter = this.montantTotal; 
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
      client_nom: this.factureInformation.value.client_nom || 'ANONYME',
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
        p?.nom?.toLowerCase().includes(filterValue) ||
        p?.reference?.toLowerCase().includes(filterValue) ||
        p?.categorie?.nom?.toLowerCase().includes(filterValue)
      );
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  isInCart(produitId: number): boolean {
    return this.produitsVente.some(item => item.produits.id === produitId);
  }
}
