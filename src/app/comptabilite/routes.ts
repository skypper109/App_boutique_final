import path from "path";
import { ComptaCAComponent } from "./compta-ca/compta-ca.component";
import { ComptaFactureComponent } from "./compta-facture/compta-facture.component";
import { ComptaInventaireComponent } from "./compta-inventaire/compta-inventaire.component";
import { Routes } from "@angular/router";

export class comptaRoute {
  public static routes: Routes = [
    { path: 'comptabilite/compta-ca', component: ComptaCAComponent, data: { roles: ['admin', 'comptable', 'gestionnaire'] } },
    { path: 'comptabilite/compta-inventaire', component: ComptaInventaireComponent, data: { roles: ['admin', 'comptable', 'gestionnaire'] } },
    { path: 'comptabilite/compta-facture', component: ComptaFactureComponent, data: { roles: ['admin', 'comptable', 'vendeur', 'gestionnaire'] } },
  ];
}
