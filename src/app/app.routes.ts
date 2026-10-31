import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Public Marketing Multi-Page Website
  {
    path: '',
    loadComponent: () => import('./features/public/public-layout.component').then(m => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'about',
        loadComponent: () => import('./features/public/about/about.component').then(m => m.AboutComponent)
      },
      {
        path: 'how-it-works',
        loadComponent: () => import('./features/public/how-it-works/how-it-works.component').then(m => m.HowItWorksComponent)
      },
      {
        path: 'security',
        loadComponent: () => import('./features/public/security/security.component').then(m => m.SecurityComponent)
      },
      {
        path: 'terms',
        loadComponent: () => import('./features/public/terms/terms.component').then(m => m.TermsComponent)
      },
      {
        path: 'privacy',
        loadComponent: () => import('./features/public/privacy/privacy.component').then(m => m.PrivacyComponent)
      },
      {
        path: 'contact',
        loadComponent: () => import('./features/public/contact/contact.component').then(m => m.ContactComponent)
      }
    ]
  },
  { path: 'home', redirectTo: '', pathMatch: 'full' },

  // Authentication Routes
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      }
    ]
  },

  // User Portal Routes (Protected)
  {
    path: 'portal',
    canActivate: [authGuard],
    loadComponent: () => import('./features/portal/portal-layout.component').then(m => m.PortalLayoutComponent),
    children: [
      {
        path: 'hub',
        loadComponent: () => import('./features/portal/hub/market-hub.component').then(m => m.MarketHubComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/portal/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'trading',
        loadComponent: () => import('./features/portal/trading/trading.component').then(m => m.TradingComponent)
      },
      {
        path: 'bots',
        loadComponent: () => import('./features/portal/bots/bots.component').then(m => m.BotsComponent)
      },
      {
        path: 'stocks/dashboard',
        loadComponent: () => import('./features/portal/stocks/stocks-dashboard/stocks-dashboard.component').then(m => m.StocksDashboardComponent)
      },
      {
        path: 'stocks/trading',
        loadComponent: () => import('./features/portal/stocks/stocks-trading/stocks-trading.component').then(m => m.StocksTradingComponent)
      },
      {
        path: 'stocks/bots',
        loadComponent: () => import('./features/portal/stocks/stocks-bots/stocks-bots.component').then(m => m.StocksBotsComponent)
      },
      {
        path: 'cards',
        loadComponent: () => import('./features/portal/cards/cards.component').then(m => m.CardsComponent)
      },
      {
        path: 'wallet',
        loadComponent: () => import('./features/portal/wallet/wallet.component').then(m => m.WalletComponent)
      },
      {
        path: 'kyc',
        loadComponent: () => import('./features/portal/kyc/kyc.component').then(m => m.KycComponent)
      },
      {
        path: 'plans',
        loadComponent: () => import('./features/portal/plans/plans.component').then(m => m.PlansComponent)
      },
      {
        path: 'support',
        loadComponent: () => import('./features/portal/support/support.component').then(m => m.SupportComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Executive Admin Command Center Routes (Protected by authGuard + adminGuard)
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/admin/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: 'overview',
        loadComponent: () => import('./features/admin/overview/overview.component').then(m => m.OverviewComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'transactions',
        loadComponent: () => import('./features/admin/transactions/transactions.component').then(m => m.AdminTransactionsComponent)
      },
      {
        path: 'trade-controller',
        loadComponent: () => import('./features/admin/trade-controller/trade-controller.component').then(m => m.AdminTradeControllerComponent)
      },
      {
        path: 'plans',
        loadComponent: () => import('./features/admin/plan-manager/plan-manager.component').then(m => m.PlanManagerComponent)
      },
      {
        path: 'support',
        loadComponent: () => import('./features/admin/support-manager/support-manager.component').then(m => m.AdminSupportManagerComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/admin/settings/settings.component').then(m => m.AdminSettingsComponent)
      },
      { path: '', redirectTo: 'overview', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: 'portal/dashboard' }
];
