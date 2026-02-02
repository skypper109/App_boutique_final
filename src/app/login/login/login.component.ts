import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { LoginService } from '../Guard/login.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { randomUUID } from 'crypto';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgxSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginComponent {

  authForm: FormGroup;
  error: any;
  session: boolean = false;
  verification: boolean = false;
  constructor(
    private fb: FormBuilder,
    private data: DataService,
    private log: LoginService,
    private router: Router,
    private toast: ToastrService,
    private spinner: NgxSpinnerService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      numero: ['']
    });
  }
  

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.shiftKey && event.altKey && event.key === 'R') {
      // if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('user_token');
        localStorage.removeItem('active_token');
        localStorage.removeItem('token_expiration');
        this.toast.info('Activation réinitialisée. Veuillez redémarrer ou actualiser.', 'Reset');
        window.location.reload();
      // }
    }
  }

  onSubmit() {
    if (this.authForm.valid) {
      this.log.login(this.authForm.value);

      this.spinner.show();
      // if (!this.log.isActiveCompte) {
      //   window.location.reload();
      // }

      setTimeout(() => {
        this.spinner.hide();
      }, 1000);
      this.error = this.log.error;
    }
  }
  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    /** le spinner démarre à l'initialisation */
    this.spinner.show();

    // setTimeout ( ( )  =>  {
    //   /** le spinner se termine après 5 secondes */
    // } ,  3000 ) ;
    const token = localStorage.getItem('user_token');
    const activer = localStorage.getItem('active_token');


    if (!token && activer == 'yes') {
      this.verification = false;
      this.log.verification = false;
      this.router.navigateByUrl('/');
    }
    else if (token) {
      if (this.log.getToken() === null) {
        // this.toast.error('Accès refusé : Veuillez contacter l\'administrateur.', 'Erreur', {
        //   timeOut: 3000,
        //   progressBar: true,
        //   progressAnimation: 'increasing',
        //   positionClass: 'toast-top-center'
        // });
        this.log.verification = true;
        this.verification = true;
        this.router.navigateByUrl('/login');
      }
      this.log.verification = false;
      this.verification = false;
      // this.router.navigateByUrl('/');
    }
    else {
      this.verification = true
      this.router.navigateByUrl('/login');
    }

    this.spinner.hide();
  }



  verifcate(): void {

    if (this.authForm.value.numero === this.log.data1[0]) {
      this.saveToken("OOOOOOOOOOOIIIIIIIIIUUUUUUU888899999990000000OIY9990876YTSQERRZDD/§%%£gfdss", 45);
      this.toast.success('Activé avec succès.', 'Identifié', {
        timeOut: 3000,
        progressBar: true,
        progressAnimation: 'increasing',
        positionClass: 'toast-top-center'
      });

      this.log.data1.shift();
      this.log.verification = false;
      this.verification = false;
      this.router.navigateByUrl('/login');

    }
    // Pour activation a vie :
    else if (this.authForm.value.numero == 'stop-pour-toujours') {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('active_token', 'yes');
        localStorage.setItem('user_token', "OOOOOOOOOOOIIIIIIIIIUUUUUUU888899999990000000OIY9990876YTSQERRZDD/§%%£gfdss");
      }
      this.toast.success('Activé pour Toujours avec succès.', 'Identifié', {
        timeOut: 3000,
        progressBar: true,
        progressAnimation: 'increasing',
        positionClass: 'toast-top-center'
      });
      this.log.verification = false;
      this.verification = false;
      this.log.stop = true;
      this.router.navigateByUrl('/login');

    }
    else {

      this.toast.error('Clé non valide.', 'Erreur', {
        timeOut: 3000,
        progressBar: true,
        progressAnimation: 'increasing',
        positionClass: 'toast-top-center'
      });
    }
  }

  // Sauvegarder un token avec une durée d'expiration
  saveToken(token: string, jour: number): void {
    const expirationTime = new Date().getTime() + jour * 24 * 60 * 60 * 1000;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user_token', token);
      localStorage.setItem('token_expiration', expirationTime.toString());
    }
  }


}
