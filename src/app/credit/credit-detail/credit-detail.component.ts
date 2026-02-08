import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Env } from '../../services/env';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { ExportService } from '../../services/export.service';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-credit-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, NgxSpinnerModule, FormsModule],
    templateUrl: './credit-detail.component.html',
})
export class CreditDetailComponent implements OnInit {
    vente: any = null;
    paymentAmount: number = 0;
    paymentMode: string = 'Espèces';
    paymentNotes: string = '';
    showPaymentForm: boolean = false;
    date = new Date();
    isProforma: boolean = false;
    history: any[] = [];
    paginatedHistory: any[] = [];
    historyPage: number = 1;
    historyItemsPerPage: number = 5;
    historyTotalPages: number = 0;
    historyPages: number[] = [];

    // UI State for Modal
    isConfirmModalVisible: boolean = false;
    confirmConfig: { title: string, message: string, action: () => void } = {
        title: '',
        message: '',
        action: () => { }
    };

    constructor(
        private route: ActivatedRoute,
        private data: DataService,
        private spinner: NgxSpinnerService,
        private toast: ToastrService,
        private router: Router,
        private exportService: ExportService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadDetail(+id);
        }
    }

    loadDetail(id: number): void {
        this.spinner.show();
        this.data.getById(Env.CREDIT_STATEMENT, id).subscribe({
            next: (res: any) => {
                this.vente = res;
                this.isProforma = res.type_paiement === 'proforma' || res.statut === 'proforma';
                this.paymentAmount = res.montant_restant;

                this.isProforma = res.type_paiement === 'proforma' || res.statut === 'proforma';
                this.paymentAmount = res.montant_restant;

                // If converted, we might want to refresh type_paiement
                this.loadHistory(id);
                this.spinner.hide();
            },
            error: (err: any) => {
                this.spinner.hide();
                this.toast.error("Erreur de chargement des détails");
            }
        });
    }

    loadHistory(id: number): void {
        this.data.getById(Env.CREDIT_STATEMENT, id + '/history').subscribe({
            next: (res: any) => {
                this.history = res;
                this.updateHistoryPagination();
            },
            error: (err) => {
                console.error("Erreur chargement historique", err);
            }
        });
    }

    updateHistoryPagination(): void {
        this.historyTotalPages = Math.ceil(this.history.length / this.historyItemsPerPage);
        this.historyPages = Array(this.historyTotalPages).fill(0).map((x, i) => i + 1);
        
        const startIndex = (this.historyPage - 1) * this.historyItemsPerPage;
        const endIndex = startIndex + this.historyItemsPerPage;
        this.paginatedHistory = this.history.slice(startIndex, endIndex);
    }

    changeHistoryPage(page: number): void {
        if (page < 1 || page > this.historyTotalPages) return;
        this.historyPage = page;
        this.updateHistoryPagination();
    }

    openConfirm(title: string, message: string, action: () => void) {
        this.confirmConfig = { title, message, action };
        this.isConfirmModalVisible = true;
    }

    closeConfirm() {
        this.isConfirmModalVisible = false;
    }

    executeConfirm() {
        this.confirmConfig.action();
        this.closeConfirm();
    }

    checkoutProforma(): void {
        this.openConfirm(
            "Finalisation de Vente",
            "Voulez-vous transformer ce bordereau en vente réelle ? Les stocks seront mis à jour immédiatement.",
            () => {
                this.spinner.show();
                const payload = {
                    type_paiement: 'contant', // Default to cash on checkout
                    montant_avance: 0
                };

                this.data.add(`${Env.PROFORMA_CONVERT}/${this.vente.id}/convert`, payload).subscribe({
                    next: (res: any) => {
                        this.spinner.hide();
                        this.toast.success("Bordereau converti en vente avec succès");
                        this.loadDetail(this.vente.id);
                        // Optional: Navigate to invoice
                        this.openConfirm(
                            "Facture Disponible",
                            "La vente est validée. Souhaitez-vous imprimer la facture maintenant ?",
                            () => this.router.navigate(['/clients/facture', res.factID])
                        );
                    },
                    error: (err) => {
                        this.spinner.hide();
                        this.toast.error(err.error?.message || "Erreur lors de la conversion");
                    }
                });
            }
        );
    }

    addPayment(): void {
        if (this.paymentAmount <= 0) {
            this.toast.warning("Montant invalide");
            return;
        }

        if (this.paymentAmount > this.vente.montant_restant) {
            this.toast.error("Le montant dépasse le reste à payer");
            return;
        }

        const payload = {
            vente_id: this.vente.id,
            montant: this.paymentAmount,
            date_paiement: new Date().toISOString().split('T')[0],
            mode_paiement: this.paymentMode,
            notes: this.paymentNotes
        };

        console.log(payload);

        this.spinner.show();
        this.data.add(Env.CREDIT_PAYMENTS, payload).subscribe({
            next: (res: any) => {
                this.toast.success("Paiement enregistré");
                this.showPaymentForm = false;
                this.paymentAmount = 0;
                this.paymentNotes = '';
                this.loadDetail(this.vente.id);
            },
            error: (err) => {
                this.spinner.hide();
                this.toast.error("Erreur lors de l'enregistrement du paiement");
            }
        });
    }

    printStatement(): void {
        // Use bordereau for proforma, recu_credit for credit sales
        const type = this.isProforma ? 'bordereau' : 'recu_credit';
        this.exportService.printPdf(type, this.vente.id);
    }

    exportPDF(): void {
        const type = this.isProforma ? 'bordereau' : 'recu_credit';
        const filename = `${type}_${this.vente?.id}_${new Date().toISOString().split('T')[0]}.pdf`;
        this.exportService.downloadPdf(type, this.vente.id, filename);
    }
}
