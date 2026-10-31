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
import { StockService } from '../../../services/stock.service';

@Component({
  selector: 'app-stock-tradingview-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-panel rounded-3xl p-5 flex flex-col h-[520px] w-full border border-white/10 shadow-xl">
      <!-- Chart Controls Header -->
      <div class="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-white/10">
        <!-- Selected Stock Info -->
        <div class="flex items-center space-x-3">
          <div *ngIf="stockService.selectedTicker() as ticker" class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-2xl bg-[#003432] text-emerald-400 flex items-center justify-center font-black text-sm border border-emerald-400/30">
              {{ ticker.symbol.slice(0, 3) }}
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <h2 class="text-xl font-black text-white tracking-tight">{{ ticker.pair }}</h2>
                <span class="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#002625] rounded-md text-emerald-300 border border-emerald-400/30">
                  {{ ticker.market }}
                </span>
              </div>
              <span class="text-xs text-slate-400 truncate block">{{ ticker.name }}</span>
            </div>

            <div class="flex items-baseline space-x-2 pl-2">
              <span class="text-2xl font-mono font-black text-white">
                \${{ ticker.price | number:'1.2-2' }}
              </span>
              <span
                class="font-mono text-xs font-bold px-2 py-0.5 rounded-lg"
                [ngClass]="ticker.change24h >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'"
              >
                {{ ticker.change24h >= 0 ? '+' : '' }}{{ ticker.change24h }}%
              </span>
            </div>
          </div>
        </div>

        <!-- Controls: Timeframes & Chart Type -->
        <div class="flex items-center space-x-2">
          <!-- Timeframes -->
          <div class="flex items-center bg-[#002625] p-1 rounded-xl border border-white/10 text-xs font-mono font-bold">
            <button
              *ngFor="let tf of ['1H', '24H', '7D', '1M', '1Y']"
              (click)="setTimeframe(tf)"
              class="px-2.5 py-1 rounded-lg transition-all"
              [ngClass]="activeTf() === tf ? 'bg-emerald-500/30 text-emerald-300 font-black' : 'text-slate-400 hover:text-white'"
            >
              {{ tf }}
            </button>
          </div>

          <!-- Chart Type Toggle -->
          <button
            (click)="toggleChartType()"
            class="px-3 py-1.5 rounded-xl border border-white/10 bg-[#002625] text-xs font-mono text-slate-300 hover:text-emerald-300 transition-colors font-bold"
          >
            {{ chartType() === 'candlestick' ? '📊 Candles' : '📈 Line' }}
          </button>
        </div>
      </div>

      <!-- Chart Container DOM Target -->
      <div #chartContainer class="flex-1 w-full relative min-h-[360px]"></div>

      <!-- Quick Metrics Bar -->
      <div *ngIf="stockService.selectedTicker() as t" class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 pt-3 border-t border-white/10 text-xs font-mono">
        <div>
          <span class="text-slate-400 block text-[10px] uppercase font-sans">24h High</span>
          <span class="font-bold text-slate-200">\${{ t.high24h | number:'1.2-2' }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[10px] uppercase font-sans">24h Low</span>
          <span class="font-bold text-slate-200">\${{ t.low24h | number:'1.2-2' }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[10px] uppercase font-sans">Market Cap</span>
          <span class="font-bold text-white">\${{ t.marketCap || '3.5T' }}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[10px] uppercase font-sans">Market Status</span>
          <span class="text-emerald-400 font-bold">● Wall Street Open</span>
        </div>
      </div>
    </div>
  `
})
export class StockTradingViewChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartContainer') chartContainerRef!: ElementRef<HTMLDivElement>;
  stockService = inject(StockService);

  activeTf = signal<string>('24H');
  chartType = signal<'candlestick' | 'line'>('candlestick');

  private chart: IChartApi | null = null;
  private series: ISeriesApi<any> | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    effect(() => {
      const ticker = this.stockService.selectedTicker();
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
      const pair = this.stockService.activePair();
      if (this.chart) {
        this.loadCandles(pair, this.activeTf());
      }
    });
  }

  ngAfterViewInit() {
    this.initChart();
    this.loadCandles(this.stockService.activePair(), this.activeTf());
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
        vertLine: { color: '#10b981', width: 1, style: 3 },
        horzLine: { color: '#10b981', width: 1, style: 3 }
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
        topColor: 'rgba(16, 185, 129, 0.4)',
        bottomColor: 'rgba(16, 185, 129, 0.01)',
        lineColor: '#10b981',
        lineWidth: 2
      });
    }
  }

  loadCandles(pair: string, tf: string) {
    this.stockService.fetchCandles(pair, tf).subscribe({
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
    this.loadCandles(this.stockService.activePair(), tf);
  }

  toggleChartType() {
    this.chartType.set(this.chartType() === 'candlestick' ? 'line' : 'candlestick');
    this.setupSeries();
    this.loadCandles(this.stockService.activePair(), this.activeTf());
  }

  ngOnDestroy() {
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.chart) this.chart.remove();
  }
}
