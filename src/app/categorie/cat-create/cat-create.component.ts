import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Form, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProduitsService } from '../../Data/produits.service';
import { error } from 'console';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Env } from '../../services/env';
import { DataService } from '../../services/data.service';
import { Router, RouterLink } from '@angular/router';
import { create } from 'domain';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-cat-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './cat-create.component.html',
  styleUrl: './cat-create.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CatCreateComponent implements OnInit {

  @ViewChild('deleteModal') deleteModal!: TemplateRef<any>;

  categorieForm: FormGroup;
  categories: any;
  button: boolean = false;
  selectedCategoryId: number | null = null;

  constructor(private fb: FormBuilder, private dataCat: ProduitsService, private data: DataService, private route: Router, private spinne: NgxSpinnerService) {
    this.categorieForm = this.fb.group({
      created_at: [''],
      updated_at: [''],
      id: [],
      nom: [''],
      description: [''],
      boutique_id: '',
      deleted_at: ''
    });
  }
  ngOnInit() {
    this.getCategorie();
  }
  getCategorie() {

    this.spinne.show();
    setTimeout(() => {
      this.spinne.hide();
    }, 1000);
    // La liste des categories Presentes dans la base de données
    this.data.getAll(Env.CATEGORIES).subscribe(
      (data) => {
        // console.log(data);
        this.categories = data;
      },
      (error) => {
        console.log(error);
      }
    );
  }
  onDeleteCategorie(id: any) {
    this.data.delete(Env.CATEGORIES, id).subscribe(
      (data) => {
        console.log(data);
        // this.route.navigateByUrl('/produits/categories', { skipLocationChange: true }).then(() => {
        //   this.route.navigate([this.route.url]);
        // });
        this.getCategorie();
        this.closeDeleteModal();
      },
      (error) => {
        console.log(error);
      }
    );

  }
  onEditCategorie(id: any) {
    // Pour recuperer les informations de la categorie à modifier
    console.log(id);

    this.data.getById(Env.CATEGORIES, id).subscribe(
      (data) => {
        console.log(data);
        this.button = true;
        this.categorieForm.setValue(data);
        this.selectedCategoryId = id;
        // this.formButton.get('button')?.setValue('Modifier');
        this.getCategorie();
        this.route.navigateByUrl('produits/categories');
      },
      (error) => {
        console.log(error);
      }
    );
  }

  onSubmit() {

    if (this.categorieForm.valid && !this.button) {
      this.data.add(Env.CATEGORIES, this.categorieForm.value).subscribe(
        (data) => {
          console.log(data);
          this.categorieForm.get('nom')?.setValue('');
          this.categorieForm.get('description')?.setValue('');
          this.getCategorie();
        },
        (error) => {
          console.log(error);
        }
      );
    } else {
      console.log('Le formulaire n\'est pas valide');
    }
  }
  onUpadateCategorie() {
    if (this.categorieForm.valid && this.selectedCategoryId) {
      const id = this.selectedCategoryId;
      this.data.updateCat(Env.CATEGORIES, id, this.categorieForm.value).subscribe(
        (data) => {
          console.log(data);
          this.categorieForm.get('nom')?.setValue('');
          this.categorieForm.get('description')?.setValue('');
          this.button = false;
          this.getCategorie();
        },
        (error) => {
          console.log(error);
        }
      );
    } else {
      console.log('Le formulaire n\'est pas valide');
    }
  }

  openDeleteModal(id: number) {
    if (confirm('Voulez-vous vraiment supprimer cette catégorie ?')) {
      this.onDeleteCategorie(id);
    }
  }

  closeDeleteModal() {
    this.selectedCategoryId = null;
  }

}
