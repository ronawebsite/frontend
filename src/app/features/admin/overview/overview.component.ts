import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { ToastService } from '../../../services/toast.service';
import { AdminMetrics, Transaction, User } from '../../../core/models/fintech.models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-8 font-nunito text-slate-100">
      
      <!-- ========================================================================= -->
      <!-- WELCOME BANNER (Simple, Clean, Friendly)                                   -->
      <!-- ========================================================================= -->
      <div class="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#002625] via-[#003432] to-[#071d24] border border-[#0BB4D2]/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="space-y-1.5">
          <div class="flex items-center space-x-2">
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="text-xs font-black uppercase tracking-wider text-cyan-300">Admin Control Center</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Easy Mode Active
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome to Your Admin Dashboard 👋
          </h1>
          <p class="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Everything you need to manage your platform in one place. Approve payments, edit user balances, and set deposit addresses with a single click.
          </p>
        </div>

        <div class="flex items-center space-x-3 shrink-0">
          <a
            routerLink="/admin/deposit-wallets"
            class="px-4 py-3 rounded-2xl btn-cyan-gradient font-black text-xs shadow-lg shadow-[#0BB4D2]/25 flex items-center space-x-2 transition hover:scale-[1.02]"
          >
            <span>💳</span>
            <span>Set Deposit Wallets</span>
          </a>
          <a
            routerLink="/portal/dashboard"
            class="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/15 font-bold text-xs transition"
          >
            <span>👁️</span>
            <span>View User App</span>
          </a>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- 4 BIG QUICK ACTION CARDS                                                   -->
      <!-- ========================================================================= -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- 1. Deposit Wallets -->
        <a
          routerLink="/admin/deposit-wallets"
          class="glass-panel p-5 rounded-3xl border border-white/10 hover:border-[#0BB4D2]/60 hover:bg-[#002625]/90 transition group flex flex-col justify-between space-y-3 cursor-pointer shadow-lg"
        >
          <div class="flex items-center justify-between">
            <div class="w-12 h-12 rounded-2xl bg-[#0BB4D2]/15 text-[#0BB4D2] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              💳
            </div>
            <span class="text-xs text-[#0BB4D2] font-black group-hover:translate-x-1 transition-transform">&rarr;</span>
          </div>
          <div>
            <h3 class="text-sm font-black text-white">Deposit Wallets</h3>
            <p class="text-[11px] text-slate-400">Set crypto addresses that users see to deposit funds</p>
          </div>
          <span class="text-[11px] font-bold text-[#0BB4D2]">Manage Addresses &rarr;</span>
        </a>

        <!-- 2. Users & Balances -->
        <a
          routerLink="/admin/users"
          class="glass-panel p-5 rounded-3xl border border-white/10 hover:border-purple-500/60 hover:bg-[#002625]/90 transition group flex flex-col justify-between space-y-3 cursor-pointer shadow-lg"
        >
          <div class="flex items-center justify-between">
            <div class="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-300 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              👥
            </div>
            <span class="text-xs text-purple-300 font-black group-hover:translate-x-1 transition-transform">&rarr;</span>
          </div>
          <div>
            <h3 class="text-sm font-black text-white">Users &amp; Balances</h3>
            <p class="text-[11px] text-slate-400">Add or deduct cash/crypto balance for any investor</p>
          </div>
          <span class="text-[11px] font-bold text-purple-300">Edit Balances &rarr;</span>
        </a>

        <!-- 3. Transactions & Approvals -->
        <a
          routerLink="/admin/transactions"
          class="glass-panel p-5 rounded-3xl border border-white/10 hover:border-amber-500/60 hover:bg-[#002625]/90 transition group flex flex-col justify-between space-y-3 cursor-pointer shadow-lg"
        >
          <div class="flex items-center justify-between">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-300 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              💸
            </div>
            <span
              *ngIf="pendingTxs().length > 0"
              class="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-black animate-pulse"
            >
              {{ pendingTxs().length }} PENDING
            </span>
            <span *ngIf="pendingTxs().length === 0" class="text-xs text-amber-300 font-black group-hover:translate-x-1 transition-transform">&rarr;</span>
          </div>
          <div>
            <h3 class="text-sm font-black text-white">Deposits &amp; Cash Outs</h3>
            <p class="text-[11px] text-slate-400">Approve or reject client withdrawals and deposits</p>
          </div>
          <span class="text-[11px] font-bold text-amber-300">Review Payments &rarr;</span>
        </a>

        <!-- 4. Trade Profits -->
        <a
          routerLink="/admin/trade-controller"
          class="glass-panel p-5 rounded-3xl border border-white/10 hover:border-emerald-500/60 hover:bg-[#002625]/90 transition group flex flex-col justify-between space-y-3 cursor-pointer shadow-lg"
        >
          <div class="flex items-center justify-between">
            <div class="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-300 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              📈
            </div>
            <span class="text-xs text-emerald-300 font-black group-hover:translate-x-1 transition-transform">&rarr;</span>
          </div>
          <div>
            <h3 class="text-sm font-black text-white">Trade Profit Controls</h3>
            <p class="text-[11px] text-slate-400">Set trade profits or close trades with guaranteed outcomes</p>
          </div>
          <span class="text-[11px] font-bold text-emerald-300">Control Profits &rarr;</span>
        </a>

      </div>

      <!-- ========================================================================= -->
      <!-- KEY NUMBERS (Simple & Clear)                                               -->
      <!-- ========================================================================= -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <!-- Total Users -->
        <div class="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 space-y-1">
          <span class="text-[11px] font-bold uppercase text-slate-400 block">Registered Users</span>
          <div class="text-2xl sm:text-3xl font-mono font-black text-white">
            {{ metrics()?.total_users || 0 }}
          </div>
          <span class="text-[10px] text-slate-400">Active investor accounts</span>
        </div>

        <!-- Pending Approvals -->
        <div
          class="glass-panel p-4 sm:p-5 rounded-2xl border space-y-1 transition"
          [ngClass]="pendingTxs().length > 0 ? 'border-amber-500/50 bg-amber-950/20' : 'border-white/10'"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase block" [ngClass]="pendingTxs().length > 0 ? 'text-amber-300' : 'text-slate-400'">
              Pending Approvals
            </span>
            <span
              *ngIf="pendingTxs().length > 0"
              class="w-2 h-2 rounded-full bg-amber-400 animate-ping"
            ></span>
          </div>
          <div
            class="text-2xl sm:text-3xl font-mono font-black"
            [ngClass]="pendingTxs().length > 0 ? 'text-amber-400' : 'text-emerald-400'"
          >
            {{ pendingTxs().length }}
          </div>
          <span class="text-[10px]" [ngClass]="pendingTxs().length > 0 ? 'text-amber-300 font-bold' : 'text-slate-400'">
            {{ pendingTxs().length > 0 ? 'Action required below' : 'All caught up' }}
          </span>
        </div>

        <!-- Total Deposits In -->
        <div class="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 space-y-1">
          <span class="text-[11px] font-bold uppercase text-slate-400 block">Total Deposits In</span>
          <div class="text-2xl sm:text-3xl font-mono font-black text-emerald-400">
            \${{ (metrics()?.total_deposits_usd || 0) | number:'1.2-2' }}
          </div>
          <span class="text-[10px] text-slate-400">Total client funding</span>
        </div>

        <!-- Total Withdrawals Out -->
        <div class="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 space-y-1">
          <span class="text-[11px] font-bold uppercase text-slate-400 block">Total Cash Outs</span>
          <div class="text-2xl sm:text-3xl font-mono font-black text-rose-400">
            \${{ (metrics()?.total_withdrawals_usd || 0) | number:'1.2-2' }}
          </div>
          <span class="text-[10px] text-slate-400">Completed payouts</span>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- PENDING TRANSACTIONS THAT NEED YOUR APPROVAL (Instant 1-Click Action)       -->
      <!-- ========================================================================= -->
      <div class="glass-panel rounded-3xl border border-white/10 p-6 space-y-4 shadow-xl">
        <div class="flex items-center justify-between border-b border-white/10 pb-3">
          <div class="flex items-center space-x-3">
            <span class="text-xl">⏳</span>
            <div>
              <h2 class="text-base font-black text-white">Transactions Needing Approval</h2>
              <p class="text-xs text-slate-400">Approve or reject client deposits and cash-outs in 1 click</p>
            </div>
          </div>
          <a routerLink="/admin/transactions" class="text-xs text-[#0BB4D2] font-bold hover:underline">
            View All History &rarr;
          </a>
        </div>

        <!-- Empty state when no pending transactions -->
        <div *ngIf="pendingTxs().length === 0" class="py-8 text-center space-y-2">
          <span class="text-3xl">✅</span>
          <div class="text-sm font-bold text-white">All Caught Up!</div>
          <p class="text-xs text-slate-400 max-w-sm mx-auto">
            There are no pending deposits or cash-out requests waiting for your approval.
          </p>
        </div>

        <!-- Pending Transactions Table -->
        <div *ngIf="pendingTxs().length > 0" class="overflow-x-auto no-scrollbar">
          <table class="w-full text-left text-xs font-mono">
            <thead>
              <tr class="border-b border-white/10 text-slate-400 font-sans font-bold uppercase text-[11px]">
                <th class="py-2.5 px-3">Type</th>
                <th class="py-2.5 px-3">User</th>
                <th class="py-2.5 px-3">Amount</th>
                <th class="py-2.5 px-3">USD Value</th>
                <th class="py-2.5 px-3">Date</th>
                <th class="py-2.5 px-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5 font-sans">
              <tr *ngFor="let tx of pendingTxs()" class="hover:bg-white/5 transition-colors">
                <td class="py-3 px-3">
                  <span
                    class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase"
                    [ngClass]="tx.type === 'withdrawal' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'"
                  >
                    {{ tx.type === 'withdrawal' ? '📤 Cash Out' : '📥 Deposit' }}
                  </span>
                </td>
                <td class="py-3 px-3">
                  <div class="font-bold text-white">{{ tx.full_name || 'Client' }}</div>
                  <div class="text-[10px] text-slate-400 font-mono">{{ tx.account_id || ('ID #' + tx.user_id) }}</div>
                  <a
                    *ngIf="tx.receipt_url"
                    [href]="getFullReceiptUrl(tx.receipt_url)"
                    target="_blank"
                    class="text-[10px] text-cyan-300 font-bold hover:underline inline-flex items-center space-x-1 mt-0.5"
                  >
                    <span>🧾 View Proof</span>
                  </a>
                </td>
                <td class="py-3 px-3 font-mono font-bold text-white">
                  {{ tx.amount }} {{ tx.asset_symbol }}
                </td>
                <td class="py-3 px-3 font-mono font-bold text-[#0BB4D2]">
                  \${{ tx.amount_usd | number:'1.2-2' }}
                </td>
                <td class="py-3 px-3 text-slate-400 text-xs font-mono">
                  {{ tx.created_at | date:'short' }}
                </td>
                <td class="py-3 px-3 text-right space-x-2">
                  <button
                    (click)="approveTransaction(tx.id)"
                    class="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs shadow-md transition"
                  >
                    ✓ Approve &amp; Release
                  </button>
                  <button
                    (click)="rejectTransaction(tx.id)"
                    class="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-xs transition"
                  >
                    ✕ Reject
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- QUICK USER BALANCE EDITOR (Right on the Dashboard!)                        -->
      <!-- ========================================================================= -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- 1. Quick User Lookup & Balance Adjustment -->
        <div class="glass-panel rounded-3xl border border-white/10 p-6 space-y-4 shadow-xl">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <div class="flex items-center space-x-2.5">
              <span class="text-xl">💰</span>
              <div>
                <h3 class="text-base font-black text-white">Quick Balance Editor</h3>
                <p class="text-xs text-slate-400">Search any user and change their balance in seconds</p>
              </div>
            </div>
            <a routerLink="/admin/users" class="text-xs text-[#0BB4D2] font-bold hover:underline">
              All Users &rarr;
            </a>
          </div>

          <!-- User Search Box -->
          <div class="relative">
            <input
              type="text"
              [(ngModel)]="searchUserQuery"
              (ngModelChange)="onSearchUsers()"
              placeholder="Type user name, email, or account ID..."
              class="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#0BB4D2]"
            />
            <span class="absolute left-3 top-3 text-xs text-slate-400">🔍</span>
          </div>

          <!-- Quick User List -->
          <div *ngIf="users().length === 0" class="py-4 text-center text-xs text-slate-400">
            No users found matching "{{ searchUserQuery }}"
          </div>

          <div class="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
            <div
              *ngFor="let u of users().slice(0, 5)"
              class="p-3.5 rounded-2xl bg-[#001c1c] border border-white/10 flex items-center justify-between gap-3 hover:border-[#0BB4D2]/40 transition"
            >
              <div class="min-w-0 flex-1">
                <div class="flex items-center space-x-2">
                  <span class="font-bold text-white text-xs truncate">{{ u.full_name }}</span>
                  <span class="text-[10px] text-cyan-300 font-mono font-bold">{{ u.account_id }}</span>
                </div>
                <div class="text-[11px] text-slate-400 truncate">{{ u.email }}</div>
                <!-- Balance badges -->
                <div class="flex flex-wrap gap-1 mt-1 text-[10px] font-mono">
                  <span *ngFor="let w of u.wallets?.slice(0, 3)" class="px-1.5 py-0.5 rounded bg-white/5 text-slate-300">
                    {{ w.asset_symbol }}: <strong>{{ w.balance | number:'1.0-2' }}</strong>
                  </span>
                </div>
              </div>

              <button
                (click)="openBalanceModal(u)"
                class="px-3.5 py-2 rounded-xl btn-cyan-gradient font-black text-xs shrink-0 shadow-md transition hover:scale-105"
              >
                ✏️ Edit Balance
              </button>
            </div>
          </div>
        </div>

        <!-- 2. Active Deposit Addresses (Quick Glance) -->
        <div class="glass-panel rounded-3xl border border-white/10 p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div class="flex items-center space-x-2.5">
                <span class="text-xl">💳</span>
                <div>
                  <h3 class="text-base font-black text-white">Your Deposit Addresses</h3>
                  <p class="text-xs text-slate-400">Current addresses shown to users when depositing</p>
                </div>
              </div>
              <a routerLink="/admin/deposit-wallets" class="text-xs text-[#0BB4D2] font-black hover:underline">
                Edit Wallets &rarr;
              </a>
            </div>

            <div class="space-y-2.5">
              <div
                *ngFor="let w of depositWallets().slice(0, 4)"
                class="p-3 rounded-2xl bg-[#001c1c] border border-white/10 flex items-center justify-between gap-3"
              >
                <div class="min-w-0 flex-1">
                  <div class="flex items-center space-x-2">
                    <span class="font-black text-white text-xs">{{ w.asset_symbol }}</span>
                    <span class="text-[10px] text-[#0BB4D2] font-mono">{{ w.network }}</span>
                  </div>
                  <div class="font-mono text-[11px] text-slate-300 truncate mt-0.5" title="{{ w.deposit_address }}">
                    {{ w.deposit_address }}
                  </div>
                </div>

                <a
                  routerLink="/admin/deposit-wallets"
                  class="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs transition shrink-0"
                >
                  Change
                </a>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-white/10">
            <a
              routerLink="/admin/deposit-wallets"
              class="w-full py-2.5 rounded-xl bg-purple-900/30 hover:bg-purple-900/50 text-purple-200 border border-purple-500/30 font-bold text-xs flex items-center justify-center space-x-2 transition"
            >
              <span>⚙️</span>
              <span>Open Deposit Wallet Manager</span>
            </a>
          </div>
        </div>

      </div>

      <!-- ========================================================================= -->
      <!-- QUICK BALANCE EDIT MODAL                                                  -->
      <!-- ========================================================================= -->
      <div *ngIf="balanceModalOpen()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
        <div class="glass-panel w-full max-w-md rounded-3xl p-6 border border-[#0BB4D2]/40 shadow-2xl space-y-5">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span class="text-[10px] font-black text-[#0BB4D2] uppercase tracking-wider block">QUICK BALANCE ADJUSTMENT</span>
              <h3 class="text-base font-black text-white">
                Edit Balance for {{ selectedUser()?.full_name }}
              </h3>
            </div>
            <button (click)="balanceModalOpen.set(false)" class="text-slate-400 hover:text-white text-lg">✕</button>
          </div>

          <div class="space-y-4 text-xs">
            <div class="space-y-1">
              <label class="text-slate-300 font-bold">Select Currency / Coin</label>
              <select
                [(ngModel)]="editAsset"
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

            <div class="space-y-1">
              <label class="text-slate-300 font-bold">New Balance Amount</label>
              <input
                type="number"
                step="any"
                [(ngModel)]="newBalanceAmount"
                placeholder="e.g. 5000"
                class="w-full px-4 py-3 rounded-xl bg-[#001c1c] border border-[#0BB4D2]/40 text-emerald-300 font-mono text-base font-bold focus:outline-none focus:ring-1 focus:ring-[#0BB4D2]"
              />
              <p class="text-[10px] text-slate-400">
                This will immediately update the user's trading balance to this exact amount.
              </p>
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

    </div>
  `
})
export class OverviewComponent implements OnInit {
  adminService = inject(AdminService);
  toast = inject(ToastService);

  metrics = signal<AdminMetrics | null>(null);
  pendingTxs = signal<Transaction[]>([]);
  users = signal<any[]>([]);
  depositWallets = signal<any[]>([]);

  searchUserQuery = '';
  balanceModalOpen = signal<boolean>(false);
  selectedUser = signal<any | null>(null);
  editAsset = 'USDT';
  newBalanceAmount = 0;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // 1. Load metrics
    this.adminService.getMetrics().subscribe(res => {
      if (res.success) this.metrics.set(res.data);
    });

    // 2. Load pending transactions
    this.adminService.getTransactions().subscribe(res => {
      if (res.success) {
        const pending = res.data.filter(t => t.status === 'pending');
        this.pendingTxs.set(pending);
      }
    });

    // 3. Load users for quick balance lookup
    this.adminService.getUsers().subscribe(res => {
      if (res.success) this.users.set(res.data);
    });

    // 4. Load deposit wallets
    this.adminService.getDepositWallets().subscribe(res => {
      if (res.success) this.depositWallets.set(res.data);
    });
  }

  onSearchUsers() {
    this.adminService.getUsers(this.searchUserQuery).subscribe(res => {
      if (res.success) this.users.set(res.data);
    });
  }

  approveTransaction(id: number) {
    this.adminService.reviewTransaction(id, 'completed').subscribe({
      next: (res) => {
        this.toast.success(res.message || 'Transaction approved successfully');
        this.loadData();
      },
      error: (err) => this.toast.error(err.error?.error || 'Failed to approve transaction')
    });
  }

  rejectTransaction(id: number) {
    if (!confirm('Are you sure you want to reject this transaction?')) return;
    this.adminService.reviewTransaction(id, 'rejected').subscribe({
      next: (res) => {
        this.toast.info('Transaction rejected');
        this.loadData();
      },
      error: (err) => this.toast.error(err.error?.error || 'Failed to reject transaction')
    });
  }

  getFullReceiptUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const base = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  openBalanceModal(user: any) {
    this.selectedUser.set(user);
    this.editAsset = 'USDT';
    const existing = user.wallets?.find((w: any) => w.asset_symbol === 'USDT');
    this.newBalanceAmount = existing ? Number(existing.balance) : 0;
    this.balanceModalOpen.set(true);
  }

  saveBalance() {
    const user = this.selectedUser();
    if (!user) return;

    this.adminService.updateUserBalance(user.id, this.editAsset, this.newBalanceAmount).subscribe({
      next: (res) => {
        this.toast.success(res.message || `${this.editAsset} balance updated for ${user.full_name}`);
        this.balanceModalOpen.set(false);
        this.loadData();
      },
      error: (err) => this.toast.error(err.error?.error || 'Failed to update balance')
    });
  }
}
