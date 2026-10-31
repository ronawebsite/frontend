import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LineData,
  CandlestickSeries,
  AreaSeries
} from 'lightweight-charts';
import { MarketService } from '../../../services/market.service';

@Component({
  selector: 'app-tradingview-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-panel rounded-2xl p-4 flex flex-col h-[520px] w-full">
      <!-- Chart Controls Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800">
        <!-- Selected Asset Info -->
        <div class="flex items-center space-x-3">
          <div *ngIf="marketService.selectedTicker() as ticker" class="flex items-center space-x-3">
            <h2 class="text-xl font-black text-white tracking-tight flex items-center space-x-2">
              <span>{{ ticker.pair }}</span>
              <span class="px-2 py-0.5 text-xs font-mono font-bold bg-slate-800 rounded text-slate-300">SPOT</span>
            </h2>
            <div class="flex items-baseline space-x-2">
              <span class="text-2xl font-mono font-bold text-white">
                \${{ ticker.price >= 1 ? (ticker.price | number:'1.2-2') : (ticker.price | number:'1.4-4') }}
              </span>
              <span
                class="font-mono text-xs font-semibold px-1.5 py-0.5 rounded"
                [ngClass]="ticker.change24h >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'"
              >
                {{ ticker.change24h >= 0 ? '+' : '' }}{{ ticker.change24h }}%
              </span>
            </div>
          </div>
        </div>

        <!-- Controls: Timeframes & Chart Type -->
        <div class="flex items-center space-x-2">
          <!-- Timeframes -->
          <div class="flex items-center bg-slate-900/80 p-0.5 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              *ngFor="let tf of ['1H', '24H', '7D', '1M', '1Y']"
              (click)="setTimeframe(tf)"
              class="px-2.5 py-1 rounded-md transition-all font-semibold"
              [ngClass]="activeTf() === tf ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'"
            >
              {{ tf }}
            </button>
          </div>

          <!-- Chart Type Toggle -->
          <button
            (click)="toggleChartType()"
            class="px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900/80 text-xs font-mono text-slate-300 hover:text-cyan-400 transition-colors"
          >
            {{ chartType() === 'candlestick' ? '📊 Candles' : '📈 Line' }}
          </button>
        </div>
      </div>

      <!-- Chart Container DOM Target -->
      <div #chartContainer class="flex-1 w-full relative min-h-[380px]"></div>

      <!-- Quick Metrics Bar -->
      <div *ngIf="marketService.selectedTicker() as t" class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 pt-3 border-t border-slate-800 text-xs">
        <div>
          <span class="text-slate-400 block text-[10px] uppercase">24h High</span>
          <span class="font-mono font-medium text-slate-200">\${{ t.high24h | number:'1.2-2' }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[10px] uppercase">24h Low</span>
          <span class="font-mono font-medium text-slate-200">\${{ t.low24h | number:'1.2-2' }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[10px] uppercase">24h Volume</span>
          <span class="font-mono font-medium text-slate-200">\${{ (t.volume24h * t.price) | number:'1.0-0' }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[10px] uppercase">Feed Provider</span>
          <span class="font-mono text-emerald-400 font-semibold">Binance AggTrade L1</span>
        </div>
      </div>
    </div>
  `
})
export class TradingViewChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartContainer') chartContainerRef!: ElementRef<HTMLDivElement>;
  marketService = inject(MarketService);

  activeTf = signal<string>('24H');
  chartType = signal<'candlestick' | 'line'>('candlestick');

  private chart: IChartApi | null = null;
  private series: ISeriesApi<any> | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    effect(() => {
      const ticker = this.marketService.selectedTicker();
      if (ticker && this.series && this.chart) {
        const time = Math.floor(ticker.timestamp / 1000);
        if (this.chartType() === 'candlestick') {
          this.series.update({
            time: time as any,
            open: ticker.price * 0.9995,
            high: Math.max(ticker.price, ticker.high24h || ticker.price),
            low: Math.min(ticker.price, ticker.low24h || ticker.price),
            close: ticker.price
          });
        } else {
          this.series.update({ time: time as any, value: ticker.price });
        }
      }
    });

    effect(() => {
      const pair = this.marketService.activePair();
      if (this.chart) {
        this.loadCandles(pair, this.activeTf());
      }
    });
  }

  ngAfterViewInit() {
    this.initChart();
    this.loadCandles(this.marketService.activePair(), this.activeTf());
  }

  initChart() {
    if (!this.chartContainerRef) return;
    const container = this.chartContainerRef.nativeElement;

    this.chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: {
        background: { color: 'transparent' },
        textColor: '#94a3b8'
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.04)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.04)' }
      },
      crosshair: {
        vertLine: { color: '#06b6d4', width: 1, style: 3 },
        horzLine: { color: '#06b6d4', width: 1, style: 3 }
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
        timeVisible: true,
        secondsVisible: false
      }
    });

    this.setupSeries();

    this.resizeObserver = new ResizeObserver(entries => {
      if (entries.length && this.chart) {
        const { width, height } = entries[0].contentRect;
        this.chart.applyOptions({ width, height });
      }
    });
    this.resizeObserver.observe(container);
  }

  setupSeries() {
    if (!this.chart) return;
    if (this.series) {
      this.chart.removeSeries(this.series);
    }

    if (this.chartType() === 'candlestick') {
      this.series = this.chart.addSeries(CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#f43f5e',
        borderVisible: false,
        wickUpColor: '#10b981',
        wickDownColor: '#f43f5e'
      });
    } else {
      this.series = this.chart.addSeries(AreaSeries, {
        topColor: 'rgba(6, 182, 212, 0.4)',
        bottomColor: 'rgba(6, 182, 212, 0.01)',
        lineColor: '#06b6d4',
        lineWidth: 2
      });
    }
  }

  loadCandles(pair: string, tf: string) {
    this.marketService.fetchCandles(pair, tf).subscribe({
      next: (res) => {
        if (res.success && res.data && this.series) {
          if (this.chartType() === 'candlestick') {
            const data: CandlestickData[] = res.data.map(c => ({
              time: c.time as any,
              open: c.open,
              high: c.high,
              low: c.low,
              close: c.close
            }));
            this.series.setData(data);
          } else {
            const data: LineData[] = res.data.map(c => ({
              time: c.time as any,
              value: c.close
            }));
            this.series.setData(data);
          }
          this.chart?.timeScale().fitContent();
        }
      }
    });
  }

  setTimeframe(tf: string) {
    this.activeTf.set(tf);
    this.loadCandles(this.marketService.activePair(), tf);
  }

  toggleChartType() {
    this.chartType.set(this.chartType() === 'candlestick' ? 'line' : 'candlestick');
    this.setupSeries();
    this.loadCandles(this.marketService.activePair(), this.activeTf());
  }

  ngOnDestroy() {
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.chart) this.chart.remove();
  }
}
