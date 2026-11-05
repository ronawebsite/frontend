import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ToastService } from '../../../services/toast.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 font-nunito text-slate-100">
      
      <!-- Top Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#002625] to-[#003432] border border-[#0BB4D2]/30 shadow-xl">
        <div class="space-y-1">
          <div class="flex items-center space-x-2">
            <span class="text-xs font-black uppercase tracking-wider text-[#0BB4D2]">PAYMENT APPROVALS</span>
            <span
              *ngIf="pendingCount() > 0"
              class="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-black animate-pulse"
            >
              {{ pendingCount() }} ACTION NEEDED
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Deposits &amp; Cash Outs
          </h1>
          <p class="text-xs sm:text-sm text-slate-300">
            Verify client payment receipts, approve deposits, and release funds into client accounts with 1 click.
          </p>
        </div>

        <!-- Quick Summary Numbers -->
        <div class="flex items-center space-x-3 shrink-0">
          <div class="px-4 py-2 rounded-2xl bg-black/40 border border-white/10 text-center min-w-[90px]">
            <span class="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
            <span class="text-lg font-black text-white font-mono">{{ transactions().length }}</span>
          </div>
          <div
            class="px-4 py-2 rounded-2xl border text-center min-w-[90px]"
            [ngClass]="pendingCount() > 0 ? 'bg-amber-950/40 border-amber-500/50' : 'bg-black/40 border-white/10'"
          >
            <span class="text-[10px] uppercase font-bold block" [ngClass]="pendingCount() > 0 ? 'text-amber-300' : 'text-slate-400'">Pending</span>
            <span class="text-lg font-black font-mono" [ngClass]="pendingCount() > 0 ? 'text-amber-400' : 'text-emerald-400'">{{ pendingCount() }}</span>
          </div>
        </div>
      </div>

      <!-- Filters & Tabs -->
      <div class="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <!-- Tab Buttons -->
        <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            (click)="activeTab = 'PENDING'"
            class="px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center space-x-1.5"
            [ngClass]="activeTab === 'PENDING' ? 'btn-cyan-gradient text-black shadow-md' : 'bg-white/5 text-slate-300 hover:text-white'"
          >
            <span>⏳ Pending Review</span>
            <span *ngIf="pendingCount() > 0" class="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 font-bold">
              {{ pendingCount() }}
            </span>
          </button>

          <button
            (click)="activeTab = 'ALL'"
            class="px-3.5 py-2 rounded-xl text-xs font-bold transition"
            [ngClass]="activeTab === 'ALL' ? 'btn-cyan-gradient text-black shadow-md' : 'bg-white/5 text-slate-300 hover:text-white'"
          >
            All History ({{ transactions().length }})
          </button>

          <button
            (click)="activeTab = 'DEPOSITS'"
            class="px-3.5 py-2 rounded-xl text-xs font-bold transition"
            [ngClass]="activeTab === 'DEPOSITS' ? 'btn-cyan-gradient text-black shadow-md' : 'bg-white/5 text-slate-300 hover:text-white'"
          >
            Deposits
          </button>

          <button
            (click)="activeTab = 'WITHDRAWALS'"
            class="px-3.5 py-2 rounded-xl text-xs font-bold transition"
            [ngClass]="activeTab === 'WITHDRAWALS' ? 'btn-cyan-gradient text-black shadow-md' : 'bg-white/5 text-slate-300 hover:text-white'"
          >
            Cash Outs
          </button>
        </div>

        <!-- Search Input -->
        <div class="relative w-full sm:w-64">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search by user or coin..."
            class="w-full pl-8 pr-3 py-2 rounded-xl bg-[#001c1c] border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#0BB4D2]"
          />
          <span class="absolute left-2.5 top-2.5 text-xs text-slate-400">🔍</span>
        </div>
      </div>

      <!-- Transactions Table -->
      <div class="glass-panel rounded-3xl border border-white/10 p-6 space-y-4 shadow-xl">
        
        <div *ngIf="filteredTransactions().length === 0" class="py-12 text-center space-y-2">
          <span class="text-3xl">☕</span>
          <div class="text-sm font-bold text-white">No transactions found</div>
          <p class="text-xs text-slate-400">
            {{ activeTab === 'PENDING' ? 'No pending requests waiting for review.' : 'No transactions match your search.' }}
          </p>
        </div>

        <div *ngIf="filteredTransactions().length > 0" class="overflow-x-auto no-scrollbar">
          <table class="w-full text-left text-xs font-mono">
            <thead>
              <tr class="border-b border-white/10 text-slate-400 font-sans font-bold uppercase tracking-wider text-[11px]">
                <th class="py-3 px-3">Date</th>
                <th class="py-3 px-3">User &amp; Proof</th>
                <th class="py-3 px-3">Action</th>
                <th class="py-3 px-3">Amount</th>
                <th class="py-3 px-3">USD Value</th>
                <th class="py-3 px-3">Status</th>
                <th class="py-3 px-3 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5 font-sans">
              <tr *ngFor="let tx of filteredTransactions()" class="hover:bg-white/5 transition-colors">
                <td class="py-3.5 px-3 text-slate-400 text-xs font-mono">
                  {{ tx.created_at | date:'mediumDate' }}
                  <span class="text-[10px] text-slate-500 block">{{ tx.created_at | date:'shortTime' }}</span>
                </td>
                <td class="py-3.5 px-3">
                  <div class="text-white font-bold">{{ tx.full_name || 'Client' }}</div>
                  <div class="text-[10px] text-slate-400 font-mono">{{ tx.account_id || ('ID #' + tx.user_id) }}</div>
                  
                  <!-- View Receipt Proof Button -->
                  <div *ngIf="tx.receipt_url" class="mt-1">
                    <button
                      type="button"
                      (click)="viewReceipt(tx.receipt_url)"
                      class="text-[10px] px-2 py-0.5 rounded-lg bg-[#0BB4D2]/20 hover:bg-[#0BB4D2]/35 text-cyan-300 font-bold inline-flex items-center space-x-1 border border-[#0BB4D2]/40 transition"
                    >
                      <span>🧾 View Receipt Proof</span>
                    </button>
                  </div>
                </td>
                <td class="py-3.5 px-3">
                  <span
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase"
                    [ngClass]="{
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30': tx.type === 'deposit' || tx.type === 'bot_profit',
                      'bg-rose-500/20 text-rose-300 border border-rose-500/30': tx.type === 'withdrawal',
                      'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30': tx.type === 'trade' || tx.type === 'swap'
                    }"
                  >
                    {{ tx.type === 'withdrawal' ? '📤 Cash Out' : (tx.type === 'deposit' ? '📥 Deposit' : tx.type) }}
                  </span>
                </td>
                <td class="py-3.5 px-3 font-mono font-bold text-white">
                  {{ tx.amount }} <span class="text-xs text-slate-400">{{ tx.asset_symbol }}</span>
                </td>
                <td class="py-3.5 px-3 font-mono font-bold text-[#0BB4D2]">
                  \${{ tx.amount_usd | number:'1.2-2' }}
                </td>
                <td class="py-3.5 px-3">
                  <span
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase"
                    [ngClass]="{
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40': tx.status === 'completed',
                      'bg-amber-500/20 text-amber-300 border border-amber-500/40': tx.status === 'pending',
                      'bg-rose-500/20 text-rose-300 border border-rose-500/40': tx.status === 'failed' || tx.status === 'rejected'
                    }"
                  >
                    {{ tx.status === 'pending' ? '⏳ Pending' : (tx.status === 'completed' ? '✓ Credited' : tx.status) }}
                  </span>
                </td>
                <td class="py-3.5 px-3 text-right space-x-2">
                  <button
                    *ngIf="tx.status === 'pending'"
                    (click)="approveTx(tx)"
                    class="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs shadow-md transition"
                  >
                    ✓ Approve &amp; Release Funds
                  </button>
                  <button
                    *ngIf="tx.status === 'pending'"
                    (click)="rejectTx(tx.id)"
                    class="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold text-xs transition"
                  >
                    ✕ Reject
                  </button>
                  <span *ngIf="tx.status !== 'pending'" class="text-slate-500 text-xs font-semibold">
                    Settled
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- RECEIPT PREVIEW MODAL -->
      <div *ngIf="previewReceiptUrl()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
        <div class="bg-[#002625] border border-[#0BB4D2]/40 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 class="text-base font-black text-white flex items-center space-x-2">
              <span>🧾 Client Payment Receipt Proof</span>
            </h3>
            <button
              type="button"
              (click)="previewReceiptUrl.set(null)"
              class="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              ✕
            </button>
          </div>

          <div class="max-h-[70vh] overflow-auto rounded-2xl border border-white/10 bg-black/40 p-2 flex items-center justify-center">
            <img [src]="getFullReceiptUrl(previewReceiptUrl()!)" alt="Payment Receipt" class="max-w-full h-auto rounded-xl object-contain shadow-lg" />
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-white/10">
            <a
              [href]="getFullReceiptUrl(previewReceiptUrl()!)"
              target="_blank"
              class="text-xs text-cyan-300 font-bold hover:underline"
            >
              Open in full window ↗
            </a>
            <button
              type="button"
              (click)="previewReceiptUrl.set(null)"
              class="px-4 py-2 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>

    </div>
  `
})
export class AdminTransactionsComponent implements OnInit {
  adminService = inject(AdminService);
  toast = inject(ToastService);

  transactions = signal<any[]>([]);
  activeTab: 'PENDING' | 'ALL' | 'DEPOSITS' | 'WITHDRAWALS' = 'PENDING';
  searchQuery = '';
  previewReceiptUrl = signal<string | null>(null);

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.adminService.getTransactions().subscribe(res => {
      if (res.success) {
        this.transactions.set(res.data);
        const hasPending = res.data.some((t: any) => t.status === 'pending');
        if (!hasPending && this.activeTab === 'PENDING') {
          this.activeTab = 'ALL';
        }
      }
    });
  }

  pendingCount(): number {
    return this.transactions().filter(t => t.status === 'pending').length;
  }

  filteredTransactions(): any[] {
    const q = this.searchQuery.toLowerCase().trim();
    return this.transactions().filter(t => {
      if (this.activeTab === 'PENDING' && t.status !== 'pending') return false;
      if (this.activeTab === 'DEPOSITS' && t.type !== 'deposit') return false;
      if (this.activeTab === 'WITHDRAWALS' && t.type !== 'withdrawal') return false;

      if (q) {
        const matchesUser = t.full_name?.toLowerCase().includes(q) || t.account_id?.toLowerCase().includes(q);
        const matchesCoin = t.asset_symbol?.toLowerCase().includes(q);
        if (!matchesUser && !matchesCoin) return false;
      }

      return true;
    });
  }

  viewReceipt(url: string) {
    this.previewReceiptUrl.set(url);
  }

  getFullReceiptUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const base = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  approveTx(tx: any) {
    const hash = tx.tx_hash || ('0x' + Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2));
    this.adminService.reviewTransaction(tx.id, 'completed', hash).subscribe({
      next: (res) => {
        this.toast.success(res.message || 'Deposit approved and funds released to client account!');
        this.loadTransactions();
      },
      error: (err) => this.toast.error(err.error?.error || 'Could not approve transaction')
    });
  }

  rejectTx(id: number) {
    if (!confirm('Are you sure you want to reject this transaction?')) return;
    this.adminService.reviewTransaction(id, 'failed').subscribe({
      next: () => {
        this.toast.info('Transaction rejected');
        this.loadTransactions();
      },
      error: (err) => this.toast.error(err.error?.error || 'Could not reject transaction')
    });
  }
}
