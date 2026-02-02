import { Routes } from "@angular/router";
import { ProdIndexComponent } from "./prod-index/prod-index.component";
import { ProdCreateComponent } from "./prod-create/prod-create.component";
import { ProdListComponent } from "./prod-list/prod-list.component";
import { CatCreateComponent } from "../categorie/cat-create/cat-create.component";
import { CatIndexComponent } from "../categorie/cat-index/cat-index.component";
import { ReapproIndexComponent } from "../reappro/reappro-index/reappro-index.component";
import { ProdDetailComponent } from "./prod-detail/prod-detail.component";
import { ProdFactureComponent } from "./prod-facture/prod-facture.component";


export class produitsRoute {

  public static routes: Routes = [
    {
      path: 'produits', component: ProdIndexComponent, children: [
        { path: 'new', component: ProdCreateComponent, data: { roles: ['admin', 'gestionnaire'] } },
        { path: 'new/:id', component: ProdCreateComponent, data: { roles: ['admin', 'gestionnaire'] } },
        { path: 'list', component: ProdListComponent, data: { roles: ['admin', 'gestionnaire', 'vendeur'] } },
        { path: 'categories', component: CatCreateComponent, data: { roles: ['admin', 'gestionnaire'] } },
        { path: 'categorie/:id/edit', component: CatCreateComponent, data: { roles: ['admin', 'gestionnaire'] } },
        { path: 'categorie/:id/delete', component: CatCreateComponent, data: { roles: ['admin', 'gestionnaire'] } },
        { path: 'reappro', component: ReapproIndexComponent, data: { roles: ['admin', 'gestionnaire'] } },
        { path: 'detail/:desc', component: ProdDetailComponent, data: { roles: ['admin', 'gestionnaire', 'vendeur'] } },
        { path: 'facture/:idVente', component: ProdFactureComponent, data: { roles: ['admin', 'gestionnaire', 'vendeur'] } }
      ]
    },
  ];

}
