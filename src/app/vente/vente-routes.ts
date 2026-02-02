import { Routes } from "@angular/router";
import { VentelistComponent } from "./ventelist/ventelist.component";
import { VenteCreateComponent } from "./vente-create/vente-create.component";
import { HistoriqueComponent } from "./historique/historique.component";
import { ProformaListComponent } from "./proforma-list/proforma-list.component";

export class VenteRoutes {
  public static routes: Routes = [
    { path: 'ventes', redirectTo: 'ventes/historique', pathMatch: 'full' },
    { path: 'ventes/new', component: VenteCreateComponent, data: { roles: ['admin', 'vendeur'] } },
    { path: 'ventes/new/:id', component: VenteCreateComponent, data: { roles: ['admin', 'vendeur'] } },
    { path: 'ventes/historique', component: HistoriqueComponent, data: { roles: ['admin', 'gestionnaire'] } },
    { path: 'ventes/bordereaux', component: ProformaListComponent, data: { roles: ['admin', 'gestionnaire', 'vendeur'] } }
  ];
}
