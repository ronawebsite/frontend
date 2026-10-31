import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="py-16 lg:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      
      <!-- Page Header -->
      <div class="space-y-4 text-center max-w-3xl mx-auto">
        <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#003432] border border-[#0BB4D2]/30 text-xs font-bold text-[#0BB4D2]">
          <span>📈 Managed Trading Lifecycle</span>
        </div>
        <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight">
          How Your Capital Works For You
        </h1>
        <p class="text-xs sm:text-base text-slate-300 leading-relaxed">
          From initial deposit to real-time profit generation and instant cashouts, discover how our institutional desk manages multi-asset portfolios on your behalf.
        </p>
      </div>

      <!-- Comparison: Complex Broker vs Fichain Pro -->
      <div class="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 bg-[#002625]/70 shadow-xl">
        <div class="text-center space-y-1 max-w-xl mx-auto">
          <span class="text-xs font-black uppercase text-[#0BB4D2] tracking-wider">The Fichain Pro Advantage</span>
          <h2 class="text-xl sm:text-2xl font-black text-white">Why Managed Trading Wins</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-xs leading-relaxed">
          <!-- Complex Broker Side -->
          <div class="p-5 rounded-2xl bg-black/40 border border-rose-500/30 space-y-3">
            <div class="flex items-center space-x-2 text-rose-300 font-bold text-sm">
              <span>❌</span>
              <span>Traditional Complex Brokerages</span>
            </div>
            <ul class="space-y-2 text-slate-300 list-disc pl-4">
              <li>Requires hours studying complex candlestick patterns and order books.</li>
              <li>High emotional stress, manual stop-loss management, and slippage risk.</li>
              <li>Separate siloed balances for crypto wallets and stock brokerage accounts.</li>
              <li>Hidden withdrawal fees, slow clearing times, and confusing liquidation rules.</li>
            </ul>
          </div>

          <!-- Fichain Pro Side -->
          <div class="p-5 rounded-2xl bg-[#003432]/60 border border-emerald-500/40 space-y-3 shadow-lg">
            <div class="flex items-center space-x-2 text-emerald-300 font-black text-sm">
              <span>✅</span>
              <span>The Fichain Pro Managed Experience</span>
            </div>
            <ul class="space-y-2 text-slate-200 list-disc pl-4">
              <li>Experienced institutional desk and algorithmic bots trade for you.</li>
              <li>Universal USD Cash ledger unifies crypto and Wall Street stocks.</li>
              <li>Live real-time profit ticking on your dashboard every single day.</li>
              <li>2-step email-verified cashouts and luxury 3D virtual debit cards.</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Detailed 5-Step Deep Dive -->
      <div class="space-y-10">
        <div class="border-b border-white/10 pb-4">
          <h2 class="text-2xl font-black text-white">The Complete Step-by-Step Flow</h2>
          <p class="text-xs text-slate-400 mt-1">Full transparency into our order execution and profit settlement architecture.</p>
        </div>

        <!-- Step 1 -->
        <div class="flex flex-col md:flex-row gap-6 items-start">
          <div class="w-12 h-12 rounded-2xl bg-[#003432] text-[#0BB4D2] flex items-center justify-center font-black text-xl shrink-0 border border-[#0BB4D2]/40 shadow-md">
            1
          </div>
          <div class="space-y-2 flex-1">
            <div class="flex items-center space-x-2">
              <h3 class="text-lg font-black text-white">Account Funding &amp; Universal USD Cash</h3>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">INSTANT ONBOARDING</span>
            </div>
            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Upon registration, each investor is provided with a secure universal USD cash account. You can fund your account via cryptocurrency (Bitcoin, USDT) or simulated wire transfers. Funds are immediately pooled into USD cash, ready for diversified deployment without currency conversion fees.
            </p>
          </div>
        </div>

        <!-- Step 2 -->
        <div class="flex flex-col md:flex-row gap-6 items-start">
          <div class="w-12 h-12 rounded-2xl bg-[#003432] text-emerald-400 flex items-center justify-center font-black text-xl shrink-0 border border-emerald-500/40 shadow-md">
            2
          </div>
          <div class="space-y-2 flex-1">
            <div class="flex items-center space-x-2">
              <h3 class="text-lg font-black text-white">Multi-Asset Portfolio Deployment</h3>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">ALGORITHMIC + BROKER</span>
            </div>
            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Our supervisory desk deploys your capital across institutional baskets—combining high-growth cryptocurrencies (BTC, ETH, SOL) with premier Wall Street equities (NVDA, AAPL, MSFT, TSLA). Algorithmic bots capture micro-fluctuations while managing portfolio risk.
            </p>
          </div>
        </div>

        <!-- Step 3 -->
        <div class="flex flex-col md:flex-row gap-6 items-start">
          <div class="w-12 h-12 rounded-2xl bg-[#003432] text-cyan-400 flex items-center justify-center font-black text-xl shrink-0 border border-cyan-500/40 shadow-md">
            3
          </div>
          <div class="space-y-2 flex-1">
            <div class="flex items-center space-x-2">
              <h3 class="text-lg font-black text-white">Live Real-Time Profit Flow &amp; Market Drift</h3>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">SOCKET.IO ENGINE</span>
            </div>
            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Log in to your dashboard anytime to watch your earnings tick live. Our background engine gently drifts trade profits every 5 seconds, mirroring organic liquidity shifts. When profits update, your screen pulses with an emerald green glow.
            </p>
          </div>
        </div>

        <!-- Step 4 -->
        <div class="flex flex-col md:flex-row gap-6 items-start">
          <div class="w-12 h-12 rounded-2xl bg-[#003432] text-amber-400 flex items-center justify-center font-black text-xl shrink-0 border border-amber-500/40 shadow-md">
            4
          </div>
          <div class="space-y-2 flex-1">
            <div class="flex items-center space-x-2">
              <h3 class="text-lg font-black text-white">Capital Top-Up Directives for High-Probability Breakouts</h3>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">REAL-TIME PROMPTS</span>
            </div>
            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
              When market conditions indicate a high-conviction breakout, the managing broker dispatches a customizable directive directly to your screen. The directive clearly specifies the recommended additional capital and the projected payout target, with a 1-click button to pre-fill your deposit.
            </p>
          </div>
        </div>

        <!-- Step 5 -->
        <div class="flex flex-col md:flex-row gap-6 items-start">
          <div class="w-12 h-12 rounded-2xl bg-[#003432] text-purple-400 flex items-center justify-center font-black text-xl shrink-0 border border-purple-500/40 shadow-md">
            5
          </div>
          <div class="space-y-2 flex-1">
            <div class="flex items-center space-x-2">
              <h3 class="text-lg font-black text-white">Closing Window &amp; Instant Cashout</h3>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">SETTLEMENT &amp; PAYOUT</span>
            </div>
            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
              When a trade reaches its target, the broker triggers the <strong>Closing Window</strong> (visible as stage 3 on your trading terminal). Upon settlement, profits are realized and credited directly to your universal USD cash balance. Request withdrawals anytime with 2-step email PIN security or spend via your 3D virtual debit card.
            </p>
          </div>
        </div>
      </div>

      <!-- Bottom CTA Banner -->
      <div class="p-8 rounded-3xl bg-gradient-to-r from-[#003432] via-[#0284c7] to-[#0BB4D2] text-center space-y-4 shadow-2xl">
        <h3 class="text-2xl sm:text-3xl font-black text-white">Ready to Put Your Money to Work?</h3>
        <p class="text-xs sm:text-sm text-cyan-100 max-w-xl mx-auto">
          Create your account in 30 seconds and let our quantitative desk handle the markets for you.
        </p>
        <div class="pt-2">
          <a routerLink="/auth/register" class="inline-block px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-[#003432] font-black text-sm shadow-xl transition-all">
            Open Free Account Now
          </a>
        </div>
      </div>

    </div>
  `
})
export class HowItWorksComponent {}
