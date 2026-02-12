import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Env } from './env';
import { DataService } from './data.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor(
    private http: HttpClient,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private dataService: DataService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  /**
   * Download PDF from backend
   */
  async downloadPdf(type: 'facture' | 'bordereau' | 'recu_credit' | 'inventaire' | 'rapport_journalier', id: any, filename?: string, filters: any = {}) {
    if (!isPlatformBrowser(this.platformId)) return;

    this.spinner.show();
    this.toastr.info('Génération du PDF...', 'Export');

    try {
      const response = await firstValueFrom(
        this.http.post(
          `${Env.API_URL}/pdf/generate`,
          { type, id, ...filters },
          {
            headers: this.dataService.getHeaders(),
            responseType: 'blob'
          }
        )
      );

      // Create blob and download
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `${type}-${id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);

      this.toastr.success('PDF téléchargé avec succès', 'Succès');
    } catch (error: any) {
      console.error('PDF download error:', error);
      this.toastr.error('Erreur lors de la génération du PDF.', 'Erreur');
    } finally {
      this.spinner.hide();
    }
  }

  /**
   * Print PDF from backend
   */
  async printPdf(type: 'facture' | 'bordereau' | 'recu_credit' | 'inventaire' | 'rapport_journalier', id: any, filters: any = {}) {
    if (!isPlatformBrowser(this.platformId)) return;

    this.spinner.show();
    this.toastr.info('Préparation de l\'impression...', 'Impression');

    try {
      const response = await firstValueFrom(
        this.http.post(
          `${Env.API_URL}/pdf/generate`,
          { type, id, ...filters },
          {
            headers: this.dataService.getHeaders(),
            responseType: 'blob'
          }
        )
      );

      // Create blob URL and open in new window for printing
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print();
        });
      }

      this.toastr.success('Document prêt à imprimer', 'Succès');
    } catch (error: any) {
      console.error('Print error:', error);
      this.toastr.error('Erreur lors de la préparation de l\'impression', 'Erreur');
    } finally {
      this.spinner.hide();
    }
  }

  /**
   * Legacy method for backward compatibility (deprecated)
   * @deprecated Use downloadPdf or printPdf instead
   */
  async exportToPdf(selector: string, filename: string, orientation: 'portrait' | 'landscape' = 'portrait') {
    console.warn('exportToPdf is deprecated. Please use downloadPdf() instead.');
    this.toastr.warning('Cette méthode est obsolète', 'Avertissement');
  }

  /**
   * Legacy method for backward compatibility (deprecated)
   * @deprecated Use printPdf instead
   */
  async printElement(selector: string) {
    console.warn('printElement is deprecated. Please use printPdf() instead.');
    this.toastr.warning('Cette méthode est obsolète', 'Avertissement');
  }
}
