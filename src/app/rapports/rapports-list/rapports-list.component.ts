import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RapportService, DailyReport, ReportsResponse } from '../../services/rapport.service';
import { Router, RouterLink } from '@angular/router';

declare var toastr: any;

@Component({
  selector: 'app-rapports-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './rapports-list.component.html',
  styleUrls: ['./rapports-list.component.scss']
})
export class RapportsListComponent implements OnInit {
  rapports: DailyReport[] = [];
  filteredRapports: DailyReport[] = [];
  
  currentPage = 1;
  totalPages = 1;
  perPage = 20;
  totalItems = 0;

  startDate: string = '';
  endDate: string = '';
  searchTerm: string = '';

  isLoading = false;
  sendingEmailId: number | null = null;
  sendingWhatsAppId: number | null = null;
  downloadingId: number | null = null;
  regeneratingId: number | null = null;

  constructor(
    private rapportService: RapportService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRapports();
  }

  loadRapports(): void {
    this.isLoading = true;
    this.rapportService.getRapports(this.currentPage, this.startDate, this.endDate)
      .subscribe({
        next: (response: ReportsResponse) => {
          this.rapports = response.data;
          this.filteredRapports = response.data;
          this.currentPage = response.current_page;
          this.totalPages = response.last_page;
          this.perPage = response.per_page;
          this.totalItems = response.total;
          this.isLoading = false;
          this.applyFilter();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des rapports:', error);
          toastr.error('Erreur lors du chargement des rapports');
          this.isLoading = false;
        }
      });
  }

  applyFilter(): void {
    if (!this.searchTerm) {
      this.filteredRapports = this.rapports;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredRapports = this.rapports.filter(rapport =>
      rapport.date.toLowerCase().includes(term) ||
      rapport.boutique?.nom.toLowerCase().includes(term)
    );
  }

  filterByDateRange(): void {
    if (this.startDate && this.endDate) {
      this.currentPage = 1;
      this.loadRapports();
    }
  }

  clearFilters(): void {
    this.startDate = '';
    this.endDate = '';
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadRapports();
  }

  downloadPdf(rapport: DailyReport): void {
    this.downloadingId = rapport.id;
    this.rapportService.downloadPdf(rapport.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rapport-${rapport.date}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.downloadingId = null;
        toastr.success('PDF téléchargé avec succès');
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement:', error);
        toastr.error('Erreur lors du téléchargement du PDF');
        this.downloadingId = null;
      }
    });
  }

  sendEmail(rapport: DailyReport): void {
    this.sendingEmailId = rapport.id;
    this.rapportService.sendEmail(rapport.id).subscribe({
      next: (response) => {
        toastr.success(response.message || 'Email envoyé avec succès');
        this.sendingEmailId = null;
        this.loadRapports();
      },
      error: (error) => {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        toastr.error('Erreur lors de l\'envoi de l\'email');
        this.sendingEmailId = null;
      }
    });
  }

  sendWhatsApp(rapport: DailyReport): void {
    this.sendingWhatsAppId = rapport.id;
    this.rapportService.sendWhatsApp(rapport.id).subscribe({
      next: (response) => {
        toastr.success(response.message || 'Message WhatsApp envoyé');
        this.sendingWhatsAppId = null;
        this.loadRapports();
      },
      error: (error) => {
        console.error('Erreur lors de l\'envoi WhatsApp:', error);
        toastr.error('Erreur lors de l\'envois WhatsApp');
        this.sendingWhatsAppId = null;
      }
    });
  }

  regenerateReport(rapport: DailyReport): void {
    this.regeneratingId = rapport.id;
    this.rapportService.generateRapport(rapport.date).subscribe({
      next: (response) => {
        toastr.success(response.message || 'Rapport mis à jour');
        this.regeneratingId = null;
        this.loadRapports();
      },
      error: (error) => {
        console.error('Erreur lors de la régénération:', error);
        toastr.error('Erreur lors de la mise à jour du rapport');
        this.regeneratingId = null;
      }
    });
  }

  navigateToGenerate(): void {
    this.router.navigate(['/rapports/generer']);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadRapports();
    }
  }

  get paginationPages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  formatCurrency(amount: number, devise: string = 'CFA'): string {
    return `${amount.toLocaleString('fr-FR')} ${devise}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  get isSessionClosable(): boolean {
    const now = new Date();
    return now.getHours() >= 19;
  }

  closeSession(): void {
    if (!this.isSessionClosable) {
      toastr.warning('La session ne peut être fermée qu\'à partir de 19h');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const confirm = window.confirm('Voulez-vous vraiment fermer la session pour aujourd\'hui (' + this.formatDate(today) + ') ? Cela générera le rapport journalier.');

    if (confirm) {
      this.isLoading = true;
      this.rapportService.generateRapport(today).subscribe({
        next: (response) => {
          toastr.success('Session fermée avec succès. Rapport généré.');
          this.isLoading = false;
          this.loadRapports();
        },
        error: (error) => {
          console.error('Erreur lors de la fermeture de session:', error);
          toastr.error('Erreur lors de la génération du rapport');
          this.isLoading = false;
        }
      });
    }
  }

}
