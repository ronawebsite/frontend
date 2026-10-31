import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { Trade, Position } from '../core/models/fintech.models';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TradeService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private socket!: Socket;

  managedTrades = signal<any[]>([]);
  activePrompts = signal<any[]>([]);
  latestPrompt = signal<any | null>(null);
  latestUpdate = signal<{
    type: string;
    trade: any;
    delta?: number;
    current_profit?: number;
    outcome?: string;
    message?: string;
    timestamp: number;
  } | null>(null);

  constructor() {
    this.initSocket();
    this.loadInitialManagedTrades();
    this.loadInitialPrompts();
  }

  private initSocket() {
    try {
      this.socket = io(environment.wsUrl, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 10
      });

      // Join user room when auth user exists
      const user = this.authService.currentUser();
      if (user) {
        this.socket.emit('user:join', user.id);
      }

      // Handle personal managed trade notifications
      this.socket.on('trade:managed_update', (payload: any) => {
        this.handleTradeUpdate(payload);
      });

      // Handle real-time broker directive / top-up prompt
      this.socket.on('broker:prompt', (payload: any) => {
        if (payload?.prompt) {
          this.latestPrompt.set(payload.prompt);
          this.activePrompts.update(prev => [payload.prompt, ...prev.filter(p => p.id !== payload.prompt.id)]);
        }
      });

      // Handle broadcast updates
      this.socket.on('trade:managed_broadcast', (payload: any) => {
        if (payload?.trade) {
          const user = this.authService.currentUser();
          if (user && payload.trade.user_id === user.id) {
            this.handleTradeUpdate({
              type: 'BROADCAST_SYNC',
              trade: payload.trade,
              current_profit: payload.trade.current_profit,
              outcome: payload.trade.target_outcome
            });
          }
        }
      });
    } catch (err) {
      console.warn('[TradeService] Socket connection notice:', err);
    }
  }

  joinUserRoom(userId: number) {
    if (this.socket && userId) {
      this.socket.emit('user:join', userId);
    }
  }

  private handleTradeUpdate(payload: any) {
    if (!payload?.trade) return;

    this.latestUpdate.set({
      ...payload,
      timestamp: Date.now()
    });

    this.managedTrades.update(current => {
      const idx = current.findIndex(t => t.id === payload.trade.id);
      if (idx >= 0) {
        const copy = [...current];
        copy[idx] = { ...copy[idx], ...payload.trade };
        return copy;
      } else {
        return [payload.trade, ...current];
      }
    });
  }

  loadInitialManagedTrades() {
    if (this.authService.isAuthenticated()) {
      this.getManagedTrades().subscribe({
        next: (res) => {
          if (res.success && Array.isArray(res.data)) {
            this.managedTrades.set(res.data);
          }
        },
        error: () => {}
      });
    }
  }

  loadInitialPrompts() {
    if (this.authService.isAuthenticated()) {
      this.getUserPrompts().subscribe({
        next: (res) => {
          if (res.success && Array.isArray(res.data)) {
            this.activePrompts.set(res.data);
            if (res.data.length > 0) {
              this.latestPrompt.set(res.data[0]);
            }
          }
        },
        error: () => {}
      });
    }
  }

  getUserPrompts(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${environment.apiUrl}/trade/prompts`);
  }

  dismissUserPrompt(id: number): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/trade/prompts/${id}/dismiss`, {});
  }

  dismissPromptLocally(id: number) {
    this.dismissUserPrompt(id).subscribe({
      next: () => {
        this.activePrompts.update(list => list.filter(p => p.id !== id));
        if (this.latestPrompt()?.id === id) {
          const remaining = this.activePrompts();
          this.latestPrompt.set(remaining.length > 0 ? remaining[0] : null);
        }
      },
      error: () => {
        // Optimistically dismiss
        this.activePrompts.update(list => list.filter(p => p.id !== id));
        if (this.latestPrompt()?.id === id) {
          const remaining = this.activePrompts();
          this.latestPrompt.set(remaining.length > 0 ? remaining[0] : null);
        }
      }
    });
  }

  closeLatestPromptBanner() {
    this.latestPrompt.set(null);
  }

  getManagedTrades(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${environment.apiUrl}/trade/managed`);
  }

  placeOrder(order: {
    pair: string;
    side: 'BUY' | 'SELL';
    order_type: 'MARKET' | 'LIMIT';
    price?: number;
    amount: number;
  }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/trade/order`, order);
  }

  getOpenOrders(): Observable<{ success: boolean; data: Trade[] }> {
    return this.http.get<{ success: boolean; data: Trade[] }>(`${environment.apiUrl}/trade/orders/open`);
  }

  getOrderHistory(): Observable<{ success: boolean; data: Trade[] }> {
    return this.http.get<{ success: boolean; data: Trade[] }>(`${environment.apiUrl}/trade/orders/history`);
  }

  cancelOrder(orderId: number): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/trade/orders/${orderId}`);
  }

  getPositions(): Observable<{ success: boolean; data: Position[] }> {
    return this.http.get<{ success: boolean; data: Position[] }>(`${environment.apiUrl}/trade/positions`);
  }
}
