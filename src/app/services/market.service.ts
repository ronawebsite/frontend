import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { Ticker, OrderBook, Candle } from '../core/models/fintech.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MarketService {
  private http = inject(HttpClient);
  private socket!: Socket;

  tickers = signal<Ticker[]>([]);
  activePair = signal<string>('BTC/USDT');
  activeTimeframe = signal<string>('24H');
  orderBook = signal<OrderBook | null>(null);

  selectedTicker = computed(() => {
    const pair = this.activePair();
    return this.tickers().find(t => t.pair === pair) || this.tickers()[0] || null;
  });

  getTicker(pair: string): Ticker | undefined {
    return this.tickers().find(t => t.pair === pair);
  }

  constructor() {
    this.initSocketConnection();
    this.fetchInitialMarkets();
  }

  private initSocketConnection() {
    try {
      this.socket = io(environment.wsUrl, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 10
      });

      this.socket.on('market:snapshot', (snapshot: Ticker[]) => {
        if (Array.isArray(snapshot)) {
          this.tickers.set(snapshot);
        }
      });

      this.socket.on('market:ticker', (tick: Ticker) => {
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

      this.socket.on('market:orderbook', (book: OrderBook) => {
        if (book && book.pair === this.activePair()) {
          this.orderBook.set(book);
        }
      });
    } catch (e) {
      console.warn('Socket.IO connection could not be established directly:', e);
    }
  }

  fetchInitialMarkets() {
    this.http.get<{ success: boolean; data: Ticker[] }>(`${environment.apiUrl}/trade/markets`).subscribe({
      next: (res) => {
        if (res.success && Array.isArray(res.data)) {
          this.tickers.set(res.data);
        }
      },
      error: (err) => console.error('Failed to fetch initial market tickers:', err)
    });
  }

  setActivePair(pair: string) {
    this.activePair.set(pair);
    this.requestOrderBook(pair);
  }

  requestOrderBook(pair: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('subscribe:orderbook', pair);
    } else {
      this.http.get<{ success: boolean; data: OrderBook }>(`${environment.apiUrl}/trade/orderbook?pair=${encodeURIComponent(pair)}`).subscribe({
        next: (res) => {
          if (res.success) this.orderBook.set(res.data);
        }
      });
    }
  }

  fetchCandles(pair: string, timeframe: string = '24H'): Observable<{ success: boolean; data: Candle[] }> {
    return this.http.get<{ success: boolean; data: Candle[] }>(
      `${environment.apiUrl}/trade/candles?pair=${encodeURIComponent(pair)}&timeframe=${timeframe}`
    );
  }
}
