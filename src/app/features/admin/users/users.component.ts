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
    <div class="space-y-6">
      
      <!-- Top Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#002625] border border-purple-500/30 shadow-xl">
        <div class="space-y-1">
          <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
            User &amp; Balance Management
          </h1>
          <p class="text-xs sm:text-sm text-slate-300">
            Search users, adjust coin and dollar balances, approve or reject KYC documents, and reset PINs.
          </p>
        </div>

        <!-- Search Bar -->
        <div class="w-full sm:w-72">
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (ngModelChange)="onSearch()"
            placeholder="Search by name, email, or account ID..."
            class="w-full px-4 py-2.5 rounded-xl bg-[#070c18] border border-white/15 text-white text-xs focus:outline-none focus:border-purple-400 placeholder:text-slate-500 font-sans"
          />
        </div>
      </div>

      <!-- Users Table -->
      <div class="glass-panel rounded-3xl border border-white/10 p-6 space-y-4 shadow-xl">
        <div class="overflow-x-auto no-scrollbar">
          <table class="w-full text-left text-xs font-mono">
            <thead>
              <tr class="border-b border-white/10 text-slate-400 font-sans font-bold uppercase tracking-wider">
                <th class="py-3 px-3">Account ID</th>
                <th class="py-3 px-3">User Name</th>
                <th class="py-3 px-3">Email</th>
                <th class="py-3 px-3">Role</th>
                <th class="py-3 px-3">KYC Status</th>
                <th class="py-3 px-3">Balances Overview</th>
                <th class="py-3 px-3 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr *ngFor="let u of users()" class="hover:bg-white/5 transition-colors">
                <td class="py-3.5 px-3 text-[#0BB4D2] font-bold">{{ u.account_id }}</td>
                <td class="py-3.5 px-3 font-sans font-bold text-white">{{ u.full_name }}</td>
                <td class="py-3.5 px-3 text-slate-300 font-sans">{{ u.email }}</td>
                <td class="py-3.5 px-3 font-sans">
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                    [ngClass]="u.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-white/10 text-slate-300'"
                  >
                    {{ u.role }}
                  </span>
                </td>
                <td class="py-3.5 px-3 font-sans">
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
                <td class="py-3.5 px-3 text-[11px] text-slate-300">
                  <div class="flex flex-wrap gap-1 max-w-xs">
                    <span *ngFor="let w of u.wallets?.slice(0, 3)" class="px-2 py-0.5 bg-[#002625] rounded-lg border border-white/10 font-bold">
                      {{ w.asset_symbol }}: {{ w.balance | number:'1.1-2' }}
                    </span>
                    <span *ngIf="(u.wallets?.length || 0) > 3" class="text-slate-400 font-sans">
                      +{{ (u.wallets?.length || 0) - 3 }} more
                    </span>
                  </div>
                </td>
                <td class="py-3.5 px-3 text-right space-x-1.5 font-sans">
                  <button
                    (click)="openBalanceModal(u)"
                    class="px-2.5 py-1 rounded-lg bg-teal-950/60 hover:bg-teal-900/60 text-cyan-300 border border-teal-800/60 font-bold text-xs"
                  >
                    💰 Edit Cash
                  </button>
                  <button
                    (click)="openKycModal(u)"
                    class="px-2.5 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-800/60 font-bold text-xs"
                  >
                    🛡️ KYC
                  </button>
                  <button
                    (click)="openSecurityModal(u)"
                    class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-bold text-xs"
                  >
                    🔑 PIN
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Edit Balance Modal -->
      <div *ngIf="balanceModalOpen()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <div class="glass-panel w-full max-w-md rounded-3xl p-6 border border-[#0BB4D2]/40 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 class="text-base font-black text-white">Adjust Balance for {{ selectedUser()?.full_name }}</h3>
            <button (click)="balanceModalOpen.set(false)" class="text-slate-400 hover:text-white text-lg">✕</button>
          </div>

          <div class="space-y-3.5 text-xs">
            <div class="space-y-1">
              <label class="text-slate-200 font-bold">Select Currency / Crypto Asset</label>
              <select
                [(ngModel)]="editAsset"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#002625] border border-white/15 text-white font-mono font-bold"
              >
                <option value="USD">USD (Cash)</option>
                <option value="USDT">USDT (Tether USD)</option>
                <option value="BTC">BTC (Bitcoin)</option>
                <option value="ETH">ETH (Ethereum)</option>
                <option value="SOL">SOL (Solana)</option>
                <option value="BNB">BNB (Binance Coin)</option>
                <option value="TRX">TRX (TRON)</option>
                <option value="DOGE">DOGE (Dogecoin)</option>
                <option value="LTC">LTC (Litecoin)</option>
                <option value="MATIC">MATIC (Polygon)</option>
                <option value="XRP">XRP (Ripple)</option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="text-slate-200 font-bold">New Balance Amount</label>
              <input
                type="number"
                [(ngModel)]="newBalanceAmount"
                step="any"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#002625] border border-white/15 text-white font-mono text-sm"
              />
            </div>
          </div>

          <div class="flex justify-end space-x-2 pt-2 border-t border-white/10 font-sans">
            <button (click)="balanceModalOpen.set(false)" class="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-bold">Cancel</button>
            <button (click)="saveBalance()" class="px-5 py-2 rounded-xl btn-cyan-gradient font-black text-xs shadow-md">
              Save Balance
            </button>
          </div>
        </div>
      </div>

      <!-- Override KYC Modal -->
      <div *ngIf="kycModalOpen()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <div class="glass-panel w-full max-w-md rounded-3xl p-6 border border-purple-500/40 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 class="text-base font-black text-white">KYC Status for {{ selectedUser()?.full_name }}</h3>
            <button (click)="kycModalOpen.set(false)" class="text-slate-400 hover:text-white text-lg">✕</button>
          </div>

          <div class="space-y-3.5 text-xs">
            <div class="space-y-1">
              <label class="text-slate-200 font-bold">Set Status</label>
              <select [(ngModel)]="newKycStatus" class="w-full px-3.5 py-2.5 rounded-xl bg-[#002625] border border-white/15 text-white font-mono font-bold">
                <option value="approved">Approved (Verified)</option>
                <option value="pending">Pending Review</option>
                <option value="rejected">Rejected</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="text-slate-200 font-bold">Supervisor Note</label>
              <input
                type="text"
                [(ngModel)]="kycNotes"
                placeholder="Verified by Admin"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#002625] border border-white/15 text-white font-sans text-xs"
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

      <!-- Security Reset Modal -->
      <div *ngIf="securityModalOpen()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <div class="glass-panel w-full max-w-md rounded-3xl p-6 border border-white/15 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 class="text-base font-black text-white">Reset Password or PIN</h3>
            <button (click)="securityModalOpen.set(false)" class="text-slate-400 hover:text-white text-lg">✕</button>
          </div>

          <div class="space-y-3.5 text-xs">
            <div class="space-y-1">
              <label class="text-slate-200 font-bold">New Password</label>
              <input type="password" [(ngModel)]="resetPassword" placeholder="Leave blank to keep current" class="w-full px-3.5 py-2.5 rounded-xl bg-[#002625] border border-white/15 text-white font-mono" />
            </div>

            <div class="space-y-1">
              <label class="text-slate-200 font-bold">New 4-Digit PIN</label>
              <input type="text" maxlength="4" [(ngModel)]="resetPin" placeholder="1234" class="w-full px-3.5 py-2.5 rounded-xl bg-[#002625] border border-white/15 text-white font-mono text-center tracking-widest font-bold" />
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
  newBalanceAmount = 10000;

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
    const foundWallet = user.wallets?.find((w: any) => w.asset_symbol === 'USDT');
    this.newBalanceAmount = foundWallet ? parseFloat(foundWallet.balance) : 10000;
    this.balanceModalOpen.set(true);
  }

  saveBalance() {
    const u = this.selectedUser();
    if (!u) return;

    this.adminService.updateUserBalance(u.id, this.editAsset, this.newBalanceAmount).subscribe({
      next: (res) => {
        this.toast.success(res.message);
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
