import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MarketService } from '../../../services/market.service';
import { StockService } from '../../../services/stock.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div>
      
      <!-- ========================================================================= -->
      <!-- HERO SECTION                                                              -->
      <!-- ========================================================================= -->
      <section class="relative pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden">
        <!-- Ambient Glowing Background Accents -->
        <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#003432]/40 via-[#0BB4D2]/15 to-transparent blur-[140px] pointer-events-none rounded-full"></div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <!-- Trust Badge -->
          <div class="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#003432] border border-[#0BB4D2]/30 text-xs font-bold text-[#0BB4D2] shadow-sm">
            <span>🛡️ Managed Investment Desk</span>
            <span class="text-slate-500">•</span>
            <span class="text-emerald-300">Live Real-Time Earnings</span>
          </div>

          <!-- Hero Headline (Clear, Human, Layman) -->
          <div class="max-w-3xl mx-auto space-y-3">
            <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Watch Your Earnings Grow
              <span class="block bg-gradient-to-r from-[#0BB4D2] via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                In Real-Time.
              </span>
            </h1>
            <p class="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Deposit funds and let our experienced desk trade on your behalf. Track live earnings ticking daily and cash out whenever you want.
            </p>
          </div>

          <!-- Hero Action Buttons -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              routerLink="/auth/register"
              class="w-full sm:w-auto px-7 py-3 rounded-2xl btn-cyan-gradient text-sm font-black shadow-lg shadow-[#0BB4D2]/25 tracking-wide flex items-center justify-center space-x-2"
            >
              <span>🚀 Open Free Account</span>
            </a>
            <a
              routerLink="/about"
              class="w-full sm:w-auto px-7 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-sm font-bold transition-colors flex items-center justify-center space-x-2"
            >
              <span>🏛️ Explore Our Desk</span>
            </a>
          </div>

          <!-- Live Top Market Cards Banner (Crypto & Stocks) -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 max-w-5xl mx-auto">
            <!-- Top Cryptos -->
            <div *ngFor="let tick of topCryptos()" class="glass-panel p-4 rounded-2xl border border-slate-800 text-left space-y-2 hover:border-[#0BB4D2]/40 transition-colors">
              <div class="flex items-center justify-between text-xs">
                <span class="font-extrabold text-white text-sm">{{ tick.symbol }}</span>
                <span class="font-mono font-bold text-[11px]" [ngClass]="tick.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                  {{ tick.change24h >= 0 ? '+' : '' }}{{ tick.change24h }}%
                </span>
              </div>
              <div class="font-mono text-xl font-bold text-white">
                \${{ tick.price >= 1 ? (tick.price | number:'1.2-2') : (tick.price | number:'1.4-4') }}
              </div>
              <div class="text-[10px] text-slate-400 flex items-center justify-between">
                <span>Crypto Market</span>
                <a routerLink="/auth/login" class="text-[#0BB4D2] font-semibold">View →</a>
              </div>
            </div>

            <!-- Top Stocks -->
            <div *ngFor="let stock of topStocks()" class="glass-panel p-4 rounded-2xl border border-slate-800 text-left space-y-2 hover:border-emerald-400/40 transition-colors">
              <div class="flex items-center justify-between text-xs">
                <span class="font-extrabold text-white text-sm">{{ stock.symbol }}</span>
                <span class="font-mono font-bold text-[11px]" [ngClass]="stock.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'">
                  {{ stock.change24h >= 0 ? '+' : '' }}{{ stock.change24h }}%
                </span>
              </div>
              <div class="font-mono text-xl font-bold text-white">
                \${{ stock.price | number:'1.2-2' }}
              </div>
              <div class="text-[10px] text-slate-400 flex items-center justify-between">
                <span>Wall Street Equity</span>
                <a routerLink="/auth/login" class="text-emerald-300 font-semibold">View →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ========================================================================= -->
      <!-- HOW IT WORKS IN 4 EASY STEPS                                              -->
      <!-- ========================================================================= -->
      <section class="py-16 bg-[#002625]/40 border-y border-white/5 relative">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div class="space-y-1.5 max-w-xl">
              <span class="text-xs font-bold uppercase tracking-widest text-[#0BB4D2]">Simple Process</span>
              <h2 class="text-2xl sm:text-3xl font-black text-white">How Your Account Works</h2>
              <p class="text-xs sm:text-sm text-slate-300">Start earning with zero prior trading experience.</p>
            </div>
            <a routerLink="/how-it-works" class="text-xs text-[#0BB4D2] hover:text-cyan-300 font-bold flex items-center space-x-1 shrink-0">
              <span>Read complete walkthrough</span>
              <span>&rarr;</span>
            </a>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <!-- Step 1 -->
            <div class="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2.5 relative">
              <div class="w-10 h-10 rounded-xl bg-[#003432] text-[#0BB4D2] flex items-center justify-center font-black text-lg border border-[#0BB4D2]/30">
                1
              </div>
              <h3 class="text-base font-bold text-white">Create Account</h3>
              <p class="text-xs text-slate-300 leading-relaxed">
                Sign up in 30 seconds and gain instant access to your investor portal.
              </p>
            </div>

            <!-- Step 2 -->
            <div class="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2.5 relative">
              <div class="w-10 h-10 rounded-xl bg-[#003432] text-emerald-400 flex items-center justify-center font-black text-lg border border-emerald-500/30">
                2
              </div>
              <h3 class="text-base font-bold text-white">Deposit Capital</h3>
              <p class="text-xs text-slate-300 leading-relaxed">
                Fund your account with Crypto or Wire transfer, tracked under secure USD cash.
              </p>
            </div>

            <!-- Step 3 -->
            <div class="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2.5 relative">
              <div class="w-10 h-10 rounded-xl bg-[#003432] text-cyan-400 flex items-center justify-center font-black text-lg border border-cyan-500/30">
                3
              </div>
              <h3 class="text-base font-bold text-white">Senior Desk Trades</h3>
              <p class="text-xs text-slate-300 leading-relaxed">
                Experienced brokers trade for you. No need to study complex charts.
              </p>
            </div>

            <!-- Step 4 -->
            <div class="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2.5 relative">
              <div class="w-10 h-10 rounded-xl bg-[#003432] text-amber-400 flex items-center justify-center font-black text-lg border border-amber-500/30">
                4
              </div>
              <h3 class="text-base font-bold text-white">Track &amp; Cash Out</h3>
              <p class="text-xs text-slate-300 leading-relaxed">
                Watch profits tick in real-time and withdraw whenever you choose.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ========================================================================= -->
      <!-- CORE FEATURES SHOWCASE                                                    -->
      <!-- ========================================================================= -->
      <section class="py-16 relative">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div class="text-center space-y-1.5 max-w-xl mx-auto">
            <span class="text-xs font-bold uppercase tracking-widest text-[#0BB4D2]">Platform Features</span>
            <h2 class="text-2xl sm:text-3xl font-black text-white">Built for Everyday Investors</h2>
            <p class="text-xs sm:text-sm text-slate-300">Everything you need to manage your money easily.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Feature 1: Dual Market Hub -->
            <div class="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800 space-y-3">
              <div class="w-10 h-10 rounded-xl bg-[#003432] text-xl flex items-center justify-center">
                ⇄
              </div>
              <h3 class="text-base font-bold text-white">Crypto &amp; Stocks Hub</h3>
              <p class="text-xs text-slate-300 leading-relaxed">
                Access 24/7 crypto and Wall Street equities with one universal USD cash balance.
              </p>
            </div>

            <!-- Feature 2: Automated Trading Robots -->
            <div class="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800 space-y-3">
              <div class="w-10 h-10 rounded-xl bg-[#003432] text-xl flex items-center justify-center">
                🤖
              </div>
              <h3 class="text-base font-bold text-white">Smart Trading Bots</h3>
              <p class="text-xs text-slate-300 leading-relaxed">
                Pre-configured algorithmic strategies automatically capture market opportunities.
              </p>
            </div>

            <!-- Feature 3: Past Performance Tester -->
            <div class="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800 space-y-3">
              <div class="w-10 h-10 rounded-xl bg-[#003432] text-xl flex items-center justify-center">
                📈
              </div>
              <h3 class="text-base font-bold text-white">Strategy Backtester</h3>
              <p class="text-xs text-slate-300 leading-relaxed">
                Test strategies against historical candles to review win rates and profit statistics.
              </p>
            </div>

            <!-- Feature 4: 3D Virtual Cards -->
            <div class="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800 space-y-3">
              <div class="w-10 h-10 rounded-xl bg-[#003432] text-xl flex items-center justify-center">
                💳
              </div>
              <h3 class="text-base font-bold text-white">3D Virtual Debit Cards</h3>
              <p class="text-xs text-slate-300 leading-relaxed">
                Flip your card in 3D, reveal your secret CVV with your PIN, and freeze anytime.
              </p>
            </div>

            <!-- Feature 5: Safe Deposit & Withdrawal Sandbox -->
            <div class="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800 space-y-3">
              <div class="w-10 h-10 rounded-xl bg-[#003432] text-xl flex items-center justify-center">
                🏦
              </div>
              <h3 class="text-base font-bold text-white">Fast Deposits &amp; Cashouts</h3>
              <p class="text-xs text-slate-300 leading-relaxed">
                Fund with dynamic QR codes and withdraw securely with 2-step email verification.
              </p>
            </div>

            <!-- Feature 6: One-Click PDF Statements -->
            <div class="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800 space-y-3">
              <div class="w-10 h-10 rounded-xl bg-[#003432] text-xl flex items-center justify-center">
                📄
              </div>
              <h3 class="text-base font-bold text-white">Instant PDF Statements</h3>
              <p class="text-xs text-slate-300 leading-relaxed">
                Download formal statements and transaction records in PDF format with one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ========================================================================= -->
      <!-- FREQUENTLY ASKED QUESTIONS (LAYMAN FRIENDLY)                              -->
      <!-- ========================================================================= -->
      <section class="py-16 bg-[#002625]/30 border-t border-white/5">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div class="text-center space-y-1.5">
            <span class="text-xs font-bold uppercase tracking-widest text-[#0BB4D2]">Common Questions</span>
            <h2 class="text-2xl sm:text-3xl font-black text-white">Frequently Asked Questions</h2>
          </div>

          <div class="space-y-3 text-sm">
            <div class="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1.5">
              <h4 class="font-bold text-white text-sm">How do I switch between Stocks and Crypto?</h4>
              <p class="text-xs text-slate-300 leading-relaxed">
                Choose your preferred market upon login, or switch anytime via the sidebar and top navigation.
              </p>
            </div>

            <div class="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1.5">
              <h4 class="font-bold text-white text-sm">How does the managed trading work?</h4>
              <p class="text-xs text-slate-300 leading-relaxed">
                Your deposit is allocated across crypto and equities by our desk. Profits update in real-time on your dashboard.
              </p>
            </div>

            <div class="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1.5">
              <h4 class="font-bold text-white text-sm">How do I withdraw my earnings?</h4>
              <p class="text-xs text-slate-300 leading-relaxed">
                Request a withdrawal anytime from your wallet. A 6-digit confirmation PIN is sent to your email for security.
              </p>
            </div>

            <div class="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1.5">
              <h4 class="font-bold text-white text-sm">Can I use this on mobile?</h4>
              <p class="text-xs text-slate-300 leading-relaxed">
                Yes, the platform includes a native-feeling mobile app layout with bottom navigation dock for all smartphones.
              </p>
            </div>
          </div>

          <!-- Bottom CTA Banner -->
          <div class="p-6 rounded-3xl bg-gradient-to-r from-[#003432] via-[#0284c7] to-[#0BB4D2] text-center space-y-3 shadow-xl">
            <h3 class="text-xl sm:text-2xl font-black text-white">Ready to Start?</h3>
            <p class="text-xs text-cyan-100 max-w-md mx-auto">
              Open your free account today and track your live earnings in real-time.
            </p>
            <div>
              <a
                routerLink="/auth/register"
                class="inline-block px-7 py-3 rounded-2xl bg-white hover:bg-slate-100 text-[#003432] font-black text-xs shadow-lg transition-all"
              >
                Create Free Account
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  `
})
export class HomeComponent {
  marketService = inject(MarketService);
  stockService = inject(StockService);
  authService = inject(AuthService);

  topCryptos = computed(() => this.marketService.tickers().slice(0, 2));
  topStocks = computed(() => this.stockService.tickers().slice(0, 2));
}
