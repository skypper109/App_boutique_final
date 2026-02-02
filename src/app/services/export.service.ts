import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor(
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  /**
   * Detects if the app is running in Tauri
   */
  private isTauri(): boolean {
    return isPlatformBrowser(this.platformId) && (window as any).__TAURI__ !== undefined;
  }

  /**
   * Professionally prints an element by ID
   */
  async printElement(selector: string) {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      this.spinner.show();
      
      // Short delay for rendering
      await new Promise(resolve => setTimeout(resolve, 800));

      const element = document.querySelector(selector);
      if (!element) {
        this.toastr.error('Élément à imprimer introuvable');
        return;
      }

      // Hide spinner BEFORE printing to avoid it blocking the UI thread or appearing in the print
      this.spinner.hide();
      
      // Mandatory delay for NgxSpinner to fully disappear before system dialog opens
      await new Promise(resolve => setTimeout(resolve, 300));
      
      window.print();
    } catch (error) {
      console.error('Print error:', error);
      this.toastr.error('Échec de l\'impression');
      this.spinner.hide();
    }
  }

  /**
   * Professionally exports an element to PDF
   * @param orientation 'portrait' or 'landscape'
   */
  async exportToPdf(selector: string, filename: string, orientation: 'portrait' | 'landscape' = 'portrait') {
    if (!isPlatformBrowser(this.platformId)) return;

    this.spinner.show();
    this.toastr.info('Préparation du document...', 'Export PDF', { timeOut: 2000 });

    try {
      const element = document.querySelector(selector) as HTMLElement;
      if (!element) {
        throw new Error('Élément introuvable');
      }

      // Temporarily show the element if it's hidden via .hidden or print:block
      const originalDisplay = element.style.display;
      const originalPosition = element.style.position;
      const originalVisibility = element.style.visibility;

      // Handle common Tailwind/CSS hidden classes
      const isHidden = window.getComputedStyle(element).display === 'none';
      if (isHidden) {
        element.style.setProperty('display', 'block', 'important');
        element.style.position = 'absolute';
        element.style.top = '-9999px';
        element.style.left = '-9999px';
        element.style.visibility = 'visible';
      }

      // Dynamic import
      const html2pdf = (await import('html2pdf.js' as any)).default;

      if (!html2pdf) {
        throw new Error('Bibliothèque PDF non chargée');
      }

      const opt = {
        margin: [0.15, 0.15],
        filename: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { 
          scale: 3,
          useCORS: true,
          letterRendering: true,
          scrollY: 0,
          windowWidth: 1400
        },
        jsPDF: { unit: 'in', format: 'a4', orientation: orientation },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      // Generate PDF
      await html2pdf().set(opt).from(element).save();

      // Restore original state
      if (isHidden) {
        element.style.display = originalDisplay;
        element.style.position = originalPosition;
        element.style.visibility = originalVisibility;
      }

      this.toastr.success('Document généré avec succès', 'Succès');

    } catch (error: any) {
      console.error('PDF export error:', error);
      this.toastr.error(error.message || 'Erreur lors de la génération du PDF');
    } finally {
      this.spinner.hide();
    }
  }
}
