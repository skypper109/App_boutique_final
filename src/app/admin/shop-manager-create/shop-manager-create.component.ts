import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Env } from '../../services/env';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-shop-manager-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './shop-manager-create.component.html',
  styleUrl: './shop-manager-create.component.scss'
})
export class ShopManagerCreateComponent implements OnInit {
  shopManagerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private data: DataService,
    private router: Router,
    private toast: ToastrService,
    private spinner: NgxSpinnerService
  ) {
    this.shopManagerForm = this.fb.group({
      // Boutique info
      nom: ['', Validators.required],
      adresse: [''],
      telephone: [''],
      // PDF Customization
      logo: [''],
      description_facture: ['HAUTE COLLECTION'],
      description_bordereau: ['BORDEREAU COMMERCIAL'],
      description_recu: ['REÇU DE PAIEMENT'],
      footer_facture: ['Aucun échange ne sera accepté sans ce ticket de caisse original.'],
      footer_bordereau: ['Ce document est la propriété de Ma Boutique jusqu\'au règlement intégral.'],
      footer_recu: ['Merci pour votre confiance. Ce reçu fait foi de paiement.'],
      couleur_principale: ['#4f46e5'],
      couleur_secondaire: ['#10b981'],
      devise: ['FCFA'],
      format_facture: ['A4'],
      // Manager info
      manager_name: ['', Validators.required],
      manager_email: ['', [Validators.required, Validators.email]],
      manager_password: ['', [Validators.required, Validators.minLength(8)]],
      manager_password_confirmation: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {}

  passwordMatchValidator(g: FormGroup) {
    return g.get('manager_password')?.value === g.get('manager_password_confirmation')?.value
       ? null : {'mismatch': true};
  }

  onSubmit(): void {
    if (this.shopManagerForm.invalid) return;
    
    // Check password match manually to be safe
    const pwd = this.shopManagerForm.get('manager_password')?.value;
    const confirm = this.shopManagerForm.get('manager_password_confirmation')?.value;
    
    if (pwd !== confirm) {
      this.toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    this.spinner.show();
    
    // Prepare payload structure: { boutique: {...}, manager: {...} }
    const formValue = this.shopManagerForm.value;
    
    const payload = {
      boutique: {
        nom: formValue.nom,
        adresse: formValue.adresse,
        telephone: formValue.telephone,
        email: formValue.manager_email, // Use manager email as boutique contact email by default or empty
        // PDF Customization
        logo: formValue.logo,
        description_facture: formValue.description_facture,
        description_bordereau: formValue.description_bordereau,
        description_recu: formValue.description_recu,
        footer_facture: formValue.footer_facture,
        footer_bordereau: formValue.footer_bordereau,
        footer_recu: formValue.footer_recu,
        couleur_principale: formValue.couleur_principale,
        couleur_secondaire: formValue.couleur_secondaire,
        devise: formValue.devise,
        format_facture: formValue.format_facture
      },
      manager: {
        name: formValue.manager_name,
        email: formValue.manager_email,
        password: formValue.manager_password,
        telephone: formValue.telephone
      }
    };

    this.data.add(Env.BOUTIQUES_STORE_WITH_MANAGER, payload).subscribe({
      next: () => {
        this.toast.success('Boutique et Gérant créés avec succès');
        this.router.navigate(['/boutiques']);
        this.spinner.hide();
      },
      error: (err) => {
        this.toast.error(err.error?.message || "Erreur lors de la création");
        this.spinner.hide();
      }
    });
  }
}
