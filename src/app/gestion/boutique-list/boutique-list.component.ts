import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Env } from '../../services/env';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CfaPipe } from '../../pipes/cfa.pipe';

@Component({
    selector: 'app-boutique-list',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxSpinnerModule, RouterLink, CfaPipe],
    templateUrl: './boutique-list.component.html',
    styleUrl: './boutique-list.component.scss'
})
export class BoutiqueListComponent implements OnInit {

    boutiques: any[] = [];
    boutiqueForm: FormGroup;
    isEdit = false;
    currentId: any;
    showModal = false;
    activeBoutiqueId: string | null = null;
    globalReports: any[] = [];
    boutiqueLimit: number = 2;
    currentUser: any = null;

    constructor(
        private data: DataService,
        private fb: FormBuilder,
        private spinner: NgxSpinnerService,
        private toast: ToastrService,
        private router: Router
    ) {
        this.boutiqueForm = this.fb.group({
            nom: ['', Validators.required],
            adresse: [''],
            telephone: [''],
            email: ['', Validators.email],
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
            format_facture: ['A4']
        });
    }

    ngOnInit(): void {
        this.fetchBoutiques();
        this.fetchGlobalReports();
        this.activeBoutiqueId = localStorage.getItem('boutique_id');
        this.loadUserLimit();
    }

    loadUserLimit() {
        this.data.getAll(Env.CHECK_USER_STATUS).subscribe({
            next: (res: any) => {
                this.boutiqueLimit = res.boutique_limit || 2;
            },
            error: (err) => {
                console.error("Erreur lors de la vérification du quota", err);
                // Fallback to localStorage if API fails
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    this.boutiqueLimit = user.boutique_limit || 2;
                }
            }
        });
    }

    fetchGlobalReports() {
        this.data.getAll(Env.API_URL + '/boutiques-reports').subscribe({
            next: (res: any) => {
                this.globalReports = res;
            },
            error: (err) => console.error(err)
        });
    }

    get totalRevenue(): number {
        return this.globalReports.reduce((acc, rep) => acc + (rep.revenue || 0), 0);
    }

    get totalPersonnel(): number {
        return this.globalReports.reduce((acc, rep) => acc + (rep.users_count || 0), 0);
    }

    fetchBoutiques() {
        this.spinner.show();
        this.data.getAll(Env.BOUTIQUES).subscribe(
            (res: any) => {
                this.boutiques = res;
                this.spinner.hide();
            },
            (error) => {
                console.error(error);
                this.spinner.hide();
                this.toast.error("Impossible de charger les boutiques", "Erreur");
            }
        );
    }

    openAddModal() {
        this.isEdit = false;
        this.currentId = null;
        this.boutiqueForm.reset();
        this.showModal = true;
    }

    openEditModal(boutique: any) {
        this.isEdit = true;
        this.currentId = boutique.id;
        this.boutiqueForm.patchValue(boutique);
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }

    onSubmit() {
        if (this.boutiqueForm.invalid) return;

        this.spinner.show();
        const action = this.isEdit
            ? this.data.updateCat(Env.BOUTIQUES, this.currentId, this.boutiqueForm.value)
            : this.data.add(Env.BOUTIQUES, this.boutiqueForm.value);

        action.subscribe(
            () => {
                this.toast.success(this.isEdit ? "Boutique mise à jour" : "Boutique ajoutée avec succès", "Succès");
                this.fetchBoutiques();
                this.closeModal();
            },
            (error) => {
                const message = error.error?.message || "Erreur lors de l'enregistrement";
                this.toast.error(message, "Erreur");
                this.spinner.hide();
            }
        );
    }

    onDelete(id: any) {
        if (confirm("Voulez-vous vraiment supprimer cette boutique ?")) {
            this.spinner.show();
            this.data.delete(Env.BOUTIQUES, id).subscribe(
                () => {
                    this.toast.success("Boutique supprimée", "Succès");
                    this.fetchBoutiques();
                },
                (error) => {
                    this.toast.error("Erreur lors de la suppression", "Erreur");
                    this.spinner.hide();
                }
            );
        }
    }

    onSwitch(boutique: any) {
        localStorage.setItem('boutique_id', boutique.id);
        localStorage.setItem('boutique_nom', boutique.nom);
        this.toast.success(`Direction : ${boutique.nom}`, "Accès Boutique");
        this.router.navigate(['/accueil']).then(() => {
            window.location.reload(); // Reload to ensure all components refetch with new ID
        });
    }

}
