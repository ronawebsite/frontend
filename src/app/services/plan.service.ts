import { Injectable, inject, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { GrowthPlan, UserSubscription, PlanCandleTick } from '../core/models/fintech.models';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { WalletService } from './wallet.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private walletService = inject(WalletService);
  private socket!: Socket;

  plans = signal<GrowthPlan[]>([]);
  subscriptions = signal<UserSubscription[]>([]);
  activeSubscription = signal<UserSubscription | null>(null);
  selectedSubscription = signal<UserSubscription | null>(null);

  // Live real-time tick signal
  latestCandleTick = signal<PlanCandleTick | null>(null);
  isPulsing = signal<boolean>(false);
  lastDelta = signal<number>(0);

  constructor() {
    this.initSocket();
    this.loadPlans();
    this.loadMySubscriptions();

    // Re-join user room when auth user changes
    effect(() => {
      const user = this.authService.currentUser();
      if (user && this.socket) {
        this.socket.emit('user:join', user.id);
        this.loadMySubscriptions();
      }
    });
  }

  private initSocket() {
    try {
      this.socket = io(environment.wsUrl, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 10
      });

      const user = this.authService.currentUser();
      if (user) {
        this.socket.emit('user:join', user.id);
      }

      // Listen for real-time price fluctuation ticks from PlanEngine
      this.socket.on('plan:tick', (payload: any) => {
        this.handlePlanTick(payload);
      });

      // Listen for plan completion settlement events
      this.socket.on('plan:completed', (payload: any) => {
        this.handlePlanCompleted(payload);
      });
    } catch (err) {
      console.warn('[PlanService] WebSocket connection notice:', err);
    }
  }

  private handlePlanTick(payload: any) {
    if (!payload || !payload.investment_id) return;

    // Trigger visual pulse
    this.lastDelta.set(payload.delta || 0);
    this.isPulsing.set(true);
    setTimeout(() => this.isPulsing.set(false), 700);

    // Update in-memory subscriptions list
    this.subscriptions.update(list =>
      list.map(sub => {
        if (sub.id === payload.investment_id) {
          const S0 = sub.invested_amount;
          const current = payload.current_value;
          return {
            ...sub,
            current_value: current,
            current_profit: payload.current_profit,
            profit_percent: S0 > 0 ? parseFloat((((current - S0) / S0) * 100).toFixed(2)) : 0,
            progress_percent: payload.progress_percent !== undefined ? payload.progress_percent : sub.progress_percent,
            countdown: payload.countdown || sub.countdown
          };
        }
        return sub;
      })
    );

    // If currently selected or active matches this subscription
    const currentActive = this.activeSubscription();
    if (currentActive && currentActive.id === payload.investment_id) {
      this.activeSubscription.update(sub => {
        if (!sub) return null;
        return {
          ...sub,
          current_value: payload.current_value,
          current_profit: payload.current_profit,
          profit_percent: sub.invested_amount > 0 ? parseFloat((((payload.current_value - sub.invested_amount) / sub.invested_amount) * 100).toFixed(2)) : 0,
          progress_percent: payload.progress_percent !== undefined ? payload.progress_percent : sub.progress_percent,
          countdown: payload.countdown || sub.countdown
        };
      });
    }

    // Emit candle update for chart series
    if (payload.candle) {
      this.latestCandleTick.set(payload.candle);
    }
  }

  private handlePlanCompleted(payload: any) {
    if (!payload || !payload.investment_id) return;

    this.toast.success(payload.message || `🎉 Plan "${payload.plan_name}" matured! $${payload.target_amount} credited to cash balance!`);

    // Mark as completed
    this.subscriptions.update(list =>
      list.map(sub => {
        if (sub.id === payload.investment_id) {
          return {
            ...sub,
            current_value: payload.target_amount,
            current_profit: payload.net_profit,
            status: 'COMPLETED',
            payout_credited: 1,
            progress_percent: 100,
            countdown: { ...sub.countdown, formatted: 'Matured & Settled', remaining_seconds: 0 }
          };
        }
        return sub;
      })
    );

    // Refresh user subscriptions so state updates instantly on UI
    this.loadMySubscriptions();
  }

  // ==========================================
  // USER METHODS
  // ==========================================

  loadPlans() {
    this.http.get<{ success: boolean; data: GrowthPlan[] }>(`${environment.apiUrl}/plans`).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.plans.set(res.data);
        }
      },
      error: (err) => console.error('[PlanService] Failed to load plans:', err)
    });
  }

  loadMySubscriptions() {
    this.http.get<{ success: boolean; data: UserSubscription[] }>(`${environment.apiUrl}/plans/my-subscriptions`).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.subscriptions.set(res.data);
          // Set first active subscription as active view by default
          const active = res.data.find(s => s.status === 'ACTIVE') || res.data[0] || null;
          this.activeSubscription.set(active);
          this.selectedSubscription.set(active);
        }
      },
      error: (err) => console.error('[PlanService] Failed to load user subscriptions:', err)
    });
  }

  getSubscriptionCandles(id: number): Observable<{ success: boolean; data: PlanCandleTick[] }> {
    return this.http.get<{ success: boolean; data: PlanCandleTick[] }>(
      `${environment.apiUrl}/plans/subscription/${id}/candles`
    );
  }

  subscribe(planId: number, customAmount?: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/plans/subscribe`, {
      plan_id: planId,
      custom_amount: customAmount
    });
  }

  // ==========================================
  // ADMIN METHODS
  // ==========================================

  adminGetAllPlans(): Observable<{ success: boolean; data: GrowthPlan[] }> {
    return this.http.get<{ success: boolean; data: GrowthPlan[] }>(`${environment.apiUrl}/plans/admin/all-plans`);
  }

  adminCreatePlan(data: Partial<GrowthPlan>): Observable<any> {
    return this.http.post(`${environment.apiUrl}/plans/admin/create-plan`, data);
  }

  adminUpdatePlan(id: number, data: Partial<GrowthPlan>): Observable<any> {
    return this.http.put(`${environment.apiUrl}/plans/admin/update-plan/${id}`, data);
  }

  adminDeletePlan(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/plans/admin/delete-plan/${id}`);
  }

  adminGetSubscriptions(): Observable<{ success: boolean; data: UserSubscription[] }> {
    return this.http.get<{ success: boolean; data: UserSubscription[] }>(`${environment.apiUrl}/plans/admin/subscriptions`);
  }

  adminForceComplete(id: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/plans/admin/force-complete/${id}`, {});
  }

  adminFastForward(id: number, seconds: number = 86400): Observable<any> {
    return this.http.post(`${environment.apiUrl}/plans/admin/fast-forward/${id}`, { seconds });
  }

  adminNudgeValue(id: number, delta: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/plans/admin/nudge/${id}`, { delta });
  }
}
