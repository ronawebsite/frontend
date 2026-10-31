import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  Input,
  inject,
  signal,
  effect,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  CandlestickSeries,
  AreaSeries,
  ColorType,
  IPriceLine
} from 'lightweight-charts';
import { PlanService } from '../../../services/plan.service';
import { UserSubscription, PlanCandleTick } from '../../../core/models/fintech.models';

@Component({
  selector: 'app-plan-growth-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-panel rounded-3xl p-4 sm:p-5 flex flex-col h-[480px] w-full border border-white/10 bg-[#002625]/90 shadow-2xl relative overflow-hidden">
      
      <!-- Top Chart HUD Bar -->
      <div class="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-white/10">
        <!-- Asset Title & Live Numbers -->
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-2xl bg-[#003432] text-cyan-300 flex items-center justify-center font-black text-lg border border-[#0BB4D2]/30 shadow-md">
            📈
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <span class="text-sm font-black text-white tracking-tight">{{ subscription?.plan_name || 'Active Growth Plan' }}</span>
              <span class="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                LIVE BINANCE ENGINE
              </span>
            </div>

            <div class="flex items-baseline space-x-3 pt-0.5">
              <span
                class="text-2xl sm:text-3xl font-mono font-black transition-all duration-200"
                [ngClass]="planService.isPulsing() ? (planService.lastDelta() >= 0 ? 'text-emerald-400 scale-105' : 'text-rose-400 scale-105') : 'text-white'"
              >
                \${{ (subscription?.current_value || 0) | number:'1.2-2' }}
              </span>

              <span
                class="font-mono text-xs font-bold px-2 py-0.5 rounded"
                [ngClass]="(subscription?.current_profit || 0) >= 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'"
              >
                {{ (subscription?.current_profit || 0) >= 0 ? '+' : '' }}\${{ (subscription?.current_profit || 0) | number:'1.2-2' }}
                ({{ (subscription?.profit_percent || 0) >= 0 ? '+' : '' }}{{ subscription?.profit_percent || 0 }}%)
              </span>
            </div>
          </div>
        </div>

        <!-- Controls: Chart Mode & Target Ceiling Indicator -->
        <div class="flex items-center space-x-2">
          <!-- Target Pill -->
          <div class="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs">
            <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>Target Goal: <strong>\${{ (subscription?.target_amount || 0) | number:'1.2-2' }}</strong></span>
          </div>

          <!-- Switch Chart Type -->
          <button
            type="button"
            (click)="toggleChartType()"
            class="px-3 py-1.5 rounded-xl border border-white/10 bg-black/40 hover:bg-white/10 text-xs font-bold text-slate-200 transition flex items-center space-x-1.5"
            title="Toggle Candlesticks / Line Chart"
          >
            <span>{{ chartType() === 'candlestick' ? '🕯️ Candlesticks' : '🌊 Smooth Area' }}</span>
          </button>

          <button
            type="button"
            (click)="resetView()"
            class="p-1.5 rounded-xl border border-white/10 bg-black/40 hover:bg-white/10 text-slate-400 hover:text-white text-xs transition"
            title="Auto-Fit Chart View"
          >
            ⤢
          </button>
        </div>
      </div>

      <!-- Chart Canvas Container -->
      <div #chartContainer class="flex-1 w-full relative">
        <!-- Ambient Watermark -->
        <div class="absolute bottom-3 left-4 pointer-events-none text-[11px] font-mono text-slate-400/40 select-none z-10">
          Target Guaranteed Settlement: \${{ (subscription?.target_amount || 0) | number:'1.2-2' }} &bull; Real-Time Socket Fluctuation
        </div>
      </div>

      <!-- Chart Sub-Footer Legend -->
      <div class="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400">
        <div class="flex items-center space-x-4">
          <span class="flex items-center space-x-1">
            <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>Entry Base: \${{ (subscription?.invested_amount || 0) | number:'1.2-2' }}</span>
          </span>
          <span class="flex items-center space-x-1">
            <span class="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Guaranteed Target: \${{ (subscription?.target_amount || 0) | number:'1.2-2' }}</span>
          </span>
        </div>

        <span class="text-emerald-400 font-bold flex items-center space-x-1">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Live Stochastic Ticks (3s)</span>
        </span>
      </div>

    </div>
  `
})
export class PlanGrowthChartComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  @Input() subscription: UserSubscription | null = null;

  planService = inject(PlanService);

  chartType = signal<'candlestick' | 'area'>('candlestick');

  private chart: IChartApi | null = null;
  private candleSeries: any = null;
  private areaSeries: any = null;
  private targetLine: IPriceLine | null = null;
  private entryLine: IPriceLine | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    // React to live candle ticks coming from Socket.IO
    effect(() => {
      const tick = this.planService.latestCandleTick();
      if (tick && this.chart) {
        this.updateTick(tick);
      }
    });
  }

  ngAfterViewInit() {
    this.initChart();
    if (this.subscription) {
      this.loadSubscriptionData(this.subscription.id);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['subscription'] && !changes['subscription'].firstChange) {
      if (this.subscription && this.chart) {
        this.loadSubscriptionData(this.subscription.id);
        this.updatePriceLines();
      }
    }
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.chart) {
      this.chart.remove();
      this.chart = null;
    }
  }

  private initChart() {
    if (!this.chartContainer?.nativeElement) return;

    this.chart = createChart(this.chartContainer.nativeElement, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8'
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.04)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.04)' }
      },
      crosshair: {
        vertLine: { color: '#0BB4D2', width: 1, style: 2 },
        horzLine: { color: '#0BB4D2', width: 1, style: 2 }
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        borderColor: 'rgba(255, 255, 255, 0.1)'
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        scaleMargins: { top: 0.15, bottom: 0.15 }
      }
    });

    // Create Candlestick series (Binance colors: green #10b981, red #f43f5e)
    this.candleSeries = this.chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e'
    });

    // Create Area series (hidden by default)
    this.areaSeries = this.chart.addSeries(AreaSeries, {
      topColor: 'rgba(11, 180, 210, 0.45)',
      bottomColor: 'rgba(11, 180, 210, 0.02)',
      lineColor: '#0BB4D2',
      lineWidth: 2
    });
    this.areaSeries.applyOptions({ visible: false });

    this.updatePriceLines();

    // Auto-resize observer
    this.resizeObserver = new ResizeObserver(entries => {
      if (!entries || entries.length === 0 || !this.chart) return;
      const { width, height } = entries[0].contentRect;
      this.chart.applyOptions({ width, height });
    });
    this.resizeObserver.observe(this.chartContainer.nativeElement);
  }

  private updatePriceLines() {
    if (!this.candleSeries || !this.subscription) return;

    // Remove old lines if present
    if (this.targetLine) {
      try { this.candleSeries.removePriceLine(this.targetLine); } catch (e) {}
      this.targetLine = null;
    }
    if (this.entryLine) {
      try { this.candleSeries.removePriceLine(this.entryLine); } catch (e) {}
      this.entryLine = null;
    }

    const targetPrice = parseFloat(String(this.subscription.target_amount));
    const entryPrice = parseFloat(String(this.subscription.invested_amount));

    // Target Ceiling Line (Dashed Gold/Amber)
    if (targetPrice > 0) {
      this.targetLine = this.candleSeries.createPriceLine({
        price: targetPrice,
        color: '#f59e0b',
        lineWidth: 2,
        lineStyle: 1, // Dashed
        axisLabelVisible: true,
        title: `🎯 Target Goal: $${targetPrice.toLocaleString()}`
      });
    }

    // Entry Baseline (Dotted Cyan)
    if (entryPrice > 0) {
      this.entryLine = this.candleSeries.createPriceLine({
        price: entryPrice,
        color: '#0BB4D2',
        lineWidth: 1,
        lineStyle: 2, // Dotted
        axisLabelVisible: true,
        title: `Entry: $${entryPrice.toLocaleString()}`
      });
    }
  }

  loadSubscriptionData(subscriptionId: number) {
    this.planService.getSubscriptionCandles(subscriptionId).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.length > 0) {
          const sorted = [...res.data].sort((a, b) => a.time - b.time);

          if (this.candleSeries) {
            this.candleSeries.setData(sorted as any);
          }

          if (this.areaSeries) {
            const areaData = sorted.map(c => ({ time: c.time as any, value: c.close }));
            this.areaSeries.setData(areaData);
          }

          this.resetView();
        }
      },
      error: (err) => console.error('[PlanGrowthChart] Failed to load candles:', err)
    });
  }

  private updateTick(tick: PlanCandleTick) {
    if (!this.candleSeries) return;

    try {
      if (this.candleSeries) {
        this.candleSeries.update(tick as any);
      }
      if (this.areaSeries) {
        this.areaSeries.update({ time: tick.time as any, value: tick.close });
      }
    } catch (e) {
      // Ignored for out of order historical micro-ticks
    }
  }

  toggleChartType() {
    if (!this.candleSeries || !this.areaSeries) return;

    if (this.chartType() === 'candlestick') {
      this.chartType.set('area');
      this.candleSeries.applyOptions({ visible: false });
      this.areaSeries.applyOptions({ visible: true });
    } else {
      this.chartType.set('candlestick');
      this.candleSeries.applyOptions({ visible: true });
      this.areaSeries.applyOptions({ visible: false });
    }
    this.resetView();
  }

  resetView() {
    if (this.chart) {
      this.chart.timeScale().fitContent();
    }
  }
}
