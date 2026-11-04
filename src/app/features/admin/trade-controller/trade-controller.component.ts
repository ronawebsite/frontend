import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { MarketService } from '../../../services/market.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-admin-trade-controller',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6 font-nunito text-slate-100">
      
      <!-- TOP BANNER & REAL-TIME STATUS -->
      <div class="p-6 rounded-3xl bg-gradient-to-r from-[#002625] via-[#003836] to-[#04171a] border border-[#0BB4D2]/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div class="space-y-1">
          <div class="flex items-center space-x-2">
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span class="text-xs font-black uppercase tracking-wider text-cyan-300">Live Trading Command Desk</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Real-Time Active
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Client Live Trade &amp; Profit Controller
          </h1>
          <p class="text-xs sm:text-sm text-slate-300 max-w-xl">
            Alter profits on active client trades in real time. Changes push instantly to the investor's live trading room and earnings counter.
          </p>
        </div>

        <!-- Stats & Actions -->
        <div class="flex flex-wrap items-center gap-3 shrink-0">
          <!-- Live Drift Toggle -->
          <button
            type="button"
            (click)="toggleDrift()"
            class="px-3.5 py-2 rounded-2xl border text-xs font-bold transition flex items-center space-x-2 shadow-sm"
            [ngClass]="liveDriftEnabled() ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' : 'bg-white/5 border-white/10 text-slate-400'"
            title="Auto-drifts active trade profits gently every 5 seconds to simulate live market movements"
          >
            <span class="w-2 h-2 rounded-full" [ngClass]="liveDriftEnabled() ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'"></span>
            <span>Market Drift: <strong class="uppercase">{{ liveDriftEnabled() ? 'ON' : 'OFF' }}</strong></span>
          </button>

          <!-- Total Active Trades Counter -->
          <div class="px-4 py-2 rounded-2xl bg-black/40 border border-white/10 text-center min-w-[90px]">
            <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Live Trades</span>
            <span class="text-lg font-black text-white font-mono">{{ filteredTrades().length }}</span>
          </div>

          <!-- Total Managed Profit Counter -->
          <div class="px-4 py-2 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center min-w-[120px]">
            <span class="text-[10px] uppercase font-bold text-emerald-300 tracking-wider block">Total Profit</span>
            <span class="text-lg font-black text-emerald-400 font-mono">\${{ totalProfit() | number:'1.2-2' }}</span>
          </div>

          <!-- Open Trade Modal Button -->
          <button
            type="button"
            (click)="showNewTradeModal = true"
            class="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#0BB4D2] to-emerald-400 text-[#002625] font-black text-xs shadow-lg shadow-[#0BB4D2]/25 hover:brightness-110 active:scale-95 transition flex items-center space-x-2"
          >
            <span class="text-base leading-none">⚡</span>
            <span>Open Trade for Client</span>
          </button>
        </div>
      </div>

      <!-- FILTER & QUICK CONTROLS BAR -->
      <div class="p-4 rounded-2xl bg-[#002625]/90 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        
        <!-- Investor Selector & Search -->
        <div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <!-- User Dropdown -->
          <div class="w-full sm:w-72">
            <label class="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Target Investor</label>
            <select
              [(ngModel)]="selectedUserId"
              (ngModelChange)="onUserFilterChange()"
              class="w-full px-3 py-2 rounded-xl bg-[#001c1c] border border-white/15 text-white text-xs font-bold focus:outline-none focus:border-[#0BB4D2] transition"
            >
              <option [ngValue]="null">🌐 All Investors (Show All Active)</option>
              <option *ngFor="let u of users()" [ngValue]="u.id">
                {{ u.full_name }} ({{ u.account_id }})
              </option>
            </select>
          </div>

          <!-- Search Filter -->
          <div class="w-full sm:w-60">
            <label class="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Search Trades</label>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Filter by name, pair, ID..."
              class="w-full px-3 py-2 rounded-xl bg-[#001c1c] border border-white/15 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#0BB4D2] transition"
            />
          </div>
        </div>

        <!-- Quick Boost Buttons (Available when a specific user is selected or all) -->
        <div class="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider mr-1">Boost All:</span>
          <button
            type="button"
            (click)="quickBoostAll(50)"
            class="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold active:scale-95 transition"
          >
            +$50
          </button>
          <button
            type="button"
            (click)="quickBoostAll(100)"
            class="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold active:scale-95 transition"
          >
            +$100
          </button>
          <button
            type="button"
            (click)="quickBoostAll(250)"
            class="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold active:scale-95 transition"
          >
            +$250
          </button>
          <button
            type="button"
            (click)="quickBoostAll(500)"
            class="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold active:scale-95 transition"
          >
            +$500
          </button>
          <button
            type="button"
            (click)="loadManagedTrades()"
            class="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs transition"
            title="Refresh active trades"
          >
            🔄
          </button>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- ACTIVE TRADES LIST                                                        -->
      <!-- ========================================================================= -->
      <div class="space-y-4">
        
        <!-- Empty State -->
        <div *ngIf="filteredTrades().length === 0" class="p-12 text-center rounded-3xl bg-[#002625]/60 border border-white/10 space-y-3">
          <div class="w-14 h-14 rounded-2xl bg-white/5 text-3xl mx-auto flex items-center justify-center">
            📈
          </div>
          <h3 class="text-base font-bold text-white">No Active Live Trades Found</h3>
          <p class="text-xs text-slate-400 max-w-md mx-auto">
            {{ selectedUserId ? 'This investor currently has no active live trades.' : 'No open client trades at this moment.' }} Click below to open a live trade for any client with customized initial profit.
          </p>
          <button
            type="button"
            (click)="showNewTradeModal = true"
            class="mt-2 px-6 py-2.5 rounded-xl bg-[#0BB4D2] text-[#002625] font-black text-xs hover:brightness-110 active:scale-95 transition"
          >
            ⚡ Open Live Trade for Client
          </button>
        </div>

        <!-- Cards Grid for Each Active Trade -->
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-5" *ngIf="filteredTrades().length > 0">
          <div
            *ngFor="let t of filteredTrades()"
            class="p-5 sm:p-6 rounded-3xl bg-[#002625]/90 border border-white/15 space-y-4 hover:border-[#0BB4D2]/50 transition-all shadow-xl relative overflow-hidden"
          >
            <!-- Background Accent Glow -->
            <div
              class="absolute -top-10 -right-10 w-36 h-36 rounded-full pointer-events-none blur-3xl opacity-20"
              [ngClass]="t.current_profit >= 0 ? 'bg-emerald-400' : 'bg-rose-500'"
            ></div>

            <!-- Card Header: Client Identity & Asset Direction -->
            <div class="flex items-start justify-between gap-3 relative z-10">
              <div class="space-y-0.5">
                <div class="flex items-center space-x-2">
                  <span class="font-extrabold text-sm sm:text-base text-white">{{ t.full_name }}</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0BB4D2]/20 text-cyan-300 border border-[#0BB4D2]/30">
                    {{ t.account_id || ('ID #' + t.user_id) }}
                  </span>
                </div>
                <div class="text-xs text-slate-400">{{ t.email }}</div>
              </div>

              <!-- Asset Pair & Direction -->
              <div class="text-right shrink-0">
                <span
                  class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center space-x-1.5"
                  [ngClass]="t.side === 'BUY' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'"
                >
                  <span>{{ t.side === 'BUY' ? '🟢 BUY' : '🔴 SELL' }}</span>
                  <span class="font-mono">{{ t.pair }}</span>
                </span>
                <div class="text-[10px] text-slate-400 mt-1 font-mono">
                  Amt: <span class="text-white font-bold">{{ t.amount }}</span> | Entry: <span class="text-slate-300 font-bold">\${{ t.price | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>

            <!-- HERO PROFIT CAPSULE -->
            <div class="p-4 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between relative z-10">
              <div class="space-y-0.5">
                <div class="flex items-center space-x-2">
                  <span class="w-2 h-2 rounded-full animate-ping" [ngClass]="t.current_profit >= 0 ? 'bg-emerald-400' : 'bg-rose-400'"></span>
                  <span class="text-[10px] uppercase font-black text-slate-400 tracking-wider">Client Live Profit</span>
                </div>
                <div
                  class="text-3xl sm:text-4xl font-black font-mono tracking-tight transition-all duration-300"
                  [ngClass]="t.current_profit >= 0 ? 'text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.3)]' : 'text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.3)]'"
                >
                  {{ t.current_profit >= 0 ? '+' : '' }}\${{ t.current_profit | number:'1.2-2' }}
                </div>
              </div>

              <!-- Status Tag & Notes -->
              <div class="text-right space-y-1">
                <span
                  class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block"
                  [ngClass]="{
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30': t.target_outcome === 'IN_PROGRESS' || t.target_outcome === 'WIN',
                    'bg-amber-500/20 text-amber-300 border border-amber-500/30': t.target_outcome === 'CLOSING_SOON',
                    'bg-rose-500/20 text-rose-300 border border-rose-500/30': t.target_outcome === 'LOSS',
                    'bg-slate-700/50 text-slate-300 border border-slate-600': t.status === 'FILLED' && t.target_outcome === 'CLOSED'
                  }"
                >
                  {{ t.target_outcome === 'IN_PROGRESS' ? '🟢 Live Streaming' : t.target_outcome }}
                </span>
                <div class="text-[10px] text-slate-400 truncate max-w-[140px]">
                  {{ t.admin_notes || 'Active Session' }}
                </div>
              </div>
            </div>

            <!-- 1-CLICK QUICK PROFIT ALTERATION BUTTONS -->
            <div class="space-y-2 relative z-10 pt-1">
              <div class="flex items-center justify-between text-[11px] font-bold text-slate-300">
                <span>⚡ Instant Profit Nudge:</span>
                <span class="text-[10px] text-cyan-400">Updates client screen instantly</span>
              </div>

              <!-- Positive Profit Boosters -->
              <div class="grid grid-cols-6 gap-1.5 text-xs font-mono font-bold">
                <button
                  type="button"
                  (click)="adjustProfit(t.id, 25)"
                  class="py-1.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30 active:scale-95 transition text-center"
                >
                  +25
                </button>
                <button
                  type="button"
                  (click)="adjustProfit(t.id, 50)"
                  class="py-1.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30 active:scale-95 transition text-center"
                >
                  +50
                </button>
                <button
                  type="button"
                  (click)="adjustProfit(t.id, 100)"
                  class="py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-850 text-emerald-300 border border-emerald-500/40 active:scale-95 transition text-center"
                >
                  +100
                </button>
                <button
                  type="button"
                  (click)="adjustProfit(t.id, 250)"
                  class="py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-800 text-emerald-300 border border-emerald-500/50 active:scale-95 transition text-center"
                >
                  +250
                </button>
                <button
                  type="button"
                  (click)="adjustProfit(t.id, 500)"
                  class="py-1.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-700 text-emerald-200 border border-emerald-400/50 active:scale-95 transition text-center"
                >
                  +500
                </button>
                <button
                  type="button"
                  (click)="adjustProfit(t.id, 1000)"
                  class="py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-600 text-emerald-100 border border-emerald-300/60 active:scale-95 transition text-center shadow-sm"
                >
                  +1K
                </button>
              </div>

              <!-- Negative Dips -->
              <div class="grid grid-cols-5 gap-1.5 text-xs font-mono font-bold">
                <button
                  type="button"
                  (click)="adjustProfit(t.id, -25)"
                  class="py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900 text-rose-300 border border-rose-500/30 active:scale-95 transition text-center"
                >
                  -25
                </button>
                <button
                  type="button"
                  (click)="adjustProfit(t.id, -50)"
                  class="py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900 text-rose-300 border border-rose-500/30 active:scale-95 transition text-center"
                >
                  -50
                </button>
                <button
                  type="button"
                  (click)="adjustProfit(t.id, -100)"
                  class="py-1 rounded-lg bg-rose-950/50 hover:bg-rose-900 text-rose-300 border border-rose-500/30 active:scale-95 transition text-center"
                >
                  -100
                </button>
                <button
                  type="button"
                  (click)="adjustProfit(t.id, -250)"
                  class="py-1 rounded-lg bg-rose-950/60 hover:bg-rose-850 text-rose-300 border border-rose-500/40 active:scale-95 transition text-center"
                >
                  -250
                </button>
                <button
                  type="button"
                  (click)="adjustProfit(t.id, -500)"
                  class="py-1 rounded-lg bg-rose-900/70 hover:bg-rose-800 text-rose-200 border border-rose-400/40 active:scale-95 transition text-center"
                >
                  -500
                </button>
              </div>
            </div>

            <!-- EXACT PROFIT OVERRIDE INPUT -->
            <div class="p-3 rounded-2xl bg-black/30 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
              <div class="flex items-center space-x-2 w-full sm:w-auto">
                <span class="text-xs font-bold text-slate-400 font-mono">Set Exact $:</span>
                <input
                  #exactInput
                  type="number"
                  step="any"
                  [value]="t.current_profit"
                  (keyup.enter)="setExactProfit(t.id, exactInput.value)"
                  placeholder="e.g. 500"
                  class="w-28 px-3 py-1.5 rounded-xl bg-[#001c1c] border border-white/20 text-emerald-400 text-xs font-mono font-bold focus:outline-none focus:border-[#0BB4D2] transition"
                />
                <button
                  type="button"
                  (click)="setExactProfit(t.id, exactInput.value)"
                  class="px-3 py-1.5 rounded-xl bg-[#0BB4D2] text-[#002625] font-black text-xs hover:brightness-110 active:scale-95 transition"
                >
                  Save Profit
                </button>
              </div>

              <!-- Deal Notification Signal -->
              <button
                type="button"
                *ngIf="t.target_outcome !== 'CLOSING_SOON'"
                (click)="signalClosing(t.id)"
                class="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-bold active:scale-95 transition flex items-center space-x-1"
                title="Pushes a notification to the client saying this deal will settle soon"
              >
                <span>🔔 Signal Closing Soon</span>
              </button>
            </div>

            <!-- SETTLEMENT & CLOSE ACTIONS FOOTER -->
            <div class="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 relative z-10">
              <span class="text-[11px] text-slate-400 font-bold">Close &amp; Settle Balance:</span>
              
              <div class="flex items-center space-x-2">
                <!-- Close as WIN -->
                <button
                  type="button"
                  (click)="closeWithOutcome(t.id, 'WIN')"
                  class="px-3.5 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/50 text-xs font-black active:scale-95 transition flex items-center space-x-1"
                >
                  <span>🏆 Close as WIN</span>
                </button>

                <!-- Close as LOSS -->
                <button
                  type="button"
                  (click)="closeWithOutcome(t.id, 'LOSS')"
                  class="px-3.5 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500/50 text-xs font-black active:scale-95 transition flex items-center space-x-1"
                >
                  <span>🛑 Close as LOSS</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- MODAL: OPEN LIVE MANAGED TRADE FOR USER                                   -->
      <!-- ========================================================================= -->
      <div
        *ngIf="showNewTradeModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <div class="bg-[#002625] border border-[#0BB4D2]/40 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
          
          <!-- Modal Header -->
          <div class="flex items-center justify-between border-b border-white/10 pb-4">
            <div class="space-y-0.5">
              <div class="text-[10px] font-black uppercase text-cyan-300 tracking-wider">Platform Supervisor</div>
              <h3 class="text-xl font-black text-white">Open Live Trade for Client</h3>
            </div>
            <button
              type="button"
              (click)="showNewTradeModal = false"
              class="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              ✕
            </button>
          </div>

          <form (ngSubmit)="handleCreateTrade()" class="space-y-4">
            
            <!-- Target Investor -->
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-300">Target Investor Account *</label>
              <select
                [(ngModel)]="newTradeUserId"
                name="newTradeUserId"
                required
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#001c1c] border border-white/20 text-white text-xs font-bold focus:outline-none focus:border-[#0BB4D2] transition"
              >
                <option [ngValue]="null" disabled>Select investor account...</option>
                <option *ngFor="let u of users()" [ngValue]="u.id">
                  {{ u.full_name }} ({{ u.account_id }})
                </option>
              </select>
            </div>

            <!-- Asset Pair Quick Presets -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-300">Trading Pair / Asset *</label>
              <div class="flex flex-wrap gap-1.5 pb-1">
                <button
                  type="button"
                  *ngFor="let p of popularPairs"
                  (click)="selectedPair = p"
                  class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition"
                  [ngClass]="selectedPair === p ? 'bg-[#0BB4D2] text-[#002625] border-[#0BB4D2]' : 'bg-black/30 text-slate-300 border-white/10 hover:border-white/30'"
                >
                  {{ p }}
                </button>
              </div>
              <input
                type="text"
                [(ngModel)]="selectedPair"
                name="selectedPair"
                required
                placeholder="Or custom pair, e.g. SOL/USDT"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#001c1c] border border-white/20 text-white text-xs font-mono focus:outline-none focus:border-[#0BB4D2] transition"
              />
            </div>

            <!-- Direction & Amount -->
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="text-xs font-bold text-slate-300">Direction *</label>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    (click)="tradeSide = 'BUY'"
                    class="py-2 rounded-xl text-xs font-black transition border"
                    [ngClass]="tradeSide === 'BUY' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500' : 'bg-black/30 text-slate-400 border-white/10'"
                  >
                    🟢 BUY (Long)
                  </button>
                  <button
                    type="button"
                    (click)="tradeSide = 'SELL'"
                    class="py-2 rounded-xl text-xs font-black transition border"
                    [ngClass]="tradeSide === 'SELL' ? 'bg-rose-500/20 text-rose-300 border-rose-500' : 'bg-black/30 text-slate-400 border-white/10'"
                  >
                    🔴 SELL (Short)
                  </button>
                </div>
              </div>

              <div class="space-y-1">
                <label class="text-xs font-bold text-slate-300">Position Amount *</label>
                <input
                  type="number"
                  step="any"
                  [(ngModel)]="tradeAmount"
                  name="tradeAmount"
                  required
                  placeholder="0.25"
                  class="w-full px-3.5 py-2 rounded-xl bg-[#001c1c] border border-white/20 text-white text-xs font-mono font-bold focus:outline-none focus:border-[#0BB4D2] transition"
                />
              </div>
            </div>

            <!-- Initial Starting Profit -->
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Initial Starting Profit ($)</span>
                <span class="text-[10px] text-emerald-400">Streams live to client immediately</span>
              </label>
              <input
                type="number"
                step="any"
                [(ngModel)]="initialProfit"
                name="initialProfit"
                placeholder="250.00"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#001c1c] border border-white/20 text-emerald-400 text-sm font-mono font-black focus:outline-none focus:border-[#0BB4D2] transition"
              />
            </div>

            <!-- Supervisor Note (Optional) -->
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-300">Desk / Trade Note</label>
              <input
                type="text"
                [(ngModel)]="adminNotes"
                name="adminNotes"
                placeholder="Institutional Managed Position"
                class="w-full px-3.5 py-2 rounded-xl bg-[#001c1c] border border-white/20 text-slate-300 text-xs focus:outline-none focus:border-[#0BB4D2] transition"
              />
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
              <button
                type="button"
                (click)="showNewTradeModal = false"
                class="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                [disabled]="loading() || !newTradeUserId || !tradeAmount"
                class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0BB4D2] to-emerald-400 text-[#002625] font-black text-xs shadow-lg shadow-[#0BB4D2]/25 hover:brightness-110 active:scale-95 transition disabled:opacity-50 flex items-center space-x-1.5"
              >
                <span>🚀</span>
                <span>{{ loading() ? 'Executing...' : 'Launch Trade' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `
})
export class AdminTradeControllerComponent implements OnInit {
  private adminService = inject(AdminService);
  private toast = inject(ToastService);

  // Core Data Signals
  users = signal<any[]>([]);
  managedTrades = signal<any[]>([]);
  liveDriftEnabled = signal<boolean>(true);
  loading = signal<boolean>(false);

  // Filters & State
  selectedUserId: number | null = null;
  searchQuery = '';
  showNewTradeModal = false;

  // New Trade Form
  newTradeUserId: number | null = null;
  selectedPair = 'BTC/USDT';
  tradeSide: 'BUY' | 'SELL' = 'BUY';
  tradeAmount = 0.25;
  initialProfit = 250.00;
  targetOutcome = 'IN_PROGRESS';
  adminNotes = 'Institutional Managed Trade';

  popularPairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'NVDA/USD', 'AAPL/USD', 'TSLA/USD'];

  // Filtered trades computed signal
  filteredTrades = computed(() => {
    let list = this.managedTrades();
    if (this.selectedUserId) {
      list = list.filter(t => t.user_id === this.selectedUserId);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(t => 
        (t.full_name && t.full_name.toLowerCase().includes(q)) ||
        (t.account_id && t.account_id.toLowerCase().includes(q)) ||
        (t.email && t.email.toLowerCase().includes(q)) ||
        (t.pair && t.pair.toLowerCase().includes(q)) ||
        String(t.id).includes(q)
      );
    }
    return list;
  });

  // Total profit of currently visible trades
  totalProfit = computed(() => {
    return this.filteredTrades().reduce((acc, t) => acc + (parseFloat(t.current_profit) || 0), 0);
  });

  ngOnInit() {
    this.loadUsers();
    this.loadManagedTrades();
  }

  loadUsers() {
    this.adminService.getUsers().subscribe({
      next: (res) => {
        if (res.success) {
          const clients = res.data.filter((u: any) => u.role !== 'admin');
          this.users.set(clients);
          if (clients.length > 0 && !this.newTradeUserId) {
            this.newTradeUserId = clients[0].id;
          }
        }
      }
    });
  }

  loadManagedTrades() {
    this.adminService.getManagedTrades().subscribe({
      next: (res) => {
        if (res.success && Array.isArray(res.data)) {
          this.managedTrades.set(res.data);
        }
      }
    });
  }

  onUserFilterChange() {
    if (this.selectedUserId) {
      this.newTradeUserId = this.selectedUserId;
    }
  }

  toggleDrift() {
    const nextState = !this.liveDriftEnabled();
    this.adminService.toggleLiveDrift(nextState).subscribe({
      next: () => {
        this.liveDriftEnabled.set(nextState);
        this.toast.info(`Market drift ${nextState ? 'enabled (5s pulse)' : 'paused'}`);
      },
      error: () => this.toast.error('Failed to toggle drift')
    });
  }

  quickBoostAll(delta: number) {
    if (this.selectedUserId) {
      this.adminService.boostAllProfits({
        user_id: this.selectedUserId,
        delta_profit: delta
      }).subscribe({
        next: () => {
          this.toast.success(`Boosted all positions by +$${delta}! Client screen updated.`);
          this.loadManagedTrades();
        },
        error: (err) => this.toast.error(err.error?.error || 'Failed to boost')
      });
    } else {
      // If no specific user is selected, apply to all currently listed trades individually
      const visible = this.filteredTrades();
      if (visible.length === 0) {
        this.toast.info('No active trades to boost.');
        return;
      }
      visible.forEach(t => this.adjustProfit(t.id, delta, false));
      this.toast.success(`Boosted ${visible.length} trades by +$${delta}!`);
    }
  }

  adjustProfit(tradeId: number, delta: number, showToast = true) {
    this.adminService.alterTradeProfit({
      trade_id: tradeId,
      delta_profit: delta
    }).subscribe({
      next: (res) => {
        if (showToast) {
          this.toast.success(`Profit ${delta >= 0 ? '+' : ''}$${delta} pushed to client live room!`);
        }
        this.updateLocalTrade(res.data);
      },
      error: (err) => {
        if (showToast) {
          this.toast.error(err.error?.error || 'Failed to update profit');
        }
      }
    });
  }

  setExactProfit(tradeId: number, val: string) {
    const num = parseFloat(val);
    if (isNaN(num)) return;

    this.adminService.alterTradeProfit({
      trade_id: tradeId,
      new_profit: num
    }).subscribe({
      next: (res) => {
        this.toast.success(`Trade profit set to $${num.toFixed(2)} in real time!`);
        this.updateLocalTrade(res.data);
      },
      error: (err) => {
        this.toast.error(err.error?.error || 'Failed to update profit');
      }
    });
  }

  signalClosing(tradeId: number) {
    this.adminService.signalTradeClosing({ trade_id: tradeId }).subscribe({
      next: (res) => {
        this.toast.info('Deal closing alert pushed to client screen!');
        this.updateLocalTrade(res.data);
      },
      error: () => this.toast.error('Failed to signal closing')
    });
  }

  closeWithOutcome(tradeId: number, outcome: 'WIN' | 'LOSS') {
    this.adminService.closeTrade({
      trade_id: tradeId,
      outcome
    }).subscribe({
      next: () => {
        this.toast.success(`Trade settled as ${outcome}! Profit credited to client wallet.`);
        this.loadManagedTrades();
      },
      error: (err) => {
        this.toast.error(err.error?.error || 'Failed to close trade');
      }
    });
  }

  handleCreateTrade() {
    if (!this.newTradeUserId) {
      this.toast.error('Please choose an investor account');
      return;
    }

    this.loading.set(true);
    this.adminService.tradeForUser({
      user_id: this.newTradeUserId,
      pair: this.selectedPair,
      side: this.tradeSide,
      amount: this.tradeAmount,
      initial_profit: this.initialProfit,
      target_outcome: this.targetOutcome,
      admin_notes: this.adminNotes
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.showNewTradeModal = false;
        this.toast.success(`Live trade launched! Investor sees +$${this.initialProfit} in real-time.`);
        this.loadManagedTrades();
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.error || 'Failed to execute trade');
      }
    });
  }

  private updateLocalTrade(updated: any) {
    if (!updated) return;
    this.managedTrades.update(list => {
      const idx = list.findIndex(t => t.id === updated.id);
      if (idx >= 0) {
        const copy = [...list];
        copy[idx] = updated;
        return copy;
      }
      return [updated, ...list];
    });
  }
}
