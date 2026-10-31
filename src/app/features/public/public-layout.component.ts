import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MarketService } from '../../services/market.service';
import { StockService } from '../../services/stock.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-[#070c18] text-slate-100 flex flex-col selection:bg-[#0BB4D2] selection:text-white font-nunito">
      
      <!-- ========================================================================= -->
      <!-- TOP ANNOUNCEMENT & LIVE DUAL-MARKET TICKER BAR                            -->
      <!-- ========================================================================= -->
      <div class="bg-[#002625] border-b border-white/10 py-1.5 px-4 text-xs font-semibold overflow-x-auto no-scrollbar flex items-center justify-between">
        <div class="flex items-center space-x-2 shrink-0">
          <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span class="text-[#0BB4D2] uppercase tracking-wider text-[11px] font-bold">LIVE MARKETS:</span>
        </div>

        <div class="flex items-center space-x-6 overflow-x-auto no-scrollbar mx-4">
          <!-- Crypto items -->
          <div *ngFor="let tick of marketService.tickers().slice(0, 3)" class="flex items-center space-x-1.5 shrink-0 font-mono text-[11px]">
            <span class="text-cyan-300 font-bold">{{ tick.symbol }}</span>
            <span class="text-white font-semibold">\${{ tick.price >= 1 ? (tick.price | number:'1.2-2') : (tick.price | number:'1.4-4') }}</span>
            <span [ngClass]="tick.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'">
              {{ tick.change24h >= 0 ? '+' : '' }}{{ tick.change24h }}%
            </span>
          </div>

          <span class="text-slate-600 font-bold shrink-0">|</span>

          <!-- Stock items -->
          <div *ngFor="let stock of stockService.tickers().slice(0, 3)" class="flex items-center space-x-1.5 shrink-0 font-mono text-[11px]">
            <span class="text-emerald-300 font-bold">{{ stock.symbol }}</span>
            <span class="text-white font-semibold">\${{ stock.price | number:'1.2-2' }}</span>
            <span [ngClass]="stock.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'">
              {{ stock.change24h >= 0 ? '+' : '' }}{{ stock.change24h }}%
            </span>
          </div>
        </div>

        <div class="hidden sm:flex items-center space-x-2 shrink-0 text-slate-400 text-[11px]">
          <span class="text-emerald-400 font-bold">● Free $10,000 Demo Active</span>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- PUBLIC WEBSITE HEADER / NAVBAR                                            -->
      <!-- ========================================================================= -->
      <header class="sticky top-0 z-40 bg-[#070c18]/95 backdrop-blur-md border-b border-slate-800/80">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <!-- Brand Logo -->
          <a routerLink="/" class="flex items-center space-x-3 group">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#003432] via-[#0284c7] to-[#0BB4D2] p-0.5 shadow-md shadow-[#0BB4D2]/20 group-hover:scale-105 transition-transform">
              <div class="w-full h-full bg-[#002625] rounded-[10px] flex items-center justify-center font-black text-white text-lg">
                F
              </div>
            </div>
            <div>
              <span class="text-xl font-black tracking-tight text-white block">
                Fichain<span class="text-[#0BB4D2]">Pro</span>
              </span>
              <span class="text-[9px] text-slate-400 uppercase tracking-widest font-bold block -mt-0.5">
                INSTITUTIONAL FINTECH
              </span>
            </div>
          </a>

          <!-- Navigation Links (Desktop) -->
          <nav class="hidden lg:flex items-center space-x-7 text-xs font-bold text-slate-300">
            <a
              routerLink="/"
              routerLinkActive="text-[#0BB4D2]"
              [routerLinkActiveOptions]="{ exact: true }"
              class="hover:text-[#0BB4D2] transition-colors py-1"
            >
              Overview
            </a>
            <a
              routerLink="/about"
              routerLinkActive="text-[#0BB4D2]"
              class="hover:text-[#0BB4D2] transition-colors py-1"
            >
              About Us
            </a>
            <a
              routerLink="/how-it-works"
              routerLinkActive="text-[#0BB4D2]"
              class="hover:text-[#0BB4D2] transition-colors py-1"
            >
              How It Works
            </a>
            <a
              routerLink="/security"
              routerLinkActive="text-[#0BB4D2]"
              class="hover:text-[#0BB4D2] transition-colors py-1"
            >
              Security &amp; Vaults
            </a>
            <a
              routerLink="/contact"
              routerLinkActive="text-[#0BB4D2]"
              class="hover:text-[#0BB4D2] transition-colors py-1"
            >
              Contact
            </a>
          </nav>

          <!-- Action CTAs -->
          <div class="hidden sm:flex items-center space-x-3">
            <a
              routerLink="/auth/login"
              class="px-4 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-colors"
            >
              Sign In
            </a>
            <a
              routerLink="/auth/register"
              class="px-4 py-2 rounded-xl text-xs font-extrabold btn-cyan-gradient shadow-md tracking-wide"
            >
              Open Free Account
            </a>
          </div>

          <!-- Mobile Hamburger Menu Button -->
          <div class="flex items-center space-x-2 lg:hidden">
            <a
              routerLink="/auth/login"
              class="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-200 hover:text-white bg-slate-800/80 border border-slate-700/60 transition-colors sm:hidden"
            >
              Sign In
            </a>
            <button
              type="button"
              (click)="mobileMenuOpen.set(!mobileMenuOpen())"
              class="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              <svg *ngIf="!mobileMenuOpen()" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"/>
              </svg>
              <svg *ngIf="mobileMenuOpen()" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Dropdown Navigation -->
        <div
          *ngIf="mobileMenuOpen()"
          class="lg:hidden bg-[#002625] border-b border-white/10 px-4 py-4 space-y-3 text-sm font-bold shadow-2xl animate-slide-up"
        >
          <a
            routerLink="/"
            (click)="mobileMenuOpen.set(false)"
            routerLinkActive="text-[#0BB4D2]"
            [routerLinkActiveOptions]="{ exact: true }"
            class="block py-2 text-slate-200 hover:text-[#0BB4D2]"
          >
            Overview
          </a>
          <a
            routerLink="/about"
            (click)="mobileMenuOpen.set(false)"
            routerLinkActive="text-[#0BB4D2]"
            class="block py-2 text-slate-200 hover:text-[#0BB4D2]"
          >
            About Us
          </a>
          <a
            routerLink="/how-it-works"
            (click)="mobileMenuOpen.set(false)"
            routerLinkActive="text-[#0BB4D2]"
            class="block py-2 text-slate-200 hover:text-[#0BB4D2]"
          >
            How It Works
          </a>
          <a
            routerLink="/security"
            (click)="mobileMenuOpen.set(false)"
            routerLinkActive="text-[#0BB4D2]"
            class="block py-2 text-slate-200 hover:text-[#0BB4D2]"
          >
            Security &amp; Vaults
          </a>
          <a
            routerLink="/terms"
            (click)="mobileMenuOpen.set(false)"
            routerLinkActive="text-[#0BB4D2]"
            class="block py-2 text-slate-200 hover:text-[#0BB4D2]"
          >
            Terms &amp; Conditions
          </a>
          <a
            routerLink="/privacy"
            (click)="mobileMenuOpen.set(false)"
            routerLinkActive="text-[#0BB4D2]"
            class="block py-2 text-slate-200 hover:text-[#0BB4D2]"
          >
            Privacy Policy
          </a>
          <a
            routerLink="/contact"
            (click)="mobileMenuOpen.set(false)"
            routerLinkActive="text-[#0BB4D2]"
            class="block py-2 text-slate-200 hover:text-[#0BB4D2]"
          >
            Contact
          </a>

          <div class="pt-3 border-t border-white/10 flex flex-col space-y-2">
            <a
              routerLink="/auth/register"
              (click)="mobileMenuOpen.set(false)"
              class="w-full py-2.5 rounded-xl text-xs font-black btn-cyan-gradient text-center shadow-md"
            >
              Open Free Account
            </a>
          </div>
        </div>
      </header>

      <!-- ========================================================================= -->
      <!-- ROUTED PAGE CONTENT                                                       -->
      <!-- ========================================================================= -->
      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>

      <!-- ========================================================================= -->
      <!-- SOPHISTICATED INSTITUTIONAL FOOTER                                        -->
      <!-- ========================================================================= -->
      <footer class="bg-[#002625] border-t border-white/10 pt-16 pb-12 text-xs text-slate-400">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <!-- Brand & Mission Column (2 Cols) -->
            <div class="lg:col-span-2 space-y-4">
              <div class="flex items-center space-x-3">
                <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#003432] to-[#0BB4D2] flex items-center justify-center font-black text-white text-base shadow-md">
                  F
                </div>
                <div>
                  <span class="text-base font-black text-white block">Fichain Pro</span>
                  <span class="text-[9px] text-[#0BB4D2] uppercase tracking-widest font-bold block -mt-0.5">
                    MANAGED FINTECH PLATFORM
                  </span>
                </div>
              </div>
              <p class="text-xs text-slate-300 leading-relaxed max-w-sm">
                Fichain Pro bridges everyday capital with quantitative institutional execution. Designed with bank-grade multi-signature vaults, real-time Socket.IO earnings streams, and 3D virtual cards for academic simulation and university capstone defense.
              </p>
              <div class="flex items-center space-x-3 text-slate-400 text-xs pt-1">
                <span class="flex items-center space-x-1.5 font-bold text-emerald-400">
                  <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Institutional Desks Online</span>
                </span>
              </div>
            </div>

            <!-- Col 2: Platform Capabilities -->
            <div class="space-y-3">
              <h4 class="text-xs font-black uppercase tracking-wider text-white">Platform</h4>
              <ul class="space-y-2 font-medium text-slate-300">
                <li><a routerLink="/" class="hover:text-[#0BB4D2] transition">Overview</a></li>
                <li><a routerLink="/how-it-works" class="hover:text-[#0BB4D2] transition">Managed Trading</a></li>
                <li><a routerLink="/portal/hub" class="hover:text-[#0BB4D2] transition">Crypto &amp; Stocks Hub</a></li>
                <li><a routerLink="/portal/trading" class="hover:text-[#0BB4D2] transition">TradingView Charts</a></li>
                <li><a routerLink="/portal/cards" class="hover:text-[#0BB4D2] transition">3D Virtual Debit Cards</a></li>
              </ul>
            </div>

            <!-- Col 3: Company & Governance -->
            <div class="space-y-3">
              <h4 class="text-xs font-black uppercase tracking-wider text-white">Company</h4>
              <ul class="space-y-2 font-medium text-slate-300">
                <li><a routerLink="/about" class="hover:text-[#0BB4D2] transition">About Fichain Pro</a></li>
                <li><a routerLink="/how-it-works" class="hover:text-[#0BB4D2] transition">How It Works</a></li>
                <li><a routerLink="/security" class="hover:text-[#0BB4D2] transition">Security Safeguards</a></li>
                <li><a routerLink="/contact" class="hover:text-[#0BB4D2] transition">Institutional Inquiries</a></li>
              </ul>
            </div>

            <!-- Col 4: Legal & Policies -->
            <div class="space-y-3">
              <h4 class="text-xs font-black uppercase tracking-wider text-white">Legal &amp; Policy</h4>
              <ul class="space-y-2 font-medium text-slate-300">
                <li><a routerLink="/terms" class="hover:text-[#0BB4D2] transition">Terms &amp; Conditions</a></li>
                <li><a routerLink="/privacy" class="hover:text-[#0BB4D2] transition">Privacy Policy</a></li>
                <li><a routerLink="/security" class="hover:text-[#0BB4D2] transition">AML &amp; KYC Policy</a></li>
                <li><a routerLink="/contact" class="hover:text-[#0BB4D2] transition">Compliance Desk</a></li>
              </ul>
            </div>
          </div>

          <!-- Disclaimers & Copyright -->
          <div class="border-t border-white/10 pt-8 space-y-4">
            <p class="text-[11px] text-slate-400 leading-relaxed">
              <strong>Academic Simulation Notice:</strong> Fichain Pro is developed for university capstone presentations and educational FinTech research. Real market price streams are derived from Binance WebSockets and Wall Street US Equities data providers. Simulated portfolios, virtual cards, and managed balances are for demonstration purposes.
            </p>

            <div class="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
              <p>&copy; 2026 Fichain Pro. All rights reserved. Obsidian Trust Bank Architecture.</p>
              <div class="flex items-center space-x-4">
                <a routerLink="/terms" class="hover:text-white">Terms</a>
                <span>&bull;</span>
                <a routerLink="/privacy" class="hover:text-white">Privacy</a>
                <span>&bull;</span>
                <a routerLink="/security" class="hover:text-white">Security</a>
                <span>&bull;</span>
                <a routerLink="/contact" class="hover:text-white">Contact</a>
              </div>
            </div>
          </div>

        </div>
      </footer>

    </div>
  `
})
export class PublicLayoutComponent {
  marketService = inject(MarketService);
  stockService = inject(StockService);
  authService = inject(AuthService);

  mobileMenuOpen = signal<boolean>(false);
}
