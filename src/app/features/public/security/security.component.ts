import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="py-16 lg:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      
      <!-- Page Header -->
      <div class="space-y-4 text-center max-w-3xl mx-auto">
        <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#003432] border border-[#0BB4D2]/30 text-xs font-bold text-[#0BB4D2]">
          <span>🛡️ Bank-Grade FinTech Protection</span>
        </div>
        <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Institutional Security &amp; Asset Protection
        </h1>
        <p class="text-xs sm:text-base text-slate-300 leading-relaxed">
          How Fichain Pro safeguards investor capital, prevents unauthorized withdrawals, and maintains enterprise-grade operational resilience.
        </p>
      </div>

      <!-- Security Grid Overview -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-3 bg-[#002625]/70 shadow-lg">
          <div class="w-12 h-12 rounded-2xl bg-[#003432] text-[#0BB4D2] flex items-center justify-center text-2xl border border-[#0BB4D2]/30">
            🔐
          </div>
          <h3 class="text-base font-bold text-white">Dual-Key Authentication</h3>
          <p class="text-xs text-slate-300 leading-relaxed">
            Standard bcrypt-hashed email/password credentials or Web3-style 12-Word cryptographic recovery phrase for instant, passwordless recovery.
          </p>
        </div>

        <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-3 bg-[#002625]/70 shadow-lg">
          <div class="w-12 h-12 rounded-2xl bg-[#003432] text-emerald-400 flex items-center justify-center text-2xl border border-emerald-500/30">
            ✉️
          </div>
          <h3 class="text-base font-bold text-white">2-Step Email Cashout PIN</h3>
          <p class="text-xs text-slate-300 leading-relaxed">
            Zero withdrawals can occur without entering a dynamic 6-digit confirmation PIN dispatched directly to the client's verified email address.
          </p>
        </div>

        <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-3 bg-[#002625]/70 shadow-lg">
          <div class="w-12 h-12 rounded-2xl bg-[#003432] text-cyan-400 flex items-center justify-center text-2xl border border-cyan-500/30">
            🛡️
          </div>
          <h3 class="text-base font-bold text-white">100% Parameterized SQL</h3>
          <p class="text-xs text-slate-300 leading-relaxed">
            All database queries run through strict parameterized statements using <code class="text-cyan-300">mysql2</code> connection pools, eliminating SQL injection.
          </p>
        </div>
      </div>

      <!-- Architectural Hardening Breakdown -->
      <div class="space-y-8">
        <div class="border-b border-white/10 pb-4">
          <h2 class="text-2xl font-black text-white">Multi-Layered Security Architecture</h2>
          <p class="text-xs text-slate-400 mt-1">Institutional safeguards engineered at every layer of the software stack.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Card 1 -->
          <div class="p-6 rounded-3xl bg-[#002625] border border-white/10 space-y-3">
            <div class="flex items-center space-x-2.5">
              <span class="text-lg">💳</span>
              <h3 class="text-base font-bold text-white">4-Digit Card Transaction PIN</h3>
            </div>
            <p class="text-xs text-slate-300 leading-relaxed">
              Virtual debit card CVV codes and 16-digit primary account numbers remain masked by default. Clicking to unmask triggers an encrypted modal requiring the client's 4-digit transaction PIN, shielding sensitive financial details during public screen shares.
            </p>
          </div>

          <!-- Card 2 -->
          <div class="p-6 rounded-3xl bg-[#002625] border border-white/10 space-y-3">
            <div class="flex items-center space-x-2.5">
              <span class="text-lg">⚡</span>
              <h3 class="text-base font-bold text-white">Instant Card Freezing</h3>
            </div>
            <p class="text-xs text-slate-300 leading-relaxed">
              Clients can toggle instant card freezing with a single click. When frozen, the virtual card state updates instantly in the database, blocking any simulated outbound merchant transactions until the client safely unfreezes the card.
            </p>
          </div>

          <!-- Card 3 -->
          <div class="p-6 rounded-3xl bg-[#002625] border border-white/10 space-y-3">
            <div class="flex items-center space-x-2.5">
              <span class="text-lg">📑</span>
              <h3 class="text-base font-bold text-white">AML &amp; KYC Verification Center</h3>
            </div>
            <p class="text-xs text-slate-300 leading-relaxed">
              Clients can upload government-issued ID documents (passports, driver's licenses) directly through the portal with drag-and-drop instant previews. The senior supervisory desk conducts formal reviews, approving or requesting document updates before large cashouts.
            </p>
          </div>

          <!-- Card 4 -->
          <div class="p-6 rounded-3xl bg-[#002625] border border-white/10 space-y-3">
            <div class="flex items-center space-x-2.5">
              <span class="text-lg">🚨</span>
              <h3 class="text-base font-bold text-white">Automated Dispute Escalation</h3>
            </div>
            <p class="text-xs text-slate-300 leading-relaxed">
              Our integrated 24/7 AI chatbot analyzes client messages for dispute indicators. When an issue is detected, it automatically files an official <code class="text-rose-300 font-mono">DISPUTE-...</code> ticket with URGENT priority, instantly alerting senior supervisors via email and Socket.IO.
            </p>
          </div>
        </div>
      </div>

      <!-- Regulatory & Academic Defense Note -->
      <div class="p-6 rounded-3xl bg-[#002625] border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="space-y-1">
          <h3 class="text-base font-bold text-white">Looking for the Technical Security Audit?</h3>
          <p class="text-xs text-slate-300">Detailed endpoint documentation, database ER diagrams, and cryptographic flows are documented in the README.</p>
        </div>
        <a routerLink="/terms" class="px-5 py-2.5 rounded-xl btn-cyan-gradient text-[#002625] font-black text-xs shrink-0 shadow-md">
          Review Terms &amp; Conditions
        </a>
      </div>

    </div>
  `
})
export class SecurityComponent {}
