
import { Routes } from '@angular/router';
import { CreditListComponent } from './credit-list/credit-list.component';
import { DebtorListComponent } from './debtor-list/debtor-list.component';
import { CreditDetailComponent } from './credit-detail/credit-detail.component';

export class CreditRoutingModule {
    public static routes: Routes = [
        {
            path: 'credits',
            children: [
                { path: 'list', component: CreditListComponent },
                { path: 'debtors', component: DebtorListComponent },
                { path: 'detail/:id', component: CreditDetailComponent },
                { path: '', redirectTo: 'list', pathMatch: 'full' }
            ]
        }
    ];
}
