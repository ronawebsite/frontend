import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PlanService } from '../../../services/plan.service';
import { ToastService } from '../../../services/toast.service';
import { GrowthPlan, UserSubscription } from '../../../core/models/fintech.models';

@Component({
  selector: 'app-admin-plan-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-8 font-nunito text-slate-100 selection:bg-purple-500 selection:text-white">
      
      <!-- ========================================================================= -->
      <!-- TOP BANNER                                                                -->
      <!-- ========================================================================= -->
      <div class="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#002625] via-[#1e1435] to-[#071318] border border-purple-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="space-y-1.5">
          <div class="flex items-center space-x-2">
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span class="text-xs font-black uppercase tracking-wider text-purple-300">Senior Broker Desk</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Guaranteed Target Engine
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Growth Plans &amp; Client Target Settlement Controller
          </h1>
          <p class="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Create plans where initial amounts grow to target amounts in specified days with real-time fluctuations. Inspect active client subscriptions, nudge values, or trigger instant settlement.
          </p>
        </div>

        <!-- Quick Metrics -->
        <div class="flex items-center space-x-3 shrink-0">
          <div class="px-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-center min-w-[100px]">
            <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Active Plans</span>
            <span class="text-lg font-black text-white font-mono">{{ allPlans().length }}</span>
          </div>
          <div class="px-4 py-2.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-center min-w-[120px]">
            <span class="text-[10px] uppercase font-bold text-purple-300 tracking-wider block">Subscriptions</span>
            <span class="text-lg font-black text-emerald-400 font-mono">{{ clientSubscriptions().length }}</span>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- TAB NAVIGATION                                                            -->
      <!-- ========================================================================= -->
      <div class="flex border-b border-white/10 space-x-4 text-xs font-bold">
        <button
          type="button"
          (click)="activeTab = 'subscriptions'"
          class="pb-3 px-2 border-b-2 transition flex items-center space-x-2"
          [ngClass]="activeTab === 'subscriptions' ? 'border-[#0BB4D2] text-[#0BB4D2] font-black' : 'border-transparent text-slate-400 hover:text-white'"
        >
          <span>👥</span>
          <span>Active Client Subscriptions ({{ getActiveSubscriptionCount() }})</span>
        </button>

        <button
          type="button"
          (click)="activeTab = 'catalog'"
          class="pb-3 px-2 border-b-2 transition flex items-center space-x-2"
          [ngClass]="activeTab === 'catalog' ? 'border-purple-400 text-purple-300 font-black' : 'border-transparent text-slate-400 hover:text-white'"
        >
          <span>⚙️</span>
          <span>Plan Catalog &amp; Rules Settings</span>
        </button>
      </div>

      <!-- ========================================================================= -->
      <!-- TAB 1: ACTIVE CLIENT SUBSCRIPTIONS INSPECTOR                              -->
      <!-- ========================================================================= -->
      <div *ngIf="activeTab === 'subscriptions'" class="space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-black text-white flex items-center space-x-2">
              <span>📡</span>
              <span>Live Client Plan Subscriptions</span>
            </h2>
            <p class="text-xs text-slate-300">
              Real-time monitoring of all client investments fluctuating towards target settlement.
            </p>
          </div>
          <button
            type="button"
            (click)="loadSubscriptions()"
            class="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 transition"
          >
            ↻ Refresh
          </button>
        </div>

        <!-- Empty State -->
        <div *ngIf="clientSubscriptions().length === 0" class="glass-panel p-12 text-center rounded-3xl border border-white/10 space-y-2 bg-[#002625]/40">
          <div class="text-3xl">👥</div>
          <h3 class="text-base font-bold text-white">No Active Subscriptions Yet</h3>
          <p class="text-xs text-slate-400">When clients subscribe to a growth plan, their real-time progress appears here.</p>
        </div>

        <!-- Subscriptions Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5" *ngIf="clientSubscriptions().length > 0">
          <div
            *ngFor="let s of clientSubscriptions()"
            class="glass-panel p-5 sm:p-6 rounded-3xl border space-y-4 shadow-xl relative transition-all"
            [ngClass]="s.status === 'ACTIVE' ? 'border-[#0BB4D2]/40 bg-[#002625]/80' : 'border-emerald-500/30 bg-[#002625]/50'"
          >
            <!-- Header -->
            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center space-x-2">
                  <span class="text-sm font-black text-white">{{ s.plan_name }}</span>
                  <span
                    class="px-2 py-0.2 rounded text-[9px] font-black uppercase"
                    [ngClass]="s.status === 'ACTIVE' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'"
                  >
                    {{ s.status }}
                  </span>
                </div>
                <div class="text-xs text-slate-400 mt-0.5">
                  Client: <strong class="text-white">{{ s.user_name || 'Investor' }}</strong> ({{ s.user_email }})
                </div>
              </div>

              <span class="font-mono text-xs text-slate-400">ID #{{ s.id }}</span>
            </div>

            <!-- Numbers Grid -->
            <div class="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-[#001c1c] border border-white/10 text-xs font-mono">
              <div>
                <span class="text-[10px] text-slate-400 font-sans block">Starting</span>
                <span class="font-bold text-white">\${{ s.invested_amount | number:'1.2-2' }}</span>
              </div>
              <div>
                <span class="text-[10px] text-cyan-300 font-sans block">Live Value</span>
                <span class="font-black text-cyan-300 text-sm">\${{ s.current_value | number:'1.2-2' }}</span>
              </div>
              <div>
                <span class="text-[10px] text-amber-300 font-sans block">Target Goal</span>
                <span class="font-black text-amber-300 text-sm">\${{ s.target_amount | number:'1.2-2' }}</span>
              </div>
            </div>

            <!-- Progress Bar & Dates -->
            <div class="space-y-1">
              <div class="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>{{ s.start_date | date:'shortDate' }}</span>
                <span class="text-cyan-300 font-bold">{{ s.progress_percent || 0 }}% completed</span>
                <span>{{ s.end_date | date:'shortDate' }}</span>
              </div>
              <div class="w-full h-2 rounded-full bg-black/60 overflow-hidden border border-white/10">
                <div
                  class="h-full rounded-full bg-gradient-to-r from-[#003432] via-[#0284c7] to-[#0BB4D2]"
                  [style.width.%]="s.progress_percent || 0"
                ></div>
              </div>
            </div>

            <!-- Admin Action Controls (Active Only) -->
            <div class="pt-2 border-t border-white/10 space-y-2" *ngIf="s.status === 'ACTIVE'">
              <div class="text-[10px] uppercase font-bold text-purple-300 tracking-wider">
                ⚡ Supervisor Real-Time Actions
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <!-- Nudge +100 -->
                <button
                  type="button"
                  (click)="nudgeValue(s.id, 100)"
                  class="py-2 px-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition active:scale-95 flex items-center justify-center space-x-1"
                  title="Nudge client price up by $100 immediately"
                >
                  <span>📈</span>
                  <span>+$100 Nudge</span>
                </button>

                <!-- Fast-Forward 1 Day -->
                <button
                  type="button"
                  (click)="fastForward(s.id, 86400)"
                  class="py-2 px-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 text-xs font-bold transition active:scale-95 flex items-center justify-center space-x-1"
                  title="Advance time by 1 day for presentation demo"
                >
                  <span>⏩</span>
                  <span>+1 Day Demo</span>
                </button>

                <!-- Force Complete -->
                <button
                  type="button"
                  (click)="forceComplete(s.id)"
                  class="py-2 px-2.5 rounded-xl btn-cyan-gradient text-[#002625] font-black text-xs shadow-md active:scale-95 transition flex items-center justify-center space-x-1 col-span-2 sm:col-span-1"
                  title="Instantly settles the plan to full target amount and credits client cash balance"
                >
                  <span>✨</span>
                  <span>Force Complete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- TAB 2: PLAN CATALOG & SETTINGS MANAGER                                    -->
      <!-- ========================================================================= -->
      <div *ngIf="activeTab === 'catalog'" class="space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-black text-white flex items-center space-x-2">
              <span>🌱</span>
              <span>Growth Plan Rule Definitions</span>
            </h2>
            <p class="text-xs text-slate-300">
              Configure initial amounts, target payouts, and durations in days.
            </p>
          </div>

          <button
            type="button"
            (click)="openCreateModal()"
            class="px-4 py-2.5 rounded-2xl btn-cyan-gradient text-[#002625] font-black text-xs shadow-md flex items-center space-x-1.5 active:scale-95 transition"
          >
            <span>+ Create New Plan</span>
          </button>
        </div>

        <!-- Plans Table -->
        <div class="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-xl bg-[#002625]/80">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs font-sans">
              <thead class="bg-[#001c1c] text-slate-400 font-mono text-[10px] uppercase border-b border-white/10">
                <tr>
                  <th class="p-4">Plan Name &amp; Badge</th>
                  <th class="p-4">Starting Deposit</th>
                  <th class="p-4">Target Payout</th>
                  <th class="p-4">Duration</th>
                  <th class="p-4">ROI %</th>
                  <th class="p-4">Status</th>
                  <th class="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr *ngFor="let p of allPlans()" class="hover:bg-white/5 transition">
                  <td class="p-4">
                    <div class="font-bold text-white text-sm">{{ p.name }}</div>
                    <span class="text-[10px] text-cyan-300 font-mono">{{ p.badge || p.risk_level }}</span>
                  </td>
                  <td class="p-4 font-mono font-bold text-white">\${{ p.initial_amount | number:'1.2-2' }}</td>
                  <td class="p-4 font-mono font-black text-amber-300">\${{ p.target_amount | number:'1.2-2' }}</td>
                  <td class="p-4 font-mono font-bold text-cyan-300">
                    {{ p.duration_days }} Days
                    <span *ngIf="p.duration_seconds < 86400" class="text-amber-400 text-[10px] block">({{ p.duration_seconds / 60 }}m demo)</span>
                  </td>
                  <td class="p-4 font-mono font-bold text-emerald-400">+{{ p.roi_percentage }}%</td>
                  <td class="p-4">
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                      [ngClass]="p.is_active ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-700 text-slate-400'"
                    >
                      {{ p.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="p-4 text-right space-x-2">
                    <button
                      type="button"
                      (click)="openEditModal(p)"
                      class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-bold transition"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      (click)="deletePlan(p.id)"
                      class="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition"
                    >
                      Deactivate
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- CREATE / EDIT PLAN MODAL                                                  -->
      <!-- ========================================================================= -->
      <div
        *ngIf="showPlanModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"
      >
        <div class="glass-panel p-6 sm:p-7 rounded-3xl border border-white/15 bg-[#002625] max-w-lg w-full space-y-5 shadow-2xl relative">
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 class="text-base font-black text-white">
              {{ editingPlanId ? 'Edit Growth Plan' : 'Create New Institutional Growth Plan' }}
            </h3>
            <button
              type="button"
              (click)="showPlanModal = false"
              class="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 text-lg leading-none"
            >
              &times;
            </button>
          </div>

          <!-- Form -->
          <form (ngSubmit)="savePlan()" class="space-y-4 text-xs">
            <div class="space-y-1.5">
              <label class="font-bold text-slate-300">Plan Name</label>
              <input
                type="text"
                [(ngModel)]="planForm.name"
                name="name"
                required
                placeholder="e.g. Gold Wealth Accumulator"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-white focus:outline-none focus:border-[#0BB4D2]"
              />
            </div>

            <div class="space-y-1.5">
              <label class="font-bold text-slate-300">Description</label>
              <textarea
                rows="2"
                [(ngModel)]="planForm.description"
                name="description"
                placeholder="Brief layman summary of strategy"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-white focus:outline-none focus:border-[#0BB4D2]"
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-3 font-mono">
              <div class="space-y-1.5">
                <label class="font-sans font-bold text-slate-300 text-xs">Starting Deposit ($)</label>
                <input
                  type="number"
                  step="any"
                  [(ngModel)]="planForm.initial_amount"
                  name="initial_amount"
                  required
                  class="w-full px-3.5 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-white font-bold focus:outline-none focus:border-[#0BB4D2]"
                />
              </div>

              <div class="space-y-1.5">
                <label class="font-sans font-bold text-slate-300 text-xs">Guaranteed Target ($)</label>
                <input
                  type="number"
                  step="any"
                  [(ngModel)]="planForm.target_amount"
                  name="target_amount"
                  required
                  class="w-full px-3.5 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-amber-300 font-bold focus:outline-none focus:border-[#0BB4D2]"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="font-bold text-slate-300">Duration (Days)</label>
                <input
                  type="number"
                  [(ngModel)]="planForm.duration_days"
                  name="duration_days"
                  required
                  class="w-full px-3.5 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-cyan-300 font-mono font-bold focus:outline-none focus:border-[#0BB4D2]"
                />
              </div>

              <div class="space-y-1.5">
                <label class="font-bold text-slate-300">Demo Seconds (Optional)</label>
                <input
                  type="number"
                  [(ngModel)]="planForm.duration_seconds"
                  name="duration_seconds"
                  placeholder="e.g. 300 for 5 mins"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-slate-300 font-mono focus:outline-none focus:border-[#0BB4D2]"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <label class="font-bold text-slate-300">Risk Level</label>
                <select
                  [(ngModel)]="planForm.risk_level"
                  name="risk_level"
                  class="w-full px-3 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-white focus:outline-none focus:border-[#0BB4D2]"
                >
                  <option value="Conservative">Conservative</option>
                  <option value="Balanced Growth">Balanced Growth</option>
                  <option value="Institutional Elite">Institutional Elite</option>
                  <option value="Demo Fast-Track">Demo Fast-Track</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="font-bold text-slate-300">Badge Label</label>
                <input
                  type="text"
                  [(ngModel)]="planForm.badge"
                  name="badge"
                  placeholder="e.g. Popular, High Yield"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-white focus:outline-none focus:border-[#0BB4D2]"
                />
              </div>
            </div>

            <div class="flex items-center space-x-3 pt-3">
              <button
                type="button"
                (click)="showPlanModal = false"
                class="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold border border-white/10 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="flex-1 py-3 rounded-xl btn-cyan-gradient text-[#002625] font-black shadow-md active:scale-95 transition"
              >
                {{ editingPlanId ? 'Save Changes' : 'Create Plan' }}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `
})
export class PlanManagerComponent implements OnInit {
  planService = inject(PlanService);
  toast = inject(ToastService);

  activeTab: 'subscriptions' | 'catalog' = 'subscriptions';
  allPlans = signal<GrowthPlan[]>([]);
  clientSubscriptions = signal<UserSubscription[]>([]);

  showPlanModal = false;
  editingPlanId: number | null = null;
  planForm: any = {
    name: '',
    description: '',
    initial_amount: 1000,
    target_amount: 2500,
    duration_days: 7,
    duration_seconds: null,
    risk_level: 'Balanced Growth',
    badge: 'Popular',
    icon: '⚡',
    color: 'teal'
  };

  ngOnInit() {
    this.loadPlans();
    this.loadSubscriptions();
  }

  loadPlans() {
    this.planService.adminGetAllPlans().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.allPlans.set(res.data);
        }
      },
      error: (err) => console.error('Failed to load plans:', err)
    });
  }

  loadSubscriptions() {
    this.planService.adminGetSubscriptions().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.clientSubscriptions.set(res.data);
        }
      },
      error: (err) => console.error('Failed to load subscriptions:', err)
    });
  }

  getActiveSubscriptionCount(): number {
    return this.clientSubscriptions().filter(s => s.status === 'ACTIVE').length;
  }

  forceComplete(id: number) {
    if (!confirm(`Are you sure you want to force complete and settle Plan #${id} to the guaranteed target amount?`)) return;

    this.planService.adminForceComplete(id).subscribe({
      next: (res) => {
        this.toast.success(res.message);
        this.loadSubscriptions();
      },
      error: (err) => this.toast.error(err.error?.error || 'Failed to complete plan')
    });
  }

  fastForward(id: number, seconds: number = 86400) {
    this.planService.adminFastForward(id, seconds).subscribe({
      next: (res) => {
        this.toast.success(res.message);
        this.loadSubscriptions();
      },
      error: (err) => this.toast.error(err.error?.error || 'Failed to fast forward')
    });
  }

  nudgeValue(id: number, delta: number) {
    this.planService.adminNudgeValue(id, delta).subscribe({
      next: (res) => {
        this.toast.success(res.message);
        this.loadSubscriptions();
      },
      error: (err) => this.toast.error(err.error?.error || 'Failed to nudge value')
    });
  }

  openCreateModal() {
    this.editingPlanId = null;
    this.planForm = {
      name: '',
      description: '',
      initial_amount: 1000,
      target_amount: 2500,
      duration_days: 7,
      duration_seconds: null,
      risk_level: 'Balanced Growth',
      badge: 'Popular',
      icon: '⚡',
      color: 'teal'
    };
    this.showPlanModal = true;
  }

  openEditModal(plan: GrowthPlan) {
    this.editingPlanId = plan.id;
    this.planForm = {
      name: plan.name,
      description: plan.description,
      initial_amount: plan.initial_amount,
      target_amount: plan.target_amount,
      duration_days: plan.duration_days,
      duration_seconds: plan.duration_seconds,
      risk_level: plan.risk_level,
      badge: plan.badge,
      icon: plan.icon || '📈',
      color: plan.color || 'teal',
      is_active: plan.is_active
    };
    this.showPlanModal = true;
  }

  deletePlan(id: number) {
    if (!confirm('Are you sure you want to deactivate this plan?')) return;
    this.planService.adminDeletePlan(id).subscribe({
      next: (res) => {
        this.toast.success('Plan deactivated successfully');
        this.loadPlans();
      },
      error: (err) => this.toast.error(err.error?.error || 'Failed to deactivate plan')
    });
  }

  savePlan() {
    if (this.editingPlanId) {
      this.planService.adminUpdatePlan(this.editingPlanId, this.planForm).subscribe({
        next: (res) => {
          this.toast.success(res.message);
          this.showPlanModal = false;
          this.loadPlans();
        },
        error: (err) => this.toast.error(err.error?.error || 'Failed to update plan')
      });
    } else {
      this.planService.adminCreatePlan(this.planForm).subscribe({
        next: (res) => {
          this.toast.success(res.message);
          this.showPlanModal = false;
          this.loadPlans();
        },
        error: (err) => this.toast.error(err.error?.error || 'Failed to create plan')
      });
    }
  }
}
