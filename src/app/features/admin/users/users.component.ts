import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ToastService } from '../../../services/toast.service';
import { User } from '../../../core/models/fintech.models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 font-nunito text-slate-100">
      
      <!-- Top Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#002625] to-[#003432] border border-[#0BB4D2]/30 shadow-xl">
        <div class="space-y-1">
          <div class="flex items-center space-x-2">
            <span class="text-xs font-black uppercase tracking-wider text-[#0BB4D2]">CLIENT ACCOUNTS</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {{ users().length }} Users Total
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Users &amp; Balances
          </h1>
          <p class="text-xs sm:text-sm text-slate-300">
            Search investors, credit or deduct balances with 1 click, approve KYC, and manage accounts.
          </p>
        </div>

        <!-- Search Bar -->
        <div class="w-full sm:w-80">
          <div class="relative">
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearch()"
              placeholder="Search by name, email, or account ID..."
              class="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-white text-xs focus:outline-none focus:border-[#0BB4D2] placeholder:text-slate-400 font-sans"
            />
            <span class="absolute left-3 top-3 text-xs text-slate-400">🔍</span>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="glass-panel rounded-3xl border border-white/10 p-6 space-y-4 shadow-xl">
        <div class="overflow-x-auto no-scrollbar">
          <table class="w-full text-left text-xs font-mono">
            <thead>
              <tr class="border-b border-white/10 text-slate-400 font-sans font-bold uppercase tracking-wider text-[11px]">
                <th class="py-3 px-3">Account ID</th>
                <th class="py-3 px-3">Investor Name</th>
                <th class="py-3 px-3">Email Address</th>
                <th class="py-3 px-3">KYC Status</th>
                <th class="py-3 px-3">Current Balances</th>
                <th class="py-3 px-3 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5 font-sans">
              <tr *ngFor="let u of users()" class="hover:bg-white/5 transition-colors">
                <td class="py-3.5 px-3 text-[#0BB4D2] font-mono font-bold">{{ u.account_id }}</td>
                <td class="py-3.5 px-3 font-bold text-white">
                  {{ u.full_name }}
                  <span *ngIf="u.role === 'admin'" class="ml-1.5 px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    ADMIN
                  </span>
                </td>
                <td class="py-3.5 px-3 text-slate-300">{{ u.email }}</td>
                <td class="py-3.5 px-3">
                  <span
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase"
                    [ngClass]="{
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40': u.kyc_status === 'approved',
                      'bg-amber-500/20 text-amber-300 border border-amber-500/40': u.kyc_status === 'pending',
                      'bg-rose-500/20 text-rose-300 border border-rose-500/40': u.kyc_status === 'rejected',
                      'bg-slate-800 text-slate-400': u.kyc_status === 'unverified'
                    }"
                  >
                    {{ u.kyc_status }}
                  </span>
                </td>
                <td class="py-3.5 px-3 text-[11px] font-mono">
                  <div class="flex flex-wrap gap-1 max-w-xs">
                    <span *ngFor="let w of u.wallets?.slice(0, 3)" class="px-2 py-0.5 bg-[#001c1c] rounded-lg border border-white/10 font-bold text-slate-200">
                      {{ w.asset_symbol }}: <strong class="text-white">{{ w.balance | number:'1.0-2' }}</strong>
                    </span>
                    <span *ngIf="(u.wallets?.length || 0) > 3" class="text-slate-400 font-sans text-[10px] self-center">
                      +{{ (u.wallets?.length || 0) - 3 }} more
                    </span>
                  </div>
                </td>
                <td class="py-3.5 px-3 text-right space-x-1.5">
                  <button
                    (click)="openBalanceModal(u)"
                    class="px-3 py-1.5 rounded-xl btn-cyan-gradient font-black text-xs shadow-sm transition hover:scale-105"
                  >
                    💰 Edit Balance
                  </button>
                  <button
                    (click)="openKycModal(u)"
                    class="px-2.5 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-800/60 font-bold text-xs"
                    title="Change verification status"
                  >
                    🛡️ KYC
                  </button>
                  <button
                    (click)="openSecurityModal(u)"
                    class="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-bold text-xs"
                    title="Reset password or PIN"
                  >
                    🔑 PIN
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- EDIT BALANCE MODAL (Intuitive & Easy)                                      -->
      <!-- ========================================================================= -->
      <div *ngIf="balanceModalOpen()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
        <div class="glass-panel w-full max-w-md rounded-3xl p-6 border border-[#0BB4D2]/40 shadow-2xl space-y-5">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span class="text-[10px] font-black text-[#0BB4D2] uppercase tracking-wider block">EDIT USER BALANCE</span>
              <h3 class="text-base font-black text-white">Adjust Balance for {{ selectedUser()?.full_name }}</h3>
            </div>
            <button (click)="balanceModalOpen.set(false)" class="text-slate-400 hover:text-white text-lg">✕</button>
          </div>

          <div class="space-y-4 text-xs">
            <!-- Asset Selection -->
            <div class="space-y-1">
              <label class="text-slate-300 font-bold">Select Currency / Coin</label>
              <select
                [(ngModel)]="editAsset"
                (ngModelChange)="onAssetChange()"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-white font-mono font-bold focus:outline-none focus:border-[#0BB4D2]"
              >
                <option value="USDT">USDT (Tether USD)</option>
                <option value="USD">USD (Cash Ledger)</option>
                <option value="BTC">BTC (Bitcoin)</option>
                <option value="ETH">ETH (Ethereum)</option>
                <option value="SOL">SOL (Solana)</option>
                <option value="BNB">BNB (Binance Coin)</option>
                <option value="TRX">TRX (TRON)</option>
                <option value="DOGE">DOGE (Dogecoin)</option>
                <option value="LTC">LTC (Litecoin)</option>
                <option value="XRP">XRP (Ripple)</option>
              </select>
            </div>

            <!-- Current Balance Indicator -->
            <div class="p-3 bg-[#001c1c] rounded-2xl border border-white/10 flex items-center justify-between">
              <span class="text-slate-400">Current {{ editAsset }} Balance:</span>
              <span class="font-mono font-bold text-white text-sm">
                {{ getCurrentAssetBalance() | number:'1.2-6' }} {{ editAsset }}
              </span>
            </div>

            <!-- New Balance Input -->
            <div class="space-y-1.5">
              <label class="text-white font-bold">New Balance Amount</label>
              <input
                type="number"
                step="any"
                [(ngModel)]="newBalanceAmount"
                class="w-full px-4 py-3 rounded-xl bg-[#001c1c] border border-[#0BB4D2]/40 text-emerald-300 font-mono text-lg font-bold focus:outline-none focus:ring-1 focus:ring-[#0BB4D2]"
              />

              <!-- Quick Add Buttons -->
              <div class="flex items-center space-x-2 pt-1">
                <span class="text-[10px] text-slate-400">Quick set:</span>
                <button
                  type="button"
                  (click)="quickAdd(100)"
                  class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-[10px] font-bold"
                >
                  +100
                </button>
                <button
                  type="button"
                  (click)="quickAdd(500)"
                  class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-[10px] font-bold"
                >
                  +500
                </button>
                <button
                  type="button"
                  (click)="quickAdd(1000)"
                  class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-[10px] font-bold"
                >
                  +1,000
                </button>
                <button
                  type="button"
                  (click)="quickSet(0)"
                  class="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[10px] font-bold"
                >
                  Set to 0
                </button>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-2 pt-3 border-t border-white/10 font-sans">
            <button
              (click)="balanceModalOpen.set(false)"
              type="button"
              class="px-4 py-2.5 rounded-xl bg-white/5 text-slate-300 text-xs font-bold hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              (click)="saveBalance()"
              type="button"
              class="px-5 py-2.5 rounded-xl btn-cyan-gradient font-black text-xs shadow-md"
            >
              Save New Balance
            </button>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- OVERRIDE KYC MODAL                                                        -->
      <!-- ========================================================================= -->
      <div *ngIf="kycModalOpen()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
        <div class="glass-panel w-full max-w-md rounded-3xl p-6 border border-purple-500/40 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 class="text-base font-black text-white">KYC Status for {{ selectedUser()?.full_name }}</h3>
            <button (click)="kycModalOpen.set(false)" class="text-slate-400 hover:text-white text-lg">✕</button>
          </div>

          <div class="space-y-3.5 text-xs">
            <div class="space-y-1">
              <label class="text-slate-200 font-bold">Set Status</label>
              <select [(ngModel)]="newKycStatus" class="w-full px-3.5 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-white font-bold">
                <option value="approved">Approved (Verified)</option>
                <option value="pending">Pending Review</option>
                <option value="rejected">Rejected</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="text-slate-200 font-bold">Admin Note</label>
              <input
                type="text"
                [(ngModel)]="kycNotes"
                placeholder="Verified by Admin"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-white text-xs"
              />
            </div>
          </div>

          <div class="flex justify-end space-x-2 pt-2 border-t border-white/10 font-sans">
            <button (click)="kycModalOpen.set(false)" class="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-bold">Cancel</button>
            <button (click)="saveKYC()" class="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-md">
              Update KYC Status
            </button>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- SECURITY RESET MODAL                                                      -->
      <!-- ========================================================================= -->
      <div *ngIf="securityModalOpen()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
        <div class="glass-panel w-full max-w-md rounded-3xl p-6 border border-white/15 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 class="text-base font-black text-white">Reset Password or PIN</h3>
            <button (click)="securityModalOpen.set(false)" class="text-slate-400 hover:text-white text-lg">✕</button>
          </div>

          <div class="space-y-3.5 text-xs">
            <div class="space-y-1">
              <label class="text-slate-200 font-bold">New Password</label>
              <input type="password" [(ngModel)]="resetPassword" placeholder="Leave blank to keep current" class="w-full px-3.5 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-white font-mono" />
            </div>

            <div class="space-y-1">
              <label class="text-slate-200 font-bold">New 4-Digit PIN</label>
              <input type="text" maxlength="4" [(ngModel)]="resetPin" placeholder="1234" class="w-full px-3.5 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-white font-mono text-center tracking-widest font-bold" />
            </div>
          </div>

          <div class="flex justify-end space-x-2 pt-2 border-t border-white/10 font-sans">
            <button (click)="securityModalOpen.set(false)" class="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-bold">Cancel</button>
            <button (click)="saveSecurity()" class="px-5 py-2 rounded-xl btn-cyan-gradient font-black text-xs shadow-md">
              Save Security Changes
            </button>
          </div>
        </div>
      </div>

    </div>
  `
})
export class UsersComponent implements OnInit {
  adminService = inject(AdminService);
  toast = inject(ToastService);

  users = signal<any[]>([]);
  searchTerm = '';

  balanceModalOpen = signal<boolean>(false);
  selectedUser = signal<any | null>(null);
  editAsset = 'USDT';
  newBalanceAmount = 0;

  kycModalOpen = signal<boolean>(false);
  newKycStatus = 'approved';
  kycNotes = 'Verified by Admin';

  securityModalOpen = signal<boolean>(false);
  resetPassword = '';
  resetPin = '1234';

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.adminService.getUsers(this.searchTerm).subscribe(res => {
      if (res.success) this.users.set(res.data);
    });
  }

  onSearch() {
    this.loadUsers();
  }

  openBalanceModal(user: any) {
    this.selectedUser.set(user);
    this.editAsset = 'USDT';
    this.onAssetChange();
    this.balanceModalOpen.set(true);
  }

  getCurrentAssetBalance(): number {
    const u = this.selectedUser();
    if (!u) return 0;
    const foundWallet = u.wallets?.find((w: any) => w.asset_symbol === this.editAsset);
    return foundWallet ? parseFloat(foundWallet.balance) : 0;
  }

  onAssetChange() {
    this.newBalanceAmount = this.getCurrentAssetBalance();
  }

  quickAdd(amount: number) {
    this.newBalanceAmount = parseFloat((this.newBalanceAmount + amount).toFixed(4));
  }

  quickSet(amount: number) {
    this.newBalanceAmount = amount;
  }

  saveBalance() {
    const u = this.selectedUser();
    if (!u) return;

    this.adminService.updateUserBalance(u.id, this.editAsset, this.newBalanceAmount).subscribe({
      next: (res) => {
        this.toast.success(res.message || `${this.editAsset} balance updated`);
        this.balanceModalOpen.set(false);
        this.loadUsers();
      },
      error: (err) => this.toast.error(err.error?.error || 'Could not update balance')
    });
  }

  openKycModal(user: any) {
    this.selectedUser.set(user);
    this.newKycStatus = user.kyc_status === 'approved' ? 'approved' : 'approved';
    this.kycModalOpen.set(true);
  }

  saveKYC() {
    const u = this.selectedUser();
    if (!u) return;

    this.adminService.overrideKYC(u.id, this.newKycStatus, this.kycNotes).subscribe({
      next: (res) => {
        this.toast.success(res.message);
        this.kycModalOpen.set(false);
        this.loadUsers();
      },
      error: (err) => this.toast.error(err.error?.error || 'Could not override KYC')
    });
  }

  openSecurityModal(user: any) {
    this.selectedUser.set(user);
    this.resetPassword = '';
    this.resetPin = user.transaction_pin || '1234';
    this.securityModalOpen.set(true);
  }

  saveSecurity() {
    const u = this.selectedUser();
    if (!u) return;

    this.adminService.resetUserSecurity(u.id, this.resetPassword || undefined, this.resetPin || undefined).subscribe({
      next: (res) => {
        this.toast.success(res.message);
        this.securityModalOpen.set(false);
        this.loadUsers();
      },
      error: (err) => this.toast.error(err.error?.error || 'Could not reset security credentials')
    });
  }
}
