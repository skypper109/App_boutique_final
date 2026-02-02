import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  FormSubmittedEvent,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Env } from '../../services/env';
import { ProduitsService } from '../../Data/produits.service';
import { ToastrService } from 'ngx-toastr';
import { Console } from 'console';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-prod-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink, 
  ],
  templateUrl: './prod-create.component.html',
  styleUrl: './prod-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProdCreateComponent implements OnInit {
  readonly startDate = new Date(1990, 0, 1);
  produitForm: FormGroup;
  previewImage: string | ArrayBuffer | null = '';

  categories: any;
  buttonUpdate: boolean = false;
  toastr = inject(ToastrService) as ToastrService;

  constructor(
    private fb: FormBuilder,
    private data: DataService,
    private router: Router,
    private dataProd: ProduitsService,
    private spinne: NgxSpinnerService
  ) {
    // var toastr = inject(ToastrService) as ToastrService
    this.produitForm = this.fb.group({
      nom: ['', Validators.required],
      reference: [''],
      categorie_id: ['', Validators.required],
      quantite: [1, { value: Number, disabled: false }],
      prixVente: [0, { value: Number, disabled: false }],
      prixAchat: [0, { value: Number, disabled: false }],
      montantPaye: [{ value: Number, disabled: true }],
      montantEstime: [{ value: 0, disabled: true }],
      description: [''],
      image: File || null,
      dateAchat: ['', { value: Date, disabled: false }],
      dateFinGarantie: ['', { value: Date, disabled: false }],
    });

    this.produitForm
      .get('quantite')
      ?.valueChanges.subscribe(() => this.updateMontantPaye());
    this.produitForm
      .get('prixAchat')
      ?.valueChanges.subscribe(() => this.updateMontantPaye());
    this.produitForm
      .get('prixVente')
      ?.valueChanges.subscribe(() => this.updateMontantEstime());
  }
  id: any;
  ngOnInit() {
    this.spinne.show();
    // Pour la liste des catégories qui sont présentes dans la base de données
    this.data.getAll(Env.CATEGORIES).subscribe(
      (data) => {
        console.log(data);
        this.categories = data;
      },
      (error) => {
        console.log(error);
        this.categories = ['Électronique', 'Mobilier', 'Papeterie'];
      }
    );
    // Pour la modification d'un produit
    this.id = this.router.url.split('/')[3];
    if (this.id) {
      this.produitForm.get('quantite')?.disable();
      this.produitForm.get('prixVente')?.disable();
      this.produitForm.get('prixAchat')?.disable();
      this.produitForm.get('dateAchat')?.disable();
      this.produitForm.get('dateFinGarantie')?.disable();
      this.buttonUpdate = true;
      console.log(this.id);

      this.dataProd.editProd(this.id).subscribe(
        (data: any) => {
          console.log(data);
          this.produitForm.get('nom')?.setValue(data.nom);
          this.produitForm.get('reference')?.setValue(data.reference);
          this.produitForm.get('categorie_id')?.setValue(data.categorie.id);
          this.produitForm.get('quantite')?.setValue(data.stock.quantite);
          this.produitForm.get('prixVente')?.setValue(data.stock.prix_vente);
          this.produitForm.get('prixAchat')?.setValue(data.stock.prix_achat);
          this.produitForm.get('description')?.setValue(data.description);
          this.filePreview = data.image;
        },
        (error) => {
          console.log(error);
        }
      );

      // this.data.getById(Env.PRODUITS, this.id).subscribe(
      //   (data:any) => {
      //     console.log(data);
      //     this.produitForm.get('nom')?.setValue(data.nom);
      //     this.produitForm.get('categorie')?.setValue(data.categorie_id);
      //     this.produitForm.get('quantite')?.setValue(data.quantite);
      //     this.produitForm.get('prixVente')?.setValue(data.prix_vente);
      //     this.produitForm.get('prixAchat')?.setValue(data.prix_achat);
      //     this.produitForm.get('description')?.setValue(data.description);
      //     this.filePreview = data.image;
      //   },
      //   (error) => {
      //     console.log(error);
      //   }
      // );

      this.spinne.hide();
    }
    this.spinne.hide();
  }

  updateMontantPaye() {
    const quantite = this.produitForm.get('quantite')?.value || 1;
    const prixUnitaire = this.produitForm.get('prixAchat')?.value || 0;
    this.produitForm.get('montantPaye')?.setValue(quantite * prixUnitaire);
  }

  updateMontantEstime() {
    const quantite = this.produitForm.get('quantite')?.value || 1;
    const montantPaye = this.produitForm.get('montantPaye')?.value || 0;
    const prixUnitaire = this.produitForm.get('prixVente')?.value || 0;
    this.produitForm
      .get('montantEstime')
      ?.setValue(quantite * prixUnitaire - montantPaye);
  }

  selectedFile: File | null = null;
  filePreview: string | ArrayBuffer | null = null;

  onFileSelected(event: any): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = event.target.files[0];
    this.produitForm.get('image')?.setValue(event.target.files[0]);
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      // Afficher un aperçu si c'est une image
      if (this.selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          this.filePreview = reader.result;
        };
        reader.readAsDataURL(this.selectedFile);
      } else {
        this.filePreview = null; // Réinitialiser si ce n'est pas une image
      }
    }
  }
  onSubmit() {

    this.spinne.show();
    if (this.produitForm.valid && this.selectedFile) {
      const formData = new FormData();
      formData.append('nom', this.produitForm.value.nom);
      formData.append('categorie_id', this.produitForm.value.categorie_id);
      formData.append('quantite', this.produitForm.value.quantite);
      formData.append('prixVente', this.produitForm.value.prixVente);
      formData.append('prixAchat', this.produitForm.value.prixAchat);
      formData.append('montantPaye', this.produitForm.value.montantPaye);
      formData.append('montantEstime', this.produitForm.value.montantEstime);
      formData.append('image', this.selectedFile);
      formData.append('description', this.produitForm.value.description);
      formData.append('dateAchat', this.produitForm.value.dateAchat);

      // Afficher chaque paire clé/valeur du FormData pour vérifier

      this.dataProd.createProduit(Env.PRODUITS, formData).subscribe(
        (response) => {
          console.log('Produit créé avec succès!', response);
          this.spinne.hide();

          this.router.navigate(['/produits/list']);
          this.toastr.success('Produit créé avec succès!', 'Succès', {
            closeButton: true,
            timeOut: 10000,
            progressBar: true,
            progressAnimation: 'increasing',
          });
          // Rediriger vers la liste des produits
        },
        (error) => {
          this.spinne.hide();
          console.error('Erreur est : ', error);
          this.toastr.error(
            'Erreur lors de la création du produit!',
            'Succès',
            {
              closeButton: true,
              timeOut: 10000,
              progressBar: true,
              progressAnimation: 'increasing',
            }
          );
        }
      );
    } else if (this.produitForm.valid && !this.selectedFile) {
      //Envoie de formdata sans image
      const formData = new FormData();
      formData.append('nom', this.produitForm.value.nom);
      formData.append('categorie_id', this.produitForm.value.categorie_id);
      formData.append('quantite', this.produitForm.value.quantite);
      formData.append('prixVente', this.produitForm.value.prixVente);
      formData.append('prixAchat', this.produitForm.value.prixAchat);
      formData.append('montantPaye', this.produitForm.value.montantPaye);
      formData.append('montantEstime', this.produitForm.value.montantEstime);
      formData.append('description', this.produitForm.value.description);
      formData.append('dateAchat', this.produitForm.value.dateAchat);
      this.dataProd.createProduit(Env.PRODUITS, formData).subscribe(
        (response) => {
          console.log('Produit créé avec succès!', response);
          this.spinne.hide();

          this.router.navigate(['/produits/list']);
          this.toastr.success('Produit créé avec succès!', 'Succès', {
            closeButton: true,
            timeOut: 10000,
            progressBar: true,
            progressAnimation: 'increasing',
          });
          // Rediriger vers la liste des produits
        },
        (error) => {
          this.spinne.hide();
          console.error('Erreur est : ', error);
          this.toastr.error(
            'Erreur lors de la création du produit!',
            'Succès',
            {
              closeButton: true,
              timeOut: 10000,
              progressBar: true,
              progressAnimation: 'increasing',
            }
          );
        }
      );
    } else {
      this.spinne.hide();
      // console.log('Le formulaire n\'est pas valide');
      this.toastr.error("Le formulaire n'est pas valide!", 'Erreur', {
        closeButton: true,
        timeOut: 10000,
        progressBar: true,
        progressAnimation: 'increasing',
      });
    }
  }
  onUpdate() {
    this.spinne.show();
    if (this.produitForm.valid) {
      var formData = new FormData();


      // Ajoute tous les champs avec les bonnes clés
      formData.append('nom', this.produitForm.value.nom);
      formData.append('reference', this.produitForm.value.reference || '');
      formData.append('categorie_id', this.produitForm.value.categorie_id.toString());
      formData.append('description', this.produitForm.value.description);

      // Vérifie si une image est sélectionnée
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }
      // formData.append('description', this.produitForm.value);
      console.log(formData);
      this.dataProd.updateProd(this.id, formData).subscribe(
        (data) => {
          console.log('Produit modifié avec succès!', data);
          this.spinne.hide();

          this.toastr.success(
            `Produit ${this.produitForm.value.nom} modifié avec succès!`,
            'Succès',
            {
              closeButton: true,
              timeOut: 20000,
              progressBar: true,
              progressAnimation: 'increasing',
            }
          );
          // Rediriger vers la liste des produits
          this.router.navigate(['/produits/list']);
        },
        (error) => {
          console.error('Erreur lors de la modification du produit:', error);
          this.spinne.hide();

          this.toastr.error(
            `Erreur lors de la modification du produit: ${this.produitForm.value.nom} `,
            'Succès',
            {
              closeButton: true,
              timeOut: 10000,
              progressBar: true,
              progressAnimation: 'increasing',
            }
          );
        }
      );
    }
    else {
      this.spinne.hide();
      // console.log('Le formulaire n\'est pas valide');
      this.toastr.error("Le formulaire n'est pas valide!", 'Erreur', {
        closeButton: true,
        timeOut: 10000,
        progressBar: true,
        progressAnimation: 'increasing',
      });
    }
  }

  verifierSubmit() {
    if (this.buttonUpdate) {
      this.onUpdate();
    } else {
      this.onSubmit();
    }
  }
}
