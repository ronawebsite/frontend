import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MarketService } from '../../../services/market.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#090d16]/90 backdrop-blur-md">
      <!-- Live Real-Time Ticker Tape -->
      <div class="hidden lg:flex items-center space-x-6 overflow-x-auto py-1.5 px-6 border-b border-slate-800/60 text-xs bg-slate-950/60 no-scrollbar">
        <div class="flex items-center space-x-2 text-cyan-400 font-mono font-semibold uppercase tracking-wider shrink-0">
          <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>LIVE BINANCE FEED:</span>
        </div>
        <div class="flex items-center space-x-6 overflow-x-auto">
          <div
            *ngFor="let tick of marketService.tickers()"
            (click)="marketService.setActivePair(tick.pair)"
            class="flex items-center space-x-2 cursor-pointer py-0.5 px-2 rounded hover:bg-slate-800/50 transition-colors shrink-0"
          >
            <span class="font-medium text-slate-300">{{ tick.symbol }}</span>
            <span class="font-mono font-semibold text-white">
              \${{ tick.price >= 1 ? (tick.price | number:'1.2-2') : (tick.price | number:'1.4-4') }}
            </span>
            <span
              class="font-mono text-[11px] font-semibold"
              [ngClass]="tick.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'"
            >
              {{ tick.change24h >= 0 ? '+' : '' }}{{ tick.change24h }}%
            </span>
          </div>
        </div>
      </div>

      <!-- Main Navigation Bar -->
      <div class="flex items-center justify-between px-6 py-3">
        <!-- Brand Logo -->
        <div class="flex items-center space-x-3">
          <a routerLink="/portal/dashboard" class="flex items-center space-x-2.5 group">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
              <div class="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
                <span class="text-cyan-400 font-black text-lg tracking-wider">F</span>
              </div>
            </div>
            <div>
              <div class="flex items-center space-x-1.5">
                <span class="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  FICHAIN<span class="text-cyan-400">PRO</span>
                </span>
                <span class="px-1.5 py-0.5 text-[10px] font-bold tracking-widest uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded">
                  INSTITUTIONAL
                </span>
              </div>
              <p class="text-[10px] text-slate-400 tracking-wider">ALGORITHMIC QUANT PLATFORM</p>
            </div>
          </a>
        </div>

        <!-- Quick Links / Actions -->
        <div class="flex items-center space-x-4">
          <!-- User Profile & Badges -->
          <div *ngIf="authService.currentUser() as user" class="flex items-center space-x-3">
            <div class="hidden sm:block text-right">
              <div class="flex items-center justify-end space-x-1.5">
                <span class="text-sm font-semibold text-white">{{ user.full_name }}</span>
                <span
                  *ngIf="user.role === 'admin'"
                  class="px-2 py-0.5 text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-full"
                >
                  ADMIN
                </span>
                <span
                  *ngIf="user.role !== 'admin'"
                  class="px-2 py-0.5 text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full"
                >
                  PRO TRADER
                </span>
              </div>
              <div class="text-xs text-slate-400 font-mono">{{ user.account_id }}</div>
            </div>

            <!-- KYC Tag -->
            <span
              class="hidden md:inline-flex items-center px-2 py-1 rounded text-xs font-semibold"
              [ngClass]="{
                'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30': user.kyc_status === 'approved',
                'bg-amber-500/10 text-amber-400 border border-amber-500/30': user.kyc_status === 'pending',
                'bg-slate-800 text-slate-400 border border-slate-700': user.kyc_status === 'unverified'
              }"
            >
              {{ user.kyc_status === 'approved' ? 'Verified Pro' : (user.kyc_status === 'pending' ? 'KYC Pending' : 'Unverified') }}
            </span>

            <!-- Logout Button -->
            <button
              (click)="authService.logout()"
              class="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-800/60 border border-slate-700/80 text-slate-300 transition-all duration-200"
              title="Sign Out"
            >
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  `
})
export class NavbarComponent {
  authService = inject(AuthService);
  marketService = inject(MarketService);
}
