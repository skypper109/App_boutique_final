import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RapportService } from '../../services/rapport.service';

import { ToastrService } from 'ngx-toastr';

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
  maxDateValue: string = '';

  constructor(
    private rapportService: RapportService,
    private router: Router,
    private toast: ToastrService
  ) {
    this.calculateMaxDate();
    const today = new Date();
    today.setDate(today.getDate() - 1);
    this.selectedDate = today.toISOString().split('T')[0];
  }

  calculateMaxDate(): void {
    const today = new Date();
    // Si l'heure est avant 15h, on ne peut pas générer le rapport d'aujourd'hui
    if (today.getHours() < 15) {
      today.setDate(today.getDate() - 1);
    }
    this.maxDateValue = today.toISOString().split('T')[0];
  }

  generateRapport(): void {
    if (!this.selectedDate) {
      this.toast.warning('Veuillez sélectionner une date');
      return;
    }

    this.isGenerating = true;
    this.rapportService.generateRapport(this.selectedDate).subscribe({
      next: (response) => {
        this.toast.success(response.message || 'Rapport généré avec succès');
        
        if (response.report && response.report.id) {
          this.downloadGeneratedPdf(response.report.id);
        } else {
          this.isGenerating = false;
          this.router.navigateByUrl('/rapports');
        }
      },
      error: (error) => {
        console.error('Erreur lors de la génération:', error);
        this.toast.error(error.error?.message || 'Erreur lors de la génération du rapport');
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
        
        // Reset state and navigate after download initiated
        setTimeout(() => {
          this.isGenerating = false;
          this.router.navigateByUrl('/rapports');
        }, 1000);
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement:', error);
        this.toast.error('Rapport généré mais erreur lors du téléchargement automatique');
        this.isGenerating = false;
        this.router.navigateByUrl('/rapports');
      }
    });
  }

  cancel(): void {
    this.router.navigateByUrl('/rapports');
  }
}
