import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TradingViewChartComponent } from '../../../shared/charts/tradingview-chart/tradingview-chart.component';
import { MarketService } from '../../../services/market.service';
import { TradeService } from '../../../services/trade.service';
import { WalletService } from '../../../services/wallet.service';
import { ToastService } from '../../../services/toast.service';
import { Trade, Position, OrderBook } from '../../../core/models/fintech.models';

@Component({
  selector: 'app-trading',
  standalone: true,
  imports: [CommonModule, FormsModule, TradingViewChartComponent],
  template: `
    <div class="space-y-6">
      
      <!-- ========================================================================= -->
      <!-- TOP MARKET SELECTION & LIVE TICKER BAR                                    -->
      <!-- ========================================================================= -->
      <div class="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-[#002625] border border-white/10 shadow-lg">
        <div class="flex items-center space-x-3 sm:space-x-4">
          <!-- Market Pair Selector -->
          <div class="flex items-center space-x-2">
            <span class="text-xs text-slate-300 font-bold uppercase tracking-wider hidden sm:inline">Choose Asset:</span>
            <select
              [ngModel]="marketService.activePair()"
              (ngModelChange)="onPairChange($event)"
              class="px-3.5 py-2 rounded-xl bg-[#003432] border border-[#0BB4D2]/40 font-mono font-bold text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#0BB4D2]"
            >
              <option *ngFor="let tick of marketService.tickers()" [value]="tick.pair">
                {{ tick.pair }} ({{ tick.change24h >= 0 ? '+' : '' }}{{ tick.change24h }}%)
              </option>
            </select>
          </div>

          <!-- 24H High & Low -->
          <div *ngIf="marketService.selectedTicker() as t" class="flex items-center space-x-3 text-xs font-mono">
            <div>
              <span class="text-slate-400">24h High:</span>
              <span class="text-emerald-400 ml-1 font-bold">\${{ t.high24h | number:'1.2-4' }}</span>
            </div>
            <div>
              <span class="text-slate-400">24h Low:</span>
              <span class="text-rose-400 ml-1 font-bold">\${{ t.low24h | number:'1.2-4' }}</span>
            </div>
          </div>
        </div>

        <!-- Simulation Trust Badges -->
        <div class="flex items-center space-x-2">
          <span class="px-3 py-1 text-xs font-bold font-mono rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>LIVE FEED</span>
          </span>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- MULTI-ASSET ACTIVE BASKET QUICK SWITCHER (When > 1 active trade)          -->
      <!-- ========================================================================= -->
      <div
        *ngIf="activeManagedTrades().length > 1"
        class="p-4 rounded-2xl bg-[#002625] border border-[#0BB4D2]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
      >
        <div class="flex items-center space-x-2">
          <span class="text-xs font-black uppercase text-cyan-300 tracking-wider">Active Multi-Asset Basket:</span>
          <span class="text-xs text-slate-400">Click any asset to view chart:</span>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            *ngFor="let at of activeManagedTrades()"
            type="button"
            (click)="selectActiveTrade(at)"
            class="px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center space-x-1.5 transition active:scale-95"
            [ngClass]="activeManagedTrade()?.id === at.id ? 'bg-[#0BB4D2] text-[#002625] border-[#0BB4D2] shadow-md shadow-[#0BB4D2]/25' : 'bg-black/40 text-slate-300 border-white/10 hover:border-white/30'"
          >
            <span>{{ at.pair }}</span>
            <span [ngClass]="activeManagedTrade()?.id === at.id ? 'text-[#002625] font-black' : (at.current_profit >= 0 ? 'text-emerald-400' : 'text-rose-400')">
              {{ at.current_profit >= 0 ? '+' : '' }}\${{ at.current_profit | number:'1.0-0' }}
            </span>
          </button>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- SUPERVISOR MANAGED TRADE & LIVE PROFIT FLOW BANNER                        -->
      <!-- Real-time dynamic profit flow with chart entry/target visualization       -->
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
                <span>SUPERVISOR MANAGED TRADE</span>
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
              <span>Amount: <strong class="text-white">{{ mt.amount }}</strong></span>
              <span>Entry: <strong class="text-white">\${{ mt.price | number:'1.2-4' }}</strong></span>
              <span *ngIf="mt.admin_notes" class="text-cyan-300 font-sans hidden sm:inline">&bull; {{ mt.admin_notes }}</span>
            </div>

            <!-- 4-Stage Institutional Deal Lifecycle Pipeline -->
            <div class="flex flex-wrap items-center space-x-2 text-[11px] font-sans text-slate-300 pt-1">
              <span class="flex items-center space-x-1 text-emerald-300 font-semibold">
                <span>●</span>
                <span>1. Entry Filled</span>
              </span>
              <span class="text-slate-600">&rarr;</span>
              <span
                class="flex items-center space-x-1 font-semibold"
                [ngClass]="mt.target_outcome === 'IN_PROGRESS' ? 'text-cyan-300 animate-pulse' : (mt.target_outcome === 'CLOSING_SOON' || mt.target_outcome === 'WIN' ? 'text-emerald-300' : 'text-slate-400')"
              >
                <span>●</span>
                <span>2. Live Growth</span>
              </span>
              <span class="text-slate-600">&rarr;</span>
              <span
                class="flex items-center space-x-1 font-bold"
                [ngClass]="mt.target_outcome === 'CLOSING_SOON' ? 'text-amber-300 animate-pulse' : (mt.target_outcome === 'WIN' ? 'text-emerald-300' : 'text-slate-400')"
              >
                <span>●</span>
                <span>3. Closing Window</span>
              </span>
              <span class="text-slate-600">&rarr;</span>
              <span
                class="flex items-center space-x-1 font-bold"
                [ngClass]="mt.target_outcome === 'WIN' ? 'text-emerald-400 font-black' : 'text-slate-500'"
              >
                <span>●</span>
                <span>4. Settled Payout</span>
              </span>
            </div>

            <!-- Closing Soon Alert Banner -->
            <div
              *ngIf="mt.target_outcome === 'CLOSING_SOON'"
              class="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center space-x-2 animate-pulse mt-2"
            >
              <span class="text-base">⏳</span>
              <div>
                <strong>DEAL CLOSING INITIATED:</strong> Senior broker is locking in your target profit. Cash payout will credit to your universal balance shortly!
              </div>
            </div>
          </div>

          <!-- Right: Big Live Real-Time Profit Display -->
          <div class="flex items-center space-x-4 bg-black/40 p-4 rounded-2xl border border-white/10 shrink-0">
            <div>
              <div class="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">
                <span>Live Real-Time Profit</span>
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
      <!-- MAIN TRADING INTERFACE: CHART & ORDER PLACEMENT FORM                      -->
      <!-- ========================================================================= -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Left Column: TradingView Candlestick Chart (8 Cols) -->
        <div class="lg:col-span-8">
          <app-tradingview-chart></app-tradingview-chart>
        </div>

        <!-- Right Column: Investor Managed Desk & Simple Info (4 Cols) -->
        <div class="lg:col-span-4 glass-panel rounded-3xl p-5 sm:p-6 border border-white/10 flex flex-col justify-between space-y-5 shadow-xl bg-[#002625]/80">
          <div class="space-y-4">
            <!-- Header -->
            <div class="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 class="text-base font-black text-white">Live Trading Desk</h3>
                <span class="text-xs text-slate-400">Institutional Managed Session</span>
              </div>
              <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Active Desk
              </span>
            </div>

            <!-- Investor Status Card -->
            <div class="p-4 rounded-2xl bg-[#001c1c] border border-white/10 space-y-3">
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-400">Assigned Broker:</span>
                <span class="font-bold text-white">Chief Institutional Trader</span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-400">Capital Available:</span>
                <span class="font-mono font-bold text-cyan-300">\${{ getAvailableBalance() | number:'1.2-2' }}</span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-400">Total Active Earnings:</span>
                <span class="font-mono font-bold text-emerald-400 text-sm">
                  +{{ totalManagedProfit() >= 0 ? '+' : '' }}\${{ totalManagedProfit() | number:'1.2-2' }}
                </span>
              </div>
              <div class="flex items-center justify-between text-[11px] text-slate-400">
                <span>Active Basket Positions:</span>
                <span class="font-bold text-cyan-300 font-mono">{{ activeManagedTrades().length }}</span>
              </div>
            </div>

            <!-- Fast Deposit & Cashout Buttons -->
            <div class="space-y-2 pt-1">
              <a
                routerLink="/portal/wallet"
                class="w-full py-2.5 rounded-2xl btn-cyan-gradient text-[#002625] font-black text-xs shadow-md shadow-[#0BB4D2]/20 flex items-center justify-center space-x-1.5 active:scale-95 transition"
              >
                <span>📥 Deposit Capital</span>
              </a>

              <a
                routerLink="/portal/wallet"
                class="w-full py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 font-bold text-xs border border-white/10 flex items-center justify-center space-x-1.5 transition"
              >
                <span>📤 Cash Out</span>
              </a>
            </div>
          </div>

          <!-- Bottom Security Strip -->
          <div class="text-[11px] text-slate-400 pt-3 border-t border-white/10 flex items-center justify-between">
            <span>Real-time Socket.IO Sync</span>
            <span class="text-emerald-400 font-bold">● Connected</span>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- LOWER SECTION: ORDER BOOK & PAST TRADES LOG                               -->
      <!-- ========================================================================= -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- Live Market Order Book Depth (4 Cols) -->
        <div class="lg:col-span-4 glass-panel rounded-3xl p-5 border border-white/10 space-y-3">
          <div class="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 class="text-xs font-bold text-white uppercase tracking-wider">Live Buyers &amp; Sellers</h3>
            <span class="text-[10px] text-cyan-300 font-mono">Real-Time Depth</span>
          </div>

          <!-- Sellers (Red Asks) -->
          <div class="space-y-1 font-mono text-xs">
            <div
              *ngFor="let ask of orderBook()?.asks?.slice(0, 5)"
              class="flex justify-between py-1 px-2 rounded hover:bg-rose-500/10 text-rose-300"
            >
              <span class="font-bold">\${{ ask.price | number:'1.2-4' }}</span>
              <span class="text-slate-400">{{ ask.amount | number:'1.2-4' }}</span>
              <span class="text-slate-500">\${{ ask.total | number:'1.0-0' }}</span>
            </div>
          </div>

          <!-- Current Market Price Bar -->
          <div class="py-2 px-3 bg-[#002625] rounded-xl text-center font-mono font-bold text-sm text-[#0BB4D2] border border-white/10">
            \${{ (marketService.selectedTicker() ? marketService.selectedTicker()!.price : 0) | number:'1.2-4' }}
            <span class="text-[10px] text-slate-400 font-normal ml-2">Current Live Price</span>
          </div>

          <!-- Buyers (Green Bids) -->
          <div class="space-y-1 font-mono text-xs">
            <div
              *ngFor="let bid of orderBook()?.bids?.slice(0, 5)"
              class="flex justify-between py-1 px-2 rounded hover:bg-emerald-500/10 text-emerald-300"
            >
              <span class="font-bold">\${{ bid.price | number:'1.2-4' }}</span>
              <span class="text-slate-400">{{ bid.amount | number:'1.2-4' }}</span>
              <span class="text-slate-500">\${{ bid.total | number:'1.0-0' }}</span>
            </div>
          </div>
        </div>

        <!-- Orders & Positions Tabs (8 Cols) -->
        <div class="lg:col-span-8 glass-panel rounded-3xl p-5 border border-white/10 space-y-4">
          <!-- Tab Navigation -->
          <div class="flex items-center space-x-6 border-b border-white/10 pb-3">
            <button
              (click)="activeSubTab.set('managed')"
              class="text-xs font-bold uppercase tracking-wider transition-colors pb-1 border-b-2 flex items-center space-x-1"
              [ngClass]="activeSubTab() === 'managed' ? 'text-emerald-400 border-emerald-400 font-black' : 'text-slate-400 border-transparent hover:text-white'"
            >
              <span>⚡ Manager Trades</span>
              <span class="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500/20 text-emerald-300">
                {{ tradeService.managedTrades().length }}
              </span>
            </button>

            <button
              (click)="activeSubTab.set('positions')"
              class="text-xs font-bold uppercase tracking-wider transition-colors pb-1 border-b-2"
              [ngClass]="activeSubTab() === 'positions' ? 'text-[#0BB4D2] border-[#0BB4D2]' : 'text-slate-400 border-transparent hover:text-white'"
            >
              Coins I Hold ({{ positions().length }})
            </button>
            <button
              (click)="activeSubTab.set('open')"
              class="text-xs font-bold uppercase tracking-wider transition-colors pb-1 border-b-2"
              [ngClass]="activeSubTab() === 'open' ? 'text-[#0BB4D2] border-[#0BB4D2]' : 'text-slate-400 border-transparent hover:text-white'"
            >
              Pending Orders ({{ openOrders().length }})
            </button>
            <button
              (click)="activeSubTab.set('history')"
              class="text-xs font-bold uppercase tracking-wider transition-colors pb-1 border-b-2"
              [ngClass]="activeSubTab() === 'history' ? 'text-[#0BB4D2] border-[#0BB4D2]' : 'text-slate-400 border-transparent hover:text-white'"
            >
              Past Trades History
            </button>
          </div>

          <!-- Tab 0: Manager Trades (Default) -->
          <div *ngIf="activeSubTab() === 'managed'" class="overflow-x-auto no-scrollbar space-y-2">
            <table class="w-full text-left text-xs font-mono">
              <thead>
                <tr class="text-slate-400 border-b border-white/10">
                  <th class="py-2.5 px-3">Asset</th>
                  <th class="py-2.5 px-3">Direction</th>
                  <th class="py-2.5 px-3">Amount</th>
                  <th class="py-2.5 px-3">Entry Price</th>
                  <th class="py-2.5 px-3">Live Earnings</th>
                  <th class="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr *ngFor="let t of tradeService.managedTrades()" class="hover:bg-white/5">
                  <td class="py-3 px-3 font-bold text-white">{{ t.pair }}</td>
                  <td class="py-3 px-3">
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                      [ngClass]="t.side === 'BUY' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'"
                    >
                      {{ t.side }}
                    </span>
                  </td>
                  <td class="py-3 px-3">{{ t.amount }}</td>
                  <td class="py-3 px-3">\${{ t.price | number:'1.2-4' }}</td>
                  <td class="py-3 px-3 font-bold font-mono" [ngClass]="t.current_profit >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                    {{ t.current_profit >= 0 ? '+' : '' }}\${{ t.current_profit | number:'1.2-2' }}
                  </td>
                  <td class="py-3 px-3 text-right">
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                      [ngClass]="{
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30': t.target_outcome === 'WIN' || t.target_outcome === 'IN_PROGRESS',
                        'bg-rose-500/20 text-rose-300 border border-rose-500/30': t.target_outcome === 'LOSS'
                      }"
                    >
                      {{ t.target_outcome === 'IN_PROGRESS' ? '🟢 Live' : t.target_outcome }}
                    </span>
                  </td>
                </tr>
                <tr *ngIf="tradeService.managedTrades().length === 0">
                  <td colspan="6" class="py-8 text-center text-slate-400 font-sans">
                    No active managed trades right now. Your senior manager will start a session shortly.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Tab 1: Coins I Hold -->
          <div *ngIf="activeSubTab() === 'positions'" class="overflow-x-auto no-scrollbar">
            <table class="w-full text-left text-xs font-mono">
              <thead>
                <tr class="text-slate-400 border-b border-white/10">
                  <th class="py-2.5 px-3">Coin</th>
                  <th class="py-2.5 px-3">Amount Owned</th>
                  <th class="py-2.5 px-3">Market Price</th>
                  <th class="py-2.5 px-3">Total Value</th>
                  <th class="py-2.5 px-3 text-right">Profit / Loss</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr *ngFor="let pos of positions()" class="hover:bg-white/5">
                  <td class="py-3 px-3 font-bold text-white">{{ pos.pair }}</td>
                  <td class="py-3 px-3">{{ pos.size | number:'1.2-6' }} {{ pos.asset }}</td>
                  <td class="py-3 px-3">\${{ pos.currentPrice | number:'1.2-4' }}</td>
                  <td class="py-3 px-3 font-bold text-white">\${{ pos.totalValue | number:'1.2-2' }}</td>
                  <td class="py-3 px-3 text-right font-bold text-emerald-400">
                    +\${{ pos.unrealizedPnl | number:'1.2-2' }} (+{{ pos.unrealizedPnlPct }}%)
                  </td>
                </tr>
                <tr *ngIf="positions().length === 0">
                  <td colspan="5" class="py-8 text-center text-slate-400 font-sans">
                    You do not hold any open coin positions yet. Buy some coins above to get started!
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
                  <th class="py-2.5 px-3">Coin</th>
                  <th class="py-2.5 px-3">Target Price</th>
                  <th class="py-2.5 px-3">Amount</th>
                  <th class="py-2.5 px-3">Total Cost</th>
                  <th class="py-2.5 px-3 text-right">Cancel</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr *ngFor="let ord of openOrders()" class="hover:bg-white/5">
                  <td class="py-3 px-3 font-bold" [ngClass]="ord.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'">
                    {{ ord.side }}
                  </td>
                  <td class="py-3 px-3 text-white">{{ ord.pair }}</td>
                  <td class="py-3 px-3">\${{ ord.price | number:'1.2-4' }}</td>
                  <td class="py-3 px-3">{{ ord.amount | number:'1.2-4' }}</td>
                  <td class="py-3 px-3 font-semibold text-white">\${{ ord.total_value | number:'1.2-2' }}</td>
                  <td class="py-3 px-3 text-right">
                    <button
                      (click)="cancelLimitOrder(ord.id)"
                      class="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 font-sans font-bold text-[11px]"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
                <tr *ngIf="openOrders().length === 0">
                  <td colspan="6" class="py-8 text-center text-slate-400 font-sans">
                    No pending orders right now.
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
                  <th class="py-2.5 px-3">Type</th>
                  <th class="py-2.5 px-3">Coin</th>
                  <th class="py-2.5 px-3">Price Paid</th>
                  <th class="py-2.5 px-3">Amount</th>
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
                  <td class="py-3 px-3">\${{ h.price | number:'1.2-4' }}</td>
                  <td class="py-3 px-3">{{ h.amount | number:'1.2-4' }}</td>
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
                    No trade history recorded yet.
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
export class TradingComponent implements OnInit {
  marketService = inject(MarketService);
  tradeService = inject(TradeService);
  walletService = inject(WalletService);
  toast = inject(ToastService);

  orderType = signal<'MARKET' | 'LIMIT'>('MARKET');
  side = signal<'BUY' | 'SELL'>('BUY');
  activeSubTab = signal<'managed' | 'positions' | 'open' | 'history'>('managed');
  loading = signal<boolean>(false);

  orderAmount = 0.05;
  limitPrice = 0;

  openOrders = signal<Trade[]>([]);
  tradeHistory = signal<Trade[]>([]);
  positions = signal<Position[]>([]);
  wallets = signal<any[]>([]);

  isProfitPulsing = signal<boolean>(false);
  selectedTradeId = signal<number | null>(null);

  activeManagedTrades = computed(() => {
    return this.tradeService.managedTrades().filter(t => t.target_outcome !== 'CLOSED');
  });

  totalManagedProfit = computed(() => {
    return this.activeManagedTrades().reduce((sum, t) => sum + (parseFloat(t.current_profit) || 0), 0);
  });

  activeManagedTrade = computed(() => {
    const list = this.activeManagedTrades();
    if (!list || list.length === 0) return null;
    const selId = this.selectedTradeId();
    if (selId) {
      const match = list.find(t => t.id === selId);
      if (match) return match;
    }
    const currentPair = this.marketService.activePair();
    return list.find(t => t.pair === currentPair) || list[0] || null;
  });

  orderBook = this.marketService.orderBook;

  constructor() {
    effect(() => {
      const update = this.tradeService.latestUpdate();
      if (update) {
        this.isProfitPulsing.set(true);
        setTimeout(() => this.isProfitPulsing.set(false), 2000);
        if (update.type === 'PROFIT_UPDATE') {
          const deltaStr = update.delta ? ` (${update.delta >= 0 ? '+' : ''}$${update.delta})` : '';
          this.toast.info(`Supervisor updated trade profit to $${Number(update.current_profit).toFixed(2)}${deltaStr}`);
        } else if (update.type === 'DEAL_CLOSING_SOON') {
          this.toast.warning(update.message || '🔔 Deal closing window initiated by supervisor!');
        } else if (update.type === 'TRADE_CLOSED') {
          this.toast.success(update.message || 'Managed trade settled!');
        } else if (update.type === 'NEW_TRADE') {
          this.toast.success(update.message || 'New managed trade launched!');
        }
      }
    });
  }

  ngOnInit() {
    this.refreshTerminalData();
    const ticker = this.marketService.selectedTicker();
    if (ticker) this.limitPrice = ticker.price;
  }

  onPairChange(newPair: string) {
    this.marketService.setActivePair(newPair);
    const ticker = this.marketService.selectedTicker();
    if (ticker) this.limitPrice = ticker.price;
  }

  selectActiveTrade(trade: any) {
    this.selectedTradeId.set(trade.id);
    this.onPairChange(trade.pair);
  }

  refreshTerminalData() {
    this.tradeService.getOpenOrders().subscribe(res => {
      if (res.success) this.openOrders.set(res.data);
    });

    this.tradeService.getOrderHistory().subscribe(res => {
      if (res.success) this.tradeHistory.set(res.data);
    });

    this.tradeService.getPositions().subscribe(res => {
      if (res.success) this.positions.set(res.data);
    });

    this.walletService.getPortfolio().subscribe(res => {
      if (res.success) this.wallets.set(res.data.wallets);
    });
  }

  getBaseSymbol(): string {
    return this.marketService.activePair().split('/')[0];
  }

  getAvailableBalance(): number {
    const quoteOrBase = this.side() === 'BUY' ? 'USDT' : this.getBaseSymbol();
    const w = this.wallets().find(item => item.asset_symbol === quoteOrBase);
    if (!w) return 0;
    return parseFloat((w.balance - (w.locked_balance || 0)).toFixed(4));
  }

  applyPercentage(pct: number) {
    const available = this.getAvailableBalance();
    const ticker = this.marketService.selectedTicker();
    const price = this.orderType() === 'LIMIT' && this.limitPrice > 0 ? this.limitPrice : (ticker ? ticker.price : 1);

    if (this.side() === 'BUY') {
      const usdtAllocation = available * (pct / 100);
      this.orderAmount = parseFloat((usdtAllocation / price).toFixed(4));
    } else {
      this.orderAmount = parseFloat((available * (pct / 100)).toFixed(4));
    }
  }

  getEstimatedTotal(): number {
    const ticker = this.marketService.selectedTicker();
    const price = this.orderType() === 'LIMIT' && this.limitPrice > 0 ? this.limitPrice : (ticker ? ticker.price : 1);
    return parseFloat((this.orderAmount * price).toFixed(2));
  }

  submitOrder() {
    this.loading.set(true);
    const ticker = this.marketService.selectedTicker();

    this.tradeService.placeOrder({
      pair: this.marketService.activePair(),
      side: this.side(),
      order_type: this.orderType(),
      price: this.orderType() === 'LIMIT' ? this.limitPrice : (ticker ? ticker.price : 0),
      amount: this.orderAmount
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toast.success(res.message);
        this.refreshTerminalData();
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.error || 'Order execution rejected');
      }
    });
  }

  cancelLimitOrder(id: number) {
    this.tradeService.cancelOrder(id).subscribe({
      next: (res) => {
        this.toast.info(res.message);
        this.refreshTerminalData();
      },
      error: (err) => this.toast.error(err.error?.error || 'Could not cancel order')
    });
  }
}
