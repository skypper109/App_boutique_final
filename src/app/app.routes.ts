import { Routes } from '@angular/router';
import { AccueilComponent } from './home/accueil/accueil.component';
import { ErrorGeneraleComponent } from './error/error-generale/error-generale.component';
import { produitsRoute } from './produit/routes';
import { VenteRoutes } from './vente/vente-routes';
import { CreditRoutingModule } from './credit/credit-routes';
import { comptaRoute } from './comptabilite/routes';
import { LoginComponent } from './login/login/login.component';
import { DashboardComponent } from './home/dashboard/dashboard.component';
import { IndexClientComponent } from './client/index-client/index-client.component';
import { ClientFactureComponent } from './client/client-facture/client-facture.component';
import { ListClientComponent } from './client/list-client/list-client.component';
import { ClientFideleComponent } from './client/client-fidele/client-fidele.component';
import { ProdFactureComponent } from './produit/prod-facture/prod-facture.component';
import { AnneeCreateComponent } from './annee/annee-create/annee-create.component';
import { loginGuard } from './login/Guard/login.guard';
import { roleGuard } from './guards/role.guard';
import { ProfilsComponent } from './home/profils/profils.component';
import { GestionRoutes } from './gestion/routes';
import { BoutiqueSelectionComponent } from './admin/boutique-selection/boutique-selection.component';
import { ExpensesRoutingModule } from './expenses/expenses-routing.module';

export const routes: Routes = [
  // Pour la page d'accueil :
  {
    path: '', component: AccueilComponent, children:
      [
        { path: '', component: DashboardComponent, pathMatch: 'full', data: { roles: ['admin', 'gestionnaire', 'vendeur', 'comptable'] } },
        { path: 'accueil', component: DashboardComponent, pathMatch: 'full', data: { roles: ['admin', 'gestionnaire', 'vendeur', 'comptable'] } },
        ...produitsRoute.routes,
        ...VenteRoutes.routes,
        ...CreditRoutingModule.routes,
        ...comptaRoute.routes,
        ...ExpensesRoutingModule.routes,
        {
          path: 'clients', component: IndexClientComponent,
          data: { roles: ['admin', 'gestionnaire'] },
          children: [
            { path: 'index', component: ListClientComponent, data: { roles: ['admin', 'gestionnaire'] } },
            { path: 'facture/:idVente', component: ProdFactureComponent, data: { roles: ['admin', 'gestionnaire', 'vendeur'] } },
            { path: 'fidele', component: ClientFideleComponent, data: { roles: ['admin', 'gestionnaire'] } }
          ]
        },
        { path: 'annee', component: AnneeCreateComponent, data: { roles: ['admin'] } },
        { path: 'profils', component: ProfilsComponent, data: { roles: ['admin', 'gestionnaire', 'vendeur', 'comptable'] } },
        ...GestionRoutes.routes,

      ],
    canActivate: [loginGuard, roleGuard]
  },

  // C'est toujours pas corriger le probleme de la redirrection apres la connexion reussite et que on selectionne la boutique ce qui fait la redirection vers la page de login je crois que le probleme vient de la partie guard et que je v aussi que tu retire la restruction cote localhost je crois que cést ca le probleme.
// en deuxieme partie toute les parties qui demande l'acces aux imprimantes et les parties qui conserne la creation de fichier en pdf ne fonctionnent pas apres la creation et lancement de l'application sur la machine. 
  {
    path: 'admin/select-boutique',
    loadComponent: () => import('./admin/boutique-selection/boutique-selection.component').then(m => m.BoutiqueSelectionComponent),
    canActivate: [loginGuard],
    data: { roles: ['admin'] } // secure it
  },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: BoutiqueSelectionComponent, pathMatch: 'full', data: { roles: ['admin'] }, canActivate: [loginGuard] },
  { path: 'error', component: ErrorGeneraleComponent },

  // Pour les autres pages :
  { path: '**', redirectTo: 'error' }
];
