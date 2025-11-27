import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { TabsModule } from 'primeng/tabs';
import { ChartModule } from 'primeng/chart';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

interface Position {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
}

@Component({
  selector: 'app-positions',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    TableModule,
    TooltipModule,
    TabsModule,
    ChartModule,
    DividerModule,
    TagModule,
    PageHeaderComponent,
  ],
  templateUrl: './positions.component.html',
  styleUrls: ['./positions.component.scss']
})
export class PositionsComponent implements OnInit {
  positions: Position[] = [];
  selectedPositionId: string | null = null;
  selectedPosition: Position | null = null;

  // Define tabs for the new p-tabs component
  detailTabs = [
    { label: 'Performance', value: 'performance' },
    { label: 'Transactions', value: 'transactions' },
    { label: 'Analysis', value: 'analysis' }
  ];
  activeDetailTab = 'performance';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // Sample data
    this.positions = [
      { id: '1', symbol: 'AAPL', name: 'Apple Inc.', price: 150.25, change: 0.0234 },
      { id: '2', symbol: 'MSFT', name: 'Microsoft Corporation', price: 290.10, change: 0.0156 },
      { id: '3', symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2750.80, change: -0.0089 }
    ];

    this.route.params.subscribe(params => {
      this.selectedPositionId = params['id'] || null;
      if (this.selectedPositionId) {
        // Find the selected position
        this.selectedPosition = this.positions.find(p => p.id === this.selectedPositionId) || null;
      }
    });
  }

  addPosition(): void {
    // TODO: Implement add position functionality
  }

  viewPosition(position: Position): void {
    this.router.navigate(['/positions', position.id]);
  }

  editPosition(position: Position): void {
    // TODO: Implement edit position functionality
  }

  deletePosition(position: Position): void {
    // TODO: Implement delete position functionality
  }

  backToList(): void {
    this.router.navigate(['/positions']);
  }
}
