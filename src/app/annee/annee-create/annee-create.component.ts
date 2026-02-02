import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Env } from '../../services/env';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-annee-create',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxSpinnerModule, RouterLink],
  templateUrl: './annee-create.component.html',
  styleUrl: './annee-create.component.scss'
})
export class AnneeCreateComponent implements OnInit {
  years: any[] = [];
  newYear: number = new Date().getFullYear();

  constructor(
    private data: DataService,
    private spinne: NgxSpinnerService,
    private toast: ToastrService
  ) { }

  ngOnInit(): void {
    this.fetchYears();
  }

  fetchYears() {
    this.spinne.show();
    this.data.getAll(Env.ANNEEVENTE).subscribe(
      (data: any) => {
        this.years = data;
        this.spinne.hide();
      },
      (error) => {
        console.error(error);
        this.spinne.hide();
      }
    );
  }

  onSubmit() {
    if (!this.newYear) return;

    this.spinne.show();
    this.data.add(Env.ANNEEVENTE, { annee: this.newYear, is_active: true }).subscribe(
      () => {
        this.toast.success("Année ajoutée avec succès", "Succès");
        this.fetchYears();
      },
      (error) => {
        this.toast.error("Erreur lors de l'ajout", "Erreur");
        this.spinne.hide();
      }
    );
  }

  toggleStatus(year: any) {
    this.spinne.show();
    this.data.patch(Env.ANNEEVENTE + '/' + year.id + '/toggle-status', {}).subscribe({
      next: () => {
        this.toast.success("Statut mis à jour");
        this.fetchYears();
      },
      error: () => {
        this.toast.error("Erreur lors de la mise à jour");
        this.spinne.hide();
      }
    });
  }

  deleteYear(year: any) {
    if (confirm(`Voulez-vous vraiment supprimer l'année ${year.annee} ?`)) {
      this.spinne.show();
      this.data.delete(Env.ANNEEVENTE, year.id).subscribe({
        next: () => {
          this.toast.success("Année supprimée");
          this.fetchYears();
        },
        error: () => {
          this.toast.error("Erreur lors de la suppression");
          this.spinne.hide();
        }
      });
    }
  }
}
