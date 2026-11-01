import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import * as QRCode from 'qrcode';
import { AdminService } from '../../../services/admin.service';
import { ToastService } from '../../../services/toast.service';

interface DepositWallet {
  id: number;
  asset_symbol: string;
  asset_name: string;
  network: string;
  deposit_address: string;
  memo_tag?: string | null;
  instructions?: string;
  minimum_deposit: number;
  confirmations_required: number;
  is_active: number | boolean;
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-admin-deposit-wallets',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-8 font-nunito text-slate-100 selection:bg-purple-500 selection:text-white">

      <!-- ========================================================================= -->
      <!-- TOP BANNER                                                                -->
      <!-- ========================================================================= -->
      <div class="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#002625] via-[#1a1230] to-[#071318] border border-purple-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="space-y-1.5">
          <div class="flex items-center space-x-2">
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="text-xs font-black uppercase tracking-wider text-purple-300">Executive Vault Operations</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Live Deposit Gateway
            </span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Deposit Wallet Address Manager
          </h1>
          <p class="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Configure and set your company or personal crypto wallet deposit addresses. These are the exact addresses, networks, and QR codes clients see on their portal when adding funds.
          </p>
        </div>

        <!-- Quick Summary Stats -->
        <div class="flex items-center space-x-3 shrink-0">
          <div class="px-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-center min-w-[90px]">
            <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Coins</span>
            <span class="text-lg font-black text-white font-mono">{{ wallets().length }}</span>
          </div>
          <div class="px-4 py-2.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center min-w-[90px]">
            <span class="text-[10px] uppercase font-bold text-emerald-300 tracking-wider block">Active</span>
            <span class="text-lg font-black text-emerald-400 font-mono">{{ activeCount() }}</span>
          </div>
          <button
            (click)="openCreateModal()"
            class="px-4 py-3 rounded-2xl btn-cyan-gradient font-black text-xs shadow-lg shadow-[#0BB4D2]/25 flex items-center space-x-2 shrink-0 hover:scale-[1.02] transition"
          >
            <span>➕</span>
            <span>Add Crypto Wallet</span>
          </button>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- FILTER & SEARCH BAR                                                       -->
      <!-- ========================================================================= -->
      <div class="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="relative w-full sm:w-80">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search coin (USDT, BTC, SOL) or network..."
            class="w-full pl-9 pr-4 py-2 rounded-xl bg-[#001c1c] border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#0BB4D2]"
          />
          <span class="absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>
        </div>

        <div class="flex items-center space-x-2 text-xs w-full sm:w-auto justify-end">
          <span class="text-slate-400">Filter:</span>
          <button
            (click)="filterStatus = 'ALL'"
            class="px-3 py-1.5 rounded-xl border text-[11px] font-bold transition"
            [ngClass]="filterStatus === 'ALL' ? 'bg-[#0BB4D2]/20 border-[#0BB4D2] text-[#0BB4D2]' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'"
          >
            All ({{ wallets().length }})
          </button>
          <button
            (click)="filterStatus = 'ACTIVE'"
            class="px-3 py-1.5 rounded-xl border text-[11px] font-bold transition"
            [ngClass]="filterStatus === 'ACTIVE' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'"
          >
            Active Only ({{ activeCount() }})
          </button>
          <button
            (click)="filterStatus = 'INACTIVE'"
            class="px-3 py-1.5 rounded-xl border text-[11px] font-bold transition"
            [ngClass]="filterStatus === 'INACTIVE' ? 'bg-rose-500/20 border-rose-500 text-rose-300' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'"
          >
            Disabled ({{ wallets().length - activeCount() }})
          </button>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- WALLETS GRID / CARDS                                                      -->
      <!-- ========================================================================= -->
      <div *ngIf="loading()" class="py-16 text-center text-slate-400 space-y-3">
        <div class="inline-block w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <div class="text-xs font-bold">Loading deposit wallets...</div>
      </div>

      <div *ngIf="!loading() && filteredWallets().length === 0" class="glass-panel p-12 text-center rounded-3xl border border-white/10 space-y-3">
        <span class="text-4xl">👛</span>
        <h3 class="text-base font-bold text-white">No Deposit Wallets Found</h3>
        <p class="text-xs text-slate-400 max-w-sm mx-auto">
          No crypto addresses match your query. Add your first deposit wallet or clear filters.
        </p>
        <button
          (click)="openCreateModal()"
          class="px-4 py-2 rounded-xl btn-cyan-gradient font-black text-xs inline-flex items-center space-x-1.5 mt-2"
        >
          <span>➕ Add Wallet Address</span>
        </button>
      </div>

      <div *ngIf="!loading() && filteredWallets().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          *ngFor="let wallet of filteredWallets()"
          class="glass-panel rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-between space-y-4 hover:border-[#0BB4D2]/40 group"
          [ngClass]="wallet.is_active ? 'border-white/10 bg-[#002625]/90' : 'border-rose-900/30 bg-black/40 opacity-70'"
        >
          <!-- Card Header -->
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center space-x-3">
              <!-- Coin Badge -->
              <div
                class="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shadow-md shrink-0"
                [ngClass]="getCoinBadgeClass(wallet.asset_symbol)"
              >
                {{ getCoinIcon(wallet.asset_symbol) }}
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <h3 class="font-black text-white text-base tracking-tight">{{ wallet.asset_symbol }}</h3>
                  <span
                    class="px-2 py-0.5 text-[9px] font-black rounded-full uppercase"
                    [ngClass]="wallet.is_active ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'"
                  >
                    {{ wallet.is_active ? 'Active' : 'Disabled' }}
                  </span>
                </div>
                <span class="text-xs text-slate-300 font-bold block">{{ wallet.asset_name }}</span>
                <span class="text-[10px] font-mono text-[#0BB4D2] font-semibold">{{ wallet.network }}</span>
              </div>
            </div>

            <!-- 1-Click Toggle Active Status -->
            <button
              (click)="toggleActive(wallet)"
              [title]="wallet.is_active ? 'Deactivate this address for users' : 'Activate this address for users'"
              class="p-2 rounded-xl border transition"
              [ngClass]="wallet.is_active ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20' : 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20'"
            >
              <span class="text-xs">{{ wallet.is_active ? '🟢 ON' : '🔴 OFF' }}</span>
            </button>
          </div>

          <!-- Deposit Address Box -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
              <span>Deposit Address</span>
              <button
                (click)="copyAddress(wallet.deposit_address)"
                class="hover:text-cyan-300 transition flex items-center space-x-1"
              >
                <span>📋 Copy</span>
              </button>
            </div>
            <div
              (click)="copyAddress(wallet.deposit_address)"
              class="font-mono text-[11px] text-slate-200 bg-[#070c18] p-3 rounded-2xl border border-white/10 break-all select-all font-semibold hover:border-[#0BB4D2]/40 cursor-pointer transition"
              title="Click to copy address"
            >
              {{ wallet.deposit_address }}
            </div>
          </div>

          <!-- Memo / Tag if present -->
          <div *ngIf="wallet.memo_tag" class="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs font-mono">
            <div>
              <span class="text-amber-400 text-[10px] uppercase font-bold block">Memo / Tag:</span>
              <span class="text-white font-bold">{{ wallet.memo_tag }}</span>
            </div>
            <button
              (click)="copyAddress(wallet.memo_tag)"
              class="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold hover:bg-amber-500/30 transition"
            >
              Copy
            </button>
          </div>

          <!-- Meta Specs -->
          <div class="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-white/5 font-mono text-slate-400">
            <div>
              <span class="block text-[10px] text-slate-500 uppercase font-sans">Min Deposit</span>
              <strong class="text-white font-mono">{{ wallet.minimum_deposit }} {{ wallet.asset_symbol }}</strong>
            </div>
            <div>
              <span class="block text-[10px] text-slate-500 uppercase font-sans">Confirmations</span>
              <strong class="text-white font-mono">{{ wallet.confirmations_required }} Blocks</strong>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center space-x-2 pt-2 border-t border-white/10">
            <button
              (click)="openEditModal(wallet)"
              class="flex-1 py-2 rounded-xl bg-purple-900/30 hover:bg-purple-800/40 text-purple-200 border border-purple-500/30 font-bold text-xs transition flex items-center justify-center space-x-1.5"
            >
              <span>✏️</span>
              <span>Edit Address</span>
            </button>
            <button
              (click)="deleteWallet(wallet)"
              class="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition"
              title="Delete this address"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- EDIT / ADD MODAL                                                          -->
      <!-- ========================================================================= -->
      <div *ngIf="modalOpen()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
        <div class="glass-panel w-full max-w-xl rounded-3xl p-6 sm:p-7 border border-[#0BB4D2]/40 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar">
          
          <!-- Modal Header -->
          <div class="flex items-center justify-between border-b border-white/10 pb-4">
            <div class="space-y-0.5">
              <span class="text-[10px] font-black uppercase tracking-wider text-[#0BB4D2]">
                {{ isNew() ? 'NEW ASSET CONFIGURATION' : 'SET WALLET ADDRESS' }}
              </span>
              <h2 class="text-xl font-black text-white">
                {{ isNew() ? 'Add Deposit Wallet' : 'Edit ' + form.asset_symbol + ' Deposit Address' }}
              </h2>
            </div>
            <button
              (click)="modalOpen.set(false)"
              class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              ✕
            </button>
          </div>

          <!-- Form Fields -->
          <div class="space-y-4 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Asset Symbol -->
              <div class="space-y-1">
                <label class="text-slate-300 font-bold">Coin Symbol (e.g. USDT, BTC)</label>
                <input
                  type="text"
                  [(ngModel)]="form.asset_symbol"
                  [disabled]="!isNew()"
                  placeholder="USDT"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-white font-mono font-bold uppercase focus:outline-none focus:border-[#0BB4D2]"
                />
              </div>

              <!-- Full Name -->
              <div class="space-y-1">
                <label class="text-slate-300 font-bold">Full Name (e.g. Tether USD)</label>
                <input
                  type="text"
                  [(ngModel)]="form.asset_name"
                  placeholder="Tether USD"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-white focus:outline-none focus:border-[#0BB4D2]"
                />
              </div>
            </div>

            <!-- Network Name -->
            <div class="space-y-1">
              <label class="text-slate-300 font-bold">Network / Blockchain (e.g. TRC20 (Tron), ERC20, Bitcoin Mainnet)</label>
              <input
                type="text"
                [(ngModel)]="form.network"
                placeholder="TRC20 (Tron)"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-white font-mono focus:outline-none focus:border-[#0BB4D2]"
              />
            </div>

            <!-- Deposit Address (Core) -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="text-white font-black text-xs flex items-center space-x-1.5">
                  <span class="text-[#0BB4D2]">🎯</span>
                  <span>Deposit Wallet Address (Where users send funds)</span>
                </label>
                <span class="text-[10px] text-emerald-400 font-bold">Client-Visible</span>
              </div>
              <textarea
                rows="2"
                [(ngModel)]="form.deposit_address"
                (ngModelChange)="onAddressChange($event)"
                placeholder="Paste your wallet address here (e.g. TYDzsYUEpvnYmQk4zGP9sWWcTEd3GL7q3b or 0x...)"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#070c18] border border-[#0BB4D2]/40 text-emerald-300 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#0BB4D2]"
              ></textarea>
              <p class="text-[10px] text-slate-400">
                Any deposit address saved here will immediately appear in the user portal alongside an auto-generated QR code.
              </p>
            </div>

            <!-- Live QR Preview -->
            <div *ngIf="qrPreviewUrl()" class="p-3 bg-[#001c1c] rounded-2xl border border-white/10 flex items-center space-x-4">
              <div class="w-20 h-20 bg-white p-1 rounded-xl shrink-0 flex items-center justify-center">
                <img [src]="qrPreviewUrl()" alt="QR Preview" class="w-full h-full object-contain" />
              </div>
              <div class="space-y-1 text-slate-300 text-[11px]">
                <span class="font-bold text-white block">Live QR Preview</span>
                <p class="text-[10px] text-slate-400 break-all line-clamp-2 font-mono">
                  {{ form.deposit_address }}
                </p>
                <span class="text-[10px] text-cyan-300 font-semibold">✓ Generated automatically for clients</span>
              </div>
            </div>

            <!-- Memo / Destination Tag -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="space-y-1">
                <label class="text-slate-300 font-bold">Memo / Tag (Optional)</label>
                <input
                  type="text"
                  [(ngModel)]="form.memo_tag"
                  placeholder="e.g. 10928374 (XRP/BNB)"
                  class="w-full px-3.5 py-2 rounded-xl bg-[#001c1c] border border-white/15 text-white font-mono"
                />
              </div>

              <div class="space-y-1">
                <label class="text-slate-300 font-bold">Min Deposit</label>
                <input
                  type="number"
                  step="any"
                  [(ngModel)]="form.minimum_deposit"
                  class="w-full px-3.5 py-2 rounded-xl bg-[#001c1c] border border-white/15 text-white font-mono"
                />
              </div>

              <div class="space-y-1">
                <label class="text-slate-300 font-bold">Confirmations</label>
                <input
                  type="number"
                  [(ngModel)]="form.confirmations_required"
                  class="w-full px-3.5 py-2 rounded-xl bg-[#001c1c] border border-white/15 text-white font-mono"
                />
              </div>
            </div>

            <!-- Instructions -->
            <div class="space-y-1">
              <label class="text-slate-300 font-bold">Client Guidance / Deposit Instructions</label>
              <input
                type="text"
                [(ngModel)]="form.instructions"
                placeholder="Send only the specified asset to this address. Credits after network confirmation."
                class="w-full px-3.5 py-2 rounded-xl bg-[#001c1c] border border-white/15 text-white"
              />
            </div>

            <!-- Status Toggle -->
            <div class="p-3 bg-white/5 rounded-2xl flex items-center justify-between">
              <div>
                <span class="font-bold text-white block">Active &amp; Visible to Clients</span>
                <span class="text-[10px] text-slate-400">When enabled, clients can select this coin and view this address.</span>
              </div>
              <input
                type="checkbox"
                [(ngModel)]="form.is_active"
                class="w-5 h-5 accent-[#0BB4D2] cursor-pointer"
              />
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="flex justify-end space-x-3 pt-3 border-t border-white/10">
            <button
              (click)="modalOpen.set(false)"
              type="button"
              class="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              (click)="saveWallet()"
              type="button"
              class="px-6 py-2.5 rounded-xl btn-cyan-gradient font-black text-xs shadow-lg shadow-[#0BB4D2]/25"
            >
              Save Address
            </button>
          </div>
        </div>
      </div>

    </div>
  `
})
export class AdminDepositWalletsComponent implements OnInit {
  adminService = inject(AdminService);
  toast = inject(ToastService);

  wallets = signal<DepositWallet[]>([]);
  loading = signal<boolean>(false);
  modalOpen = signal<boolean>(false);
  isNew = signal<boolean>(false);

  searchQuery = '';
  filterStatus: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL';

  qrPreviewUrl = signal<string>('');

  form: {
    id?: number;
    asset_symbol: string;
    asset_name: string;
    network: string;
    deposit_address: string;
    memo_tag: string;
    instructions: string;
    minimum_deposit: number;
    confirmations_required: number;
    is_active: boolean;
  } = {
    asset_symbol: 'USDT',
    asset_name: 'Tether USD',
    network: 'TRC20 (Tron)',
    deposit_address: '',
    memo_tag: '',
    instructions: 'Send only the specified asset to this address. Credits after network confirmation.',
    minimum_deposit: 10,
    confirmations_required: 3,
    is_active: true
  };

  ngOnInit() {
    this.loadWallets();
  }

  loadWallets() {
    this.loading.set(true);
    this.adminService.getDepositWallets().subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.wallets.set(res.data);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error('Failed to load deposit wallets: ' + (err.error?.error || err.message));
      }
    });
  }

  activeCount(): number {
    return this.wallets().filter(w => Boolean(w.is_active)).length;
  }

  filteredWallets(): DepositWallet[] {
    const q = this.searchQuery.toLowerCase().trim();
    return this.wallets().filter(w => {
      const matchesSearch = !q ||
        w.asset_symbol.toLowerCase().includes(q) ||
        w.asset_name.toLowerCase().includes(q) ||
        w.network.toLowerCase().includes(q) ||
        w.deposit_address.toLowerCase().includes(q);

      const isActive = Boolean(w.is_active);
      const matchesStatus =
        this.filterStatus === 'ALL' ||
        (this.filterStatus === 'ACTIVE' && isActive) ||
        (this.filterStatus === 'INACTIVE' && !isActive);

      return matchesSearch && matchesStatus;
    });
  }

  openCreateModal() {
    this.isNew.set(true);
    this.form = {
      asset_symbol: '',
      asset_name: '',
      network: 'Mainnet',
      deposit_address: '',
      memo_tag: '',
      instructions: 'Send only the specified asset to this address. Credits after network confirmation.',
      minimum_deposit: 10,
      confirmations_required: 3,
      is_active: true
    };
    this.qrPreviewUrl.set('');
    this.modalOpen.set(true);
  }

  openEditModal(wallet: DepositWallet) {
    this.isNew.set(false);
    this.form = {
      id: wallet.id,
      asset_symbol: wallet.asset_symbol,
      asset_name: wallet.asset_name,
      network: wallet.network,
      deposit_address: wallet.deposit_address,
      memo_tag: wallet.memo_tag || '',
      instructions: wallet.instructions || 'Send only the specified asset to this address. Credits after network confirmation.',
      minimum_deposit: Number(wallet.minimum_deposit) || 10,
      confirmations_required: wallet.confirmations_required || 3,
      is_active: Boolean(wallet.is_active)
    };
    this.onAddressChange(wallet.deposit_address);
    this.modalOpen.set(true);
  }

  async onAddressChange(address: string) {
    if (address && address.trim().length > 6) {
      try {
        const url = await QRCode.toDataURL(address.trim(), {
          width: 150,
          margin: 1,
          color: { dark: '#090d16', light: '#ffffff' }
        });
        this.qrPreviewUrl.set(url);
      } catch (e) {
        this.qrPreviewUrl.set('');
      }
    } else {
      this.qrPreviewUrl.set('');
    }
  }

  saveWallet() {
    if (!this.form.asset_symbol || !this.form.deposit_address) {
      this.toast.error('Asset symbol and deposit address are required');
      return;
    }

    if (this.isNew()) {
      this.adminService.createDepositWallet(this.form).subscribe({
        next: (res) => {
          this.toast.success(res.message || 'Deposit wallet created');
          this.modalOpen.set(false);
          this.loadWallets();
        },
        error: (err) => this.toast.error(err.error?.error || 'Failed to create deposit wallet')
      });
    } else {
      if (!this.form.id) return;
      this.adminService.updateDepositWallet(this.form.id, this.form).subscribe({
        next: (res) => {
          this.toast.success(res.message || 'Deposit address updated');
          this.modalOpen.set(false);
          this.loadWallets();
        },
        error: (err) => this.toast.error(err.error?.error || 'Failed to update deposit wallet')
      });
    }
  }

  toggleActive(wallet: DepositWallet) {
    this.adminService.toggleDepositWallet(wallet.id).subscribe({
      next: (res) => {
        this.toast.success(res.message || 'Status updated');
        this.loadWallets();
      },
      error: (err) => this.toast.error(err.error?.error || 'Failed to toggle status')
    });
  }

  deleteWallet(wallet: DepositWallet) {
    if (!confirm(`Are you sure you want to delete ${wallet.asset_symbol} (${wallet.network})? Users will no longer be able to deposit via this address.`)) {
      return;
    }

    this.adminService.deleteDepositWallet(wallet.id).subscribe({
      next: (res) => {
        this.toast.success(res.message || 'Deposit wallet deleted');
        this.loadWallets();
      },
      error: (err) => this.toast.error(err.error?.error || 'Failed to delete wallet')
    });
  }

  copyAddress(text?: string | null) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    this.toast.success('Copied to clipboard: ' + text.slice(0, 16) + '...');
  }

  getCoinIcon(symbol: string): string {
    switch (symbol.toUpperCase()) {
      case 'USDT': return '₮';
      case 'BTC': return '₿';
      case 'ETH': return 'Ξ';
      case 'SOL': return '◎';
      case 'BNB': return '🔶';
      case 'TRX': return '♦';
      case 'XRP': return '✕';
      case 'DOGE': return 'Ð';
      case 'LTC': return 'Ł';
      default: return '🪙';
    }
  }

  getCoinBadgeClass(symbol: string): string {
    switch (symbol.toUpperCase()) {
      case 'USDT': return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      case 'BTC': return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      case 'ETH': return 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30';
      case 'SOL': return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
      case 'BNB': return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
      case 'TRX': return 'bg-red-500/20 text-red-300 border border-red-500/30';
      case 'XRP': return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
      case 'DOGE': return 'bg-amber-600/20 text-amber-400 border border-amber-600/30';
      case 'LTC': return 'bg-slate-400/20 text-slate-200 border border-slate-400/30';
      default: return 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30';
    }
  }
}
