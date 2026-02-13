import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Env } from '../../services/env';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../login/Guard/login.service';

@Component({
    selector: 'app-user-create',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, NgxSpinnerModule, RouterLink],
    templateUrl: './user-create.component.html',
    styleUrl: './user-create.component.scss'
})
export class UserCreateComponent implements OnInit {

    userForm: FormGroup;
    isEdit = false;
    userId: any;
  userRole: string | null = null;

    roles: any[] = [];
    boutiques: any[] = [];

    constructor(
        private fb: FormBuilder,
        private data: DataService,
        private spinner: NgxSpinnerService,
        private toast: ToastrService,
        private router: Router,
        private route: ActivatedRoute,
            private dataLog: LoginService
    ) {
        this.userForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.minLength(6)]],
            role: ['vendeur', Validators.required],
            boutique_id: ['', Validators.required]
        });
    }

    ngOnInit(): void {
    this.userRole = this.dataLog.getRole();
    this.initRoles();
        this.fetchBoutiques();
        this.userId = this.route.snapshot.paramMap.get('id');
        if (this.userId) {
            this.isEdit = true;
            this.userForm.get('password')?.clearValidators();
            this.userForm.get('password')?.updateValueAndValidity();
            this.fetchUser();
        } else {
            this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
        }
    }

  get isAdmin(): boolean {
    return this.userRole?.toLowerCase() === 'admin';
  }

  get isGestionnaire(): boolean {
    return this.userRole?.toLowerCase() === 'gestionnaire';
  }

    fetchBoutiques() {
        this.data.getAll(Env.BOUTIQUES).subscribe(
            (res: any) => {
                this.boutiques = res;
            }
        );
    }

    fetchUser() {
        this.spinner.show();
        this.data.getById(Env.USER, this.userId).subscribe(
            (res: any) => {
                this.userForm.patchValue({
                    name: res.name,
                    email: res.email,
                    role: res.role,
                    boutique_id: res.boutique_id
                });
                this.spinner.hide();
            },
            (error) => {
                this.toast.error("Utilisateur non trouvé", "Erreur");
                this.spinner.hide();
                this.router.navigate(['/users/list']);
            }
        );
    }

    onSubmit() {
        if (this.userForm.invalid) return;

        this.spinner.show();
        const endpoint = this.isEdit ? Env.USER : Env.REGISTER;
        const action = this.isEdit
            ? this.data.updateCat(Env.USER, this.userId, this.userForm.value)
            : this.data.add(Env.REGISTER, this.userForm.value);

        action.subscribe(
            () => {
                this.toast.success(this.isEdit ? "Compte mis à jour" : "Utilisateur créé avec succès", "Succès");
                this.spinner.hide();
                this.router.navigate(['/users/list']);
            },
            (error) => {
                console.error(error);
                this.toast.error("Erreur lors de l'enregistrement", "Erreur");
                this.spinner.hide();
            }
        );
    }

    initRoles() {
        this.roles = [
            { value: 'vendeur', label: 'Vendeur' },
            { value: 'comptable', label: 'Comptable' }
        ];

        if (this.isAdmin) {
            this.roles.push(
                { value: 'admin', label: 'Administrateur' },
                { value: 'gestionnaire', label: 'Gestionnaire' }
            );
        }
    }
}
