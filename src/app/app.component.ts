import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NgxSpinnerModule } from 'ngx-spinner';
import { LoginService } from './login/Guard/login.service';
import { ToastrService } from 'ngx-toastr';

import { NetworkService } from './services/network.service';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    NgxSpinnerModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent {
  title = 'Front_Boutique';
  constructor( 
    private router: Router,
    private data: LoginService,
    private toast: ToastrService,
    private networkService: NetworkService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }
  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Check internet connectivity at startup
    this.networkService.checkInitialStatus();

    // if (this.data.getToken() === null && localStorage.getItem('access_token') === null && localStorage.getItem('active_token') === null) {
    //   this.data.getToken();

    //   this.toast.error('Accès refusé : Veuillez contacter l\' Administrateur du sys.', 'Erreur', {
    //     timeOut: 3000,
    //     progressBar: true,
    //     progressAnimation: 'increasing',
    //     positionClass: 'toast-top-center'
    //   });
    //   this.router.navigateByUrl('/login');
    // }
  }

}
