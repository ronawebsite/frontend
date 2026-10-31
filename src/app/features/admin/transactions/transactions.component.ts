import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ToastService } from '../../../services/toast.service';
import { Transaction } from '../../../core/models/fintech.models';

@Component({
  selector: 'app-admin-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      
      <!-- Top Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#002625] border border-purple-500/30 shadow-xl">
        <div class="space-y-1">
          <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Transactions &amp; Security PINs
          </h1>
          <p class="text-xs sm:text-sm text-slate-300">
            Review pending deposits &amp; cash outs, approve or reject transactions, and check confirmation codes.
          </p>
        </div>
      </div>

      <!-- Transactions Table -->
      <div class="glass-panel rounded-3xl border border-white/10 p-6 space-y-4 shadow-xl">
        <div class="overflow-x-auto no-scrollbar">
          <table class="w-full text-left text-xs font-mono">
            <thead>
              <tr class="border-b border-white/10 text-slate-400 font-sans font-bold uppercase tracking-wider">
                <th class="py-3 px-3">Tx ID</th>
                <th class="py-3 px-3">User</th>
                <th class="py-3 px-3">Action Type</th>
                <th class="py-3 px-3">Coin</th>
                <th class="py-3 px-3">Amount</th>
                <th class="py-3 px-3">USD Value</th>
                <th class="py-3 px-3">Transaction Code</th>
                <th class="py-3 px-3">Status</th>
                <th class="py-3 px-3 text-right">Supervisor Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr *ngFor="let tx of transactions()" class="hover:bg-white/5 transition-colors">
                <td class="py-3.5 px-3 text-slate-400">#{{ tx.id }}</td>
                <td class="py-3.5 px-3 font-sans">
                  <div class="text-white font-bold">{{ tx.full_name }}</div>
                  <div class="text-[10px] text-slate-400 font-mono">{{ tx.account_id }}</div>
                </td>
                <td class="py-3.5 px-3 font-bold uppercase font-sans" [ngClass]="{
                  'text-emerald-400': tx.type === 'deposit' || tx.type === 'bot_profit',
                  'text-rose-400': tx.type === 'withdrawal',
                  'text-cyan-400': tx.type === 'trade' || tx.type === 'swap'
                }">
                  {{ tx.type }}
                </td>
                <td class="py-3.5 px-3 font-bold text-white">{{ tx.asset_symbol }}</td>
                <td class="py-3.5 px-3">{{ tx.amount | number:'1.2-6' }}</td>
                <td class="py-3.5 px-3 font-bold text-white">\${{ tx.amount_usd | number:'1.2-2' }}</td>
                <td class="py-3.5 px-3 text-slate-400">
                  <span class="hover:text-cyan-300 transition-colors cursor-pointer" title="{{ tx.tx_hash }}">
                    {{ (tx.tx_hash || 'TX-PENDING').slice(0, 12) }}...
                  </span>
                </td>
                <td class="py-3.5 px-3 font-sans">
                  <span
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase"
                    [ngClass]="tx.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'"
                  >
                    {{ tx.status === 'completed' ? 'Completed' : 'Pending' }}
                  </span>
                </td>
                <td class="py-3.5 px-3 text-right space-x-1.5 font-sans">
                  <button
                    *ngIf="tx.status === 'pending'"
                    (click)="approveTx(tx.id)"
                    class="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 font-bold text-xs"
                  >
                    Approve
                  </button>
                  <button
                    *ngIf="tx.status === 'pending'"
                    (click)="rejectTx(tx.id)"
                    class="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 font-bold text-xs"
                  >
                    Reject
                  </button>
                  <span *ngIf="tx.status !== 'pending'" class="text-slate-500 text-xs font-semibold">Settled</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AdminTransactionsComponent implements OnInit {
  adminService = inject(AdminService);
  toast = inject(ToastService);

  transactions = signal<any[]>([]);

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.adminService.getTransactions().subscribe(res => {
      if (res.success) this.transactions.set(res.data);
    });
  }

  approveTx(id: number) {
    const hash = '0x' + Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2);
    this.adminService.reviewTransaction(id, 'completed', hash).subscribe({
      next: (res) => {
        this.toast.success('Transaction approved and settled');
        this.loadTransactions();
      },
      error: (err) => this.toast.error(err.error?.error || 'Could not approve transaction')
    });
  }

  rejectTx(id: number) {
    this.adminService.reviewTransaction(id, 'failed').subscribe({
      next: (res) => {
        this.toast.info('Transaction rejected');
        this.loadTransactions();
      },
      error: (err) => this.toast.error(err.error?.error || 'Could not reject transaction')
    });
  }
}
