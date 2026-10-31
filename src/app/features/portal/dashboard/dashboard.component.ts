import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WalletService } from '../../../services/wallet.service';
import { TradeService } from '../../../services/trade.service';
import { AuthService } from '../../../services/auth.service';
import { PortfolioSummary } from '../../../core/models/fintech.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6 font-nunito selection:bg-[#0BB4D2] selection:text-white">
      
      <!-- ========================================================================= -->
      <!-- TOP BANNER                                                                -->
      <!-- ========================================================================= -->
      <div class="p-6 rounded-3xl bg-gradient-to-r from-[#003432] via-[#002625] to-[#071d24] border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div class="space-y-1" *ngIf="authService.currentUser() as user">
          <div class="flex items-center space-x-2.5">
            <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome, {{ user.full_name }}
            </h1>
            <span class="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 flex items-center space-x-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>LIVE DESK</span>
            </span>
          </div>
          <p class="text-xs text-cyan-200/80">
            Automated trading desk &bull; Real-time returns
          </p>
        </div>

        <!-- Quick Action Buttons -->
        <div class="flex items-center space-x-2.5 shrink-0">
          <a
            routerLink="/portal/wallet"
            class="px-4 py-2.5 rounded-xl btn-cyan-gradient font-black text-xs shadow-md shadow-[#0BB4D2]/20 flex items-center space-x-1.5 active:scale-95 transition"
          >
            <span>📥 Deposit</span>
          </a>
          <a
            routerLink="/portal/wallet"
            class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 transition active:scale-95"
          >
            <span>📤 Withdraw</span>
          </a>
          <button
            (click)="walletService.downloadPDF()"
            class="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-semibold text-xs border border-white/10 transition"
            title="PDF Statement"
          >
            <span>📄 Statement</span>
          </button>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- 3 CLEAN STAT CARDS                                                        -->
      <!-- ========================================================================= -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <!-- Card 1: Total Account Value -->
        <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-1.5 bg-[#002625]/80 shadow-lg">
          <div class="flex items-center justify-between text-xs text-slate-400">
            <span class="font-bold uppercase tracking-wider text-[11px] text-cyan-300">Total Balance</span>
            <span class="text-base">💼</span>
          </div>
          <div class="text-3xl font-mono font-black text-white">
            \${{ getTotalBalance() | number:'1.2-2' }}
          </div>
          <div class="text-[11px] text-slate-400">
            Cash &amp; active equity
          </div>
        </div>

        <!-- Card 2: Initial Capital Deposited -->
        <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-1.5 bg-[#002625]/80 shadow-lg">
          <div class="flex items-center justify-between text-xs text-slate-400">
            <span class="font-bold uppercase tracking-wider text-[11px] text-cyan-300">Initial Capital</span>
            <span class="text-base">💵</span>
          </div>
          <div class="text-3xl font-mono font-black text-slate-200">
            \$10,000.00
          </div>
          <div class="text-[11px] text-emerald-400 font-semibold">
            Starting balance
          </div>
        </div>

        <!-- Card 3: Total Real-Time Profit Earned -->
        <div
          class="glass-panel p-6 rounded-3xl border border-emerald-500/30 space-y-1.5 relative overflow-hidden bg-gradient-to-tr from-[#003432] to-[#002625] shadow-lg transition-all duration-300"
          [ngClass]="{'ring-2 ring-emerald-400 scale-[1.01]': isProfitPulsing()}"
        >
          <div class="flex items-center justify-between text-xs text-slate-400">
            <span class="font-bold uppercase tracking-wider text-[11px] text-emerald-300 flex items-center space-x-1">
              <span>Total Profit</span>
              <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            </span>
            <span class="text-base">📈</span>
          </div>
          <div class="text-3xl font-mono font-black text-emerald-400">
            {{ totalActiveProfit() >= 0 ? '+' : '' }}\${{ totalActiveProfit() | number:'1.2-2' }}
          </div>
          <div class="text-[11px] text-emerald-300 font-semibold">
            {{ isProfitPulsing() ? '⚡ Real-time update' : activeTrades().length + ' active position(s)' }}
          </div>
        </div>

      </div>

      <!-- ========================================================================= -->
      <!-- MULTI-ASSET BROKER PORTFOLIO (Only when active trades exist)              -->
      <!-- ========================================================================= -->
      <div
        *ngIf="activeTrades().length > 0"
        class="p-5 sm:p-6 rounded-3xl border shadow-xl transition-all duration-300 relative overflow-hidden bg-gradient-to-r from-[#003432] to-[#002625] border-emerald-400/30 space-y-4"
        [ngClass]="{'ring-2 ring-emerald-400': isProfitPulsing()}"
      >
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-white/10 pb-3">
          <div class="flex items-center space-x-2">
            <span class="text-xs font-black uppercase tracking-wider text-white">Active Positions</span>
            <span class="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
              {{ activeTrades().length }}
            </span>
          </div>

          <div class="flex items-center space-x-3">
            <div class="text-right">
              <span class="text-[10px] uppercase text-slate-400 block font-bold">Earnings</span>
              <span class="font-mono font-black text-emerald-400 text-sm">
                {{ totalActiveProfit() >= 0 ? '+' : '' }}\${{ totalActiveProfit() | number:'1.2-2' }}
              </span>
            </div>
            <a
              routerLink="/portal/trading"
              class="px-3 py-1.5 rounded-xl bg-[#0BB4D2] hover:bg-cyan-400 text-[#002625] font-black text-xs transition"
            >
              Chart &rarr;
            </a>
          </div>
        </div>

        <!-- Clean Chips Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            *ngFor="let t of activeTrades()"
            class="p-3.5 rounded-2xl bg-[#001c1c]/90 border border-white/10 flex items-center justify-between hover:border-cyan-400/30 transition shadow-sm"
          >
            <div class="flex items-center space-x-2.5">
              <div class="w-8 h-8 rounded-lg bg-[#003432] text-cyan-300 flex items-center justify-center font-bold text-xs">
                {{ t.pair.split('/')[0] }}
              </div>
              <div>
                <div class="flex items-center space-x-1.5">
                  <span class="font-bold text-white text-xs">{{ t.pair }}</span>
                  <span
                    class="px-1.5 py-0.2 rounded text-[8px] font-extrabold uppercase"
                    [ngClass]="t.side === 'BUY' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'"
                  >
                    {{ t.side }}
                  </span>
                </div>
                <div class="text-[10px] text-slate-400 font-mono">
                  {{ t.amount }} units &bull; \${{ t.price | number:'1.2-2' }}
                </div>
              </div>
            </div>

            <div class="text-right">
              <span
                class="font-mono font-black text-xs block"
                [ngClass]="t.current_profit >= 0 ? 'text-emerald-400' : 'text-rose-400'"
              >
                {{ t.current_profit >= 0 ? '+' : '' }}\${{ t.current_profit | number:'1.2-2' }}
              </span>
              <span
                class="text-[9px] uppercase font-bold"
                [ngClass]="t.target_outcome === 'CLOSING_SOON' ? 'text-amber-300 animate-pulse' : 'text-slate-400'"
              >
                {{ t.target_outcome === 'CLOSING_SOON' ? '⏳ Closing' : '● Live' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- RECENT TRADES HISTORY                                                     -->
      <!-- ========================================================================= -->
      <div class="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 space-y-4 bg-[#002625]/60 shadow-lg">
        <div class="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 class="text-sm font-bold text-white flex items-center space-x-2">
            <span>📑</span>
            <span>Trade History</span>
          </h2>
          <span class="text-xs text-slate-400">Total: {{ tradeService.managedTrades().length }}</span>
        </div>

        <!-- Empty State -->
        <div *ngIf="tradeService.managedTrades().length === 0" class="text-center py-8 text-slate-400 text-xs">
          No executed trades yet.
        </div>

        <!-- Clean Compact List -->
        <div class="space-y-2" *ngIf="tradeService.managedTrades().length > 0">
          <div
            *ngFor="let t of tradeService.managedTrades().slice(0, 8)"
            class="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between hover:border-white/15 transition text-xs"
          >
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 rounded-lg bg-[#003432] text-cyan-300 flex items-center justify-center font-bold text-xs">
                {{ t.pair.split('/')[0] }}
              </div>
              <div>
                <div class="flex items-center space-x-1.5">
                  <span class="font-bold text-white">{{ t.pair }}</span>
                  <span
                    class="px-1.5 py-0.2 rounded text-[8px] font-bold uppercase"
                    [ngClass]="t.side === 'BUY' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'"
                  >
                    {{ t.side }}
                  </span>
                  <span class="text-[10px] text-slate-400 font-mono">({{ t.amount }})</span>
                </div>
                <div class="text-[10px] text-slate-400 font-mono">
                  Entry: \${{ t.price | number:'1.2-2' }} &bull; {{ t.created_at | date:'short' }}
                </div>
              </div>
            </div>

            <div class="text-right">
              <span
                class="font-mono font-bold"
                [ngClass]="t.current_profit >= 0 ? 'text-emerald-400' : 'text-rose-400'"
              >
                {{ t.current_profit >= 0 ? '+' : '' }}\${{ t.current_profit | number:'1.2-2' }}
              </span>
              <span
                class="text-[9px] uppercase font-bold block"
                [ngClass]="{
                  'text-emerald-400': t.target_outcome === 'WIN',
                  'text-cyan-300': t.target_outcome === 'IN_PROGRESS',
                  'text-amber-400': t.target_outcome === 'CLOSING_SOON',
                  'text-rose-400': t.target_outcome === 'LOSS'
                }"
              >
                {{ t.target_outcome }}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class DashboardComponent implements OnInit {
  walletService = inject(WalletService);
  tradeService = inject(TradeService);
  authService = inject(AuthService);

  portfolio = signal<PortfolioSummary | null>(null);
  isProfitPulsing = signal<boolean>(false);

  activeTrades = computed(() => {
    return this.tradeService.managedTrades().filter(t => t.target_outcome !== 'CLOSED');
  });

  totalActiveProfit = computed(() => {
    return this.activeTrades().reduce((acc, t) => acc + (parseFloat(t.current_profit) || 0), 0);
  });

  constructor() {
    effect(() => {
      const update = this.tradeService.latestUpdate();
      if (update) {
        this.isProfitPulsing.set(true);
        setTimeout(() => this.isProfitPulsing.set(false), 2000);
        this.loadPortfolio();
      }
    });
  }

  ngOnInit() {
    this.loadPortfolio();
  }

  loadPortfolio() {
    this.walletService.getPortfolio().subscribe({
      next: (res) => {
        if (res.success) {
          this.portfolio.set(res.data);
        }
      }
    });
  }

  getTotalBalance(): number {
    const usd = this.portfolio()?.wallets?.find(w => w.asset_symbol === 'USD')?.balance || 0;
    const usdt = this.portfolio()?.wallets?.find(w => w.asset_symbol === 'USDT')?.balance || 0;
    return parseFloat((usd + usdt + this.totalActiveProfit()).toFixed(2));
  }
}
