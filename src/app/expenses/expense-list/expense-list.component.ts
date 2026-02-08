import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpensesService } from '../expenses.service';
import { RouterLink } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './expense-list.component.html',
  styleUrl: './expense-list.component.scss'
})
export class ExpenseListComponent implements OnInit {
  expenses: any[] = [];
  pagination: any = {};
  pages: number[] = [];
  
  constructor(
    private expenseService: ExpensesService,
    private spinner: NgxSpinnerService,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses(page: number = 1): void {
    this.spinner.show();
    this.expenseService.getExpenses({ page }).subscribe({
      next: (res: any) => {
        this.expenses = res.data;
        this.pagination = {
          current_page: res.current_page,
          last_page: res.last_page,
          total: res.total
        };
        this.pages = Array(res.last_page).fill(0).map((x, i) => i + 1);
        this.spinner.hide();
      },
      error: (err) => {
        this.toast.error('Erreur lors du chargement des dépenses');
        this.spinner.hide();
      }
    });
  }

  deleteExpense(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
      this.expenseService.deleteExpense(id).subscribe({
        next: () => {
          this.toast.success('Dépense supprimée');
          this.loadExpenses();
        },
        error: () => this.toast.error('Erreur lors de la suppression')
      });
    }
  }
}
