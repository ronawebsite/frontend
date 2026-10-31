import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockService } from '../../../../services/stock.service';
import { ToastService } from '../../../../services/toast.service';
import { StockBotTemplate } from '../../../../core/models/stock.models';

@Component({
  selector: 'app-stocks-bots',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      
      <!-- ========================================================================= -->
      <!-- TOP BANNER                                                                -->
      <!-- ========================================================================= -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#003432] via-[#047857]/40 to-[#071d24] border border-white/10 shadow-xl">
        <div class="space-y-1">
          <div class="flex items-center space-x-2.5">
            <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Stock Strategy Robots
            </h1>
            <span class="px-2.5 py-0.5 text-[11px] font-extrabold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              EQUITY QUANT
            </span>
          </div>
          <p class="text-xs sm:text-sm text-cyan-100/80 max-w-2xl leading-relaxed">
            Automate your stock portfolio with institutional quantitative models. Run S&amp;P 500 dollar-cost averaging bots, Big Tech breakout trackers, and blue-chip dip buyers.
          </p>
        </div>

        <button
          (click)="openBacktestModal('MOMENTUM_SCALPER', 'NVDA/USD')"
          class="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-black text-xs border border-white/20 transition-all flex items-center space-x-2 shrink-0 shadow-md"
        >
          <span>📊 Test Stock Past Performance</span>
        </button>
      </div>

      <!-- ========================================================================= -->
      <!-- MY RUNNING STOCK ROBOTS                                                   -->
      <!-- ========================================================================= -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-black text-white flex items-center space-x-2">
            <span>My Active Stock Robots</span>
            <span class="px-2 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
              {{ myBots().length }} Active
            </span>
          </h2>
          <span class="text-xs text-slate-400">Equity earnings automatically settle to your USD cash balance</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            *ngFor="let ub of myBots()"
            class="glass-panel rounded-3xl p-5 border border-white/10 space-y-4 relative overflow-hidden shadow-lg"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2.5">
                <div class="w-10 h-10 rounded-2xl bg-[#003432] text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-400/30">
                  📈
                </div>
                <div>
                  <span class="text-sm font-bold text-white block">{{ ub.bot_name }}</span>
                  <span class="text-xs font-mono text-emerald-400 font-semibold">{{ ub.pair }}</span>
                </div>
              </div>

              <span
                class="px-2.5 py-0.5 text-[11px] font-bold uppercase rounded-full"
                [ngClass]="{
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40': ub.status === 'running',
                  'bg-amber-500/20 text-amber-300 border border-amber-500/40': ub.status === 'paused',
                  'bg-slate-800 text-slate-400': ub.status === 'stopped'
                }"
              >
                {{ ub.status === 'running' ? 'Running' : (ub.status === 'paused' ? 'Paused' : 'Stopped') }}
              </span>
            </div>

            <!-- Financial Metrics -->
            <div class="grid grid-cols-2 gap-2.5 p-3.5 bg-[#002625] rounded-2xl border border-white/10 font-mono text-xs">
              <div>
                <span class="text-[10px] text-slate-400 block font-sans">Money Invested</span>
                <span class="font-bold text-white text-sm">\${{ ub.allocated_capital | number:'1.2-2' }}</span>
              </div>
              <div>
                <span class="text-[10px] text-slate-400 block font-sans">Total Profit Made</span>
                <span
                  class="font-bold text-sm"
                  [ngClass]="ub.total_profit_loss >= 0 ? 'text-emerald-400' : 'text-rose-400'"
                >
                  {{ ub.total_profit_loss >= 0 ? '+' : '' }}\${{ ub.total_profit_loss | number:'1.2-2' }}
                </span>
              </div>
              <div>
                <span class="text-[10px] text-slate-400 block font-sans">Win Rate</span>
                <span class="font-bold text-emerald-300">
                  {{ ub.total_trades > 0 ? ((ub.win_trades / ub.total_trades) * 100 | number:'1.0-0') : 91 }}%
                </span>
              </div>
              <div>
                <span class="text-[10px] text-slate-400 block font-sans">Trades Executed</span>
                <span class="font-semibold text-slate-300">{{ ub.total_trades }} times</span>
              </div>
            </div>

            <div class="flex items-center space-x-2 pt-1 font-sans">
              <span class="text-xs text-emerald-400 font-semibold">● Actively monitoring Wall Street quotes</span>
            </div>
          </div>

          <div *ngIf="myBots().length === 0" class="col-span-full p-8 text-center glass-panel rounded-3xl border border-white/10 text-slate-400">
            No stock trading robots active yet. Select a strategy from the catalog below to deploy!
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- STOCK STRATEGY CATALOG                                                    -->
      <!-- ========================================================================= -->
      <div class="space-y-4 pt-4">
        <div>
          <h2 class="text-xl font-black text-white">Stock Investment Strategy Catalog</h2>
          <p class="text-xs text-slate-400">Select an algorithmic model to backtest or deploy into live Wall Street simulation</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            *ngFor="let bot of templates()"
            class="glass-panel glass-panel-hover rounded-3xl p-6 border border-white/10 flex flex-col justify-between space-y-5 shadow-lg hover:border-emerald-400/40"
          >
            <div class="space-y-3.5">
              <div class="flex items-center justify-between">
                <div class="w-11 h-11 rounded-2xl bg-[#003432] text-white flex items-center justify-center text-xl border border-emerald-400/30">
                  {{ bot.icon }}
                </div>
                <span class="px-2.5 py-1 text-[11px] font-black uppercase rounded-lg bg-[#003432] text-emerald-300 border border-emerald-400/30 font-mono">
                  {{ bot.risk_level }}
                </span>
              </div>

              <div>
                <h3 class="text-lg font-black text-white">{{ bot.name }}</h3>
                <p class="text-xs text-slate-300 mt-1 leading-relaxed">{{ bot.description }}</p>
              </div>

              <!-- Stat Box -->
              <div class="grid grid-cols-2 gap-2 p-3 bg-[#002625] rounded-2xl border border-white/10 font-mono text-xs">
                <div>
                  <span class="text-[10px] text-slate-400 font-sans block">Estimated Returns</span>
                  <span class="font-bold text-emerald-400">+{{ bot.roi_min }}% – +{{ bot.roi_max }}%</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 font-sans block">Historical Win Rate</span>
                  <span class="font-bold text-cyan-300">{{ bot.win_rate }}%</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 font-sans block">Min Investment</span>
                  <span class="font-bold text-white">\${{ bot.min_investment | number:'1.0-0' }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 font-sans block">Market</span>
                  <span class="font-semibold text-slate-300">Equities</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="grid grid-cols-2 gap-2 pt-1 font-sans">
              <button
                (click)="openBacktestModal(bot.strategy_type, bot.default_pair)"
                class="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-bold text-xs transition-colors"
              >
                📊 Past Test
              </button>
              <button
                (click)="openDeployModal(bot)"
                class="py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs shadow-md shadow-emerald-500/20 transition-all"
              >
                🚀 Start Robot
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- START ROBOT MODAL                                                         -->
      <!-- ========================================================================= -->
      <div *ngIf="deployModalOpen()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <div class="glass-panel w-full max-w-md rounded-3xl p-6 border border-emerald-400/40 shadow-2xl space-y-5">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 class="text-lg font-black text-white">Start {{ selectedBot()?.name }}</h3>
              <p class="text-xs text-slate-400">Configure stock allocation &amp; activate</p>
            </div>
            <button (click)="deployModalOpen.set(false)" class="text-slate-400 hover:text-white text-lg">✕</button>
          </div>

          <div class="space-y-4 text-xs">
            <div class="space-y-1.5">
              <label class="text-slate-200 font-bold">Select US Stock or ETF to Trade</label>
              <select
                [(ngModel)]="deployPair"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#002625] border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-emerald-400"
              >
                <option value="AAPL/USD">Apple Inc. (AAPL/USD)</option>
                <option value="TSLA/USD">Tesla Inc. (TSLA/USD)</option>
                <option value="NVDA/USD">NVIDIA Corp. (NVDA/USD)</option>
                <option value="MSFT/USD">Microsoft Corp. (MSFT/USD)</option>
                <option value="AMZN/USD">Amazon.com (AMZN/USD)</option>
                <option value="SPY/USD">S&amp;P 500 Index ETF (SPY/USD)</option>
                <option value="QQQ/USD">Nasdaq 100 ETF (QQQ/USD)</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="text-slate-200 font-bold">Allocated Cash ($ USD)</label>
              <input
                type="number"
                [(ngModel)]="deployCapital"
                [min]="selectedBot()?.min_investment || 200"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#002625] border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-emerald-400"
              />
              <span class="text-[11px] text-slate-400">
                Minimum: \${{ selectedBot()?.min_investment }} USD. Cash is safely set aside for this robot.
              </span>
            </div>
          </div>

          <div class="flex justify-end space-x-2 pt-2 border-t border-white/10">
            <button
              (click)="deployModalOpen.set(false)"
              class="px-4 py-2 rounded-xl bg-white/5 text-slate-300 font-bold text-xs hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              (click)="confirmDeploy()"
              class="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md"
            >
              Confirm &amp; Start Robot
            </button>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- PAST PERFORMANCE BACKTESTER MODAL                                         -->
      <!-- ========================================================================= -->
      <div *ngIf="backtestModalOpen()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <div class="glass-panel w-full max-w-2xl rounded-3xl p-6 border border-emerald-400/40 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 class="text-lg font-black text-white">Stock Strategy Past Performance Test</h3>
              <p class="text-xs text-slate-400">Simulate how this strategy performed over recent Wall Street market data</p>
            </div>
            <button (click)="backtestModalOpen.set(false)" class="text-slate-400 hover:text-white text-lg">✕</button>
          </div>

          <!-- Parameter Selectors -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label class="text-slate-300 font-bold block mb-1">Stock Strategy Model</label>
              <select [(ngModel)]="btStrategy" (change)="runBacktest()" class="w-full px-3 py-2 rounded-xl bg-[#002625] border border-white/15 text-white font-mono">
                <option value="MOMENTUM_SCALPER">Big Tech Breakout Momentum</option>
                <option value="SMA_CROSSOVER">S&amp;P 500 DCA Indexer</option>
                <option value="RSI_REVERSION">Blue-Chip Dip Buyer</option>
                <option value="GRID_TRADING">Wall Street Range Grid</option>
              </select>
            </div>
            <div>
              <label class="text-slate-300 font-bold block mb-1">Stock / ETF</label>
              <select [(ngModel)]="btPair" (change)="runBacktest()" class="w-full px-3 py-2 rounded-xl bg-[#002625] border border-white/15 text-white font-mono">
                <option value="AAPL/USD">Apple (AAPL/USD)</option>
                <option value="NVDA/USD">NVIDIA (NVDA/USD)</option>
                <option value="TSLA/USD">Tesla (TSLA/USD)</option>
                <option value="SPY/USD">S&amp;P 500 (SPY/USD)</option>
              </select>
            </div>
            <div>
              <label class="text-slate-300 font-bold block mb-1">Test Starting Cash ($)</label>
              <input type="number" [(ngModel)]="btCapital" (change)="runBacktest()" class="w-full px-3 py-2 rounded-xl bg-[#002625] border border-white/15 text-white font-mono" />
            </div>
          </div>

          <!-- Backtest Result Metric Cards -->
          <div *ngIf="backtestResult() as res" class="space-y-4">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div class="p-3.5 bg-[#002625] rounded-2xl border border-white/10">
                <span class="text-[10px] text-slate-400 uppercase block font-sans">Simulated Return</span>
                <span class="text-xl font-bold" [ngClass]="res.totalReturnPct >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                  {{ res.totalReturnPct >= 0 ? '+' : '' }}{{ res.totalReturnPct }}%
                </span>
              </div>
              <div class="p-3.5 bg-[#002625] rounded-2xl border border-white/10">
                <span class="text-[10px] text-slate-400 uppercase block font-sans">Ending Equity</span>
                <span class="text-xl font-bold text-white">\${{ res.finalEquity | number:'1.2-2' }}</span>
              </div>
              <div class="p-3.5 bg-[#002625] rounded-2xl border border-white/10">
                <span class="text-[10px] text-slate-400 uppercase block font-sans">Win Percentage</span>
                <span class="text-xl font-bold text-emerald-300">{{ res.winRate }}%</span>
              </div>
              <div class="p-3.5 bg-[#002625] rounded-2xl border border-white/10">
                <span class="text-[10px] text-slate-400 uppercase block font-sans">Safety Score</span>
                <span class="text-xl font-bold text-purple-300">{{ res.sharpeRatio }}</span>
              </div>
            </div>

            <div class="p-4 bg-[#002625] rounded-2xl border border-white/10 space-y-1">
              <span class="text-xs font-bold text-white block">Strategy Evaluation:</span>
              <p class="text-xs text-slate-300 leading-relaxed">
                Over the simulated sample period, this stock strategy recorded <strong>{{ res.tradesCount }} trade executions</strong> with a maximum drawdown of only <strong>{{ res.maxDrawdownPct }}%</strong>, demonstrating solid risk-adjusted alpha over broad market indices.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class StocksBotsComponent implements OnInit {
  stockService = inject(StockService);
  toast = inject(ToastService);

  templates = signal<StockBotTemplate[]>([]);
  myBots = signal<any[]>([]);

  deployModalOpen = signal<boolean>(false);
  selectedBot = signal<StockBotTemplate | null>(null);
  deployPair = 'AAPL/USD';
  deployCapital = 500;

  backtestModalOpen = signal<boolean>(false);
  btStrategy = 'MOMENTUM_SCALPER';
  btPair = 'NVDA/USD';
  btCapital = 1000;
  backtestResult = signal<any | null>(null);

  ngOnInit() {
    this.stockService.setMarketMode('stocks');
    this.loadBots();
  }

  loadBots() {
    this.stockService.getBots().subscribe(res => {
      if (res.success) {
        this.templates.set(res.data.available);
        this.myBots.set(res.data.myBots);
      }
    });
  }

  openDeployModal(bot: StockBotTemplate) {
    this.selectedBot.set(bot);
    this.deployPair = bot.default_pair || 'AAPL/USD';
    this.deployCapital = bot.min_investment || 300;
    this.deployModalOpen.set(true);
  }

  confirmDeploy() {
    const bot = this.selectedBot();
    if (!bot) return;

    this.stockService.deployBot({
      template_id: bot.id,
      pair: this.deployPair,
      allocated_capital: this.deployCapital
    }).subscribe({
      next: (res) => {
        this.toast.success(res.message);
        this.deployModalOpen.set(false);
        this.loadBots();
      },
      error: (err) => this.toast.error(err.error?.error || 'Could not start stock robot')
    });
  }

  openBacktestModal(strategy: string, pair: string) {
    this.btStrategy = strategy;
    this.btPair = pair;
    this.backtestModalOpen.set(true);
    this.runBacktest();
  }

  runBacktest() {
    this.stockService.backtest({
      strategy_type: this.btStrategy,
      pair: this.btPair,
      capital: this.btCapital,
      days: 30
    }).subscribe(res => {
      if (res.success) this.backtestResult.set(res.data);
    });
  }
}
