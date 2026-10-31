import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PlanService } from '../../../services/plan.service';
import { WalletService } from '../../../services/wallet.service';
import { ToastService } from '../../../services/toast.service';
import { GrowthPlan, UserSubscription } from '../../../core/models/fintech.models';
import { PlanGrowthChartComponent } from '../../../shared/charts/plan-growth-chart/plan-growth-chart.component';

@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PlanGrowthChartComponent],
  template: `
    <div class="space-y-8 font-nunito text-slate-100 selection:bg-[#0BB4D2] selection:text-white">
      
      <!-- ========================================================================= -->
      <!-- TOP BANNER                                                                -->
      <!-- ========================================================================= -->
      <div class="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#003432] via-[#002625] to-[#071318] border border-white/10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="space-y-1.5">
          <div class="flex items-center space-x-2.5">
            <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Institutional Growth Plans
            </h1>
            <span class="px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>GUARANTEED SETTLEMENT</span>
            </span>
          </div>
          <p class="text-xs sm:text-sm text-cyan-100/80 max-w-2xl leading-relaxed">
            Select a plan to grow your starting deposit to a desired target payout in specified days. Watch real-time up and down fluctuations like a live Binance market chart until maturity.
          </p>
        </div>

        <!-- Available Balance & Quick Deposit -->
        <div class="flex items-center space-x-3 shrink-0">
          <div class="p-3 px-4 rounded-2xl bg-[#001c1c] border border-white/10 text-right">
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Available Cash</span>
            <span class="text-base font-black text-cyan-300 font-mono">\${{ getUsdBalance() | number:'1.2-2' }}</span>
          </div>
          <a
            routerLink="/portal/wallet"
            class="px-4 py-3 rounded-2xl btn-cyan-gradient text-[#002625] font-black text-xs shadow-lg shadow-[#0BB4D2]/20 flex items-center space-x-1.5 active:scale-95 transition"
          >
            <span>📥 Deposit</span>
          </a>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- ACTIVE PLAN LIVE ROOM & REAL-TIME BINANCE CHART                           -->
      <!-- Displayed when user has at least one active subscription                  -->
      <!-- ========================================================================= -->
      <div *ngIf="activeSubscription() as sub" class="space-y-5">
        
        <!-- Multi-Active Plans Switcher Bar (if user has > 1 active plan) -->
        <div *ngIf="activeSubscriptions().length > 1" class="flex items-center space-x-2 text-xs font-bold overflow-x-auto no-scrollbar">
          <span class="text-slate-400 text-xs uppercase tracking-wider shrink-0 mr-1">Your Active Plans:</span>
          <button
            *ngFor="let s of activeSubscriptions()"
            type="button"
            (click)="selectSubscription(s)"
            class="px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition flex items-center space-x-2 whitespace-nowrap"
            [ngClass]="activeSubscription()?.id === s.id ? 'bg-[#0BB4D2] text-[#002625] border-[#0BB4D2] shadow-md' : 'bg-black/40 text-slate-300 border-white/10 hover:border-white/30'"
          >
            <span>{{ s.plan_name }}</span>
            <span class="font-black">\${{ s.current_value | number:'1.0-0' }}</span>
          </button>
        </div>

        <!-- Real-Time Metrics Header Card -->
        <div class="glass-panel p-5 sm:p-6 rounded-3xl border border-emerald-500/30 bg-[#002625]/90 space-y-4 shadow-xl">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <!-- Metric 1: Starting Capital -->
            <div class="space-y-0.5">
              <span class="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Starting Capital</span>
              <span class="text-lg sm:text-xl font-black text-white font-mono">\${{ sub.invested_amount | number:'1.2-2' }}</span>
              <span class="text-[10px] text-slate-500 block">Initial deposit</span>
            </div>

            <!-- Metric 2: Live Current Value -->
            <div class="space-y-0.5">
              <div class="flex items-center space-x-1.5">
                <span class="text-[10px] text-cyan-300 uppercase font-black tracking-wider block">Live Market Value</span>
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
              <span
                class="text-xl sm:text-2xl font-black font-mono transition-all duration-200 block"
                [ngClass]="planService.isPulsing() ? (planService.lastDelta() >= 0 ? 'text-emerald-400 scale-105' : 'text-rose-400 scale-105') : 'text-white'"
              >
                \${{ sub.current_value | number:'1.2-2' }}
              </span>
              <span class="text-[11px] font-mono font-bold" [ngClass]="sub.current_profit >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                {{ sub.current_profit >= 0 ? '+' : '' }}\${{ sub.current_profit | number:'1.2-2' }} ({{ sub.profit_percent }}%)
              </span>
            </div>

            <!-- Metric 3: Guaranteed Target Goal -->
            <div class="space-y-0.5">
              <span class="text-[10px] text-amber-300 uppercase font-black tracking-wider block">Guaranteed Target</span>
              <span class="text-lg sm:text-xl font-black text-amber-300 font-mono">\${{ sub.target_amount | number:'1.2-2' }}</span>
              <span class="text-[10px] text-emerald-400 font-bold block">+{{ sub.target_profit_percent }}% Net Target Gain</span>
            </div>

            <!-- Metric 4: Live Countdown Timer -->
            <div class="space-y-0.5">
              <span class="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Time Remaining</span>
              <span class="text-base sm:text-lg font-black text-cyan-300 font-mono block">
                {{ sub.countdown.formatted || (sub.duration_days + ' Days') }}
              </span>
              <div class="flex items-center space-x-1.5 text-[10px] text-slate-400">
                <span>Progress:</span>
                <strong class="text-white">{{ sub.progress_percent }}%</strong>
              </div>
            </div>

          </div>

          <!-- Progress Bar to Target -->
          <div class="space-y-1.5 pt-2 border-t border-white/10">
            <div class="flex items-center justify-between text-[11px]">
              <span class="text-slate-400 font-bold">Progress toward \${{ sub.target_amount | number:'1.0-0' }} Goal</span>
              <span class="text-cyan-300 font-mono font-black">{{ sub.progress_percent }}% Completed</span>
            </div>
            <div class="w-full h-2.5 rounded-full bg-black/50 overflow-hidden border border-white/10">
              <div
                class="h-full rounded-full bg-gradient-to-r from-[#003432] via-[#0284c7] to-[#0BB4D2] transition-all duration-500 shadow-lg shadow-[#0BB4D2]/40"
                [style.width.%]="sub.progress_percent"
              ></div>
            </div>
          </div>
        </div>

        <!-- Binance-Style Interactive Live Chart -->
        <app-plan-growth-chart [subscription]="sub"></app-plan-growth-chart>
      </div>

      <!-- ========================================================================= -->
      <!-- AVAILABLE PLANS CATALOG CARDS                                             -->
      <!-- ========================================================================= -->
      <div class="space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div>
            <h2 class="text-xl font-black text-white flex items-center space-x-2">
              <span>🌱</span>
              <span>Select an Institutional Growth Plan</span>
            </h2>
            <p class="text-xs text-slate-300">
              Every plan starts with the specified amount and is mathematically guaranteed to reach the target payout.
            </p>
          </div>
          <span class="text-xs font-bold text-cyan-300 font-mono">
            {{ planService.plans().length }} Plans Available
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            *ngFor="let p of planService.plans()"
            class="glass-panel p-6 rounded-3xl border border-white/10 hover:border-[#0BB4D2]/60 bg-[#002625]/80 space-y-5 shadow-xl transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between relative overflow-hidden group"
          >
            <!-- Top Card Header -->
            <div class="space-y-3">
              <div class="flex items-start justify-between">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#003432] text-cyan-300 border border-[#0BB4D2]/40">
                  {{ p.badge || (p.duration_days + ' Days') }}
                </span>
                <span class="text-2xl">{{ getPlanIcon(p.icon) }}</span>
              </div>

              <div>
                <h3 class="text-lg font-black text-white group-hover:text-cyan-300 transition-colors">{{ p.name }}</h3>
                <span class="text-[11px] font-bold text-slate-400">{{ p.risk_level }}</span>
              </div>

              <p class="text-xs text-slate-300 leading-relaxed min-h-[3rem]">
                {{ p.description }}
              </p>

              <!-- Numbers Breakdown Box -->
              <div class="p-3.5 rounded-2xl bg-[#001c1c] border border-white/10 space-y-2 font-mono text-xs">
                <div class="flex items-center justify-between">
                  <span class="text-slate-400 text-[11px] font-sans">Starting Deposit:</span>
                  <span class="font-bold text-white text-sm">\${{ p.initial_amount | number:'1.2-2' }}</span>
                </div>
                <div class="flex items-center justify-between border-t border-white/5 pt-1.5">
                  <span class="text-slate-400 text-[11px] font-sans">Guaranteed Target:</span>
                  <span class="font-black text-amber-300 text-sm">\${{ p.target_amount | number:'1.2-2' }}</span>
                </div>
                <div class="flex items-center justify-between border-t border-white/5 pt-1.5">
                  <span class="text-slate-400 text-[11px] font-sans">Duration:</span>
                  <span class="font-bold text-cyan-300 text-xs">{{ p.duration_days }} Days {{ p.duration_seconds < 86400 ? '(' + (p.duration_seconds / 60) + 'm demo)' : '' }}</span>
                </div>
                <div class="flex items-center justify-between border-t border-white/5 pt-1.5">
                  <span class="text-slate-400 text-[11px] font-sans">Target Gain:</span>
                  <span class="font-black text-emerald-400 text-xs">+{{ p.roi_percentage }}% (+\${{ p.net_profit | number:'1.0-0' }})</span>
                </div>
              </div>
            </div>

            <!-- Action Button -->
            <div class="pt-2">
              <button
                type="button"
                (click)="openSubscribeModal(p)"
                class="w-full py-3 rounded-2xl btn-cyan-gradient text-[#002625] font-black text-xs shadow-md shadow-[#0BB4D2]/20 hover:brightness-110 active:scale-95 transition flex items-center justify-center space-x-1.5"
              >
                <span>🚀 Select Plan (\${{ p.initial_amount | number:'1.0-0' }})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- COMPLETED PLANS HISTORY TABLE                                             -->
      <!-- ========================================================================= -->
      <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 bg-[#002625]/60 shadow-xl" *ngIf="completedSubscriptions().length > 0">
        <div class="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 class="text-sm font-bold text-white flex items-center space-x-2">
            <span>🏆</span>
            <span>Completed &amp; Settled Plan History</span>
          </h3>
          <span class="text-xs text-slate-400">Total Settled: {{ completedSubscriptions().length }}</span>
        </div>

        <div class="space-y-2.5">
          <div
            *ngFor="let s of completedSubscriptions()"
            class="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div class="flex items-center space-x-3">
              <div class="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black text-base border border-emerald-500/30">
                ✓
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <span class="font-bold text-white text-sm">{{ s.plan_name }}</span>
                  <span class="px-2 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    MATURED &amp; CREDITED
                  </span>
                </div>
                <span class="text-[11px] text-slate-400 font-mono">
                  Started: {{ s.start_date | date:'shortDate' }} &bull; Ended: {{ s.end_date | date:'shortDate' }}
                </span>
              </div>
            </div>

            <div class="flex items-center space-x-6 text-right font-mono">
              <div>
                <span class="text-[10px] text-slate-400 uppercase block font-sans">Initial</span>
                <span class="font-bold text-white">\${{ s.invested_amount | number:'1.2-2' }}</span>
              </div>
              <div>
                <span class="text-[10px] text-emerald-400 uppercase block font-sans">Payout Credited</span>
                <span class="font-black text-emerald-400 text-sm">+\${{ s.target_amount | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- CONFIRMATION & SUBSCRIPTION MODAL                                         -->
      <!-- ========================================================================= -->
      <div
        *ngIf="selectedPlanToSubscribe"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
      >
        <div class="glass-panel p-6 sm:p-7 rounded-3xl border border-white/15 bg-[#002625] max-w-md w-full space-y-5 shadow-2xl relative">
          <!-- Modal Header -->
          <div class="flex items-start justify-between border-b border-white/10 pb-3">
            <div>
              <span class="text-[10px] font-black uppercase tracking-wider text-cyan-300 block">Confirm Plan Activation</span>
              <h3 class="text-lg font-black text-white mt-0.5">{{ selectedPlanToSubscribe.name }}</h3>
            </div>
            <button
              type="button"
              (click)="selectedPlanToSubscribe = null"
              class="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 text-lg leading-none"
            >
              &times;
            </button>
          </div>

          <!-- Plan Details Summary -->
          <div class="p-4 rounded-2xl bg-[#001c1c] border border-white/10 space-y-2.5 font-mono text-xs">
            <div class="flex items-center justify-between">
              <span class="text-slate-400 font-sans">Starting Deposit Required:</span>
              <span class="font-bold text-white text-sm">\${{ selectedPlanToSubscribe.initial_amount | number:'1.2-2' }}</span>
            </div>
            <div class="flex items-center justify-between border-t border-white/5 pt-1.5">
              <span class="text-slate-400 font-sans">Guaranteed Target Payout:</span>
              <span class="font-black text-amber-300 text-sm">\${{ selectedPlanToSubscribe.target_amount | number:'1.2-2' }}</span>
            </div>
            <div class="flex items-center justify-between border-t border-white/5 pt-1.5">
              <span class="text-slate-400 font-sans">Duration:</span>
              <span class="font-bold text-cyan-300">{{ selectedPlanToSubscribe.duration_days }} Days</span>
            </div>
            <div class="flex items-center justify-between border-t border-white/5 pt-1.5">
              <span class="text-slate-400 font-sans">Projected Profit:</span>
              <span class="font-black text-emerald-400">+\${{ selectedPlanToSubscribe.net_profit | number:'1.2-2' }} (+{{ selectedPlanToSubscribe.roi_percentage }}%)</span>
            </div>
          </div>

          <!-- Balance Validation -->
          <div class="flex items-center justify-between text-xs px-1">
            <span class="text-slate-300">Your Available USD Balance:</span>
            <span class="font-mono font-bold" [ngClass]="hasSufficientBalance() ? 'text-emerald-400' : 'text-rose-400'">
              \${{ getUsdBalance() | number:'1.2-2' }}
            </span>
          </div>

          <!-- Insufficient Balance Warning -->
          <div *ngIf="!hasSufficientBalance()" class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <span>⚠️</span>
            <span>You need \${{ (selectedPlanToSubscribe.initial_amount - getUsdBalance()) | number:'1.2-2' }} more cash to start this plan.</span>
          </div>

          <!-- Actions -->
          <div class="flex items-center space-x-3 pt-2">
            <button
              type="button"
              (click)="selectedPlanToSubscribe = null"
              class="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs border border-white/10 transition"
            >
              Cancel
            </button>

            <button
              *ngIf="hasSufficientBalance()"
              type="button"
              [disabled]="subscribing()"
              (click)="confirmSubscription()"
              class="flex-1 py-3 rounded-xl btn-cyan-gradient text-[#002625] font-black text-xs shadow-md shadow-[#0BB4D2]/25 active:scale-95 transition disabled:opacity-50"
            >
              {{ subscribing() ? 'Activating...' : 'Confirm & Start Plan' }}
            </button>

            <a
              *ngIf="!hasSufficientBalance()"
              routerLink="/portal/wallet"
              (click)="selectedPlanToSubscribe = null"
              class="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#002625] font-black text-xs text-center shadow-md active:scale-95 transition"
            >
              Deposit Funds &rarr;
            </a>
          </div>
        </div>
      </div>

    </div>
  `
})
export class PlansComponent implements OnInit {
  planService = inject(PlanService);
  walletService = inject(WalletService);
  toast = inject(ToastService);

  selectedPlanToSubscribe: GrowthPlan | null = null;
  subscribing = signal<boolean>(false);

  activeSubscriptions = computed(() =>
    this.planService.subscriptions().filter(s => s.status === 'ACTIVE')
  );

  completedSubscriptions = computed(() =>
    this.planService.subscriptions().filter(s => s.status === 'COMPLETED')
  );

  activeSubscription = computed(() =>
    this.planService.activeSubscription()
  );

  usdBalance = signal<number>(0);

  ngOnInit() {
    this.planService.loadPlans();
    this.planService.loadMySubscriptions();
    this.loadBalance();
  }

  loadBalance() {
    this.walletService.getPortfolio().subscribe({
      next: (res) => {
        if (res.success && res.data?.wallets) {
          const usdWallet = res.data.wallets.find(w => w.asset_symbol === 'USD');
          this.usdBalance.set(usdWallet ? parseFloat(String(usdWallet.balance)) : 0);
        }
      },
      error: () => {}
    });
  }

  getPlanIcon(icon?: string): string {
    const map: Record<string, string> = {
      'bolt': '⚡',
      'rocket': '🚀',
      'chart-line': '📈',
      'gem': '💎',
      'crown': '👑',
      'fire': '🔥',
      'target': '🎯'
    };
    return (icon && map[icon]) ? map[icon] : (icon || '📈');
  }

  getUsdBalance(): number {
    return this.usdBalance();
  }

  hasSufficientBalance(): boolean {
    if (!this.selectedPlanToSubscribe) return false;
    return this.getUsdBalance() >= this.selectedPlanToSubscribe.initial_amount;
  }

  selectSubscription(sub: UserSubscription) {
    this.planService.activeSubscription.set(sub);
  }

  openSubscribeModal(plan: GrowthPlan) {
    this.selectedPlanToSubscribe = plan;
  }

  confirmSubscription() {
    if (!this.selectedPlanToSubscribe || this.subscribing()) return;

    this.subscribing.set(true);
    this.planService.subscribe(this.selectedPlanToSubscribe.id).subscribe({
      next: (res) => {
        this.subscribing.set(false);
        this.selectedPlanToSubscribe = null;
        this.toast.success(res.message || 'Growth plan activated successfully!');
        this.planService.loadMySubscriptions();
        this.loadBalance();
      },
      error: (err) => {
        this.subscribing.set(false);
        this.toast.error(err.error?.error || 'Failed to activate plan.');
      }
    });
  }
}
