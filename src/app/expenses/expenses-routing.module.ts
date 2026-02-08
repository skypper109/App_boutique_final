
import { Routes } from '@angular/router';

import { ExpenseListComponent } from './expense-list/expense-list.component';
import { ExpenseFormComponent } from './expense-form/expense-form.component';
import { ExpenseDashboardComponent } from './expense-dashboard/expense-dashboard.component';

export class ExpensesRoutingModule { 

public static routes: Routes = [
  {  
    path: 'expenses', 
    data: { roles: ['admin', 'gestionnaire'] },
    children: [
      { path: 'dashboard', component: ExpenseDashboardComponent },
      { path: 'list', component: ExpenseListComponent },
      { path: 'create', component: ExpenseFormComponent },
      { path: 'edit/:id', component: ExpenseFormComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
}
