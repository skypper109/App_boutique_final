import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpensesService } from '../expenses.service';
import { Chart, registerables } from 'chart.js';
import { NgxSpinnerService, NgxSpinnerModule } from 'ngx-spinner';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../login/Guard/login.service';
import { RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';

Chart.register(...registerables);

@Component({
  selector: 'app-expense-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxSpinnerModule, RouterLink],
  templateUrl: './expense-dashboard.component.html',
  styleUrl: './expense-dashboard.component.scss'
})
export class ExpenseDashboardComponent implements OnInit {
  @ViewChild('monthlyChart', { static: false }) monthlyChartCanvas!: ElementRef;
  @ViewChild('typeChart', { static: false }) typeChartCanvas!: ElementRef;

  totalYear: number = 0;
  selectedYear: number = new Date().getFullYear();
  years: number[] = [];
  
  private monthlyChart: any;
  private typeChart: any;

  constructor(
    private expenseService: ExpensesService,
    private loginService: LoginService,
    private spinner: NgxSpinnerService,
  ) {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 5; i--) {
      this.years.push(i);
    }
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.spinner.show();
    const boutiqueId = this.loginService.getBoutiqueId();
    this.expenseService.getDashboard({ year: this.selectedYear, boutique_id: boutiqueId }).subscribe({
      next: (res: any) => {
        this.totalYear = res.total_year || 0;
        this.updateCharts(res);
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
      }
    });
  }

  updateCharts(data: any): void {
    if (data.monthly_evolution && data.monthly_evolution.length > 0) {
      this.createMonthlyChart(data.monthly_evolution);
    }
    if (data.breakdown_by_type && data.breakdown_by_type.length > 0) {
      this.createTypeChart(data.breakdown_by_type);
    }
  }

  createMonthlyChart(evolution: any[]): void {
    const labels = ['Jan', 'Féb', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const values = new Array(12).fill(0);
    
    evolution.forEach(item => {
      values[item.month - 1] = item.total;
    });

    if (this.monthlyChart) this.monthlyChart.destroy();

    this.monthlyChart = new Chart(this.monthlyChartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Dépenses mensuelles (FCFA)',
          data: values,
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { display: false } }
      }
    });
  }

  createTypeChart(breakdown: any[]): void {
    const labels: string[] = [];
    const values: number[] = [];
    breakdown.forEach(item => {
      labels.push(item.type);
      values.push(item.total);
    });

    if (this.typeChart) this.typeChart.destroy();

    this.typeChart = new Chart(this.typeChartCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: [
            '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }
}

