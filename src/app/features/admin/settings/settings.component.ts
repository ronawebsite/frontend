import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 max-w-3xl">
      
      <!-- Top Banner -->
      <div class="p-6 rounded-3xl bg-[#002625] border border-purple-500/30 shadow-xl space-y-1">
        <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
          System Switches &amp; Security Rules
        </h1>
        <p class="text-xs sm:text-sm text-slate-300">
          Turn features on or off, configure security PIN requirements, and adjust the total simulation reserve.
        </p>
      </div>

      <!-- Settings Form -->
      <div class="glass-panel rounded-3xl border border-white/10 p-6 space-y-6 shadow-xl">
        <div class="space-y-4">
          
          <!-- Switch 1: Email Code -->
          <div class="flex items-center justify-between p-4 bg-[#002625] rounded-2xl border border-white/10">
            <div>
              <span class="text-sm font-bold text-white block">Require Email Code on Registration</span>
              <span class="text-xs text-slate-400">Ask new users to enter a 6-digit confirmation code when creating an account.</span>
            </div>
            <input
              type="checkbox"
              [(ngModel)]="settings.enable_email_verification"
              class="w-5 h-5 accent-[#0BB4D2] rounded cursor-pointer"
            />
          </div>

          <!-- Switch 2: Transaction PIN -->
          <div class="flex items-center justify-between p-4 bg-[#002625] rounded-2xl border border-white/10">
            <div>
              <span class="text-sm font-bold text-white block">Require 4-Digit PIN for Cards &amp; Cash Out</span>
              <span class="text-xs text-slate-400">Users must enter their PIN to reveal card details and authorize withdrawals.</span>
            </div>
            <input
              type="checkbox"
              [(ngModel)]="settings.enable_pin_on_login"
              class="w-5 h-5 accent-[#0BB4D2] rounded cursor-pointer"
            />
          </div>

          <!-- Switch 3: KYC Before Withdrawal -->
          <div class="flex items-center justify-between p-4 bg-[#002625] rounded-2xl border border-white/10">
            <div>
              <span class="text-sm font-bold text-white block">Require ID Verification (KYC) Before Cash Out</span>
              <span class="text-xs text-slate-400">Block simulated withdrawals until the user uploads their ID and gets approved.</span>
            </div>
            <input
              type="checkbox"
              [(ngModel)]="settings.enable_kyc_for_withdrawal"
              class="w-5 h-5 accent-[#0BB4D2] rounded cursor-pointer"
            />
          </div>

          <!-- Number Input: Total Liquidity Reserve -->
          <div class="p-4 bg-[#002625] rounded-2xl border border-white/10 space-y-2">
            <label class="text-sm font-bold text-white block">Platform Cash Reserve Vault ($ USD)</label>
            <input
              type="number"
              [(ngModel)]="settings.simulated_liquidity_usd"
              class="w-full px-4 py-2.5 rounded-xl bg-[#070c18] border border-white/15 text-white font-mono text-sm"
            />
            <span class="text-[11px] text-slate-400">Total simulated backing capital shown across the platform.</span>
          </div>
        </div>

        <button
          (click)="saveSettings()"
          class="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm shadow-lg shadow-purple-600/30 transition-all"
        >
          Save System Switches
        </button>
      </div>

    </div>
  `
})
export class AdminSettingsComponent implements OnInit {
  adminService = inject(AdminService);
  toast = inject(ToastService);

  settings: any = {
    enable_email_verification: false,
    enable_pin_on_login: true,
    enable_kyc_for_withdrawal: false,
    simulated_liquidity_usd: 50000000.00
  };

  ngOnInit() {
    this.adminService.getSettings().subscribe(res => {
      if (res.success && res.data) {
        this.settings = {
          ...res.data,
          enable_email_verification: !!res.data.enable_email_verification,
          enable_pin_on_login: !!res.data.enable_pin_on_login,
          enable_kyc_for_withdrawal: !!res.data.enable_kyc_for_withdrawal
        };
      }
    });
  }

  saveSettings() {
    this.adminService.updateSettings({
      ...this.settings,
      enable_email_verification: this.settings.enable_email_verification ? 1 : 0,
      enable_pin_on_login: this.settings.enable_pin_on_login ? 1 : 0,
      enable_kyc_for_withdrawal: this.settings.enable_kyc_for_withdrawal ? 1 : 0
    }).subscribe({
      next: (res) => this.toast.success('System settings saved successfully!'),
      error: (err) => this.toast.error(err.error?.error || 'Could not update settings')
    });
  }
}
