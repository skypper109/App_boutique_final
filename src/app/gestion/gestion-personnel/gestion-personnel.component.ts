import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, ɵEmptyOutletComponent } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Env } from '../../services/env';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../../login/Guard/login.service';

@Component({
  selector: 'app-gestion-personnel',
  standalone: true,
  imports: [CommonModule, RouterLink, NgxSpinnerModule, ɵEmptyOutletComponent],
  templateUrl: './gestion-personnel.component.html',
  styleUrl: './gestion-personnel.component.scss'
})
export class GestionPersonnelComponent implements OnInit {

  users: any[] = [];
  userRole: string | null = null;

  constructor(
    private data: DataService,
    private spinner: NgxSpinnerService,
    private toast: ToastrService,
    private router: Router,
    private dataLog: LoginService
  ) { }

  ngOnInit(): void {
    this.userRole = this.dataLog.getRole();
    this.fetchUsers();
  }

  fetchUsers() {
    this.spinner.show();
    this.data.getAll(Env.USER).subscribe(
      (res: any) => {
        this.users = res;
        this.spinner.hide();
      },
      (error) => {
        console.error(error);
        this.spinner.hide();
        this.toast.error("Erreur lors de la récupération des utilisateurs", "Erreur");
      }
    );
  }

  get isAdmin(): boolean {
    return this.userRole?.toLowerCase() === 'admin';
  }

  get isGestionnaire(): boolean {
    return this.userRole?.toLowerCase() === 'gestionnaire';
  }

  onDelete(id: any) {
    if (confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
      this.spinner.show();
      this.data.delete(Env.USER, id).subscribe(
        () => {
          this.toast.success("Utilisateur supprimé", "Succès");
          this.fetchUsers();
        },
        (error) => {
          this.toast.error("Erreur lors de la suppression", "Erreur");
          this.spinner.hide();
        }
      );
    }
  }

  onToggleStatus(id: any) {
    this.spinner.show();
    this.data.add(`${Env.USER}/${id}/toggle-status`, {}).subscribe({
      next: (res: any) => {
        this.toast.success(res.message, "Succès");
        this.fetchUsers();
      },
      error: () => {
        this.toast.error("Erreur lors de la mise à jour du statut", "Erreur");
        this.spinner.hide();
      }
    });
  }

  getRoleBadgeClass(role: string): string {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'vendeur': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'comptable': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }
}
