import { CommonModule } from '@angular/common';
import { ProdCreateComponent } from '../prod-create/prod-create.component';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Env } from '../../services/env';
import { CfaPipe } from '../../pipes/cfa.pipe';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../login/Guard/login.service';

@Component({
  selector: 'app-prod-list',
  standalone: true,

  templateUrl: './prod-list.component.html',
  styleUrl: './prod-list.component.scss',
  imports: [
    CommonModule,
    RouterLink,
    NgxSpinnerModule,
    FormsModule,
    ReactiveFormsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProdListComponent implements OnInit {
  produits: any[] = [];
  filteredProduits: any[] = [];
  topVente: any[] = [];
  searchTerm: string = '';
  showTrash: boolean = false;
  trashedProduits: any[] = [];

  userRole: string | null = null;

  // Pagination simplified
  pageSize = 10;
  currentPage = 1;

  // Modal states
  selectedProdId?: number;
  restoreQuantity: number = 0;
  isRestoreModalOpen: boolean = false;
  isDeleteModalOpen: boolean = false;
  isFormModalOpen: boolean = false;
  categories: any;

  formData: FormData = new FormData();
  produitForm: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private data: DataService,
    private route: ActivatedRoute,
    private router: Router,
    private dataLog: LoginService,
    private spinne: NgxSpinnerService,
    private fb: FormBuilder,
    private toast: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.produitForm = this.fb.group({
      categorie_id: ['', Validators.required],
      file: File || null,
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.spinne.show();
      this.userRole = this.dataLog.getRole();
      this.loadProduits();
      this.spinne.hide(); this.data.getAll(Env.CATEGORIES).subscribe(
        (data) => {
          console.log(data);
          this.categories = data;
        },
        (error) => {
          console.log(error);
          this.categories = ['Électronique', 'Mobilier', 'Papeterie'];
        }
      );
    }
  }

  openModalImport() {
    this.isFormModalOpen = true;
  }

  loadProduits(): void {
    this.data.getAll(Env.PRODUITS).subscribe(
      (data: any) => {
        this.produits = data;
        if (!this.showTrash) {
          this.filteredProduits = data;
        }
      },
      (error) => {
        console.error('Erreur lors de la récupération des produits :', error);
      }
    );

    this.data.getAll(Env.TOPVENTE).subscribe(
      (data: any) => {
        this.topVente = data;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  loadTrashed(): void {
    this.spinne.show();
    this.data.getAll(Env.PRODUITS_TRASHED).subscribe({
      next: (data) => {
        this.trashedProduits = data;
        if (this.showTrash) {
          this.filteredProduits = data;
        }
        this.spinne.hide();
      },
      error: (err) => {
        console.error(err);
        this.spinne.hide();
      }
    });
  }

  toggleTrash() {
    this.showTrash = !this.showTrash;
    this.searchTerm = '';
    if (this.showTrash) {
      this.loadTrashed();
    } else {
      this.loadProduits();
    }
  }

  valider() {
    if (this.produitForm.invalid || !this.selectedFile) {
      this.toast.warning("Veuillez sélectionner une catégorie et un fichier valide", "Données manquantes");
      return;
    }

    this.spinne.show();

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('categorie_id', this.produitForm.get('categorie_id')?.value);

    this.data.add(Env.API_URL + '/produits/import-csv', formData).subscribe({
      next: (res: any) => {
        this.toast.success(res.message, "Succès");
        this.loadProduits();
        this.isFormModalOpen = false;
        this.spinne.hide();
        this.produitForm.reset();
        this.selectedFile = null;
      },
      error: (err) => {
        console.log(formData.get('file'));
        console.error(err);
        this.toast.error("Échec de l'importation. Vérifiez le format du fichier.", "Erreur");
        this.spinne.hide();
      }
    });
  }

  urlData: string | ArrayBuffer | null = null;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      console.log('Fichier sélectionné:', file.name);
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.searchTerm = filterValue;
    this.filteredProduits = this.produits.filter(p =>
      p.nom.toLowerCase().includes(filterValue) ||
      p.reference.toLowerCase().includes(filterValue) ||
      p.categorie.nom.toLowerCase().includes(filterValue)
    );
  }

  produitByid: any = {};

  openDeleteModal(id: number) {
    this.selectedProdId = id;
    this.isDeleteModalOpen = true;
    // In a real bootstrap app, you'd use a library or native bootstrap data-bs-toggle
    // But since we want "designer modals", we'll manage the visibility via [ngClass] or similar
  }

  confirmDelete() {
    if (this.selectedProdId) {
      this.spinne.show();
      this.data.delete(Env.PRODUITS, this.selectedProdId).subscribe({
        next: () => {
          this.toast.success("Produit déplacé vers la corbeille", "Succès");
          this.loadProduits();
          this.isDeleteModalOpen = false;
          this.spinne.hide();
        },
        error: (error) => {
          console.error(error);
          this.toast.error("Erreur lors de la suppression", "Erreur");
          this.spinne.hide();
        }
      });
    }
  }

  openRestoreModal(id: number) {
    this.selectedProdId = id;
    this.restoreQuantity = 0;
    this.isRestoreModalOpen = true;
  }

  confirmRestore() {
    if (this.selectedProdId) {
      const payload = { quantite: this.restoreQuantity };
      this.spinne.show();
      this.data.add(Env.PRODUITS + '/' + this.selectedProdId + '/restore', payload).subscribe({
        next: () => {
          this.toast.success("Produit restauré avec succès", "Succès");
          this.loadTrashed();
          this.isRestoreModalOpen = false;
          this.spinne.hide();
        },
        error: (err) => {
          console.error(err);
          this.toast.error("Erreur lors de la restauration", "Erreur");
          this.spinne.hide();
        }
      });
    }
  }

  openCreateModal() {
    this.selectedProdId = undefined;
    this.isFormModalOpen = true;
  }

  openEditModal(id: number) {
    this.selectedProdId = id;
    this.isFormModalOpen = true;
  }

  onProductSaved() {
    this.isFormModalOpen = false;
    this.loadProduits();
  }

  onDelete(id: number) {
    // Keep for potential legacy use or refactor to use openDeleteModal
    this.openDeleteModal(id);
  }

  onRestore(id: number) {
    this.openRestoreModal(id);
  }
  elementId(id: any) {
    console.log(id);
    this.data.getById(Env.PRODUITS, id).subscribe(
      (data) => {
        console.log(data);
        this.produitByid = data;
      },
      (error) => {
        console.log(error);
      }
    );
  }



  get isAdmin(): boolean {
    return this.userRole?.toLowerCase() === 'admin';
  }

  get isVendeur(): boolean {
    return this.userRole?.toLowerCase() === 'vendeur';
  }

  get isComptable(): boolean {
    return this.userRole?.toLowerCase() === 'comptable';
  }

  get isGestionnaire(): boolean {
    return this.userRole?.toLowerCase() === 'gestionnaire';
  }

}

