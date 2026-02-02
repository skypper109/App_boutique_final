import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Env } from '../../services/env';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-client-fidele',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NgxSpinnerModule
  ],
  templateUrl: './client-fidele.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrl: './client-fidele.component.scss'
})
export class ClientFideleComponent implements OnInit {



  annees: any = [];
  dataS: any;
  annee: any;
  clients: any = [];
  change: boolean = false;

  constructor(private data: DataService, private router: Router, private spinne: NgxSpinnerService) { }
  ngOnInit(): void {
    this.data.getAll(Env.ANNEEVENTE).subscribe((data: any) => {
      this.annees = data;
    });
    this.spinne.show();
    this.data.getAll(Env.CLIENTFIDELE).subscribe((data: any) => {
      this.clients = data;
      this.spinne.hide();
    });

  }
  getClientAnnee(annee: any) {
    this.annee = annee;
    this.data.getByAnnee(Env.CLIENT, annee).subscribe((data: any) => {
      this.clients = data;
      console.log(data);
    }
    );
  }
  accueil() {
    this.router.navigateByUrl('clients/index');
  }
}
