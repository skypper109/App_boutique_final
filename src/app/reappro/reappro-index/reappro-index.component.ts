import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Env } from '../../services/env';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProduitsService } from '../../Data/produits.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-reappro-index',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    RouterLink
  ],
  templateUrl: './reappro-index.component.html',
  styleUrl: './reappro-index.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ReapproIndexComponent implements OnInit {
  nomProduit: any;
  elementId(arg0: any) {
    throw new Error('Method not implemented.');
  }
  toastr = inject(ToastrService) as ToastrService
  constructor(private data: DataService, private dataP: ProduitsService, private spinne: NgxSpinnerService) { }
  produits: any[] = []; // Changed to array
  produitTri: any;
  produitsOriginal: any[] = []; // Changed to array

  // Pagination
  paginatedProduits: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  pages: number[] = [];
  ngOnInit(): void {

    this.spinne.show();
    this.data.getAll(Env.REAPPROVISIONNEMENT).subscribe(
      (data) => {
        console.log(data);
        this.produits = data;
        this.produitsOriginal = data;
        this.currentPage = 1;
        this.updatePagination();
      }
    );
    this.spinne.hide();
  }

  onUpdate: any;
  onAdd(arg0: any) { }
  onRemove: any;
  produitByid: any = {
    id: 0,
    nom: '',
    prix: 0,
    quantite: 0,
    categorie: '',
  };

  // Utilisation d'une Map pour stocker les modifications (id -> modification)
  modifications = new Map<number, any>();

  // Getter pour convertir la Map en tableau pour l'affichage
  get produitsChanger(): any[] {
    return Array.from(this.modifications.values());
  }

  onQuantityChange(event: Event, produit: any): void {
    const input = event.target as HTMLInputElement;
    const qtyToAdd = parseInt(input.value, 10);

    // Validation basique
    if (isNaN(qtyToAdd) || qtyToAdd <= 0) {
      if (this.modifications.has(produit.id)) {
        this.modifications.delete(produit.id);
        input.style.backgroundColor = 'white';
      }
      return;
    }

    // Création de l'objet modification
    const modif = {
      produit_id: produit.id,
      produit: produit.nom,
      quantite: qtyToAdd,
      prix_achat: produit.stock?.prix_achat || 0,
      prix_vente: produit.stock?.prix_vente || 0
    };

    // Mise à jour de la Map
    this.modifications.set(produit.id, modif);

    // Feedback visuel
    input.style.backgroundColor = '#d1fae5'; // Vert clair
    input.style.borderColor = '#10b981';
  }


  //
  onValider() {
    this.spinne.show();
    console.log(this.produitsChanger);
    this.dataP.postReappro(Env.REAPPROVISIONNEMENT, { produits: this.produitsChanger }).subscribe(
      (data) => {
        console.log(data);

        this.modifications.clear();
        this.nomProduit = '';
        this.data.getAll(Env.REAPPROVISIONNEMENT).subscribe(
          (data) => {
            // console.log(data);
            this.produits = data;
            this.produitsOriginal = data;
            this.currentPage = 1;
            this.updatePagination();
          }
        );
        this.spinne.hide();

        this.toastr.success(`Reapprovisionnement effectué avec succès`, 'Succès', {
          closeButton: true,
          timeOut: 5000,
          progressBar: true,
          progressAnimation: 'increasing',
          positionClass: 'toast-top-full-width',
          tapToDismiss: true,
        });

      },
      (error) => {
        console.log(error);
        this.spinne.hide();

        this.toastr.error(`Erreur lors du reapprovisionnement`, 'Erreur', {
          closeButton: true,
          timeOut: 5000,
          progressBar: true,
          progressAnimation: 'increasing',
          positionClass: 'toast-top-right',
          tapToDismiss: true,
        });

      }
    );
  }
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();

    // Si le filtre est vide, réinitialisez à la liste originale
    if (!filterValue) {
      this.produits = [...this.produitsOriginal];
    } else {
      // Filtrer les produits selon le filtre
      this.produitTri = this.produitsOriginal.filter((produit: { nom: string; description: string; categorie: any, reference: string }) =>
        produit.nom.toLowerCase().includes(filterValue) || 
        (produit.description && produit.description.toLowerCase().includes(filterValue)) || 
        (produit.categorie && produit.categorie.nom.toLowerCase().includes(filterValue)) ||
        (produit.reference && produit.reference.toLowerCase().includes(filterValue))
      );

      // Mettez à jour la liste affichée
      this.produits = [...this.produitTri];
    }
    
    this.currentPage = 1;
    this.updatePagination();
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

}

