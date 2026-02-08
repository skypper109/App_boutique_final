import { Routes } from "@angular/router";
import { GestionPersonnelComponent } from "./gestion-personnel/gestion-personnel.component";
import { UserCreateComponent } from "./user-create/user-create.component";
import { BoutiqueListComponent } from "./boutique-list/boutique-list.component";

export class GestionRoutes {
    public static routes: Routes = [
        {
            path: 'users', children: [
                { path: 'list', component: GestionPersonnelComponent, data: { roles: ['admin', 'gestionnaire'] } },
                { path: 'new', component: UserCreateComponent, data: { roles: ['admin'] } },
                { path: 'new/:id', component: UserCreateComponent, data: { roles: ['admin'] } },
            ]
        },
        { path: 'boutiques', component: BoutiqueListComponent, data: { roles: ['admin'] } },
        { path: 'boutiques/initialization', loadComponent: () => import('../admin/shop-manager-create/shop-manager-create.component').then(m => m.ShopManagerCreateComponent), data: { roles: ['admin'] } },
        { path: 'boutiques/:id', loadComponent: () => import('./boutique-dashboard/boutique-dashboard.component').then(m => m.BoutiqueDashboardComponent), data: { roles: ['admin'] } }
    ];
}
