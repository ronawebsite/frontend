import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockTradingViewChartComponent } from '../../../../shared/charts/stock-tradingview-chart/stock-tradingview-chart.component';
import { StockService } from '../../../../services/stock.service';
import { TradeService } from '../../../../services/trade.service';
import { WalletService } from '../../../../services/wallet.service';
import { ToastService } from '../../../../services/toast.service';
import { StockPosition } from '../../../../core/models/stock.models';

@Component({
  selector: 'app-stocks-trading',
  standalone: true,
  imports: [CommonModule, FormsModule, StockTradingViewChartComponent],
  template: `
    <div class="space-y-6">
      
      <!-- ========================================================================= -->
      <!-- TOP STOCK SELECTION BAR                                                   -->
      <!-- ========================================================================= -->
      <div class="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-[#002625] border border-white/10 shadow-lg">
        <div class="flex items-center space-x-3 sm:space-x-4">
          <!-- Stock Selector -->
          <div class="flex items-center space-x-2">
            <span class="text-xs text-slate-300 font-bold uppercase tracking-wider hidden sm:inline">Choose Stock:</span>
            <select
              [ngModel]="stockService.activePair()"
              (ngModelChange)="onStockChange($event)"
              class="px-3.5 py-2 rounded-xl bg-[#003432] border border-emerald-400/40 font-mono font-bold text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option *ngFor="let tick of stockService.tickers()" [value]="tick.pair">
                {{ tick.symbol }} - {{ tick.name }} (\${{ tick.price | number:'1.2-2' }})
              </option>
            </select>
          </div>

          <!-- 24h High & Low -->
          <div *ngIf="stockService.selectedTicker() as t" class="flex items-center space-x-3 text-xs font-mono">
            <div>
              <span class="text-slate-400">High:</span>
              <span class="text-emerald-400 ml-1 font-bold">\${{ t.high24h | number:'1.2-2' }}</span>
            </div>
            <div>
              <span class="text-slate-400">Low:</span>
              <span class="text-rose-400 ml-1 font-bold">\${{ t.low24h | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>

        <!-- Simulation Badges -->
        <div class="flex items-center space-x-2">
          <span class="px-3 py-1 text-xs font-bold font-mono rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>LIVE US EQUITIES</span>
          </span>
          <span class="px-3 py-1 text-xs font-bold font-mono rounded-xl bg-[#0BB4D2]/10 text-cyan-300 border border-[#0BB4D2]/30 hidden sm:inline">
            ZERO COMMISSIONS
          </span>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- SUPERVISOR MANAGED TRADE & LIVE PROFIT FLOW BANNER (EQUITIES)             -->
      <!-- ========================================================================= -->
      <div
        *ngIf="activeManagedTrade() as mt"
        class="p-5 sm:p-6 rounded-3xl border shadow-2xl transition-all duration-300 relative overflow-hidden"
        [ngClass]="{
          'bg-gradient-to-r from-[#003432] via-[#014d48] to-[#002625] border-emerald-400/40 shadow-emerald-500/10': mt.current_profit >= 0,
          'bg-gradient-to-r from-[#2a0e16] via-[#1f0d14] to-[#002625] border-rose-500/40 shadow-rose-500/10': mt.current_profit < 0,
          'ring-2 ring-emerald-400 scale-[1.01]': isProfitPulsing()
        }"
      >
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <!-- Left: Trade Meta -->
          <div class="space-y-2">
            <div class="flex items-center space-x-2.5">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-purple-500/30 text-purple-200 border border-purple-400/30 flex items-center space-x-1">
                <span>⚡</span>
                <span>SUPERVISOR MANAGED STOCK</span>
              </span>
              <span
                class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                [ngClass]="mt.side === 'BUY' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'"
              >
                {{ mt.side === 'BUY' ? '🟢 BUY (LONG)' : '🔴 SELL (SHORT)' }}
              </span>
              <span class="text-xs font-mono font-bold text-white">{{ mt.pair }}</span>
            </div>

            <div class="text-xs text-slate-300 flex items-center space-x-4 font-mono">
              <span>Shares: <strong class="text-white">{{ mt.amount }}</strong></span>
              <span>Entry: <strong class="text-white">\${{ mt.price | number:'1.2-2' }}</strong></span>
              <span *ngIf="mt.admin_notes" class="text-cyan-300 font-sans hidden sm:inline">&bull; {{ mt.admin_notes }}</span>
            </div>

            <!-- Flow Step Bar -->
            <div class="flex items-center space-x-2 text-[11px] font-sans text-slate-300 pt-1">
              <span class="flex items-center space-x-1 text-emerald-300 font-semibold">
                <span>●</span>
                <span>Entry Filled</span>
              </span>
              <span class="text-slate-600">&rarr;</span>
              <span class="flex items-center space-x-1 text-cyan-300 font-semibold animate-pulse">
                <span>●</span>
                <span>Real-Time Chart Sync</span>
              </span>
              <span class="text-slate-600">&rarr;</span>
              <span class="text-slate-400">
                Target: <strong class="text-white font-mono uppercase">{{ mt.target_outcome }}</strong>
              </span>
            </div>
          </div>

          <!-- Right: Big Live Real-Time Profit Display -->
          <div class="flex items-center space-x-4 bg-black/40 p-4 rounded-2xl border border-white/10 shrink-0">
            <div>
              <div class="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">
                <span>Live Share Profit</span>
                <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-2"></span>
              </div>
              <div
                class="text-3xl sm:text-4xl font-black font-mono transition-transform duration-200"
                [ngClass]="{
                  'text-emerald-400': mt.current_profit >= 0,
                  'text-rose-400': mt.current_profit < 0,
                  'scale-110': isProfitPulsing()
                }"
              >
                {{ mt.current_profit >= 0 ? '+' : '' }}\${{ mt.current_profit | number:'1.2-2' }}
              </div>
              <div class="text-[10px] text-slate-400 font-sans mt-0.5">
                {{ isProfitPulsing() ? '⚡ Real-time tick updated!' : 'Managed by Platform Supervisor' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- MAIN STOCK TRADING INTERFACE: CHART & SHARE ORDER FORM                    -->
      <!-- ========================================================================= -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Left Column: Stock Candlestick Chart (8 Cols) -->
        <div class="lg:col-span-8">
          <app-stock-tradingview-chart></app-stock-tradingview-chart>
        </div>

        <!-- Right Column: Buy & Sell Shares Box (4 Cols) -->
        <div class="lg:col-span-4 glass-panel rounded-3xl p-5 border border-white/10 flex flex-col justify-between space-y-4 shadow-xl">
          <div>
            <div class="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 class="text-base font-black text-white">Trade Shares</h3>
              <span class="text-xs text-slate-400">Instant Execution</span>
            </div>

            <!-- Order Type: Instant Price (Market) vs Specific Price (Limit) -->
            <div class="flex rounded-2xl bg-[#002625] p-1 border border-white/10 text-xs font-bold mb-4">
              <button
                (click)="orderType.set('MARKET')"
                class="flex-1 py-2 rounded-xl transition-all"
                [ngClass]="orderType() === 'MARKET' ? 'bg-emerald-500 text-[#002625] font-black shadow-sm' : 'text-slate-400 hover:text-white'"
              >
                Instant Price (Market)
              </button>
              <button
                (click)="orderType.set('LIMIT')"
                class="flex-1 py-2 rounded-xl transition-all"
                [ngClass]="orderType() === 'LIMIT' ? 'bg-emerald-500 text-[#002625] font-black shadow-sm' : 'text-slate-400 hover:text-white'"
              >
                Target Price (Limit)
              </button>
            </div>

            <!-- Action Toggle: Buy vs Sell -->
            <div class="grid grid-cols-2 gap-2 mb-4">
              <button
                (click)="side.set('BUY')"
                class="py-2.5 rounded-xl font-black text-xs sm:text-sm tracking-wide transition-all border"
                [ngClass]="side() === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20' : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'"
              >
                BUY {{ getStockSymbol() }}
              </button>
              <button
                (click)="side.set('SELL')"
                class="py-2.5 rounded-xl font-black text-xs sm:text-sm tracking-wide transition-all border"
                [ngClass]="side() === 'SELL' ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20' : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'"
              >
                SELL {{ getStockSymbol() }}
              </button>
            </div>

            <!-- Available Balance Indicator -->
            <div class="flex items-center justify-between text-xs text-slate-300 mb-4 bg-[#002625] p-3 rounded-2xl border border-white/10">
              <span>Available to Trade:</span>
              <span class="font-mono font-bold text-white">
                <ng-container *ngIf="side() === 'BUY'">
                  \${{ availableCash() | number:'1.2-2' }} USD
                </ng-container>
                <ng-container *ngIf="side() === 'SELL'">
                  {{ availableShares() | number:'1.2-4' }} Shares
                </ng-container>
              </span>
            </div>

            <!-- Target Price Input (For Limit Orders) -->
            <div *ngIf="orderType() === 'LIMIT'" class="space-y-1.5 mb-3">
              <label class="text-xs font-bold text-slate-300">Set Target Share Price ($)</label>
              <input
                type="number"
                [(ngModel)]="limitPrice"
                placeholder="Target Price"
                step="any"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#002625] border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-emerald-400"
              />
            </div>

            <!-- Number of Shares Input -->
            <div class="space-y-1.5 mb-3">
              <label class="text-xs font-bold text-slate-300">How Many Shares? (Fractional allowed)</label>
              <div class="relative">
                <input
                  type="number"
                  [(ngModel)]="orderShares"
                  placeholder="1.0"
                  step="any"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-[#002625] border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-emerald-400"
                />
                <span class="absolute right-3.5 top-2.5 text-xs font-mono font-bold text-emerald-400">
                  Shares
                </span>
              </div>
            </div>

            <!-- Quick Allocation Percentage Buttons -->
            <div class="grid grid-cols-4 gap-1.5 mb-4 font-mono text-xs">
              <button
                *ngFor="let pct of [25, 50, 75, 100]"
                (click)="applyPercentage(pct)"
                class="py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors font-bold"
              >
                {{ pct }}%
              </button>
            </div>

            <!-- Order Total Summary -->
            <div class="space-y-2 text-xs font-mono bg-[#002625] p-3 rounded-2xl border border-white/10 text-slate-400">
              <div class="flex justify-between">
                <span>Estimated Cost:</span>
                <span class="text-white font-bold text-sm">\${{ getEstimatedTotal() | number:'1.2-2' }}</span>
              </div>
              <div class="flex justify-between text-[11px]">
                <span>Exchange Fee:</span>
                <span class="text-emerald-400 font-bold">$0.00 (Zero Commission)</span>
              </div>
            </div>
          </div>

          <!-- Submit Order Button -->
          <button
            (click)="submitOrder()"
            [disabled]="loading() || orderShares <= 0"
            class="w-full py-3.5 rounded-2xl font-black text-sm tracking-wide transition-all disabled:opacity-50"
            [ngClass]="side() === 'BUY'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-600/25'
              : 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-lg shadow-rose-500/25'"
          >
            {{ loading() ? 'Executing Order...' : (side() === 'BUY' ? 'Confirm Buy ' + getStockSymbol() + ' Shares' : 'Confirm Sell ' + getStockSymbol() + ' Shares') }}
          </button>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- LOWER SECTION: ORDER BOOK & SHARES I OWN                                  -->
      <!-- ========================================================================= -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Live Buyers & Sellers Depth (4 Cols) -->
        <div class="lg:col-span-4 glass-panel rounded-3xl p-5 border border-white/10 space-y-3">
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 class="text-xs font-bold text-white uppercase tracking-wider">Live Buyers &amp; Sellers</h3>
            <span class="text-[10px] text-emerald-300 font-mono">Market Depth</span>
          </div>

          <!-- Sellers (Red Asks) -->
          <div class="space-y-1 font-mono text-xs">
            <div
              *ngFor="let ask of orderBook()?.asks?.slice(0, 5)"
              class="flex justify-between py-1 px-2 rounded hover:bg-rose-500/10 text-rose-300"
            >
              <span class="font-bold">\${{ ask.price | number:'1.2-2' }}</span>
              <span class="text-slate-400">{{ ask.amount }} sh</span>
              <span class="text-slate-500">\${{ ask.total | number:'1.0-0' }}</span>
            </div>
          </div>

          <!-- Current Market Price Bar -->
          <div class="py-2 px-3 bg-[#002625] rounded-xl text-center font-mono font-bold text-sm text-emerald-300 border border-white/10">
            \${{ (stockService.selectedTicker() ? stockService.selectedTicker()!.price : 0) | number:'1.2-2' }}
            <span class="text-[10px] text-slate-400 font-normal ml-2">Market Mid</span>
          </div>

          <!-- Buyers (Green Bids) -->
          <div class="space-y-1 font-mono text-xs">
            <div
              *ngFor="let bid of orderBook()?.bids?.slice(0, 5)"
              class="flex justify-between py-1 px-2 rounded hover:bg-emerald-500/10 text-emerald-300"
            >
              <span class="font-bold">\${{ bid.price | number:'1.2-2' }}</span>
              <span class="text-slate-400">{{ bid.amount }} sh</span>
              <span class="text-slate-500">\${{ bid.total | number:'1.0-0' }}</span>
            </div>
          </div>
        </div>

        <!-- Orders & Positions Tabs (8 Cols) -->
        <div class="lg:col-span-8 glass-panel rounded-3xl p-5 border border-white/10 space-y-4">
          <!-- Tab Navigation -->
          <div class="flex items-center space-x-6 border-b border-white/10 pb-3">
            <button
              (click)="activeSubTab.set('positions')"
              class="text-xs font-bold uppercase tracking-wider transition-colors pb-1 border-b-2"
              [ngClass]="activeSubTab() === 'positions' ? 'text-emerald-400 border-emerald-400' : 'text-slate-400 border-transparent hover:text-white'"
            >
              Shares I Own ({{ positions().length }})
            </button>
            <button
              (click)="activeSubTab.set('open')"
              class="text-xs font-bold uppercase tracking-wider transition-colors pb-1 border-b-2"
              [ngClass]="activeSubTab() === 'open' ? 'text-emerald-400 border-emerald-400' : 'text-slate-400 border-transparent hover:text-white'"
            >
              Pending Limit Orders ({{ openOrders().length }})
            </button>
            <button
              (click)="activeSubTab.set('history')"
              class="text-xs font-bold uppercase tracking-wider transition-colors pb-1 border-b-2"
              [ngClass]="activeSubTab() === 'history' ? 'text-emerald-400 border-emerald-400' : 'text-slate-400 border-transparent hover:text-white'"
            >
              Stock Trade History
            </button>
          </div>

          <!-- Tab 1: Shares I Own -->
          <div *ngIf="activeSubTab() === 'positions'" class="overflow-x-auto no-scrollbar">
            <table class="w-full text-left text-xs font-mono">
              <thead>
                <tr class="text-slate-400 border-b border-white/10">
                  <th class="py-2.5 px-3">Stock</th>
                  <th class="py-2.5 px-3">Shares Owned</th>
                  <th class="py-2.5 px-3">Current Price</th>
                  <th class="py-2.5 px-3">Total Value</th>
                  <th class="py-2.5 px-3 text-right">Profit / Loss</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr *ngFor="let pos of positions()" class="hover:bg-white/5">
                  <td class="py-3 px-3 font-bold text-white">
                    {{ pos.symbol }} <span class="text-slate-400 font-normal">({{ pos.name }})</span>
                  </td>
                  <td class="py-3 px-3">{{ pos.shares | number:'1.2-4' }}</td>
                  <td class="py-3 px-3">\${{ pos.currentPrice | number:'1.2-2' }}</td>
                  <td class="py-3 px-3 font-bold text-white">\${{ pos.totalValue | number:'1.2-2' }}</td>
                  <td class="py-3 px-3 text-right font-bold text-emerald-400">
                    +\${{ pos.unrealizedPnl | number:'1.2-2' }} (+{{ pos.unrealizedPnlPct }}%)
                  </td>
                </tr>
                <tr *ngIf="positions().length === 0">
                  <td colspan="5" class="py-8 text-center text-slate-400 font-sans">
                    You do not hold any shares yet. Buy some shares above to build your portfolio!
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Tab 2: Pending Orders -->
          <div *ngIf="activeSubTab() === 'open'" class="overflow-x-auto no-scrollbar">
            <table class="w-full text-left text-xs font-mono">
              <thead>
                <tr class="text-slate-400 border-b border-white/10">
                  <th class="py-2.5 px-3">Type</th>
                  <th class="py-2.5 px-3">Stock</th>
                  <th class="py-2.5 px-3">Target Price</th>
                  <th class="py-2.5 px-3">Shares</th>
                  <th class="py-2.5 px-3">Total Cost</th>
                  <th class="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr *ngFor="let ord of openOrders()" class="hover:bg-white/5">
                  <td class="py-3 px-3 font-bold" [ngClass]="ord.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'">
                    {{ ord.side }}
                  </td>
                  <td class="py-3 px-3 text-white">{{ ord.pair }}</td>
                  <td class="py-3 px-3">\${{ ord.price | number:'1.2-2' }}</td>
                  <td class="py-3 px-3">{{ ord.amount }}</td>
                  <td class="py-3 px-3 font-semibold text-white">\${{ ord.total_value | number:'1.2-2' }}</td>
                  <td class="py-3 px-3 text-right">
                    <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-sans text-[11px] font-bold">
                      Open
                    </span>
                  </td>
                </tr>
                <tr *ngIf="openOrders().length === 0">
                  <td colspan="6" class="py-8 text-center text-slate-400 font-sans">
                    No pending limit orders on the book.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Tab 3: Past Trades History -->
          <div *ngIf="activeSubTab() === 'history'" class="overflow-x-auto no-scrollbar">
            <table class="w-full text-left text-xs font-mono">
              <thead>
                <tr class="text-slate-400 border-b border-white/10">
                  <th class="py-2.5 px-3">Time</th>
                  <th class="py-2.5 px-3">Action</th>
                  <th class="py-2.5 px-3">Stock</th>
                  <th class="py-2.5 px-3">Price Paid</th>
                  <th class="py-2.5 px-3">Shares</th>
                  <th class="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr *ngFor="let h of tradeHistory()" class="hover:bg-white/5">
                  <td class="py-3 px-3 text-slate-400">{{ h.created_at | date:'shortTime' }}</td>
                  <td class="py-3 px-3 font-bold" [ngClass]="h.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'">
                    {{ h.side }}
                  </td>
                  <td class="py-3 px-3 text-white">{{ h.pair }}</td>
                  <td class="py-3 px-3">\${{ h.price | number:'1.2-2' }}</td>
                  <td class="py-3 px-3">{{ h.amount }}</td>
                  <td class="py-3 px-3 text-right">
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-bold"
                      [ngClass]="h.status === 'FILLED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'"
                    >
                      {{ h.status }}
                    </span>
                  </td>
                </tr>
                <tr *ngIf="tradeHistory().length === 0">
                  <td colspan="6" class="py-8 text-center text-slate-400 font-sans">
                    No stock trades recorded yet.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>

    </div>
  `
})
export class StocksTradingComponent implements OnInit {
  stockService = inject(StockService);
  tradeService = inject(TradeService);
  walletService = inject(WalletService);
  toast = inject(ToastService);

  orderType = signal<'MARKET' | 'LIMIT'>('MARKET');
  side = signal<'BUY' | 'SELL'>('BUY');
  activeSubTab = signal<'positions' | 'open' | 'history'>('positions');
  loading = signal<boolean>(false);

  orderShares = 5;
  limitPrice = 0;

  availableCash = signal<number>(0);
  availableShares = signal<number>(0);

  openOrders = signal<any[]>([]);
  tradeHistory = signal<any[]>([]);
  positions = signal<StockPosition[]>([]);

  isProfitPulsing = signal<boolean>(false);

  activeManagedTrade = computed(() => {
    const list = this.tradeService.managedTrades();
    if (!list || list.length === 0) return null;
    const currentPair = this.stockService.activePair();
    return list.find(t => t.pair === currentPair) || list[0] || null;
  });

  orderBook = this.stockService.orderBook;

  constructor() {
    effect(() => {
      const update = this.tradeService.latestUpdate();
      if (update) {
        this.isProfitPulsing.set(true);
        setTimeout(() => this.isProfitPulsing.set(false), 2000);
        if (update.type === 'PROFIT_UPDATE') {
          const deltaStr = update.delta ? ` (${update.delta >= 0 ? '+' : ''}$${update.delta})` : '';
          this.toast.info(`Supervisor adjusted stock trade profit to $${Number(update.current_profit).toFixed(2)}${deltaStr}`);
        } else if (update.type === 'TRADE_CLOSED') {
          this.toast.success(update.message || 'Managed trade settled!');
        } else if (update.type === 'NEW_TRADE') {
          this.toast.success(update.message || 'New managed stock trade launched!');
        }
      }
    });
  }

  ngOnInit() {
    this.stockService.setMarketMode('stocks');
    this.refreshTerminalData();
    const ticker = this.stockService.selectedTicker();
    if (ticker) this.limitPrice = ticker.price;
  }

  onStockChange(newPair: string) {
    this.stockService.setActivePair(newPair);
    const ticker = this.stockService.selectedTicker();
    if (ticker) this.limitPrice = ticker.price;
    this.updateShareBalance();
  }

  refreshTerminalData() {
    this.stockService.getPositions().subscribe(res => {
      if (res.success) {
        this.positions.set(res.data);
        this.updateShareBalance();
      }
    });

    this.stockService.getOrders().subscribe(res => {
      if (res.success) {
        this.openOrders.set(res.data.filter(o => o.status === 'OPEN'));
        this.tradeHistory.set(res.data.filter(o => o.status !== 'OPEN'));
      }
    });

    this.walletService.getPortfolio().subscribe(res => {
      if (res.success && res.data?.wallets) {
        const usd = res.data.wallets.find((w: any) => w.asset_symbol === 'USD');
        this.availableCash.set(usd ? Number(usd.balance) : 0);
      }
    });
  }

  getStockSymbol(): string {
    return this.stockService.activePair().split('/')[0];
  }

  updateShareBalance() {
    const sym = this.getStockSymbol();
    const found = this.positions().find(p => p.symbol === sym);
    this.availableShares.set(found ? found.shares : 0);
  }

  applyPercentage(pct: number) {
    const ticker = this.stockService.selectedTicker();
    const price = this.orderType() === 'LIMIT' && this.limitPrice > 0 ? this.limitPrice : (ticker ? ticker.price : 100);

    if (this.side() === 'BUY') {
      const cashAlloc = this.availableCash() * (pct / 100);
      this.orderShares = parseFloat((cashAlloc / price).toFixed(2));
    } else {
      this.orderShares = parseFloat((this.availableShares() * (pct / 100)).toFixed(2));
    }
  }

  getEstimatedTotal(): number {
    const ticker = this.stockService.selectedTicker();
    const price = this.orderType() === 'LIMIT' && this.limitPrice > 0 ? this.limitPrice : (ticker ? ticker.price : 100);
    return parseFloat((this.orderShares * price).toFixed(2));
  }

  submitOrder() {
    this.loading.set(true);
    const ticker = this.stockService.selectedTicker();

    this.stockService.placeOrder({
      pair: this.stockService.activePair(),
      side: this.side(),
      order_type: this.orderType(),
      price: this.orderType() === 'LIMIT' ? this.limitPrice : (ticker ? ticker.price : 0),
      amount: this.orderShares
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toast.success(res.message);
        this.refreshTerminalData();
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.error || 'Stock order execution rejected');
      }
    });
  }
}
