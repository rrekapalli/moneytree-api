import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-strategies',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    TableModule,
    CardModule,
    ChartModule,
    TagModule,
    PageHeaderComponent,
  ],
  templateUrl: './strategies.component.html',
  styleUrl: './strategies.component.scss'
})
export class StrategiesComponent implements OnInit {
  strategies: any[] = [];
  selectedStrategy: any = null;
  loading = false;
  performanceData: any;
  performanceOptions: any;

  constructor() {}

  ngOnInit() {
    // Initialize with mock data
    this.loadStrategies();
    this.initChartData();
  }

  loadStrategies() {
    this.loading = true;
    // Simulate API call with timeout
    setTimeout(() => {
      this.strategies = [
        {
          id: '1',
          name: 'Momentum Strategy',
          description: 'Buy stocks showing upward price momentum',
          type: 'Technical',
          status: 'Active',
          performance: 12.5,
          lastUpdated: new Date(Date.now() - 86400000) // 1 day ago
        },
        {
          id: '2',
          name: 'Value Investing',
          description: 'Buy undervalued stocks with strong fundamentals',
          type: 'Fundamental',
          status: 'Active',
          performance: 8.2,
          lastUpdated: new Date(Date.now() - 172800000) // 2 days ago
        },
        {
          id: '3',
          name: 'Dividend Growth',
          description: 'Focus on stocks with growing dividends',
          type: 'Income',
          status: 'Paused',
          performance: 5.7,
          lastUpdated: new Date(Date.now() - 259200000) // 3 days ago
        },
        {
          id: '4',
          name: 'Mean Reversion',
          description: 'Buy oversold stocks likely to revert to mean',
          type: 'Technical',
          status: 'Inactive',
          performance: -2.3,
          lastUpdated: new Date(Date.now() - 345600000) // 4 days ago
        },
        {
          id: '5',
          name: 'Growth Investing',
          description: 'Focus on companies with high growth potential',
          type: 'Fundamental',
          status: 'Active',
          performance: 15.8,
          lastUpdated: new Date(Date.now() - 432000000) // 5 days ago
        }
      ];
      this.loading = false;
    }, 1000);
  }

  initChartData() {
    // Sample performance data for chart
    this.performanceData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      datasets: [
        {
          label: 'Strategy Performance',
          data: [5.2, 7.8, 6.5, 9.2, 11.5, 10.8, 12.5],
          fill: false,
          borderColor: '#42A5F5',
          tension: 0.4
        },
        {
          label: 'Market Benchmark',
          data: [4.8, 5.2, 4.9, 6.1, 7.2, 6.9, 7.5],
          fill: false,
          borderColor: '#FFA726',
          tension: 0.4
        }
      ]
    };

    this.performanceOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        },
        y: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        }
      }
    };
  }

  selectStrategy(strategy: any) {
    this.selectedStrategy = strategy;
  }

  createStrategy() {
    // Implementation for creating a new strategy would go here
  }

  editStrategy(strategy: any) {
    // Implementation for editing a strategy would go here
  }

  deleteStrategy(strategy: any) {
    // Implementation for deleting a strategy would go here
  }

  toggleStrategyStatus(strategy: any) {
    // Implementation for toggling strategy status would go here
    if (strategy.status === 'Active') {
      strategy.status = 'Paused';
    } else if (strategy.status === 'Paused' || strategy.status === 'Inactive') {
      strategy.status = 'Active';
    }
  }

  getStatusSeverity(status: string): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Paused':
        return 'warn';
      case 'Inactive':
        return 'danger';
      default:
        return 'info';
    }
  }

  getPerformanceClass(performance: number): string {
    return performance >= 0 ? 'positive' : 'negative';
  }
}