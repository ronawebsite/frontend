import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="py-16 lg:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      
      <!-- Page Header -->
      <div class="space-y-4 text-center max-w-3xl mx-auto">
        <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#003432] border border-[#0BB4D2]/30 text-xs font-bold text-[#0BB4D2]">
          <span>🏛️ Institutional Quantitative Architecture</span>
        </div>
        <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Democratizing Institutional Trading &amp; Real-Time Wealth
        </h1>
        <p class="text-xs sm:text-base text-slate-300 leading-relaxed">
          Fichain Pro was engineered to remove the intimidation of financial markets. We combine high-frequency algorithmic precision with human broker supervision, providing clients transparent, real-time daily earnings with zero technical complexity.
        </p>
      </div>

      <!-- Core Value Metric Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="glass-panel p-5 rounded-2xl border border-white/10 text-center space-y-1 bg-[#002625]/80">
          <span class="text-2xl sm:text-3xl font-mono font-black text-[#0BB4D2]">$10M+</span>
          <span class="text-[11px] text-slate-400 uppercase font-bold block">Simulated Liquidity</span>
        </div>
        <div class="glass-panel p-5 rounded-2xl border border-white/10 text-center space-y-1 bg-[#002625]/80">
          <span class="text-2xl sm:text-3xl font-mono font-black text-emerald-400">&lt;50ms</span>
          <span class="text-[11px] text-slate-400 uppercase font-bold block">Execution Latency</span>
        </div>
        <div class="glass-panel p-5 rounded-2xl border border-white/10 text-center space-y-1 bg-[#002625]/80">
          <span class="text-2xl sm:text-3xl font-mono font-black text-cyan-300">99.98%</span>
          <span class="text-[11px] text-slate-400 uppercase font-bold block">Engine Uptime</span>
        </div>
        <div class="glass-panel p-5 rounded-2xl border border-white/10 text-center space-y-1 bg-[#002625]/80">
          <span class="text-2xl sm:text-3xl font-mono font-black text-amber-300">24/7</span>
          <span class="text-[11px] text-slate-400 uppercase font-bold block">Real-Time Streams</span>
        </div>
      </div>

      <!-- Institutional Mission Narrative -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div class="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <span class="text-xs font-black uppercase tracking-wider text-[#0BB4D2]">Our Vision</span>
          <h2 class="text-2xl font-black text-white">Why We Built Fichain Pro</h2>
          <p>
            Traditional financial institutions keep everyday investors at arm’s length. Hedge funds and proprietary trading desks reserve algorithmic strategies, high-yield multi-asset baskets, and low-latency execution for ultra-wealthy elites.
          </p>
          <p>
            Fichain Pro changes that paradigm. Clients simply open an account and deposit capital. Our senior trading desk and automated algorithmic bots execute strategic market positions on their behalf. Clients sit back and watch their earnings compound in real time on clear, uncluttered dashboards.
          </p>
        </div>

        <div class="p-6 rounded-3xl bg-[#002625] border border-white/15 space-y-4 shadow-xl">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-[#003432] text-xl flex items-center justify-center text-[#0BB4D2]">
              🛡️
            </div>
            <div>
              <h3 class="text-sm font-bold text-white">Obsidian Trust Bank Standards</h3>
              <span class="text-[11px] text-slate-400">Institutional-grade security &amp; transparency</span>
            </div>
          </div>
          <p class="text-xs text-slate-300 leading-relaxed">
            Every trade execution, profit adjustment, and capital transfer is audited in a relational database with 100% parameterized queries, Socket.IO real-time channels, and automated 6-digit email confirmation PINs.
          </p>
        </div>
      </div>

      <!-- The 3 Pillars of Fichain Pro -->
      <div class="space-y-8">
        <div class="text-center space-y-1.5 max-w-xl mx-auto">
          <span class="text-xs font-bold uppercase tracking-widest text-[#0BB4D2]">Core Principles</span>
          <h2 class="text-2xl font-black text-white">The Three Pillars of Our Platform</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-3 bg-[#002625]/60">
            <div class="text-2xl">⚡</div>
            <h3 class="text-base font-bold text-white">1. Radical Transparency</h3>
            <p class="text-xs text-slate-300 leading-relaxed">
              No black-box mystery. Watch active trade positions, entry prices, live P&amp;L ticks, and closing timelines as they unfold live on screen.
            </p>
          </div>

          <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-3 bg-[#002625]/60">
            <div class="text-2xl">💼</div>
            <h3 class="text-base font-bold text-white">2. Dual-Market Versatility</h3>
            <p class="text-xs text-slate-300 leading-relaxed">
              Unify cryptocurrency volatility with Wall Street equity stability under one single USD cash account. No currency conversions, no cross-chain bridge fees.
            </p>
          </div>

          <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-3 bg-[#002625]/60">
            <div class="text-2xl">🤖</div>
            <h3 class="text-base font-bold text-white">3. Hybrid Execution</h3>
            <p class="text-xs text-slate-300 leading-relaxed">
              Algorithmic momentum models execute mathematical entries while human supervisor desks monitor risk thresholds and lock in client profit targets.
            </p>
          </div>
        </div>
      </div>

      <!-- Senior Trading Desk Overview -->
      <div class="p-8 rounded-3xl bg-gradient-to-r from-[#003432] via-[#002625] to-[#011a19] border border-white/10 space-y-6 shadow-2xl">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-widest text-[#0BB4D2]">Operations Desk</span>
            <h2 class="text-2xl font-black text-white">Senior Quantitative &amp; Supervisory Team</h2>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 w-fit">
            ● Active Supervision
          </span>
        </div>

        <p class="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
          Our supervisory desk actively oversees portfolio allocations, initiates customizable capital top-up directives during prime market breakouts, and handles formal client disputes escalated through our 24/7 AI chatbot.
        </p>

        <div class="pt-2 flex flex-wrap items-center gap-3">
          <a routerLink="/how-it-works" class="px-5 py-2.5 rounded-xl btn-cyan-gradient text-[#002625] font-black text-xs shadow-md">
            Learn How It Works &rarr;
          </a>
          <a routerLink="/contact" class="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 transition">
            Contact Supervisory Desk
          </a>
        </div>
      </div>

    </div>
  `
})
export class AboutComponent {}
