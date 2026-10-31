import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="w-64 border-r border-slate-800 bg-[#090d16] flex flex-col justify-between p-4 shrink-0">
      <div class="space-y-6">
        <!-- Navigation Section: Core Trading Portal -->
        <div>
          <div class="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
            Platform Modules
          </div>
          <nav class="space-y-1">
            <a
              routerLink="/portal/dashboard"
              routerLinkActive="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold shadow-glow-cyan"
              class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-slate-800/60 hover:text-white transition-all duration-200"
            >
              <span class="text-lg">📊</span>
              <span>Portfolio Dashboard</span>
            </a>

            <a
              routerLink="/portal/trading"
              routerLinkActive="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold shadow-glow-cyan"
              class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-slate-800/60 hover:text-white transition-all duration-200"
            >
              <span class="text-lg">⚡</span>
              <div class="flex-1 flex items-center justify-between">
                <span>Trading Terminal</span>
                <span class="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 rounded">LIVE</span>
              </div>
            </a>

            <a
              routerLink="/portal/bots"
              routerLinkActive="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold shadow-glow-cyan"
              class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-slate-800/60 hover:text-white transition-all duration-200"
            >
              <span class="text-lg">🤖</span>
              <div class="flex-1 flex items-center justify-between">
                <span>Algorithmic Bots</span>
                <span class="px-1.5 py-0.5 text-[9px] font-bold bg-indigo-500/20 text-indigo-300 rounded">QUANT</span>
              </div>
            </a>

            <a
              routerLink="/portal/cards"
              routerLinkActive="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold shadow-glow-cyan"
              class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-slate-800/60 hover:text-white transition-all duration-200"
            >
              <span class="text-lg">💳</span>
              <span>3D Virtual Cards</span>
            </a>

            <a
              routerLink="/portal/wallet"
              routerLinkActive="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold shadow-glow-cyan"
              class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-slate-800/60 hover:text-white transition-all duration-200"
            >
              <span class="text-lg">🏦</span>
              <span>Funding & Statements</span>
            </a>

            <a
              routerLink="/portal/kyc"
              routerLinkActive="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold shadow-glow-cyan"
              class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-slate-800/60 hover:text-white transition-all duration-200"
            >
              <span class="text-lg">🛡️</span>
              <span>AML / KYC Compliance</span>
            </a>
          </nav>
        </div>

        <!-- Navigation Section: Executive Admin Command Center -->
        <div *ngIf="authService.isAdmin()">
          <div class="px-3 mb-2 text-[11px] font-bold tracking-wider text-purple-400 uppercase flex items-center space-x-1.5">
            <span>🛡️</span>
            <span>Executive Command</span>
          </div>
          <nav class="space-y-1">
            <a
              routerLink="/admin/overview"
              routerLinkActive="bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold"
              class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-purple-900/30 hover:text-white transition-all duration-200"
            >
              <span class="text-lg">🏛️</span>
              <span>Liquidity & Metrics</span>
            </a>

            <a
              routerLink="/admin/users"
              routerLinkActive="bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold"
              class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-purple-900/30 hover:text-white transition-all duration-200"
            >
              <span class="text-lg">👥</span>
              <span>User & Balance Editor</span>
            </a>

            <a
              routerLink="/admin/transactions"
              routerLinkActive="bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold"
              class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-purple-900/30 hover:text-white transition-all duration-200"
            >
              <span class="text-lg">📑</span>
              <span>Tx & PIN Controller</span>
            </a>

            <a
              routerLink="/admin/settings"
              routerLinkActive="bg-purple-500/15 text-purple-300 border border-purple-500/30 font-semibold"
              class="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-purple-900/30 hover:text-white transition-all duration-200"
            >
              <span class="text-lg">⚙️</span>
              <span>Feature Toggles</span>
            </a>
          </nav>
        </div>
      </div>

      <!-- Institutional Engine Status Footnote -->
      <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
        <div class="flex items-center justify-between text-slate-300 font-medium">
          <span>Engine Status:</span>
          <span class="flex items-center space-x-1 text-emerald-400 font-semibold">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>SEC SYNC OK</span>
          </span>
        </div>
        <div class="text-[10px] text-slate-500">Node v24 • Socket.IO • Binance L1</div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  authService = inject(AuthService);
}
