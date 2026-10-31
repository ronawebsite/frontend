import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TradeService } from '../../services/trade.service';
import { ToastContainerComponent } from '../../shared/components/toast-container/toast-container.component';
import { AiChatbotComponent } from '../../shared/components/ai-chatbot/ai-chatbot.component';

@Component({
  selector: 'app-portal-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastContainerComponent, AiChatbotComponent],
  template: `
    <div class="min-h-screen bg-[#070c18] flex antialiased text-slate-100 font-nunito selection:bg-[#0BB4D2] selection:text-white">

      <!-- ========================================================================= -->
      <!-- FIXED DESKTOP SIDEBAR NAVIGATION                                          -->
      <!-- Dedicated full-height fixed left rail, #003432 Deep Teal                  -->
      <!-- ========================================================================= -->
      <aside
        class="fixed inset-y-0 left-0 w-64 xl:w-72 bg-[#003432] text-slate-200 border-r border-[#002625] z-50 flex flex-col h-screen select-none transition-transform duration-300 ease-in-out shadow-2xl"
        [ngClass]="{
          'translate-x-0': isSidebarOpen(),
          '-translate-x-full lg:translate-x-0': !isSidebarOpen()
        }"
      >
        <!-- Sidebar Brand Header -->
        <div class="p-5 border-b border-white/10 bg-[#002625] flex items-center justify-between shrink-0">
          <a routerLink="/portal/dashboard" (click)="closeMobileSidebar()" class="flex items-center space-x-3 group">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#003432] via-[#0284c7] to-[#0BB4D2] p-0.5 shadow-md shadow-[#0BB4D2]/20 group-hover:scale-105 transition-transform">
              <div class="w-full h-full bg-[#002625] rounded-[10px] flex items-center justify-center font-black text-white text-lg">
                F
              </div>
            </div>
            <div>
              <span class="text-base font-black tracking-tight text-white block">
                Fichain<span class="text-[#0BB4D2]">Pro</span>
              </span>
              <span class="text-[9px] tracking-widest text-cyan-300 uppercase font-bold block -mt-0.5">
                MANAGED EARNINGS
              </span>
            </div>
          </a>

          <!-- Mobile Close Drawer Button -->
          <button
            (click)="closeMobileSidebar()"
            class="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
            aria-label="Close Sidebar"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- User Identity Profile Capsule -->
        <div *ngIf="authService.currentUser() as user" class="px-5 py-4 border-b border-white/10 bg-black/20 shrink-0 space-y-2">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0BB4D2] to-cyan-300 text-[#003432] flex items-center justify-center font-black text-sm shadow-md shrink-0">
              {{ getUserInitials(user.full_name) }}
            </div>
            <div class="overflow-hidden flex-1 min-w-0">
              <div class="flex items-center space-x-1.5">
                <span class="font-bold text-xs text-white truncate">{{ user.full_name }}</span>
                <span
                  *ngIf="user.role === 'admin'"
                  class="px-1.5 py-0.2 text-[9px] font-extrabold uppercase bg-purple-500/30 text-purple-200 border border-purple-400/30 rounded"
                >
                  ADMIN
                </span>
                <span
                  *ngIf="user.role !== 'admin'"
                  class="px-1.5 py-0.2 text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded"
                >
                  INVESTOR
                </span>
              </div>

              <!-- Account ID & Quick Copy -->
              <button
                (click)="copyAccountId(user.account_id)"
                title="Click to copy account ID"
                class="mt-0.5 group flex items-center space-x-1.5 text-[11px] text-slate-300 font-mono hover:text-[#0BB4D2] transition"
              >
                <span>{{ user.account_id }}</span>
                <span class="text-[9px] px-1 py-0.2 rounded bg-white/10 text-slate-300 group-hover:text-[#0BB4D2]">
                  {{ copiedAccount() ? '✓ Copied' : 'Copy' }}
                </span>
              </button>
            </div>
          </div>

          <!-- Account Managed Badge -->
          <div class="p-2 rounded-xl bg-[#002625] border border-emerald-500/30 flex items-center justify-between text-[11px]">
            <span class="text-slate-300 flex items-center space-x-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span class="font-bold">Managed Account:</span>
            </span>
            <span class="text-emerald-400 font-black">Active</span>
          </div>
        </div>

        <!-- Clean, Layman Navigation Links -->
        <nav class="flex-1 py-4 px-3 space-y-6 overflow-y-auto no-scrollbar text-xs font-semibold">
          
          <!-- Section 1: Earnings & Growth -->
          <div class="space-y-1">
            <div class="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300/80">
              My Growth &amp; Profits
            </div>

            <a
              routerLink="/portal/dashboard"
              routerLinkActive="bg-[#0BB4D2] text-[#002625] font-black shadow-md shadow-[#0BB4D2]/20"
              (click)="closeMobileSidebar()"
              class="flex items-center space-x-3 px-3.5 py-3 rounded-2xl text-slate-200 hover:text-white hover:bg-white/10 transition group"
            >
              <span class="text-lg">📊</span>
              <span>My Live Earnings</span>
            </a>

            <a
              routerLink="/portal/trading"
              routerLinkActive="bg-[#0BB4D2] text-[#002625] font-black shadow-md shadow-[#0BB4D2]/20"
              (click)="closeMobileSidebar()"
              class="flex items-center space-x-3 px-3.5 py-3 rounded-2xl text-slate-200 hover:text-white hover:bg-white/10 transition group"
            >
              <span class="text-lg">⚡</span>
              <span>Live Trading Room</span>
            </a>

            <a
              routerLink="/portal/plans"
              routerLinkActive="bg-[#0BB4D2] text-[#002625] font-black shadow-md shadow-[#0BB4D2]/20"
              (click)="closeMobileSidebar()"
              class="flex items-center space-x-3 px-3.5 py-3 rounded-2xl text-slate-200 hover:text-white hover:bg-white/10 transition group"
            >
              <span class="text-lg">🌱</span>
              <div class="flex items-center justify-between w-full">
                <span>Growth Plans</span>
                <span class="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  TARGET
                </span>
              </div>
            </a>
          </div>

          <!-- Section 2: Deposits & Cash Out -->
          <div class="space-y-1">
            <div class="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300/80">
              Money &amp; Banking
            </div>

            <a
              routerLink="/portal/wallet"
              routerLinkActive="bg-[#0BB4D2] text-[#002625] font-black shadow-md shadow-[#0BB4D2]/20"
              (click)="closeMobileSidebar()"
              class="flex items-center space-x-3 px-3.5 py-3 rounded-2xl text-slate-200 hover:text-white hover:bg-white/10 transition group"
            >
              <span class="text-lg">📥</span>
              <span>Deposit Money</span>
            </a>

            <a
              routerLink="/portal/wallet"
              routerLinkActive="bg-[#0BB4D2] text-[#002625] font-black shadow-md shadow-[#0BB4D2]/20"
              (click)="closeMobileSidebar()"
              class="flex items-center space-x-3 px-3.5 py-3 rounded-2xl text-slate-200 hover:text-white hover:bg-white/10 transition group"
            >
              <span class="text-lg">📤</span>
              <span>Withdraw Profits</span>
            </a>

            <a
              routerLink="/portal/cards"
              routerLinkActive="bg-[#0BB4D2] text-[#002625] font-black shadow-md shadow-[#0BB4D2]/20"
              (click)="closeMobileSidebar()"
              class="flex items-center space-x-3 px-3.5 py-3 rounded-2xl text-slate-200 hover:text-white hover:bg-white/10 transition group"
            >
              <span class="text-lg">💳</span>
              <span>Virtual Debit Card</span>
            </a>
          </div>

          <!-- Section 3: Verification -->
          <div class="space-y-1">
            <div class="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300/80">
              Safety &amp; Compliance
            </div>

            <a
              routerLink="/portal/kyc"
              routerLinkActive="bg-[#0BB4D2] text-[#002625] font-black shadow-md shadow-[#0BB4D2]/20"
              (click)="closeMobileSidebar()"
              class="flex items-center space-x-3 px-3.5 py-3 rounded-2xl text-slate-200 hover:text-white hover:bg-white/10 transition group"
            >
              <span class="text-lg">🛡️</span>
              <span>Verify Identity (KYC)</span>
            </a>
          </div>

          <!-- Section 4: Care & Inquiries -->
          <div class="space-y-1">
            <div class="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300/80">
              Care &amp; Inquiries
            </div>

            <a
              routerLink="/portal/support"
              routerLinkActive="bg-[#0BB4D2] text-[#002625] font-black shadow-md shadow-[#0BB4D2]/20"
              (click)="closeMobileSidebar()"
              class="flex items-center space-x-3 px-3.5 py-3 rounded-2xl text-slate-200 hover:text-white hover:bg-white/10 transition group"
            >
              <span class="text-lg">💬</span>
              <span>Support &amp; Disputes</span>
            </a>
          </div>

          <!-- Admin Section (If User is Administrator) -->
          <div *ngIf="authService.isAdmin()" class="space-y-1 pt-2">
            <div class="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-purple-300">
              Admin Command
            </div>
            <a
              routerLink="/admin/trade-controller"
              class="flex items-center space-x-3 px-3.5 py-3 rounded-2xl bg-purple-900/40 border border-purple-500/30 text-purple-200 hover:bg-purple-800/50 hover:text-white transition font-bold shadow-md"
            >
              <span class="text-lg">⚡</span>
              <span>Trade &amp; Profit Controller</span>
            </a>
            <a
              routerLink="/admin/support"
              class="flex items-center space-x-3 px-3.5 py-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-200 hover:bg-rose-900/50 hover:text-white transition font-bold shadow-md mt-1"
            >
              <span class="text-lg">🚨</span>
              <span>Disputes &amp; Support</span>
            </a>
          </div>
        </nav>

        <!-- Sidebar Bottom Footer: Stream Status & Sign Out -->
        <div class="p-4 border-t border-white/10 bg-[#002625] shrink-0 space-y-3">
          <div class="flex items-center justify-between text-[11px] text-slate-300 px-1">
            <span class="text-slate-400">Live Manager Trading:</span>
            <span class="flex items-center space-x-1.5 text-emerald-400 font-bold">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Connected</span>
            </span>
          </div>

          <button
            (click)="authService.logout()"
            class="w-full px-3 py-2 rounded-xl bg-white/5 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 text-xs font-bold flex items-center justify-center space-x-2 transition"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <!-- Sidebar Backdrop Overlay (Mobile/Tablet drawer open) -->
      <div
        *ngIf="isSidebarOpen()"
        (click)="closeMobileSidebar()"
        class="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
      ></div>

      <!-- ========================================================================= -->
      <!-- MAIN WORKSPACE CANVAS                                                     -->
      <!-- Dedicated offset for desktop sidebar (lg:pl-64 xl:pl-72)                   -->
      <!-- ========================================================================= -->
      <div class="flex-1 flex flex-col min-h-screen lg:pl-64 xl:pl-72 transition-all duration-300 min-w-0 max-w-full overflow-x-hidden">
        
        <!-- ========================================================================= -->
        <!-- MOBILE NATIVE APP HEADER (< 1024px)                                       -->
        <!-- ========================================================================= -->
        <header class="sticky top-0 z-30 bg-[#002625]/95 backdrop-blur-md border-b border-white/10 text-white shadow-md lg:hidden">
          <div class="px-4 py-3 flex items-center justify-between">
            <!-- Left: Avatar + Layman Greeting -->
            <div class="flex items-center space-x-2.5" *ngIf="authService.currentUser() as user">
              <button
                (click)="toggleServicesTray()"
                class="relative focus:outline-none active:scale-95 transition"
                title="Open Quick Services"
              >
                <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#003432] to-[#0BB4D2] text-white flex items-center justify-center font-black text-xs shadow-sm">
                  {{ getUserInitials(user.full_name) }}
                </div>
                <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#002625]"></span>
              </button>

              <div class="leading-tight">
                <span class="text-xs font-bold text-white block">
                  Hi, {{ user.full_name.split(' ')[0] }}
                </span>
                <span class="text-[10px] text-emerald-400 font-bold">
                  Managed Account
                </span>
              </div>
            </div>

            <!-- Right: Deposit Button & Menu Drawer Toggle -->
            <div class="flex items-center space-x-2">
              <a
                routerLink="/portal/wallet"
                class="px-2.5 py-1.5 rounded-xl btn-cyan-gradient text-xs font-bold shadow-md shadow-[#0BB4D2]/20 flex items-center space-x-1"
              >
                <span>➕ Deposit</span>
              </a>

              <button
                (click)="toggleSidebar()"
                class="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition active:scale-95"
                aria-label="Open Navigation Drawer"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>
            </div>
          </div>
        </header>

        <!-- ========================================================================= -->
        <!-- DESKTOP TOP HEADER (lg+ screens)                                          -->
        <!-- ========================================================================= -->
        <header class="sticky top-0 z-30 bg-[#002625]/85 backdrop-blur-md border-b border-white/10 text-white shadow-sm hidden lg:block">
          <div class="px-8 py-3 flex items-center justify-between">
            
            <!-- Left: Managed Session Status Banner -->
            <div class="flex items-center space-x-2.5">
              <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span class="text-xs font-bold text-emerald-300">
                Institutional Desk Active
              </span>
            </div>

            <!-- Right: Clean Deposit & Withdraw Actions -->
            <div class="flex items-center space-x-2.5">
              <a
                routerLink="/portal/wallet"
                class="px-3.5 py-1.5 rounded-xl btn-cyan-gradient text-xs font-black shadow-md shadow-[#0BB4D2]/20 flex items-center space-x-1.5"
              >
                <span>📥 Deposit</span>
              </a>

              <a
                routerLink="/portal/wallet"
                class="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 transition flex items-center space-x-1.5"
              >
                <span>📤 Withdraw</span>
              </a>

              <button
                (click)="authService.logout()"
                class="px-3 py-2 rounded-xl bg-white/5 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-white/10 text-xs font-semibold transition"
                title="Sign Out"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        <!-- ========================================================================= -->
        <!-- BROKER ACTION DIRECTIVE BANNER (Persistent until actioned)                -->
        <!-- ========================================================================= -->
        <div
          *ngIf="tradeService.activePrompts().length > 0 && !tradeService.latestPrompt()"
          class="bg-gradient-to-r from-amber-950/90 via-amber-900/70 to-[#002625] border-b border-amber-500/40 px-4 sm:px-8 py-2.5 flex items-center justify-between shadow-lg text-white"
        >
          <div class="flex items-center space-x-3 overflow-hidden">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0"></span>
            <span class="text-xs font-black text-amber-300 uppercase tracking-wide shrink-0">
              ⚡ Action Required:
            </span>
            <span class="text-xs text-slate-200 truncate font-semibold">
              {{ tradeService.activePrompts()[0].title }} &bull; Need +\${{ tradeService.activePrompts()[0].target_amount | number:'1.0-0' }} for target
            </span>
          </div>

          <button
            (click)="openLatestPrompt()"
            class="ml-3 px-3.5 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition shrink-0 active:scale-95"
          >
            Review Directive &rarr;
          </button>
        </div>

        <!-- ========================================================================= -->
        <!-- MAIN WORKSPACE BODY                                                       -->
        <!-- ========================================================================= -->
        <main class="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0 pb-28 lg:pb-8">
          <router-outlet></router-outlet>
        </main>

        <!-- Clean Footer Strip (Desktop only) -->
        <footer class="py-4 px-8 border-t border-white/5 text-xs text-slate-500 bg-[#002625]/40 hidden lg:block">
          <div class="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              &copy; 2026 <strong>Fichain Pro</strong>. Managed Investment &amp; Real-Time Earnings Platform.
            </div>
            <div class="text-[11px] text-slate-400">
              Live Real-Time Manager Trade Execution &bull; Instant Cash Payouts
            </div>
          </div>
        </footer>

      </div>

      <!-- ========================================================================= -->
      <!-- MOBILE APP BOTTOM NAVIGATION BAR (Sticky Phone Dock)                      -->
      <!-- ========================================================================= -->
      <nav class="fixed bottom-0 inset-x-0 z-40 bg-[#002625]/95 backdrop-blur-xl border-t border-white/10 py-1.5 px-3 flex items-center justify-around lg:hidden select-none shadow-[0_-4px_25px_rgba(0,0,0,0.4)]">
        
        <!-- Tab 1: Home Earnings -->
        <a
          routerLink="/portal/dashboard"
          routerLinkActive="text-[#0BB4D2] font-black"
          (click)="closeServicesTray()"
          class="flex flex-col items-center justify-center py-1 px-2.5 text-slate-400 hover:text-[#0BB4D2] transition group active:scale-95"
        >
          <div class="p-1 rounded-xl group-[.font-black]:bg-[#003432] group-[.font-black]:text-[#0BB4D2]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
          </div>
          <span class="text-[10px] mt-0.5 font-bold tracking-tight">Earnings</span>
        </a>

        <!-- Tab 2: Live Room -->
        <a
          routerLink="/portal/trading"
          routerLinkActive="text-[#0BB4D2] font-black"
          (click)="closeServicesTray()"
          class="flex flex-col items-center justify-center py-1 px-2.5 text-slate-400 hover:text-[#0BB4D2] transition group active:scale-95"
        >
          <div class="p-1 rounded-xl group-[.font-black]:bg-[#003432] group-[.font-black]:text-[#0BB4D2]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
          </div>
          <span class="text-[10px] mt-0.5 font-bold tracking-tight">Live Room</span>
        </a>

        <!-- Tab 3: Deposit -->
        <a
          routerLink="/portal/wallet"
          routerLinkActive="text-[#0BB4D2] font-black"
          (click)="closeServicesTray()"
          class="flex flex-col items-center justify-center py-1 px-2.5 text-slate-400 hover:text-[#0BB4D2] transition group active:scale-95"
        >
          <div class="p-1 rounded-xl group-[.font-black]:bg-[#003432] group-[.font-black]:text-[#0BB4D2]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 4v16m8-8H4"/>
            </svg>
          </div>
          <span class="text-[10px] mt-0.5 font-bold tracking-tight">Deposit</span>
        </a>

        <!-- Tab 4: Cards -->
        <a
          routerLink="/portal/cards"
          routerLinkActive="text-[#0BB4D2] font-black"
          (click)="closeServicesTray()"
          class="flex flex-col items-center justify-center py-1 px-2.5 text-slate-400 hover:text-[#0BB4D2] transition group active:scale-95"
        >
          <div class="p-1 rounded-xl group-[.font-black]:bg-[#003432] group-[.font-black]:text-[#0BB4D2]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect width="20" height="14" x="2" y="5" rx="2" stroke-width="2.2"></rect>
              <line x1="2" x2="22" y1="10" y2="10" stroke-width="2.2"></line>
            </svg>
          </div>
          <span class="text-[10px] mt-0.5 font-bold tracking-tight">Cards</span>
        </a>

        <!-- Tab 5: More Drawer -->
        <button
          (click)="toggleServicesTray()"
          [ngClass]="isServicesTrayOpen() ? 'text-[#0BB4D2] font-black' : 'text-slate-400'"
          class="flex flex-col items-center justify-center py-1 px-2.5 hover:text-[#0BB4D2] transition group active:scale-95 focus:outline-none"
        >
          <div class="p-1 rounded-xl transition" [ngClass]="isServicesTrayOpen() ? 'bg-[#003432] text-[#0BB4D2]' : ''">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
            </svg>
          </div>
          <span class="text-[10px] mt-0.5 font-bold tracking-tight">More</span>
        </button>

      </nav>

      <!-- ========================================================================= -->
      <!-- MOBILE APP SERVICES TRAY (Slide-Up Drawer)                                -->
      <!-- ========================================================================= -->
      <div *ngIf="isServicesTrayOpen()" class="fixed inset-0 z-50 lg:hidden">
        <div
          (click)="closeServicesTray()"
          class="absolute inset-0 bg-black/70 backdrop-blur-xs animate-fade-in transition-opacity"
        ></div>

        <div class="absolute bottom-0 inset-x-0 bg-[#002625] rounded-t-3xl border-t border-white/10 shadow-2xl max-h-[85vh] overflow-y-auto p-5 pb-10 space-y-6 animate-slide-up text-white">
          <div class="w-12 h-1.5 bg-white/20 rounded-full mx-auto -mt-1"></div>

          <div class="flex items-center justify-between pb-3 border-b border-white/10">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-2xl bg-[#003432] text-[#0BB4D2] flex items-center justify-center font-bold text-sm shadow-md border border-[#0BB4D2]/30">
                FP
              </div>
              <div>
                <h3 class="text-sm font-extrabold text-white">Investor Services</h3>
                <p class="text-[11px] text-slate-300">Fast access to account actions</p>
              </div>
            </div>
            <button
              (click)="closeServicesTray()"
              class="w-8 h-8 rounded-full bg-white/10 text-slate-300 hover:text-white flex items-center justify-center font-bold text-lg"
            >
              &times;
            </button>
          </div>

          <!-- Grid: Actions -->
          <div class="grid grid-cols-5 gap-2 text-center">
            <a
              routerLink="/portal/plans"
              (click)="closeServicesTray()"
              class="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition"
            >
              <div class="w-10 h-10 rounded-2xl bg-[#003432] text-cyan-300 flex items-center justify-center text-lg shadow-sm border border-[#0BB4D2]/30">🌱</div>
              <span class="text-[9px] font-bold text-slate-200 leading-tight">Plans</span>
            </a>

            <a
              routerLink="/portal/wallet"
              (click)="closeServicesTray()"
              class="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition"
            >
              <div class="w-10 h-10 rounded-2xl bg-[#003432] text-emerald-400 flex items-center justify-center text-lg shadow-sm">📥</div>
              <span class="text-[9px] font-bold text-slate-200 leading-tight">Deposit</span>
            </a>

            <a
              routerLink="/portal/wallet"
              (click)="closeServicesTray()"
              class="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition"
            >
              <div class="w-10 h-10 rounded-2xl bg-[#003432] text-cyan-400 flex items-center justify-center text-lg shadow-sm">📤</div>
              <span class="text-[9px] font-bold text-slate-200 leading-tight">Withdraw</span>
            </a>

            <a
              routerLink="/portal/cards"
              (click)="closeServicesTray()"
              class="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition"
            >
              <div class="w-10 h-10 rounded-2xl bg-[#003432] text-indigo-400 flex items-center justify-center text-lg shadow-sm">💳</div>
              <span class="text-[9px] font-bold text-slate-200 leading-tight">Cards</span>
            </a>

            <a
              routerLink="/portal/kyc"
              (click)="closeServicesTray()"
              class="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition"
            >
              <div class="w-10 h-10 rounded-2xl bg-[#003432] text-amber-400 flex items-center justify-center text-lg shadow-sm">🛡️</div>
              <span class="text-[9px] font-bold text-slate-200 leading-tight">KYC</span>
            </a>
          </div>

          <!-- Admin Shortcut -->
          <div *ngIf="authService.isAdmin()" class="pt-2">
            <a
              routerLink="/admin/trade-controller"
              (click)="closeServicesTray()"
              class="w-full py-3 rounded-xl bg-gradient-to-r from-purple-800 to-indigo-700 text-white font-black text-xs flex items-center justify-center space-x-2 shadow-md"
            >
              <span>⚡ Switch to Trade &amp; Profit Controller</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Global Toast Container -->
      <app-toast-container></app-toast-container>

      <!-- 24/7 AI Chatbot & Dispute Escalator -->
      <app-ai-chatbot></app-ai-chatbot>

      <!-- ========================================================================= -->
      <!-- HIGH-PRIORITY BROKER TOP-UP DIRECTIVE MODAL                               -->
      <!-- ========================================================================= -->
      <div
        *ngIf="tradeService.latestPrompt() as prompt"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      >
        <div
          class="w-full max-w-lg rounded-3xl bg-[#002625] border-2 shadow-2xl p-6 sm:p-7 space-y-5 text-white relative overflow-hidden"
          [ngClass]="{
            'border-rose-500 shadow-rose-950/60': prompt.urgency === 'CRITICAL',
            'border-amber-400 shadow-amber-950/60': prompt.urgency === 'HIGH' || !prompt.urgency,
            'border-[#0BB4D2] shadow-cyan-950/60': prompt.urgency === 'NORMAL'
          }"
        >
          <!-- Glowing subtle background aura -->
          <div class="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-[#0BB4D2]/15 blur-3xl pointer-events-none"></div>

          <!-- Header: Desk Identity & Close -->
          <div class="flex items-start justify-between border-b border-white/10 pb-4">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 rounded-2xl bg-[#003432] border border-[#0BB4D2]/40 text-[#0BB4D2] flex items-center justify-center text-2xl shadow-md">
                🏛️
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <span class="text-[11px] font-black uppercase tracking-wider text-slate-300">
                    Institutional Desk
                  </span>
                  <span
                    class="px-2 py-0.5 text-[9px] font-black rounded-full uppercase"
                    [ngClass]="{
                      'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse': prompt.urgency === 'CRITICAL',
                      'bg-amber-500/20 text-amber-300 border border-amber-500/40': prompt.urgency === 'HIGH' || !prompt.urgency,
                      'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40': prompt.urgency === 'NORMAL'
                    }"
                  >
                    {{ prompt.urgency || 'PRIORITY' }} DIRECTIVE
                  </span>
                </div>
                <h3 class="text-lg sm:text-xl font-black text-white mt-0.5">
                  {{ prompt.title }}
                </h3>
              </div>
            </div>

            <button
              (click)="tradeService.closeLatestPromptBanner()"
              class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition text-lg"
              title="Minimize Directive"
            >
              &times;
            </button>
          </div>

          <!-- Broker Message / Directive -->
          <div class="p-4 rounded-2xl bg-[#003432] border border-white/10 space-y-2">
            <div class="flex items-center space-x-2 text-xs font-bold text-cyan-300">
              <span>💬</span>
              <span>Managing Broker Instruction:</span>
            </div>
            <p class="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              {{ prompt.message }}
            </p>
          </div>

          <!-- Two Highlight Metric Cards: Required Top Up & Target Projected Payout -->
          <div class="grid grid-cols-2 gap-3">
            <div class="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-center space-y-1">
              <span class="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                Required Top-Up
              </span>
              <span class="text-xl sm:text-2xl font-black text-white font-mono block">
                \${{ (prompt.target_amount || 0) | number:'1.2-2' }}
              </span>
              <span class="text-[10px] text-amber-200/80 block">
                Boosts trading allocation
              </span>
            </div>

            <div class="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-center space-y-1">
              <span class="text-[10px] font-black uppercase tracking-wider text-emerald-300 block">
                Target Projected Payout
              </span>
              <span class="text-xl sm:text-2xl font-black text-emerald-400 font-mono block">
                +\${{ (prompt.expected_payout || 0) | number:'1.2-2' }}
              </span>
              <span class="text-[10px] text-emerald-200/80 block">
                Estimated profit outcome
              </span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="space-y-2 pt-1">
            <button
              (click)="goToTopUp(prompt)"
              class="w-full py-3.5 px-5 rounded-2xl btn-cyan-gradient font-black text-sm text-[#002625] shadow-lg shadow-[#0BB4D2]/30 flex items-center justify-center space-x-2 transition transform active:scale-98"
            >
              <span>📥 Top Up Capital Now (\${{ (prompt.target_amount || 0) | number:'1.0-0' }})</span>
              <span>&rarr;</span>
            </button>

            <div class="flex items-center justify-between text-xs pt-2 px-1">
              <button
                (click)="tradeService.closeLatestPromptBanner()"
                class="text-slate-400 hover:text-white transition font-medium"
              >
                Remind Me Later
              </button>
              <button
                (click)="dismissPrompt(prompt.id)"
                class="text-rose-400 hover:text-rose-300 transition font-medium"
              >
                Acknowledge &amp; Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PortalLayoutComponent {
  authService = inject(AuthService);
  tradeService = inject(TradeService);
  router = inject(Router);

  isSidebarOpen = signal<boolean>(false);
  isServicesTrayOpen = signal<boolean>(false);
  copiedAccount = signal<boolean>(false);

  toggleSidebar(): void {
    this.isSidebarOpen.update(v => !v);
  }

  closeMobileSidebar(): void {
    this.isSidebarOpen.set(false);
  }

  toggleServicesTray(): void {
    this.isServicesTrayOpen.update(v => !v);
  }

  closeServicesTray(): void {
    this.isServicesTrayOpen.set(false);
  }

  openLatestPrompt(): void {
    const prompts = this.tradeService.activePrompts();
    if (prompts.length > 0) {
      this.tradeService.latestPrompt.set(prompts[0]);
    }
  }

  goToTopUp(prompt: any): void {
    const amt = prompt.target_amount || 1000;
    this.tradeService.closeLatestPromptBanner();
    this.router.navigate(['/portal/wallet'], { queryParams: { amount: amt } });
  }

  dismissPrompt(id: number): void {
    this.tradeService.dismissPromptLocally(id);
  }

  copyAccountId(id: string): void {
    if (id) {
      navigator.clipboard.writeText(id);
      this.copiedAccount.set(true);
      setTimeout(() => this.copiedAccount.set(false), 2000);
    }
  }

  getUserInitials(name: string): string {
    if (!name) return 'FP';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
}
