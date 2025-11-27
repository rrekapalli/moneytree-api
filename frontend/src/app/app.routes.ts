import { Routes } from '@angular/router';
import { AppShellSingleComponent } from './core/shell/app-shell-single.component';
import { featureFlagGuard, authGuard } from './core/guards';

// Import all components eagerly for single bundle
import { LoginComponent } from './features/login/login.component';
import { PortfoliosComponent } from './features/portfolios/portfolios.component';
import { ScreenersComponent } from './features/screeners/screeners.component';
import { ScreenersListComponent } from './features/screeners/screeners-list/screeners-list.component';
import { ScreenerFormComponent } from './features/screeners/screener-form/screener-form.component';
import { ScreenerDetailComponent } from './features/screeners/screener-detail/screener-detail.component';
import { StrategiesComponent } from './features/strategies/strategies.component';
import { WatchlistComponent } from './features/watchlists/watchlist.component';
import { IndicesComponent } from './features/indices/indices.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { OverallComponent } from './features/dashboard/overall/overall.component';
import { StockInsightsComponent } from './features/dashboard/stock-insights/stock-insights.component';
import { TodayComponent } from './features/dashboard/today/today.component';
import { ThisWeekComponent } from './features/dashboard/this-week/this-week.component';
import { ThisMonthComponent } from './features/dashboard/this-month/this-month.component';
import { ThisYearComponent } from './features/dashboard/this-year/this-year.component';
import { HoldingsComponent } from './features/holdings/holdings.component';
import { PositionsComponent } from './features/positions/positions.component';
import { MarketComponent } from './features/market/market.component';
import { NotFoundComponent } from './features/not-found/not-found.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Login - MoneyPlant'
  },
  {
    path: '',
    component: AppShellSingleComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'portfolios',
        component: PortfoliosComponent,
        title: 'Portfolios - MoneyPlant',
        canActivate: [featureFlagGuard('portfolios')]
      },
      {
        path: 'portfolios/:id',
        component: PortfoliosComponent,
        title: 'Portfolio Details - MoneyPlant',
        canActivate: [featureFlagGuard('portfolios')]
      },
      {
        path: 'screeners',
        component: ScreenersComponent,
        title: 'Stock Screeners - MoneyPlant',
        canActivate: [featureFlagGuard('screeners')],
        children: [
          {
            path: '',
            redirectTo: 'list',
            pathMatch: 'full'
          },
          {
            path: 'list',
            component: ScreenersListComponent,
            title: 'Screeners List - MoneyPlant'
          }
        ]
      },
      {
        path: 'screeners/new',
        component: ScreenerFormComponent,
        title: 'Create Screener - MoneyPlant',
        canActivate: [featureFlagGuard('screeners')]
      },
      {
        path: 'screeners/:id/edit',
        component: ScreenerFormComponent,
        title: 'Edit Screener - MoneyPlant',
        canActivate: [featureFlagGuard('screeners')]
      },
      {
        path: 'screeners/:id',
        component: ScreenerDetailComponent,
        title: 'Screener Details - MoneyPlant',
        canActivate: [featureFlagGuard('screeners')]
      },
      {
        path: 'strategies',
        component: StrategiesComponent,
        title: 'Trading Strategies - MoneyPlant',
        canActivate: [featureFlagGuard('strategies')]
      },
      {
        path: 'strategies/:id',
        component: StrategiesComponent,
        title: 'Strategy Details - MoneyPlant',
        canActivate: [featureFlagGuard('strategies')]
      },
      {
        path: 'watchlists',
        component: WatchlistComponent,
        title: 'Watchlists - MoneyPlant',
        canActivate: [featureFlagGuard('watchlist')]
      },
      {
        path: 'watchlists/:id',
        component: WatchlistComponent,
        title: 'Watchlist Details - MoneyPlant',
        canActivate: [featureFlagGuard('watchlist')]
      },
      {
        path: 'indices',
        component: IndicesComponent,
        title: 'Indices - MoneyPlant',
        canActivate: [featureFlagGuard('indices')]
      },
      {
        path: 'indices/:id',
        component: IndicesComponent,
        title: 'Indices Details - MoneyPlant',
        canActivate: [featureFlagGuard('indices')]
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        title: 'Dashboard - MoneyPlant',
        canActivate: [featureFlagGuard('dashboard')],
        children: [
          {
            path: '',
            redirectTo: 'overall',
            pathMatch: 'full'
          },
          {
            path: 'overall',
            component: OverallComponent,
            title: 'Overall Dashboard - MoneyPlant',
            canActivate: [featureFlagGuard('dashboard-overall')]
          },
          {
            path: 'stock-insights',
            component: StockInsightsComponent,
            title: 'Stock Insights Dashboard - MoneyPlant',
            canActivate: [featureFlagGuard('dashboard-stock-insights')]
          },
          {
            path: 'stock-insights/:symbol',
            component: StockInsightsComponent,
            title: 'Stock Insights Dashboard - MoneyPlant',
            canActivate: [featureFlagGuard('dashboard-stock-insights')]
          },
          {
            path: 'today',
            component: TodayComponent,
            title: 'Today Dashboard - MoneyPlant',
            canActivate: [featureFlagGuard('dashboard-today')]
          },
          {
            path: 'week',
            component: ThisWeekComponent,
            title: 'This Week Dashboard - MoneyPlant',
            canActivate: [featureFlagGuard('dashboard-week')]
          },
          {
            path: 'month',
            component: ThisMonthComponent,
            title: 'This Month Dashboard - MoneyPlant',
            canActivate: [featureFlagGuard('dashboard-month')]
          },
          {
            path: 'year',
            component: ThisYearComponent,
            title: 'This Year Dashboard - MoneyPlant',
            canActivate: [featureFlagGuard('dashboard-year')]
          }
        ]
      },
      {
        path: 'holdings',
        component: HoldingsComponent,
        title: 'Holdings - MoneyPlant',
        canActivate: [featureFlagGuard('holdings')]
      },
      {
        path: 'holdings/:id',
        component: HoldingsComponent,
        title: 'Holdings Details - MoneyPlant',
        canActivate: [featureFlagGuard('holdings')]
      },
      {
        path: 'positions',
        component: PositionsComponent,
        title: 'Positions - MoneyPlant',
        canActivate: [featureFlagGuard('positions')]
      },
      {
        path: 'positions/:id',
        component: PositionsComponent,
        title: 'Position Details - MoneyPlant',
        canActivate: [featureFlagGuard('positions')]
      },
      {
        path: 'market',
        component: MarketComponent,
        title: 'Market - MoneyPlant',
        canActivate: [featureFlagGuard('market')]
      },
      {
        path: 'market/:id',
        component: MarketComponent,
        title: 'Market Details - MoneyPlant',
        canActivate: [featureFlagGuard('market')]
      }
    ]
  },
  {
    path: '**',
    component: NotFoundComponent,
    title: 'Page Not Found - MoneyPlant'
  }
];
