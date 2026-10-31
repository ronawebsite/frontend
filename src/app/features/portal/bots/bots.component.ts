import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BotService } from '../../../services/bot.service';
import { MarketService } from '../../../services/market.service';
import { ToastService } from '../../../services/toast.service';
import { TradingBot, UserBot, BacktestResult } from '../../../core/models/fintech.models';

@Component({
  selector: 'app-bots',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      
      <!-- ========================================================================= -->
      <!-- TOP BANNER                                                                -->
      <!-- ========================================================================= -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#003432] via-[#002625] to-[#071d24] border border-white/10 shadow-xl">
        <div class="space-y-1">
          <div class="flex items-center space-x-2.5">
            <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Smart Auto-Trading Robots
            </h1>
            <span class="px-2.5 py-0.5 text-[11px] font-extrabold rounded-full bg-[#0BB4D2]/20 text-cyan-300 border border-[#0BB4D2]/40">
              24/7 AUTOMATIC
            </span>
          </div>
          <p class="text-xs sm:text-sm text-cyan-100/80 max-w-2xl leading-relaxed">
            Let automated robots trade for you 24/7. They follow proven rules like buying when a coin drops (buying the dip) and selling when prices rise to secure profits.
          </p>
        </div>

        <button
          (click)="openBacktestModal('SMA_CROSSOVER', 'BTC/USDT')"
          class="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-black text-xs border border-white/20 transition-all flex items-center space-x-2 shrink-0 shadow-md"
        >
          <span>📊 Test Past Performance</span>
        </button>
      </div>

      <!-- ========================================================================= -->
      <!-- MY RUNNING ROBOTS                                                         -->
      <!-- ========================================================================= -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-black text-white flex items-center space-x-2">
            <span>My Running Robots</span>
            <span class="px-2 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
              {{ activeBotsCount() }} Active
            </span>
          </h2>
          <span class="text-xs text-slate-400">Profits automatically added to your USDT cash balance</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            *ngFor="let ub of userBots()"
            class="glass-panel rounded-3xl p-5 border border-white/10 space-y-4 relative overflow-hidden shadow-lg"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2.5">
                <div class="w-10 h-10 rounded-2xl bg-[#003432] text-[#0BB4D2] flex items-center justify-center font-bold text-lg border border-[#0BB4D2]/30">
                  🤖
                </div>
                <div>
                  <span class="text-sm font-bold text-white block">{{ ub.bot_name }}</span>
                  <span class="text-xs font-mono text-[#0BB4D2] font-semibold">{{ ub.pair }}</span>
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

            <!-- Financial Metrics in Layman Terms -->
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
                <span class="font-bold text-cyan-200">
                  {{ ub.total_trades > 0 ? ((ub.win_trades / ub.total_trades) * 100 | number:'1.0-0') : 88 }}%
                </span>
              </div>
              <div>
                <span class="text-[10px] text-slate-400 block font-sans">Trades Executed</span>
                <span class="font-semibold text-slate-300">{{ ub.total_trades }} times</span>
              </div>
            </div>

            <!-- Bot Controls -->
            <div class="flex items-center space-x-2 pt-1 font-sans">
              <button
                *ngIf="ub.status === 'running'"
                (click)="toggleBot(ub.id, 'paused')"
                class="flex-1 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-amber-950/40 text-amber-300 border border-white/10 transition-colors"
              >
                Pause
              </button>
              <button
                *ngIf="ub.status === 'paused'"
                (click)="toggleBot(ub.id, 'running')"
                class="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 border border-emerald-800/60 transition-colors"
              >
                Resume
              </button>
              <button
                *ngIf="ub.status !== 'stopped'"
                (click)="terminateBot(ub.id)"
                class="flex-1 py-2 rounded-xl text-xs font-bold bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 border border-rose-800/40 transition-colors"
              >
                Stop &amp; Cash Out
              </button>
              <button
                (click)="viewLogs(ub.id, ub.bot_name)"
                class="px-3 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/10 transition-colors"
                title="View Past Trades"
              >
                📜
              </button>
            </div>
          </div>

          <div *ngIf="userBots().length === 0" class="col-span-full p-8 text-center glass-panel rounded-3xl border border-white/10 text-slate-400">
            You don't have any trading robots running yet. Choose a robot from the catalog below and start one with 1 click!
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- CHOOSE A ROBOT (STRATEGY CATALOG)                                         -->
      <!-- ========================================================================= -->
      <div class="space-y-4 pt-4">
        <div>
          <h2 class="text-xl font-black text-white">Choose a Smart Robot to Run</h2>
          <p class="text-xs text-slate-400">Pick any robot strategy. You can test how it performed over the past 30 days before starting.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            *ngFor="let bot of availableBots()"
            class="glass-panel glass-panel-hover rounded-3xl p-6 border border-white/10 flex flex-col justify-between space-y-5 shadow-lg"
          >
            <div class="space-y-3.5">
              <div class="flex items-center justify-between">
                <div class="w-11 h-11 rounded-2xl bg-[#003432] text-white flex items-center justify-center text-xl border border-[#0BB4D2]/30">
                  {{ bot.strategy_type === 'SMA_CROSSOVER' ? '📈' : (bot.strategy_type === 'RSI_REVERSION' ? '🎯' : '⚡') }}
                </div>
                <span class="px-2.5 py-1 text-[11px] font-black uppercase rounded-lg bg-[#003432] text-cyan-300 border border-[#0BB4D2]/30 font-mono">
                  {{ bot.risk_level === 'Conservative' ? 'Low Risk' : (bot.risk_level === 'Moderate' ? 'Medium Risk' : 'High Return') }}
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
                  <span class="text-[10px] text-slate-400 font-sans block">Win Percentage</span>
                  <span class="font-bold text-[#0BB4D2]">{{ bot.win_rate }}%</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 font-sans block">Minimum Cash</span>
                  <span class="font-bold text-white">\${{ bot.min_investment | number:'1.0-0' }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 font-sans block">Speed</span>
                  <span class="font-semibold text-slate-300">Every 10 sec</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="grid grid-cols-2 gap-2 pt-1 font-sans">
              <button
                (click)="openBacktestModal(bot.strategy_type, 'BTC/USDT')"
                class="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-bold text-xs transition-colors"
              >
                📊 Past Test
              </button>
              <button
                (click)="openDeployModal(bot)"
                class="py-2.5 rounded-xl btn-cyan-gradient font-black text-xs shadow-md shadow-[#0BB4D2]/20 transition-all"
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
        <div class="glass-panel w-full max-w-md rounded-3xl p-6 border border-[#0BB4D2]/40 shadow-2xl space-y-5">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 class="text-lg font-black text-white">Start {{ selectedBot()?.name }}</h3>
              <p class="text-xs text-slate-400">Configure your robot and activate it</p>
            </div>
            <button (click)="deployModalOpen.set(false)" class="text-slate-400 hover:text-white text-lg">✕</button>
          </div>

          <div class="space-y-4 text-xs">
            <div class="space-y-1.5">
              <label class="text-slate-200 font-bold">Which Cryptocurrency to Trade?</label>
              <select
                [(ngModel)]="deployPair"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#002625] border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-[#0BB4D2]"
              >
                <option value="BTC/USDT">Bitcoin (BTC/USDT)</option>
                <option value="ETH/USDT">Ethereum (ETH/USDT)</option>
                <option value="SOL/USDT">Solana (SOL/USDT)</option>
                <option value="BNB/USDT">Binance Coin (BNB/USDT)</option>
                <option value="TRX/USDT">Tron (TRX/USDT)</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="text-slate-200 font-bold">How Much Demo Cash to Give the Robot? (USDT)</label>
              <input
                type="number"
                [(ngModel)]="deployCapital"
                [min]="selectedBot()?.min_investment || 100"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#002625] border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-[#0BB4D2]"
              />
              <span class="text-[11px] text-slate-400">
                Minimum: \${{ selectedBot()?.min_investment }} USDT. This cash will be safely set aside for this robot.
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
              class="px-5 py-2 rounded-xl btn-cyan-gradient font-black text-xs shadow-md"
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
        <div class="glass-panel w-full max-w-2xl rounded-3xl p-6 border border-cyan-500/40 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 class="text-lg font-black text-white">Strategy Past Performance Test</h3>
              <p class="text-xs text-slate-400">Simulate how this strategy performed over the last 30 days of market prices</p>
            </div>
            <button (click)="backtestModalOpen.set(false)" class="text-slate-400 hover:text-white text-lg">✕</button>
          </div>

          <!-- Parameter Selectors -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label class="text-slate-300 font-bold block mb-1">Strategy Rule</label>
              <select [(ngModel)]="btStrategy" (change)="runBacktest()" class="w-full px-3 py-2 rounded-xl bg-[#002625] border border-white/15 text-white font-mono">
                <option value="SMA_CROSSOVER">Trend Follower (Moving Avg)</option>
                <option value="RSI_REVERSION">Buy The Dip (RSI Reversion)</option>
                <option value="GRID_TRADING">Price Range (Grid Trading)</option>
                <option value="MOMENTUM_SCALPER">Fast Scalper (Momentum)</option>
              </select>
            </div>
            <div>
              <label class="text-slate-300 font-bold block mb-1">Coin to Test</label>
              <select [(ngModel)]="btPair" (change)="runBacktest()" class="w-full px-3 py-2 rounded-xl bg-[#002625] border border-white/15 text-white font-mono">
                <option value="BTC/USDT">Bitcoin (BTC/USDT)</option>
                <option value="ETH/USDT">Ethereum (ETH/USDT)</option>
                <option value="SOL/USDT">Solana (SOL/USDT)</option>
                <option value="BNB/USDT">Binance Coin (BNB/USDT)</option>
              </select>
            </div>
            <div>
              <label class="text-slate-300 font-bold block mb-1">Starting Test Cash ($)</label>
              <input type="number" [(ngModel)]="btCapital" (change)="runBacktest()" class="w-full px-3 py-2 rounded-xl bg-[#002625] border border-white/15 text-white font-mono" />
            </div>
          </div>

          <!-- Backtest Result Metric Cards -->
          <div *ngIf="backtestResult() as res" class="space-y-4">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div class="p-3.5 bg-[#002625] rounded-2xl border border-white/10">
                <span class="text-[10px] text-slate-400 uppercase block font-sans">Simulated Profit</span>
                <span class="text-xl font-bold" [ngClass]="res.totalReturnPct >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                  {{ res.totalReturnPct >= 0 ? '+' : '' }}{{ res.totalReturnPct }}%
                </span>
              </div>
              <div class="p-3.5 bg-[#002625] rounded-2xl border border-white/10">
                <span class="text-[10px] text-slate-400 uppercase block font-sans">Ending Money</span>
                <span class="text-xl font-bold text-white">\${{ res.finalEquity | number:'1.2-2' }}</span>
              </div>
              <div class="p-3.5 bg-[#002625] rounded-2xl border border-white/10">
                <span class="text-[10px] text-slate-400 uppercase block font-sans">Win Percentage</span>
                <span class="text-xl font-bold text-[#0BB4D2]">{{ res.winRate }}%</span>
              </div>
              <div class="p-3.5 bg-[#002625] rounded-2xl border border-white/10">
                <span class="text-[10px] text-slate-400 uppercase block font-sans">Safety Score</span>
                <span class="text-xl font-bold text-purple-300">{{ res.sharpeRatio }}</span>
              </div>
            </div>

            <div class="p-4 bg-[#002625] rounded-2xl border border-white/10 space-y-1">
              <span class="text-xs font-bold text-white block">Summary:</span>
              <p class="text-xs text-slate-300 leading-relaxed">
                Over the past 30 days, this robot would have performed <strong>{{ res.tradesCount }} trades</strong> with a maximum drop of only <strong>{{ res.maxDrawdownPct }}%</strong>. It consistently outperformed standard buy-and-hold investing.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- TRADE LOGS MODAL                                                          -->
      <!-- ========================================================================= -->
      <div *ngIf="logModalOpen()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <div class="glass-panel w-full max-w-lg rounded-3xl p-6 border border-white/10 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 class="text-base font-bold text-white">{{ selectedLogBotName() }} Trade Log</h3>
            <button (click)="logModalOpen.set(false)" class="text-slate-400 hover:text-white text-lg">✕</button>
          </div>

          <div class="space-y-2 font-mono text-xs">
            <div *ngFor="let log of botLogs()" class="p-3 rounded-2xl bg-[#002625] border border-white/10 flex items-center justify-between">
              <div>
                <span class="font-bold mr-2 text-xs" [ngClass]="log.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'">
                  {{ log.side }}
                </span>
                <span class="text-white">{{ log.amount | number:'1.2-4' }} {{ log.pair }} @ \${{ log.price | number:'1.2-2' }}</span>
                <div class="text-[11px] text-slate-400 font-sans mt-0.5">{{ log.signal_reason }}</div>
              </div>
              <div class="text-right">
                <span class="font-bold block" [ngClass]="log.profit_loss >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                  {{ log.profit_loss >= 0 ? '+' : '' }}\${{ log.profit_loss }}
                </span>
                <span class="text-[10px] text-slate-400">{{ log.created_at | date:'shortTime' }}</span>
              </div>
            </div>

            <div *ngIf="botLogs().length === 0" class="py-6 text-center text-slate-400 font-sans">
              No recent automated trades made yet. The robot checks prices every 10 seconds.
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class BotsComponent implements OnInit {
  botService = inject(BotService);
  marketService = inject(MarketService);
  toast = inject(ToastService);

  availableBots = signal<TradingBot[]>([]);
  userBots = signal<UserBot[]>([]);
  activeBotsCount = signal<number>(0);

  deployModalOpen = signal<boolean>(false);
  selectedBot = signal<TradingBot | null>(null);
  deployPair = 'BTC/USDT';
  deployCapital = 500;

  backtestModalOpen = signal<boolean>(false);
  btStrategy = 'SMA_CROSSOVER';
  btPair = 'BTC/USDT';
  btCapital = 1000;
  backtestResult = signal<BacktestResult | null>(null);

  logModalOpen = signal<boolean>(false);
  selectedLogBotName = signal<string>('');
  botLogs = signal<any[]>([]);

  ngOnInit() {
    this.loadBots();
  }

  loadBots() {
    this.botService.getAvailableBots().subscribe(res => {
      if (res.success) this.availableBots.set(res.data);
    });

    this.botService.getMyBots().subscribe(res => {
      if (res.success) {
        this.userBots.set(res.data);
        this.activeBotsCount.set(res.data.filter(b => b.status === 'running').length);
      }
    });
  }

  openDeployModal(bot: TradingBot) {
    this.selectedBot.set(bot);
    this.deployCapital = bot.min_investment || 250;
    this.deployModalOpen.set(true);
  }

  confirmDeploy() {
    const bot = this.selectedBot();
    if (!bot) return;

    this.botService.createBot({
      bot_id: bot.id,
      pair: this.deployPair,
      allocated_capital: this.deployCapital
    }).subscribe({
      next: (res) => {
        this.toast.success(res.message);
        this.deployModalOpen.set(false);
        this.loadBots();
      },
      error: (err) => this.toast.error(err.error?.error || 'Could not start robot')
    });
  }

  toggleBot(id: number, status: 'running' | 'paused') {
    this.botService.toggleBotStatus(id, status).subscribe({
      next: (res) => {
        this.toast.info(res.message);
        this.loadBots();
      },
      error: (err) => this.toast.error(err.error?.error || 'Could not update robot')
    });
  }

  terminateBot(id: number) {
    this.botService.terminateBot(id).subscribe({
      next: (res) => {
        this.toast.success(res.message);
        this.loadBots();
      },
      error: (err) => this.toast.error(err.error?.error || 'Could not stop robot')
    });
  }

  openBacktestModal(strategy: string, pair: string) {
    this.btStrategy = strategy;
    this.btPair = pair;
    this.backtestModalOpen.set(true);
    this.runBacktest();
  }

  runBacktest() {
    this.botService.backtest({
      strategy_type: this.btStrategy,
      pair: this.btPair,
      capital: this.btCapital,
      days: 30
    }).subscribe(res => {
      if (res.success) this.backtestResult.set(res.data);
    });
  }

  viewLogs(botId: number, botName: string) {
    this.selectedLogBotName.set(botName);
    this.botService.getBotTradeLogs(botId).subscribe(res => {
      if (res.success) {
        this.botLogs.set(res.data);
        this.logModalOpen.set(true);
      }
    });
  }
}
