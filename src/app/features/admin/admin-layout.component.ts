import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastContainerComponent } from '../../shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastContainerComponent],
  template: `
    <div class="min-h-screen bg-[#070c18] flex antialiased text-slate-100 font-nunito selection:bg-purple-500 selection:text-white">

      <!-- ========================================================================= -->
      <!-- FIXED ADMIN DESKTOP SIDEBAR NAVIGATION                                    -->
      <!-- Dedicated full-height fixed left rail, #002625 / Purple Institutional      -->
      <!-- ========================================================================= -->
      <aside
        class="fixed inset-y-0 left-0 w-64 xl:w-72 bg-[#002625] text-slate-200 border-r border-purple-900/40 z-50 flex flex-col h-screen select-none transition-transform duration-300 ease-in-out shadow-2xl"
        [ngClass]="{
          'translate-x-0': isSidebarOpen(),
          '-translate-x-full lg:translate-x-0': !isSidebarOpen()
        }"
      >
        <!-- Brand Header -->
        <div class="p-5 border-b border-purple-900/40 bg-[#001c1c] flex items-center justify-between shrink-0">
          <a routerLink="/admin/overview" (click)="closeMobileSidebar()" class="flex items-center space-x-3 group">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-[#0BB4D2] p-0.5 shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <div class="w-full h-full bg-[#002625] rounded-[10px] flex items-center justify-center font-black text-purple-300 text-lg">
                ⚡
              </div>
            </div>
            <div>
              <span class="text-base font-black tracking-tight text-white block">
                Fichain<span class="text-purple-400">Admin</span>
              </span>
              <span class="text-[9px] tracking-widest text-purple-300 uppercase font-bold block -mt-0.5">
                CONTROL CENTER
              </span>
            </div>
          </a>

          <!-- Mobile Close Drawer Button -->
          <button
            (click)="closeMobileSidebar()"
            class="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Admin Identity Capsule -->
        <div *ngIf="authService.currentUser() as user" class="px-5 py-4 border-b border-purple-900/30 bg-purple-950/20 shrink-0">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-sm shadow-md shrink-0">
              AD
            </div>
            <div class="overflow-hidden flex-1 min-w-0">
              <div class="flex items-center space-x-1.5">
                <span class="font-bold text-xs text-white truncate">{{ user.full_name }}</span>
                <span class="px-1.5 py-0.2 text-[9px] font-extrabold uppercase bg-purple-500/30 text-purple-200 border border-purple-400/40 rounded">
                  SUPERVISOR
                </span>
              </div>
              <div class="text-[11px] text-slate-400 truncate">{{ user.email }}</div>
            </div>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 py-4 px-3 space-y-4 overflow-y-auto no-scrollbar text-xs font-semibold">
          <div class="space-y-1">
            <div class="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-purple-300/80">
              System Operations
            </div>

            <a
              routerLink="/admin/overview"
              routerLinkActive="bg-purple-600 text-white font-black shadow-md shadow-purple-600/30"
              (click)="closeMobileSidebar()"
              class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-purple-900/30 transition group"
            >
              <span class="text-base">🏛️</span>
              <span>Platform Liquidity &amp; Stats</span>
            </a>

            <a
              routerLink="/admin/users"
              routerLinkActive="bg-purple-600 text-white font-black shadow-md shadow-purple-600/30"
              (click)="closeMobileSidebar()"
              class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-purple-900/30 transition group"
            >
              <span class="text-base">👥</span>
              <span>User &amp; Balance Editor</span>
            </a>

            <a
              routerLink="/admin/transactions"
              routerLinkActive="bg-purple-600 text-white font-black shadow-md shadow-purple-600/30"
              (click)="closeMobileSidebar()"
              class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-purple-900/30 transition group"
            >
              <span class="text-base">📑</span>
              <span>Transactions &amp; Security PINs</span>
            </a>

            <a
              routerLink="/admin/trade-controller"
              routerLinkActive="bg-purple-600 text-white font-black shadow-md shadow-purple-600/30"
              (click)="closeMobileSidebar()"
              class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-purple-900/30 transition group"
            >
              <span class="text-base">⚡</span>
              <div class="flex-1 flex items-center justify-between">
                <span>Trade &amp; Profit Controller</span>
                <span class="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-400/20 text-emerald-300 rounded">
                  LIVE
                </span>
              </div>
            </a>

            <a
              routerLink="/admin/plans"
              routerLinkActive="bg-purple-600 text-white font-black shadow-md shadow-purple-600/30"
              (click)="closeMobileSidebar()"
              class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-purple-900/30 transition group"
            >
              <span class="text-base">🌱</span>
              <div class="flex-1 flex items-center justify-between">
                <span>Growth Plan Controller</span>
                <span class="px-1.5 py-0.5 text-[9px] font-bold bg-cyan-400/20 text-cyan-300 rounded">
                  TARGET
                </span>
              </div>
            </a>

            <a
              routerLink="/admin/support"
              routerLinkActive="bg-purple-600 text-white font-black shadow-md shadow-purple-600/30"
              (click)="closeMobileSidebar()"
              class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-purple-900/30 transition group"
            >
              <span class="text-base">🚨</span>
              <div class="flex-1 flex items-center justify-between">
                <span>Support &amp; Disputes</span>
                <span class="px-1.5 py-0.5 text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded">
                  CASES
                </span>
              </div>
            </a>

            <a
              routerLink="/admin/settings"
              routerLinkActive="bg-purple-600 text-white font-black shadow-md shadow-purple-600/30"
              (click)="closeMobileSidebar()"
              class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-purple-900/30 transition group"
            >
              <span class="text-base">⚙️</span>
              <span>Feature Toggles &amp; Rules</span>
            </a>
          </div>

          <div class="pt-4 border-t border-purple-900/30 space-y-1">
            <div class="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Client Portal
            </div>
            <a
              routerLink="/portal/dashboard"
              (click)="closeMobileSidebar()"
              class="flex items-center space-x-3 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-[#003432] text-cyan-300 hover:text-white transition font-bold"
            >
              <span class="text-base">📊</span>
              <span>Open Trader App View &rarr;</span>
            </a>
          </div>
        </nav>

        <!-- Sidebar Bottom Footer -->
        <div class="p-4 border-t border-purple-900/40 bg-[#001c1c] shrink-0 space-y-2">
          <button
            (click)="authService.logout()"
            class="w-full px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-bold flex items-center justify-center space-x-2 transition"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <!-- Sidebar Backdrop Overlay -->
      <div
        *ngIf="isSidebarOpen()"
        (click)="closeMobileSidebar()"
        class="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
      ></div>

      <!-- Main Admin Workspace Canvas -->
      <div class="flex-1 flex flex-col min-h-screen lg:pl-64 xl:pl-72 transition-all duration-300 min-w-0 max-w-full overflow-x-hidden">
        
        <!-- Mobile Header (lg:hidden) -->
        <header class="sticky top-0 z-30 bg-[#001c1c]/95 backdrop-blur-md border-b border-purple-900/40 text-white shadow-md lg:hidden px-4 py-3 flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="text-sm font-black text-white">Fichain<span class="text-purple-400">Admin</span></span>
            <span class="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-purple-500/20 text-purple-300 rounded">
              CONTROL
            </span>
          </div>

          <div class="flex items-center space-x-2">
            <a routerLink="/portal/dashboard" class="px-2.5 py-1 rounded-lg bg-teal-900/60 text-cyan-300 text-xs font-bold">
              Trader Portal
            </a>
            <button
              (click)="toggleSidebar()"
              class="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition active:scale-95"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
          </div>
        </header>

        <!-- Desktop Header (hidden lg:flex) -->
        <header class="sticky top-0 z-30 bg-[#002625]/90 backdrop-blur-md border-b border-purple-900/40 text-white shadow-sm hidden lg:flex px-8 py-3.5 items-center justify-between">
          <div>
            <h1 class="text-sm font-bold text-white flex items-center space-x-2">
              <span>Admin Management Panel</span>
              <span class="px-2 py-0.5 text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full">
                SUPERVISOR
              </span>
            </h1>
            <p class="text-xs text-slate-400">Control system liquidity, user balances, security PINs, and feature switches</p>
          </div>

          <div class="flex items-center space-x-4">
            <a
              routerLink="/portal/dashboard"
              class="px-3.5 py-1.5 rounded-xl bg-[#003432] hover:bg-[#002625] text-cyan-300 border border-[#0BB4D2]/30 text-xs font-bold transition flex items-center space-x-1.5"
            >
              <span>📊 Open Trader Portal</span>
            </a>

            <button
              (click)="authService.logout()"
              class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-white/10 text-xs font-semibold transition"
            >
              Sign Out
            </button>
          </div>
        </header>

        <!-- Main Workspace Body -->
        <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0 pb-12">
          <router-outlet></router-outlet>
        </main>

        <!-- Footer -->
        <footer class="py-4 px-8 border-t border-purple-900/20 text-xs text-slate-500 bg-[#001c1c]/40 hidden lg:block">
          <div class="max-w-7xl mx-auto flex items-center justify-between">
            <div>&copy; 2026 <strong>Fichain Pro Admin Engine</strong>. Authorized Faculty &amp; Reviewers Only.</div>
            <div class="text-[11px] text-slate-400">All actions logged &amp; timestamped</div>
          </div>
        </footer>
      </div>

      <app-toast-container></app-toast-container>
    </div>
  `
})
export class AdminLayoutComponent {
  authService = inject(AuthService);
  isSidebarOpen = signal<boolean>(false);

  toggleSidebar(): void {
    this.isSidebarOpen.update(v => !v);
  }

  closeMobileSidebar(): void {
    this.isSidebarOpen.set(false);
  }
}
