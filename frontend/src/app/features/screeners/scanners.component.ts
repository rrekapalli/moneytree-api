import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-screeners',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    TableModule,
    CardModule,
    TabsModule
  ],
  templateUrl: './screeners.component.html',
  styleUrl: './screeners.component.scss'
})
export class ScreenersComponent implements OnInit {
  screeners: any[] = [];
  predefinedScreeners: any[] = [];
  customScreeners: any[] = [];
  selectedScreener: any = null;
  loading = false;

  // Define tabs for the new p-tabs component
  tabs = [
    { label: 'All Screeners', value: 'all' },
    { label: 'Predefined Screeners', value: 'predefined' },
    { label: 'Custom Screeners', value: 'custom' }
  ];
  activeTab = 'all';

  constructor() {}

  ngOnInit() {
    // Initialize with mock data
    this.loadScreeners();
  }

  loadScreeners() {
    this.loading = true;
    // Simulate API call with timeout
    setTimeout(() => {
      this.predefinedScreeners = [
        {
          id: '1',
          name: 'Oversold Stocks',
          description: 'Stocks with RSI below 30',
          category: 'Technical',
          lastRun: new Date(Date.now() - 3600000), // 1 hour ago
          results: 12
        },
        {
          id: '2',
          name: 'Earnings Surprises',
          description: 'Stocks that beat earnings expectations',
          category: 'Fundamental',
          lastRun: new Date(Date.now() - 86400000), // 1 day ago
          results: 8
        },
        {
          id: '3',
          name: 'Volume Breakouts',
          description: 'Stocks with unusual volume',
          category: 'Technical',
          lastRun: new Date(Date.now() - 7200000), // 2 hours ago
          results: 5
        }
      ];

      this.customScreeners = [
        {
          id: '4',
          name: 'My Growth Screener',
          description: 'High growth stocks with low debt',
          category: 'Custom',
          lastRun: new Date(Date.now() - 172800000), // 2 days ago
          results: 3
        },
        {
          id: '5',
          name: 'Dividend Champions',
          description: 'Stocks with consistent dividend growth',
          category: 'Custom',
          lastRun: new Date(Date.now() - 259200000), // 3 days ago
          results: 7
        }
      ];

      this.screeners = [...this.predefinedScreeners, ...this.customScreeners];
      this.loading = false;
    }, 1000);
  }

  runScreener(screener: any) {
    // Implementation for running a screener would go here
    screener.lastRun = new Date();
  }

  viewResults(screener: any) {
    this.selectedScreener = screener;
    // Implementation for viewing screener results would go here
  }

  createScreener() {
    // Implementation for creating a new screener would go here
  }

  editScreener(screener: any) {
    // Implementation for editing a screener would go here
  }

  deleteScreener(screener: any) {
    // Implementation for deleting a screener would go here
  }
}
