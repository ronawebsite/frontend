import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { TradingBot, UserBot, BacktestResult } from '../core/models/fintech.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BotService {
  private http = inject(HttpClient);

  getAvailableBots(): Observable<{ success: boolean; data: TradingBot[] }> {
    return this.http.get<{ success: boolean; data: TradingBot[] }>(`${environment.apiUrl}/bots/available`);
  }

  getMyBots(): Observable<{ success: boolean; data: UserBot[] }> {
    return this.http.get<{ success: boolean; data: UserBot[] }>(`${environment.apiUrl}/bots/my-bots`);
  }

  createBot(botData: {
    bot_id: number;
    pair: string;
    allocated_capital: number;
    strategy_params?: any;
  }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/bots/create`, botData);
  }

  toggleBotStatus(id: number, status: 'running' | 'paused'): Observable<any> {
    return this.http.patch<any>(`${environment.apiUrl}/bots/${id}/status`, { status });
  }

  terminateBot(id: number): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/bots/${id}/terminate`, {});
  }

  backtest(params: { strategy_type: string; pair: string; capital: number; days: number }): Observable<{ success: boolean; data: BacktestResult }> {
    return this.http.post<{ success: boolean; data: BacktestResult }>(`${environment.apiUrl}/bots/backtest`, params);
  }

  getBotTradeLogs(id: number): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${environment.apiUrl}/bots/${id}/logs`);
  }
}
