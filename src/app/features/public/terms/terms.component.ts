import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="py-16 lg:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      <!-- Page Header -->
      <div class="space-y-3 border-b border-white/10 pb-8 text-center sm:text-left">
        <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#003432] border border-[#0BB4D2]/30 text-xs font-bold text-[#0BB4D2]">
          <span>⚖️ Institutional Legal Governance</span>
        </div>
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          Terms &amp; Conditions
        </h1>
        <p class="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Effective Date: October 2026 &bull; Version 2.4 &bull; Governing terms for the Fichain Pro Managed FinTech &amp; Algorithmic Simulation Platform.
        </p>
      </div>

      <!-- Quick Summary Alert -->
      <div class="p-5 rounded-2xl bg-[#002625] border border-cyan-500/30 flex items-start space-x-3.5 shadow-lg">
        <div class="text-2xl shrink-0">📜</div>
        <div class="space-y-1 text-xs leading-relaxed text-slate-300">
          <strong class="text-white text-sm block">Summary for Everyday Clients:</strong>
          Fichain Pro provides a managed trading simulation platform where your capital is allocated across cryptocurrencies and Wall Street equities. You retain full ownership of your universal USD cash, can monitor profits in real-time, and can request cashouts or file disputes at any time.
        </div>
      </div>

      <!-- Detailed Terms Content Sections -->
      <div class="space-y-10 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
        
        <!-- Section 1 -->
        <section class="space-y-3">
          <h2 class="text-lg font-black text-white flex items-center space-x-2 border-l-4 border-[#0BB4D2] pl-3">
            <span>1. Acceptance of Terms &amp; Scope of Service</span>
          </h2>
          <p>
            By accessing, creating an account, or interacting with the <strong>Fichain Pro</strong> web application, you acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions. These terms govern all interfaces, including the investor portal, executive command center, WebSocket market streams, and virtual card modules.
          </p>
          <p>
            Fichain Pro operates as an institutional FinTech trading simulation platform engineered for academic evaluation, university capstone presentation, and algorithmic research. Market quotes reflect real-world Binance and Wall Street pricing feeds.
          </p>
        </section>

        <!-- Section 2 -->
        <section class="space-y-3">
          <h2 class="text-lg font-black text-white flex items-center space-x-2 border-l-4 border-[#0BB4D2] pl-3">
            <span>2. Account Registration &amp; Security Credentials</span>
          </h2>
          <p>
            Clients may register via email credentials or Web3-style 12-Word BIP39 mnemonic recovery phrases. You are solely responsible for maintaining the confidentiality of your credentials, 4-digit security PIN, and 12-word seed phrase.
          </p>
          <ul class="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>Each client must provide accurate, verified information during identity verification (KYC).</li>
            <li>Sharing account access, automated scraping, or reverse engineering platform APIs without prior authorization is strictly prohibited.</li>
            <li>If you suspect unauthorized access to your account, you must immediately freeze your virtual cards and alert the support desk.</li>
          </ul>
        </section>

        <!-- Section 3 -->
        <section class="space-y-3">
          <h2 class="text-lg font-black text-white flex items-center space-x-2 border-l-4 border-[#0BB4D2] pl-3">
            <span>3. Managed Discretionary Trading Desk</span>
          </h2>
          <p>
            By depositing capital into Fichain Pro, you grant the platform’s designated senior trading desk and algorithmic execution engine discretionary authority to allocate positions across multi-asset portfolio baskets (including Bitcoin, Ethereum, Solana, Apple, Nvidia, and Tesla).
          </p>
          <p>
            The trading desk utilizes quantitative momentum models, statistical arbitrage, and organic market drift algorithms to optimize portfolio growth. While target outcomes are modeled for steady capital appreciation, past simulated performance does not guarantee identical future results.
          </p>
        </section>

        <!-- Section 4 -->
        <section class="space-y-3">
          <h2 class="text-lg font-black text-white flex items-center space-x-2 border-l-4 border-[#0BB4D2] pl-3">
            <span>4. Universal USD Cash Balances, Deposits &amp; 2-Step Withdrawals</span>
          </h2>
          <p>
            All user deposits (whether transmitted via Bitcoin, USDT, or simulated Wire transfer) are unified into a centralized, non-volatile USD cash ledger. This removes currency conversion frictions between cryptocurrency and stock markets.
          </p>
          <p>
            To withdraw accumulated profits, clients must complete a 2-step authentication procedure:
          </p>
          <ul class="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>Submitting a withdrawal request initiates a temporary security review by the supervisor desk.</li>
            <li>A randomized 6-digit confirmation security PIN is generated and delivered directly to the client's registered email address.</li>
            <li>Funds are released and debited from the universal balance only upon valid PIN entry.</li>
          </ul>
        </section>

        <!-- Section 5 -->
        <section class="space-y-3">
          <h2 class="text-lg font-black text-white flex items-center space-x-2 border-l-4 border-[#0BB4D2] pl-3">
            <span>5. Virtual 3D Debit Cards &amp; PIN Unmasking</span>
          </h2>
          <p>
            Clients are issued virtual Visa or Mastercard debit cards backed by their available universal USD cash balance. 
          </p>
          <ul class="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>Sensitive card data (16-digit primary account number and CVV code) are masked by default.</li>
            <li>Unmasking CVV data requires the entry of the user's secret 4-digit transaction PIN.</li>
            <li>Card freezing and unfreezing take effect immediately in the database and virtual card ledger.</li>
          </ul>
        </section>

        <!-- Section 6 -->
        <section class="space-y-3">
          <h2 class="text-lg font-black text-white flex items-center space-x-2 border-l-4 border-[#0BB4D2] pl-3">
            <span>6. Deal Closing Lifecycle &amp; Settlement Pipeline</span>
          </h2>
          <p>
            All active trade positions undergo a transparent 4-stage lifecycle:
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#002625] border border-white/10 text-xs font-mono">
            <div>
              <span class="text-emerald-400 font-bold block">Stage 1</span>
              <span class="text-white">Entry Filled</span>
            </div>
            <div>
              <span class="text-cyan-400 font-bold block">Stage 2</span>
              <span class="text-white">Live Growth</span>
            </div>
            <div>
              <span class="text-amber-400 font-bold block">Stage 3</span>
              <span class="text-white">Closing Window</span>
            </div>
            <div>
              <span class="text-emerald-300 font-bold block">Stage 4</span>
              <span class="text-white">Settled Payout</span>
            </div>
          </div>
          <p>
            When a senior broker signals <strong>Closing Soon</strong>, an amber window alerts the client that target gains are being locked in. Upon completion, trade profits immediately credit the user's universal cash balance.
          </p>
        </section>

        <!-- Section 7 -->
        <section class="space-y-3">
          <h2 class="text-lg font-black text-white flex items-center space-x-2 border-l-4 border-[#0BB4D2] pl-3">
            <span>7. Support, Formal Disputes &amp; AI Escalation</span>
          </h2>
          <p>
            Fichain Pro provides a 24/7 AI Chatbot capable of handling inquiries and automatically creating formal support tickets (<code class="bg-[#002625] px-1 py-0.5 rounded text-cyan-300">DISPUTE-...</code>) with <span class="text-rose-400 font-bold">URGENT</span> priority whenever trade issues or profit discrepancies are detected.
          </p>
          <p>
            Every dispute ticket includes bidirectional messaging and automated email updates to both the client and the supervisor desk until formal resolution.
          </p>
        </section>

        <!-- Section 8 -->
        <section class="space-y-3">
          <h2 class="text-lg font-black text-white flex items-center space-x-2 border-l-4 border-[#0BB4D2] pl-3">
            <span>8. Limitation of Liability &amp; Academic Presentation</span>
          </h2>
          <p>
            Under no circumstances shall Fichain Pro, its developers, faculty advisors, or university stakeholders be liable for indirect, incidental, or consequential damages arising from simulation errors, simulated market downtime, or local browser storage interruptions.
          </p>
        </section>

      </div>

      <!-- Bottom Confirmation Pill -->
      <div class="p-6 rounded-3xl bg-gradient-to-r from-[#003432] via-[#002625] to-[#011a19] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-base font-bold text-white">Have questions about these terms?</h3>
          <p class="text-xs text-slate-300">Our compliance desk is available to assist students, evaluators, and clients.</p>
        </div>
        <div class="flex items-center space-x-3 shrink-0">
          <a routerLink="/contact" class="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 transition">
            Contact Compliance
          </a>
          <a routerLink="/auth/register" class="px-5 py-2.5 rounded-xl btn-cyan-gradient text-xs font-black shadow-md">
            Accept &amp; Register
          </a>
        </div>
      </div>

    </div>
  `
})
export class TermsComponent {}
