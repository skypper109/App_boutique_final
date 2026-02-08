import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExpensesService } from '../expenses.service';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService, NgxSpinnerComponent } from 'ngx-spinner';
import { LoginService } from '../../login/Guard/login.service';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgxSpinnerComponent],
  templateUrl: './expense-form.component.html',
  styleUrl: './expense-form.component.scss'
})
export class ExpenseFormComponent implements OnInit {
  expenseForm: FormGroup;
  isEdit = false;
  expenseId: number | null = null;
  expenseTypes = ['loyer', 'salaire', 'électricité', 'achat marchandise', 'transport', 'autres'];

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpensesService,
    private loginService: LoginService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastrService,
    private spinner: NgxSpinnerService
  ) {
    this.expenseForm = this.fb.group({
      type: ['', Validators.required],
      montant: [0, [Validators.required, Validators.min(0)]],
      description: [''],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      boutique_id: [this.loginService.getBoutiqueId(), Validators.required]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.expenseId = +id;
      this.loadExpense(this.expenseId);
    }
  }

  loadExpense(id: number): void {
    this.spinner.show();
    this.expenseService.getExpense(id).subscribe({
      next: (res: any) => {
        // Handle field rename if backend returns old 'amount' for some reason, 
        // but here we expect 'montant' due to our updates.
        this.expenseForm.patchValue({
          type: res.type,
          montant: res.montant || res.amount,
          description: res.description,
          date: res.date,
          boutique_id: res.boutique_id
        });
        this.spinner.hide();
      },
      error: () => {
        this.toast.error('Erreur lors du chargement de la dépense');
        this.spinner.hide();
        this.router.navigate(['/expenses']);
      }
    });
  }

  onSubmit(): void {
    if (this.expenseForm.invalid) return;

    this.spinner.show();
    const data = this.expenseForm.value;

    if (this.isEdit && this.expenseId) {
      this.expenseService.updateExpense(this.expenseId, data).subscribe({
        next: () => {
          this.toast.success('Dépense mise à jour');
          this.router.navigate(['/expenses']);
          this.spinner.hide();
        },
        error: () => {
          this.toast.error('Erreur lors de la mise à jour');
          this.spinner.hide();
        }
      });
    } else {
      this.expenseService.createExpense(data).subscribe({
        next: () => {
          this.toast.success('Dépense créée');
          this.router.navigate(['/expenses']);
          this.spinner.hide();
        },
        error: () => {
          this.toast.error('Erreur lors de la création');
          this.spinner.hide();
        }
      });
    }
  }
}
