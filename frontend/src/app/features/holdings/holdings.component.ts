import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DividerModule } from 'primeng/divider';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

interface Holding {
  symbol: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  change: number;
}

interface HoldingGroup {
  id: string;
  name: string;
  description: string;
  totalValue: number;
  dailyChange: number;
  holdings: Holding[];
}

@Component({
  selector: 'app-holdings',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    TextareaModule,
    DividerModule,
    FormsModule,
    PageHeaderComponent
  ],
  templateUrl: './holdings.component.html',
  styleUrls: ['./holdings.component.scss']
})
export class HoldingsComponent implements OnInit {
  selectedHoldingId: string | null = null;
  holdings: HoldingGroup[] = [];
  selectedHolding: HoldingGroup = {
    id: '',
    name: '',
    description: '',
    totalValue: 0,
    dailyChange: 0,
    holdings: []
  };

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.selectedHoldingId = params['id'] || null;
      if (this.selectedHoldingId) {
        // Load the selected holding details
        // For now, we'll just set a dummy holding
        this.selectedHolding = {
          id: this.selectedHoldingId,
          name: 'Sample Holding',
          description: 'This is a sample holding group',
          totalValue: 10000,
          dailyChange: 0.05,
          holdings: [
            {
              symbol: 'AAPL',
              shares: 10,
              avgPrice: 150,
              currentPrice: 160,
              value: 1600,
              change: 0.067
            }
          ]
        };
      } else {
        // Load the list of holdings
        // For now, we'll just set some dummy holdings
        this.holdings = [
          {
            id: '1',
            name: 'Tech Stocks',
            description: 'Technology sector investments',
            totalValue: 10000,
            dailyChange: 0.05,
            holdings: []
          },
          {
            id: '2',
            name: 'Financial Stocks',
            description: 'Financial sector investments',
            totalValue: 8000,
            dailyChange: -0.02,
            holdings: []
          }
        ];
      }
    });
  }

  onNewHolding(): void {
    // TODO: Implement new holding creation
  }

  onEdit(holding?: HoldingGroup): void {
    if (holding) {
      // Edit from list view
      this.router.navigate(['/holdings', holding.id]);
    } else {
      // Edit from detail view
      // TODO: Implement holding editing
    }
  }

  onDelete(holding?: HoldingGroup): void {
    if (holding) {
      // Delete from list view
      // TODO: Implement holding deletion
    } else {
      // Delete from detail view
      // TODO: Implement holding deletion
    }
  }

  backToList(): void {
    this.router.navigate(['/holdings']);
  }
}
