import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { StockService } from '../../../../services/stock.service';
import { WalletService } from '../../../../services/wallet.service';
import { AuthService } from '../../../../services/auth.service';
import { StockPortfolio, StockTicker } from '../../../../core/models/stock.models';

@Component({
  selector: 'app-stocks-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      
      <!-- ========================================================================= -->
      <!-- TOP BANNER                                                                -->
      <!-- ========================================================================= -->
      <div class="p-6 rounded-3xl bg-gradient-to-r from-[#003432] via-[#047857]/40 to-[#071d24] border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="space-y-1.5">
          <div class="flex items-center space-x-2.5">
            <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Stock &amp; ETF Portfolio
            </h1>
            <span class="px-2.5 py-0.5 text-[11px] font-extrabold rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 flex items-center space-x-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>WALL STREET LIVE</span>
            </span>
          </div>
          <p class="text-xs sm:text-sm text-cyan-100/80 max-w-2xl leading-relaxed">
            Practice trading shares of top US companies and benchmark ETFs with zero risk. Buy whole or fractional shares and run automated stock investing robots.
          </p>
        </div>

        <!-- Quick Layman Action Buttons -->
        <div class="flex flex-wrap items-center gap-2.5 shrink-0">
          <a
            routerLink="/portal/stocks/trading"
            class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs shadow-md shadow-emerald-500/20 flex items-center space-x-2"
          >
            <span>📈 Trade Stocks</span>
          </a>
          <a
            routerLink="/portal/stocks/bots"
            class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 transition-all flex items-center space-x-2"
          >
            <span>🤖 Stock Robots</span>
          </a>
          <a
            routerLink="/portal/hub"
            class="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 hover:text-white font-semibold text-xs border border-white/10 transition-all flex items-center space-x-1.5"
            title="Switch Market Hub"
          >
            <span>⇄ Switch to Crypto</span>
          </a>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- KEY STAT CARDS                                                            -->
      <!-- ========================================================================= -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total Stock Net Worth -->
        <div class="glass-panel p-5 rounded-2xl border border-white/10 space-y-2 hover:border-emerald-400/40 transition-colors">
          <div class="flex items-center justify-between text-xs text-slate-400">
            <span class="font-bold uppercase tracking-wider text-[11px] text-emerald-300">Total Stocks Net Worth</span>
            <span class="text-base">💼</span>
          </div>
          <div class="text-3xl font-mono font-black text-white">
            \${{ (portfolio()?.total_equity_usd || 0) | number:'1.2-2' }}
          </div>
          <div class="text-xs font-semibold text-emerald-400 flex items-center space-x-1">
            <span>↑ Shares + Cash combined (USD)</span>
          </div>
        </div>

        <!-- Cash Ready to Invest -->
        <div class="glass-panel p-5 rounded-2xl border border-white/10 space-y-2 hover:border-emerald-400/40 transition-colors">
          <div class="flex items-center justify-between text-xs text-slate-400">
            <span class="font-bold uppercase tracking-wider text-[11px] text-emerald-300">Cash Ready to Invest</span>
            <span class="text-base">💵</span>
          </div>
          <div class="text-3xl font-mono font-black text-emerald-400">
            \${{ (portfolio()?.cash_usd || 0) | number:'1.2-2' }}
          </div>
          <div class="text-xs text-slate-400">Universal USD buying power</div>
        </div>

        <!-- Shares Owned Count -->
        <div class="glass-panel p-5 rounded-2xl border border-white/10 space-y-2 hover:border-emerald-400/40 transition-colors">
          <div class="flex items-center justify-between text-xs text-slate-400">
            <span class="font-bold uppercase tracking-wider text-[11px] text-emerald-300">Stock Holdings Value</span>
            <span class="text-base">📊</span>
          </div>
          <div class="text-3xl font-mono font-black text-cyan-200">
            \${{ (portfolio()?.stock_equity_usd || 0) | number:'1.2-2' }}
          </div>
          <div class="text-xs text-slate-400">Apple, Tesla, Nvidia, S&amp;P 500</div>
        </div>

        <!-- Stock Robots -->
        <div class="glass-panel p-5 rounded-2xl border border-white/10 space-y-2 hover:border-emerald-400/40 transition-colors">
          <div class="flex items-center justify-between text-xs text-slate-400">
            <span class="font-bold uppercase tracking-wider text-[11px] text-emerald-300">Stock Strategy Robots</span>
            <span class="text-base">🤖</span>
          </div>
          <div class="text-3xl font-mono font-black text-purple-300">
            Active
          </div>
          <div class="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
            <span>S&amp;P 500 DCA &amp; Tech Momentum</span>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- POPULAR STOCKS & BENCHMARKS (LIVE QUOTES)                                  -->
      <!-- ========================================================================= -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <h2 class="text-lg font-black text-white tracking-tight">Popular US Stocks &amp; ETFs</h2>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#003432] text-emerald-300 border border-emerald-400/30">
              WALL STREET FEED
            </span>
          </div>
          <a routerLink="/portal/stocks/trading" class="text-xs text-emerald-300 hover:underline font-bold">
            View All Equities &rarr;
          </a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            *ngFor="let tick of stockService.tickers().slice(0, 4)"
            (click)="selectStock(tick.pair)"
            class="glass-panel glass-panel-hover p-4 rounded-2xl border border-white/10 cursor-pointer space-y-3 hover:border-emerald-400/40"
          >
            <div class="flex items-center justify-between">
              <div>
                <span class="font-bold text-white text-base block">{{ tick.symbol }}</span>
                <span class="text-[11px] text-slate-400 truncate block max-w-[120px]">{{ tick.name }}</span>
              </div>
              <span
                class="px-2 py-0.5 rounded-lg text-xs font-mono font-bold"
                [ngClass]="tick.change24h >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'"
              >
                {{ tick.change24h >= 0 ? '+' : '' }}{{ tick.change24h }}%
              </span>
            </div>

            <div class="text-2xl font-mono font-bold text-white">
              \${{ tick.price | number:'1.2-2' }}
            </div>

            <div class="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-white/5">
              <span>Vol: \${{ (tick.volume24h * tick.price / 1000000) | number:'1.0-0' }}M</span>
              <span class="text-emerald-400 font-bold hover:underline">Trade Now →</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- MY STOCK SHARES & HOLDINGS TABLE                                          -->
      <!-- ========================================================================= -->
      <div class="glass-panel rounded-3xl border border-white/10 p-6 space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 class="text-lg font-black text-white">My Stock Holdings</h3>
            <p class="text-xs text-slate-400">All shares credited to your portfolio. Buy or sell shares instantly with your cash balance.</p>
          </div>
          <a routerLink="/portal/stocks/trading" class="text-xs text-emerald-300 hover:underline font-bold flex items-center space-x-1">
            <span>📈 Open Stock Trading Terminal</span>
            <span>&rarr;</span>
          </a>
        </div>

        <div class="overflow-x-auto no-scrollbar">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">
                <th class="py-3 px-4">Stock / Company</th>
                <th class="py-3 px-4">Shares Owned</th>
                <th class="py-3 px-4">Share Price</th>
                <th class="py-3 px-4">Total Value</th>
                <th class="py-3 px-4">24H Change</th>
                <th class="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5 font-mono text-xs">
              <tr *ngFor="let h of portfolio()?.holdings" class="hover:bg-white/5 transition-colors">
                <td class="py-3.5 px-4 font-sans font-bold text-white flex items-center space-x-3">
                  <div class="w-8 h-8 rounded-xl bg-[#003432] text-emerald-400 flex items-center justify-center font-black text-xs border border-emerald-400/20">
                    {{ h.symbol.slice(0, 3) }}
                  </div>
                  <div>
                    <div class="text-white font-bold">{{ h.symbol }}</div>
                    <div class="text-[11px] text-slate-400 font-normal">{{ h.name }}</div>
                  </div>
                </td>
                <td class="py-3.5 px-4 font-bold text-white">
                  {{ h.shares | number:'1.2-4' }}
                </td>
                <td class="py-3.5 px-4 text-slate-300">
                  \${{ h.currentPrice | number:'1.2-2' }}
                </td>
                <td class="py-3.5 px-4 font-bold text-emerald-400">
                  \${{ h.totalValue | number:'1.2-2' }}
                </td>
                <td class="py-3.5 px-4">
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-bold"
                    [ngClass]="h.change24h >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'"
                  >
                    {{ h.change24h >= 0 ? '+' : '' }}{{ h.change24h }}%
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right space-x-2 font-sans">
                  <button
                    (click)="selectStock(h.symbol + '/USD')"
                    class="px-3 py-1.5 rounded-lg bg-[#003432] hover:bg-[#002625] text-emerald-300 border border-emerald-400/30 transition-colors text-xs font-bold inline-block"
                  >
                    Trade Share
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `
})
export class StocksDashboardComponent implements OnInit {
  stockService = inject(StockService);
  walletService = inject(WalletService);
  authService = inject(AuthService);
  private router = inject(Router);

  portfolio = signal<StockPortfolio | null>(null);

  ngOnInit() {
    this.stockService.setMarketMode('stocks');
    this.loadPortfolio();
  }

  loadPortfolio() {
    this.stockService.getPortfolio().subscribe({
      next: (res) => {
        if (res.success) {
          this.portfolio.set(res.data);
        }
      }
    });
  }

  selectStock(pair: string) {
    this.stockService.setActivePair(pair);
    this.router.navigate(['/portal/stocks/trading']);
  }
}
