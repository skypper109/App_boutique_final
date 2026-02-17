import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Env } from '../../services/env';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { RouterLink } from '@angular/router';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-compta-ca',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NgxSpinnerModule
  ],
  templateUrl: './compta-ca.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styleUrl: './compta-ca.component.scss'
})
export class ComptaCAComponent implements OnInit, AfterViewInit {

  @ViewChild('caChart') caChartCanvas!: ElementRef;
  chart: any;

  annees: any = [];
  dataS: any;
  annee: any;
  chiffres: any = [];
  currentYear: number = new Date().getFullYear();

  monthNames: string[] = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  totalCA: number = 0;
  totalQtv: number = 0;
  totalBenefice: number = 0;

  constructor(private data: DataService, private spinne: NgxSpinnerService) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.data.platformId)) {
      this.loadData()
    }
  }
  loadData(){    
      this.spinne.show();
      this.data.getAll(Env.CHIFFREDAFFAIRE).subscribe({
        next: (res: any) => {
          this.annees = res.par_annee || []; 
          this.chiffres = res.par_mois.reverse() || [];
          this.annee = res.annee_actuelle || this.currentYear;
          
          if (res.annual_stats) {
            this.totalCA = res.annual_stats.total_ca;
            this.totalQtv = res.annual_stats.total_qtv;
            this.totalBenefice = res.annual_stats.total_benefice;
          }
          this.spinne.hide();
          this.updateChart();
        },
        error: (err) => {
          console.error('Error loading CA data:', err);
          this.spinne.hide();
        }
      });
  }

  ngAfterViewInit() {
    this.initChart();
  }

  getChiffreAffaire(annee: any) {
    if (!annee) return;
    this.annee = annee;
    this.spinne.show();
    this.data.getByAnnee(Env.CHIFFREDAFFAIRE, annee).subscribe({
      next: (res: any) => {
        this.chiffres = res.par_mois.reverse() || [];
        
        if (res.annual_stats) {
          this.totalCA = res.annual_stats.total_ca;
          this.totalQtv = res.annual_stats.total_qtv;
          this.totalBenefice = res.annual_stats.total_benefice;
        }
        
        this.updateChart();
        this.spinne.hide();
      },
      error: (err) => {
        console.error('Error loading CA data for year:', annee, err);
        this.spinne.hide();
      }
    });
  }

  getMonthName(num: number): string {
    return this.monthNames[num - 1] || 'Inconnu';
  }

  initChart() {
    const ctx = this.caChartCanvas.nativeElement.getContext('2d');

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.monthNames,
        datasets: [{
          label: 'Chiffre d\'Affaires',
          data: new Array(12).fill(0),
          borderColor: '#3b82f6',
          borderWidth: 3,
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#3b82f6',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 },
            padding: 12,
            cornerRadius: 10,
            displayColors: false,
            callbacks: {
              label: (context: any) => {
                let label = context.dataset.label || '';
                if (label) label += ': ';
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(context.parsed.y);
                }
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(226, 232, 240, 0.6)',
            },
            ticks: {
              font: { size: 11, weight: 500 },
              color: '#64748b',
              callback: (value: any) => value.toLocaleString('fr-FR')
            }
          },
          x: {
            grid: { display: false },
            ticks: {
              font: { size: 11, weight: 600 },
              color: '#64748b'
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  }

  updateChart() {
    if (!this.chart) return;
    const chartData = new Array(12).fill(0);
    if (this.chiffres) {
      this.chiffres.forEach((item: any) => {
        chartData[item.mois_num - 1] = item.ca;
      });
    }
    this.chart.data.datasets[0].data = chartData;
    
    this.chart.update();
  }

}
