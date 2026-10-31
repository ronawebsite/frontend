import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MarketService } from '../../../services/market.service';
import { StockService } from '../../../services/stock.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-market-hub',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-8 max-w-6xl mx-auto py-2">

      <!-- ========================================================================= -->
      <!-- WELCOME & MARKET SELECTION HEADER                                         -->
      <!-- ========================================================================= -->
      <div class="text-center space-y-3">
        <div class="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#003432] border border-[#0BB4D2]/30 text-xs font-bold text-[#0BB4D2] shadow-sm">
          <span>🏛️ Multi-Asset FinTech Simulation Platform</span>
          <span class="text-white">•</span>
          <span class="text-slate-200">Free $10,000 Demo Grant</span>
        </div>

        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          Choose Your Trading Market
        </h1>
        <p class="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Welcome, <strong class="text-white">{{ authService.currentUser()?.full_name }}</strong>! Where would you like to start trading today? You can switch between Crypto and Stocks anytime with 1 click.
        </p>
      </div>

      <!-- ========================================================================= -->
      <!-- DUAL-MARKET SELECTION CARDS                                               -->
      <!-- ========================================================================= -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
        
        <!-- CARD 1: CRYPTOCURRENCY TRADING HUB -->
        <div
          (click)="selectMarket('crypto')"
          class="glass-panel glass-panel-hover rounded-3xl p-7 sm:p-8 border border-white/10 flex flex-col justify-between space-y-6 cursor-pointer relative overflow-hidden group shadow-2xl hover:border-[#0BB4D2]/50 transition-all duration-300"
        >
          <!-- Accent glow -->
          <div class="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-[#0BB4D2]/15 blur-3xl pointer-events-none group-hover:bg-[#0BB4D2]/25 transition-all"></div>

          <div class="space-y-5 relative z-10">
            <!-- Top Badge & Market Icon -->
            <div class="flex items-center justify-between">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#003432] to-[#0BB4D2] text-white flex items-center justify-center text-3xl shadow-lg shadow-[#0BB4D2]/25 group-hover:scale-105 transition-transform">
                ⚡
              </div>
              <span class="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center space-x-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>BINANCE LIVE STREAM</span>
              </span>
            </div>

            <!-- Title & Layman Description -->
            <div class="space-y-2">
              <h2 class="text-2xl font-black text-white group-hover:text-[#0BB4D2] transition-colors">
                Crypto Trading Hub
              </h2>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Trade Bitcoin, Ethereum, Solana, and top digital coins. Connect to live Binance WebSocket order books, activate 24/7 automated bots, and store your profits safely.
              </p>
            </div>

            <!-- Live Crypto Price Pills -->
            <div class="grid grid-cols-3 gap-2 p-3 bg-[#002625] rounded-2xl border border-white/10 font-mono text-xs">
              <div *ngFor="let tick of marketService.tickers().slice(0, 3)" class="text-center">
                <span class="text-[10px] text-slate-400 font-sans block font-bold">{{ tick.symbol }}</span>
                <span class="font-bold text-white block">\${{ tick.price >= 1 ? (tick.price | number:'1.2-2') : (tick.price | number:'1.4-4') }}</span>
                <span class="text-[10px]" [ngClass]="tick.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                  {{ tick.change24h >= 0 ? '+' : '' }}{{ tick.change24h }}%
                </span>
              </div>
            </div>

            <!-- Feature Bullet List -->
            <div class="space-y-2 text-xs text-slate-300">
              <div class="flex items-center space-x-2">
                <span class="text-emerald-400 font-bold">✓</span>
                <span><strong>10 Top Cryptos</strong>: BTC, ETH, SOL, BNB, TRX, DOGE & more</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-emerald-400 font-bold">✓</span>
                <span><strong>24/7 Smart Robots</strong>: Buy the Dip & Trend Follower</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-emerald-400 font-bold">✓</span>
                <span><strong>Interactive Candlestick Charts</strong>: 1H, 24H, 7D, 1M timeframes</span>
              </div>
            </div>
          </div>

          <!-- Enter Button -->
          <div class="pt-2 relative z-10">
            <button
              class="w-full py-3.5 rounded-2xl btn-cyan-gradient text-white font-black text-sm shadow-lg shadow-[#0BB4D2]/25 group-hover:shadow-[#0BB4D2]/40 transition-all flex items-center justify-center space-x-2"
            >
              <span>Enter Crypto Trading Hub</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>

        <!-- CARD 2: STOCKS & EQUITIES TRADING HUB -->
        <div
          (click)="selectMarket('stocks')"
          class="glass-panel glass-panel-hover rounded-3xl p-7 sm:p-8 border border-white/10 flex flex-col justify-between space-y-6 cursor-pointer relative overflow-hidden group shadow-2xl hover:border-emerald-400/50 transition-all duration-300"
        >
          <!-- Accent glow -->
          <div class="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none group-hover:bg-emerald-500/25 transition-all"></div>

          <div class="space-y-5 relative z-10">
            <!-- Top Badge & Market Icon -->
            <div class="flex items-center justify-between">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#003432] via-[#047857] to-emerald-400 text-white flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                📈
              </div>
              <span class="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center space-x-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>WALL STREET EQUITIES</span>
              </span>
            </div>

            <!-- Title & Layman Description -->
            <div class="space-y-2">
              <h2 class="text-2xl font-black text-white group-hover:text-emerald-300 transition-colors">
                Stock &amp; ETF Trading Hub
              </h2>
              <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Trade world-famous US stocks &amp; benchmark ETFs like Apple, Tesla, Nvidia, Microsoft, and the S&P 500. Buy whole or fractional shares and deploy algorithmic momentum strategies.
              </p>
            </div>

            <!-- Live Stock Price Pills -->
            <div class="grid grid-cols-3 gap-2 p-3 bg-[#002625] rounded-2xl border border-white/10 font-mono text-xs">
              <div *ngFor="let tick of stockService.tickers().slice(0, 3)" class="text-center">
                <span class="text-[10px] text-slate-400 font-sans block font-bold">{{ tick.symbol }}</span>
                <span class="font-bold text-white block">\${{ tick.price | number:'1.2-2' }}</span>
                <span class="text-[10px]" [ngClass]="tick.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                  {{ tick.change24h >= 0 ? '+' : '' }}{{ tick.change24h }}%
                </span>
              </div>
            </div>

            <!-- Feature Bullet List -->
            <div class="space-y-2 text-xs text-slate-300">
              <div class="flex items-center space-x-2">
                <span class="text-emerald-400 font-bold">✓</span>
                <span><strong>Top 10 Equities &amp; ETFs</strong>: AAPL, TSLA, NVDA, MSFT, SPY, QQQ</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-emerald-400 font-bold">✓</span>
                <span><strong>Stock Trading Bots</strong>: S&amp;P 500 DCA Indexer &amp; Big Tech Momentum</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-emerald-400 font-bold">✓</span>
                <span><strong>Fractional Share Trading</strong>: Buy with as little as $10</span>
              </div>
            </div>
          </div>

          <!-- Enter Button -->
          <div class="pt-2 relative z-10">
            <button
              class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm shadow-lg shadow-emerald-600/25 group-hover:shadow-emerald-600/40 transition-all flex items-center justify-center space-x-2"
            >
              <span>Enter Stock Trading Hub</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>

      </div>

      <!-- ========================================================================= -->
      <!-- BOTTOM INFO BANNER                                                        -->
      <!-- ========================================================================= -->
      <div class="p-6 rounded-3xl bg-[#002625] border border-white/10 text-center space-y-2">
        <div class="flex items-center justify-center space-x-2 text-cyan-300 font-bold text-xs">
          <span>💡 PRO TIP:</span>
          <span class="text-slate-300">Your USD cash balance is universal and works across both Crypto and Stocks!</span>
        </div>
        <p class="text-xs text-slate-400">
          You can toggle between markets at any time using the quick market pill in the top header.
        </p>
      </div>

    </div>
  `
})
export class MarketHubComponent {
  authService = inject(AuthService);
  marketService = inject(MarketService);
  stockService = inject(StockService);
  private router = inject(Router);

  selectMarket(mode: 'crypto' | 'stocks') {
    this.stockService.setMarketMode(mode);
    if (mode === 'stocks') {
      this.router.navigate(['/portal/stocks/dashboard']);
    } else {
      this.router.navigate(['/portal/dashboard']);
    }
  }
}
