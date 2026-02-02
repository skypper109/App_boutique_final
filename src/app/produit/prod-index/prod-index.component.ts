import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { LoginService } from '../../login/Guard/login.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-prod-index',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    NgxSpinnerModule
  ],
  templateUrl: './prod-index.component.html',
  styleUrl: './prod-index.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProdIndexComponent {
  titre: string = 'Index';
  userRole:string | null = null;
  constructor(private data: LoginService, private toast: ToastrService, private router: Router, private spinner: NgxSpinnerService) { }
  ngOnInit(): void {
    this.spinner.show();
    this.userRole = this.data.getRole();
    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
    // if (this.data.getToken() === null) {
    //   this.data.getToken();

    //   this.toast.error('Accès refusé : Veuillez contacter l\' Administrateur.', 'Erreur', {
    //     timeOut: 3000,
    //     progressBar: true,
    //     progressAnimation: 'increasing',
    //     positionClass: 'toast-top-center'
    //   });
    //   this.router.navigateByUrl('/login');
    // }
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
