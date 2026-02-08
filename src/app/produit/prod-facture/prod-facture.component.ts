import { Component, CUSTOM_ELEMENTS_SCHEMA, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Env } from '../../services/env';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ExportService } from '../../services/export.service';
import { CfaPipe } from "../../pipes/cfa.pipe";
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-prod-facture',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NgxSpinnerModule
  ],
  templateUrl: './prod-facture.component.html',
  styleUrl: './prod-facture.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProdFactureComponent {

  constructor(
    private route: ActivatedRoute,
    private data: DataService,
    private spinne: NgxSpinnerService,
    private exportService: ExportService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ventes: any;
  nomClient: any;
  montant_total: any;
  dateFacture: any;
  idFacture: any;
  numeroClient: any;
  adresseClient: any;
  montant_remis: any = 0;
  nomBoutique: string = 'Ma Boutique';
  adresseBoutique: string = '-----';
  telBoutique: string = '-----';
  produitAcheter: any[] = [];

  ngOnInit(): void {
    // Pour recuperer les produits de la vente atravers l'id de la facture de l'url
    this.spinne.show();
    let idVente = this.route.snapshot.params['idVente'];
    console.log(idVente);
    this.data.getById(Env.FACTURE, idVente).subscribe(
      (data: any) => {
        if (data && data.length > 0) {
          const item = data[0];
          this.produitAcheter = item.produitAchat;
          this.nomClient = item.nomClient;
          this.numeroClient = item.numeroClient;
          this.dateFacture = item.dateFacture;
          this.montant_total = item.montant_total;
          this.adresseClient = item.adresseClient;
          this.montant_remis = item.montant_remis || 0;
          this.nomBoutique = item.nomBoutique || 'Ma Boutique';
          this.adresseBoutique = item.adresseBoutique || '-----';
          this.telBoutique = item.telephoneBoutique || '-----';
          this.idFacture = idVente + "-" + new Date().getFullYear();
        }
        this.spinne.hide();
      },
      (error) => {
        this.spinne.hide();
        console.error('Erreur lors de la récupération de la vente :', error);
      }
    );
  }

  print() {
    const venteId = this.route.snapshot.params['idVente'];
    this.exportService.printPdf('facture', venteId);
  }

  exportPDF() {
    const venteId = this.route.snapshot.params['idVente'];
    this.exportService.downloadPdf('facture', venteId, `Facture_${this.idFacture}.pdf`);
  }

}
