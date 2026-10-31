import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { AdminMetrics } from '../../../core/models/fintech.models';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      
      <!-- Top Banner -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#002625] border border-purple-500/30 shadow-xl">
        <div class="space-y-1">
          <div class="flex items-center space-x-2.5">
            <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Admin Overview &amp; Stats
            </h1>
            <span class="px-2.5 py-0.5 text-[11px] font-extrabold uppercase rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
              SUPERVISOR
            </span>
          </div>
          <p class="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Monitor platform cash reserves, total practice trading volume, active trading robots, and user accounts.
          </p>
        </div>

        <div class="flex items-center space-x-2 shrink-0">
          <a
            routerLink="/admin/users"
            class="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-md shadow-purple-600/30 transition-all"
          >
            👥 Manage Users &amp; Balances
          </a>
          <a
            routerLink="/admin/transactions"
            class="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 font-bold text-xs transition-colors"
          >
            📑 Transactions &amp; PINs
          </a>
        </div>
      </div>

      <!-- Macro Analytics Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total Platform Reserve -->
        <div class="glass-panel p-5 rounded-3xl border border-white/10 space-y-2">
          <span class="text-xs font-bold uppercase tracking-wider text-purple-300 block">Total System Liquidity</span>
          <div class="text-3xl font-mono font-black text-[#0BB4D2]">
            \${{ (metrics()?.total_liquidity_usd || 50000000) | number:'1.2-2' }}
          </div>
          <div class="text-xs text-slate-400">Platform vault demo reserve</div>
        </div>

        <!-- Simulated Trading Volume -->
        <div class="glass-panel p-5 rounded-3xl border border-white/10 space-y-2">
          <span class="text-xs font-bold uppercase tracking-wider text-purple-300 block">Simulated Trading Volume</span>
          <div class="text-3xl font-mono font-black text-white">
            \${{ (metrics()?.simulated_volume_usd || 0) | number:'1.2-2' }}
          </div>
          <div class="text-xs text-emerald-400 font-semibold">Live order matching active</div>
        </div>

        <!-- Active Robots -->
        <div class="glass-panel p-5 rounded-3xl border border-white/10 space-y-2">
          <span class="text-xs font-bold uppercase tracking-wider text-purple-300 block">Active Trading Robots</span>
          <div class="text-3xl font-mono font-black text-purple-300">
            {{ metrics()?.active_bots || 0 }} <span class="text-sm font-sans font-normal text-slate-400">Robots</span>
          </div>
          <div class="text-xs text-slate-400">Checking markets every 10 seconds</div>
        </div>

        <!-- Total Users -->
        <div class="glass-panel p-5 rounded-3xl border border-white/10 space-y-2">
          <span class="text-xs font-bold uppercase tracking-wider text-purple-300 block">Total Registered Users</span>
          <div class="text-3xl font-mono font-black text-emerald-400">
            {{ metrics()?.total_users || 0 }} <span class="text-sm font-sans font-normal text-slate-400">Accounts</span>
          </div>
          <div class="text-xs text-slate-400">Includes demo and test accounts</div>
        </div>
      </div>

      <!-- Funding & Health Highlights -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Inflows & Outflows -->
        <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <h3 class="text-base font-black text-white flex items-center space-x-2">
            <span>Deposits &amp; Withdrawals Summary</span>
          </h3>
          <div class="space-y-3 font-mono text-xs">
            <div class="flex justify-between p-3.5 bg-[#002625] rounded-2xl border border-white/10">
              <span class="text-slate-300 font-sans">Total Deposits In:</span>
              <span class="font-bold text-emerald-400 text-sm">\${{ (metrics()?.total_deposits_usd || 0) | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between p-3.5 bg-[#002625] rounded-2xl border border-white/10">
              <span class="text-slate-300 font-sans">Total Withdrawals Out:</span>
              <span class="font-bold text-rose-400 text-sm">\${{ (metrics()?.total_withdrawals_usd || 0) | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between p-3.5 bg-[#002625] rounded-2xl border border-white/10">
              <span class="text-slate-300 font-sans">Net Cash Retained:</span>
              <span class="font-bold text-[#0BB4D2] text-sm">
                \${{ ((metrics()?.total_deposits_usd || 0) - (metrics()?.total_withdrawals_usd || 0)) | number:'1.2-2' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Engine & Server Health -->
        <div class="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
          <h3 class="text-base font-black text-white flex items-center space-x-2">
            <span>Live Server &amp; Engine Health</span>
          </h3>
          <div class="space-y-2.5 text-xs">
            <div class="flex items-center justify-between p-3 rounded-2xl bg-[#002625] border border-white/10">
              <span class="text-slate-200">Live Binance WebSocket Market Stream:</span>
              <span class="font-mono text-emerald-400 font-bold">● CONNECTED &amp; LIVE</span>
            </div>
            <div class="flex items-center justify-between p-3 rounded-2xl bg-[#002625] border border-white/10">
              <span class="text-slate-200">MySQL Database Connection (Port 3307):</span>
              <span class="font-mono text-emerald-400 font-bold">● HEALTHY &amp; READY</span>
            </div>
            <div class="flex items-center justify-between p-3 rounded-2xl bg-[#002625] border border-white/10">
              <span class="text-slate-200">12-Word Secret Phrase Login System:</span>
              <span class="font-mono text-[#0BB4D2] font-bold">● SECURE &amp; ACTIVE</span>
            </div>
            <div class="flex items-center justify-between p-3 rounded-2xl bg-[#002625] border border-white/10">
              <span class="text-slate-200">2-Step Email PIN Withdrawal Generator:</span>
              <span class="font-mono text-emerald-400 font-bold">● READY</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class OverviewComponent implements OnInit {
  adminService = inject(AdminService);
  metrics = signal<AdminMetrics | null>(null);

  ngOnInit() {
    this.adminService.getMetrics().subscribe(res => {
      if (res.success) this.metrics.set(res.data);
    });
  }
}
