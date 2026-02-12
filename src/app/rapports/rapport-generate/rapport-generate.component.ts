import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RapportService } from '../../services/rapport.service';

declare var toastr: any;

@Component({
  selector: 'app-rapport-generate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rapport-generate.component.html',
  styleUrls: ['./rapport-generate.component.scss']
})
export class RapportGenerateComponent {
  selectedDate: string = '';
  isGenerating = false;

  constructor(
    private rapportService: RapportService,
    private router: Router
  ) {
    const today = new Date();
    today.setDate(today.getDate() - 1);
    this.selectedDate = today.toISOString().split('T')[0];
  }

  generateRapport(): void {
    if (!this.selectedDate) {
      toastr.warning('Veuillez sélectionner une date');
      return;
    }

    this.isGenerating = true;
    this.rapportService.generateRapport(this.selectedDate).subscribe({
      next: (response) => {
        toastr.success(response.message || 'Rapport généré avec succès');
        
        if (response.report && response.report.id) {
          this.downloadGeneratedPdf(response.report.id);
        }

        setTimeout(() => {
          this.router.navigate(['/rapports']);
        }, 1500);
      },
      error: (error) => {
        console.error('Erreur lors de la génération:', error);
        toastr.error(error.error?.message || 'Erreur lors de la génération du rapport');
        this.isGenerating = false;
      }
    });
  }

  downloadGeneratedPdf(reportId: number): void {
    this.rapportService.downloadPdf(reportId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rapport-${this.selectedDate}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.isGenerating = false;
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement:', error);
        toastr.error('Rapport généré mais erreur lors du téléchargement automatique');
        this.isGenerating = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/rapports']);
  }

  get maxDate(): string {
    const today = new Date();
    // Si l'heure est avant 19h, on ne peut pas générer le rapport d'aujourd'hui
    if (today.getHours() < 19) {
      today.setDate(today.getDate() - 1);
    }
    return today.toISOString().split('T')[0];
  }
}
