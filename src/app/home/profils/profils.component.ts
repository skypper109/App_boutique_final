import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Env } from '../../services/env';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../login/Guard/login.service';

@Component({
  selector: 'app-profils',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    NgxSpinnerModule
  ],
  templateUrl: './profils.component.html',
  styleUrl: './profils.component.scss'
})
export class ProfilsComponent implements OnInit {

  profilForm: FormGroup;
  name: any;
  userRole:string | null = null;

  constructor(
    private data: DataService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private toast: ToastrService,
    private dataLog:LoginService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.profilForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      nom: [""],
      password: ["", [Validators.minLength(8)]]
    });
  }

  id: number | undefined;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.spinner.show();
    this.userRole = this.dataLog.getRole();
    this.data.getById(Env.PROFIL, localStorage.getItem('user_id')).subscribe(
      (next: any) => {
        this.data.user = next;
        this.id = this.data.user.id;

        this.profilForm.patchValue({
          email: this.data.user.email,
          nom: this.data.user.name
        });
        this.spinner.hide();
      },
      (error: any) => {
        console.warn("Erreur lors de la récupération du profil : ", error);
        this.spinner.hide();
        this.toast.error("Impossible de charger les données du profil", "Erreur");
      }
    );
  }

  onSubmit() {
    if (this.profilForm.valid) {
      this.spinner.show();
      this.data.updateCat(Env.PROFIL, this.id, this.profilForm.value).subscribe(
        (next: any) => {
          this.toast.success("Profil mis à jour avec succès", "Succès");
          this.data.user = next;
          this.spinner.hide();
          this.profilForm.get('password')?.reset();
        },
        (error: any) => {
          this.toast.error("Erreur lors de la mise à jour", "Erreur");
          this.spinner.hide();
        }
      );
    }
  }

}
