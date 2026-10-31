import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="py-16 lg:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      <!-- Page Header -->
      <div class="space-y-3 border-b border-white/10 pb-8 text-center sm:text-left">
        <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#003432] border border-[#0BB4D2]/30 text-xs font-bold text-[#0BB4D2]">
          <span>🔒 Data Sovereignty &amp; Protection</span>
        </div>
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          Privacy Policy
        </h1>
        <p class="text-xs sm:text-sm text-slate-300 max-w-2xl">
          Effective Date: October 2026 &bull; Strict adherence to institutional data privacy, GDPR compliance, and banking confidentiality.
        </p>
      </div>

      <!-- Quick Highlights Card -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="p-5 rounded-2xl bg-[#002625] border border-white/10 space-y-1.5 shadow-md">
          <div class="text-xl">🛡️</div>
          <h3 class="text-sm font-bold text-white">Bank-Grade Encryption</h3>
          <p class="text-xs text-slate-300">All passwords are salted and hashed with bcrypt. Sensitive tokens use AES-256 TLS.</p>
        </div>
        <div class="p-5 rounded-2xl bg-[#002625] border border-white/10 space-y-1.5 shadow-md">
          <div class="text-xl">🚫</div>
          <h3 class="text-sm font-bold text-white">Zero Data Selling</h3>
          <p class="text-xs text-slate-300">We never monetize, share, or sell client telemetries or trading habits to third-party ad networks.</p>
        </div>
        <div class="p-5 rounded-2xl bg-[#002625] border border-white/10 space-y-1.5 shadow-md">
          <div class="text-xl">📄</div>
          <h3 class="text-sm font-bold text-white">1-Click Data Export</h3>
          <p class="text-xs text-slate-300">Instantly export your complete transaction ledger and portfolio records into formal PDF statements.</p>
        </div>
      </div>

      <!-- Detailed Privacy Sections -->
      <div class="space-y-10 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
        
        <!-- Section 1 -->
        <section class="space-y-3">
          <h2 class="text-lg font-black text-white flex items-center space-x-2 border-l-4 border-[#0BB4D2] pl-3">
            <span>1. Information We Collect</span>
          </h2>
          <p>
            When you register, utilize the trading desk, or upload identity verification documents, we collect the following categories of data:
          </p>
          <ul class="list-disc pl-5 space-y-1.5 text-slate-300">
            <li><strong>Identification &amp; Contact Details:</strong> Full name, registered email address, 4-digit security PIN, and 12-word recovery mnemonics.</li>
            <li><strong>KYC Verification Documents:</strong> National passport, driver’s license, or student identification card images provided during identity submission.</li>
            <li><strong>Ledger &amp; Transaction Activity:</strong> Real-time trade executions, deposit records, 2-step cashout requests, virtual card balances, and support ticket threads.</li>
            <li><strong>Technical &amp; Session Telemetry:</strong> IP addresses, browser agent headers, and Socket.IO heartbeat timestamps used for connection stability and fraud prevention.</li>
          </ul>
        </section>

        <!-- Section 2 -->
        <section class="space-y-3">
          <h2 class="text-lg font-black text-white flex items-center space-x-2 border-l-4 border-[#0BB4D2] pl-3">
            <span>2. How We Use Your Information</span>
          </h2>
          <p>
            Your information is processed strictly to maintain the operational integrity of your managed trading account:
          </p>
          <ul class="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>To execute simulated algorithmic trades and calculate real-time profit and loss (P&amp;L).</li>
            <li>To dispatch security-critical emails, including 6-digit withdrawal verification PINs and supervisor ticket updates.</li>
            <li>To enforce role-based access control and shield administrative routes from unauthorized access.</li>
            <li>To analyze live performance metrics and ensure high availability across crypto and equity streams.</li>
          </ul>
        </section>

        <!-- Section 3 -->
        <section class="space-y-3">
          <h2 class="text-lg font-black text-white flex items-center space-x-2 border-l-4 border-[#0BB4D2] pl-3">
            <span>3. Database Security &amp; Parameterized Query Protection</span>
          </h2>
          <p>
            Fichain Pro enforces enterprise security standards throughout its full-stack architecture. 100% of database interactions are executed using parameterized SQL statements through connection pooling (<code class="bg-[#002625] px-1 py-0.5 rounded text-cyan-300">mysql2</code>), eliminating SQL Injection vulnerabilities.
          </p>
          <p>
            Virtual debit card CVV codes and full card numbers are locked behind a secondary 4-digit transaction PIN prompt, ensuring sensitive financial visuals remain hidden even during screen shares.
          </p>
        </section>

        <!-- Section 4 -->
        <section class="space-y-3">
          <h2 class="text-lg font-black text-white flex items-center space-x-2 border-l-4 border-[#0BB4D2] pl-3">
            <span>4. Third-Party Services &amp; Market Feeds</span>
          </h2>
          <p>
            Fichain Pro connects to public Binance WebSocket feeds and Wall Street US Equities market streams for real-time price quotation. No personal user data or account identifiers are transmitted to external exchanges. All trading actions remain isolated within the Fichain Pro execution engine.
          </p>
        </section>

        <!-- Section 5 -->
        <section class="space-y-3">
          <h2 class="text-lg font-black text-white flex items-center space-x-2 border-l-4 border-[#0BB4D2] pl-3">
            <span>5. Your Data Rights &amp; Portability</span>
          </h2>
          <p>
            Under global privacy standards, you maintain rights regarding your personal information:
          </p>
          <ul class="list-disc pl-5 space-y-1.5 text-slate-300">
            <li><strong>Right of Access &amp; Portability:</strong> You can download comprehensive, cryptographically formatted PDF account statements containing your complete trade history at any time.</li>
            <li><strong>Right to Rectification:</strong> You may update profile data, reset your 4-digit PIN, or request KYC document re-evaluation via the support desk.</li>
            <li><strong>Right to Erasure:</strong> Clients can request full account closure and purging of uploaded identity documents upon request.</li>
          </ul>
        </section>

        <!-- Section 6 -->
        <section class="space-y-3">
          <h2 class="text-lg font-black text-white flex items-center space-x-2 border-l-4 border-[#0BB4D2] pl-3">
            <span>6. Data Protection Officer &amp; Inquiries</span>
          </h2>
          <p>
            If you have questions, privacy requests, or wish to exercise your data rights, please contact our institutional compliance office:
          </p>
          <div class="p-4 rounded-xl bg-[#002625] border border-white/10 font-mono text-xs text-slate-300 space-y-1">
            <div>Office of the Data Protection Officer (DPO)</div>
            <div>Email: <span class="text-cyan-300">compliance&#64;fichainpro.internal</span></div>
            <div>Academic Institution: Capstone FinTech &amp; Algorithmic Architecture</div>
          </div>
        </section>

      </div>

      <!-- Bottom Navigation Links -->
      <div class="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
        <div>Also review our <a routerLink="/terms" class="text-cyan-300 hover:underline">Terms &amp; Conditions</a></div>
        <div class="flex items-center space-x-3">
          <a routerLink="/" class="hover:text-white">&larr; Back to Overview</a>
          <span>&bull;</span>
          <a routerLink="/security" class="hover:text-white">Security Safeguards &rarr;</a>
        </div>
      </div>

    </div>
  `
})
export class PrivacyComponent {}
