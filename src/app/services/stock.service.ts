import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { StockTicker, StockPortfolio, StockPosition, StockBotTemplate } from '../core/models/stock.models';
import { OrderBook, Candle } from '../core/models/fintech.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private http = inject(HttpClient);
  private socket!: Socket;

  tickers = signal<StockTicker[]>([]);
  activePair = signal<string>('AAPL/USD');
  orderBook = signal<OrderBook | null>(null);

  // Active market hub state ('crypto' vs 'stocks')
  marketMode = signal<'crypto' | 'stocks'>('stocks');

  selectedTicker = computed(() => {
    const pair = this.activePair();
    return this.tickers().find(t => t.pair === pair) || this.tickers()[0] || null;
  });

  getTicker(pair: string): StockTicker | undefined {
    return this.tickers().find(t => t.pair === pair);
  }

  constructor() {
    this.initSavedMarketMode();
    this.initSocketConnection();
    this.fetchInitialMarkets();
  }

  private initSavedMarketMode() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('fichain_market_mode') as 'crypto' | 'stocks';
      if (saved === 'crypto' || saved === 'stocks') {
        this.marketMode.set(saved);
      }
    }
  }

  setMarketMode(mode: 'crypto' | 'stocks') {
    this.marketMode.set(mode);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('fichain_market_mode', mode);
    }
  }

  private initSocketConnection() {
    try {
      this.socket = io(environment.wsUrl, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 10
      });

      this.socket.on('stock:snapshot', (snapshot: StockTicker[]) => {
        if (Array.isArray(snapshot)) {
          this.tickers.set(snapshot);
        }
      });

      this.socket.on('stock:ticker', (tick: StockTicker) => {
        this.tickers.update(current => {
          const index = current.findIndex(t => t.pair === tick.pair);
          if (index >= 0) {
            const updated = [...current];
            updated[index] = tick;
            return updated;
          } else {
            return [...current, tick];
          }
        });
      });

      this.socket.on('stock:orderbook', (book: OrderBook) => {
        if (book && book.pair === this.activePair()) {
          this.orderBook.set(book);
        }
      });
    } catch (e) {
      console.warn('Socket.IO connection could not be established directly for stocks:', e);
    }
  }

  fetchInitialMarkets() {
    this.http.get<{ success: boolean; data: StockTicker[] }>(`${environment.apiUrl}/stocks/markets`).subscribe({
      next: (res) => {
        if (res.success && Array.isArray(res.data)) {
          this.tickers.set(res.data);
        }
      },
      error: (err) => console.error('Failed to fetch initial stock tickers:', err)
    });
  }

  setActivePair(pair: string) {
    this.activePair.set(pair);
    this.requestOrderBook(pair);
  }

  requestOrderBook(pair: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('subscribe:stock_orderbook', pair);
    } else {
      this.http.get<{ success: boolean; data: OrderBook }>(`${environment.apiUrl}/stocks/orderbook?pair=${encodeURIComponent(pair)}`).subscribe({
        next: (res) => {
          if (res.success) this.orderBook.set(res.data);
        }
      });
    }
  }

  fetchCandles(pair: string, timeframe: string = '24H'): Observable<{ success: boolean; data: Candle[] }> {
    return this.http.get<{ success: boolean; data: Candle[] }>(
      `${environment.apiUrl}/stocks/candles?pair=${encodeURIComponent(pair)}&timeframe=${timeframe}`
    );
  }

  placeOrder(order: { pair: string; side: 'BUY' | 'SELL'; order_type: 'MARKET' | 'LIMIT'; price: number; amount: number }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/stocks/order`, order);
  }

  getPositions(): Observable<{ success: boolean; data: StockPosition[] }> {
    return this.http.get<{ success: boolean; data: StockPosition[] }>(`${environment.apiUrl}/stocks/positions`);
  }

  getOrders(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${environment.apiUrl}/stocks/orders`);
  }

  getPortfolio(): Observable<{ success: boolean; data: StockPortfolio }> {
    return this.http.get<{ success: boolean; data: StockPortfolio }>(`${environment.apiUrl}/stocks/portfolio`);
  }

  getBots(): Observable<{ success: boolean; data: { available: StockBotTemplate[]; myBots: any[] } }> {
    return this.http.get<any>(`${environment.apiUrl}/stocks/bots`);
  }

  deployBot(data: { template_id: number; pair: string; allocated_capital: number }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/stocks/bots/deploy`, data);
  }

  backtest(data: { strategy_type: string; pair: string; capital: number; days: number }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/stocks/backtest`, data);
  }
}
