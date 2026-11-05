import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as QRCode from 'qrcode';
import { WalletService } from '../../../services/wallet.service';
import { ToastService } from '../../../services/toast.service';
import { Transaction } from '../../../core/models/fintech.models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      
      <!-- ========================================================================= -->
      <!-- TOP BANNER                                                                -->
      <!-- ========================================================================= -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#003432] via-[#002625] to-[#071d24] border border-white/10 shadow-xl">
        <div class="space-y-1">
          <div class="flex items-center space-x-2.5">
            <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Deposit &amp; Cash Out
            </h1>
            <span class="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-[#0BB4D2]/20 text-cyan-300 border border-[#0BB4D2]/40">
              VERIFIED CUSTODY
            </span>
          </div>
          <p class="text-xs text-cyan-200/80">
            Secure multi-crypto deposit funding &bull; 2-Step verified cash out
          </p>
        </div>

        <!-- Download Statement Buttons -->
        <div class="flex items-center space-x-2 shrink-0">
          <button
            (click)="walletService.downloadCSV()"
            class="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs border border-white/10 transition flex items-center space-x-1"
          >
            <span>📥 CSV</span>
          </button>
          <button
            (click)="walletService.downloadPDF()"
            class="px-3.5 py-2 rounded-xl btn-cyan-gradient font-black text-xs shadow-md shadow-[#0BB4D2]/20 transition flex items-center space-x-1"
          >
            <span>📄 PDF</span>
          </button>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- TWO GATEWAYS: DEPOSIT & WITHDRAW                                          -->
      <!-- ========================================================================= -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- 1. Real Crypto Deposit Gateway -->
        <div class="glass-panel rounded-3xl p-6 border border-white/10 space-y-5 shadow-xl">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 class="text-base font-black text-white flex items-center space-x-2">
                <span>📥 Deposit Funds</span>
              </h2>
              <p class="text-xs text-slate-400">Step 1: Copy official address &amp; transfer funds</p>
            </div>
            <select
              [(ngModel)]="selectedDepositAsset"
              (ngModelChange)="onDepositAssetChange()"
              class="px-3 py-1.5 rounded-xl bg-[#002625] border border-white/15 font-mono font-bold text-sm text-[#0BB4D2] focus:outline-none"
            >
              <option *ngFor="let asset of supportedAssets" [value]="asset">{{ asset }}</option>
            </select>
          </div>

          <!-- Dynamic QR Code & Address Display -->
          <div class="flex flex-col sm:flex-row items-center gap-5 p-4 bg-[#002625] rounded-2xl border border-white/10">
            <!-- QR Canvas / Img -->
            <div class="w-36 h-36 bg-white p-2 rounded-2xl shadow-md flex items-center justify-center shrink-0">
              <img *ngIf="qrDataUrl()" [src]="qrDataUrl()" alt="Deposit QR Code" class="w-full h-full object-contain" />
              <div *ngIf="!qrDataUrl()" class="text-slate-400 text-xs">Generating...</div>
            </div>

            <div class="space-y-2 flex-1 w-full text-xs">
              <div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-slate-400 block text-[10px] uppercase font-bold">Official Deposit Address:</span>
                  <button
                    type="button"
                    (click)="copyDepositAddress()"
                    class="text-[10px] px-2 py-0.5 rounded-lg bg-white/10 hover:bg-[#0BB4D2]/20 text-[#0BB4D2] font-bold transition flex items-center space-x-1"
                  >
                    <span>{{ depositCopied() ? '✓ Copied' : '📋 Copy Address' }}</span>
                  </button>
                </div>
                <div
                  (click)="copyDepositAddress()"
                  class="font-mono text-slate-200 bg-[#070c18] p-2.5 rounded-xl border border-white/10 break-all select-all font-semibold text-[11px] leading-relaxed cursor-pointer hover:border-[#0BB4D2]/40 transition"
                  title="Click to copy address"
                >
                  {{ depositAddress() || 'Fetching address...' }}
                </div>
              </div>

              <!-- Memo / Destination Tag (if required, e.g. for XRP/BNB) -->
              <div *ngIf="depositMemoTag()" class="p-2.5 bg-[#070c18] rounded-xl border border-amber-500/30 flex items-center justify-between text-xs font-mono">
                <div>
                  <span class="text-amber-400 text-[10px] block font-bold uppercase">Memo / Destination Tag:</span>
                  <span class="text-white font-bold">{{ depositMemoTag() }}</span>
                </div>
                <button
                  type="button"
                  (click)="copyMemoTag()"
                  class="text-[10px] px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold hover:bg-amber-500/30 transition"
                >
                  Copy Tag
                </button>
              </div>

              <div class="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Network: <strong class="text-white">{{ depositNetwork() }}</strong></span>
                <span class="text-emerald-400 font-bold">Min: {{ depositMinAmount() }} {{ selectedDepositAsset }}</span>
              </div>

              <p *ngIf="depositInstructions()" class="text-[10px] text-slate-400 italic">
                ℹ️ {{ depositInstructions() }}
              </p>
            </div>
          </div>

          <!-- SUBMIT PAYMENT PROOF NOTICE (AFTER SUBMISSION) -->
          <div *ngIf="depositSubmittedNotice()" class="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 space-y-2">
            <div class="flex items-center space-x-2 text-emerald-300 font-black text-sm">
              <span>🎉 Payment Submitted for Approval!</span>
            </div>
            <p class="text-xs text-slate-300 leading-relaxed">
              Your deposit of <strong class="text-emerald-400 font-mono">{{ depositSubmittedNotice()?.amount }} {{ depositSubmittedNotice()?.asset }}</strong> has been logged and is now <span class="text-amber-300 font-bold">Pending Supervisor Review</span>. Funds will be released into your wallet once confirmed by the finance desk.
            </p>
            <div class="flex items-center justify-between pt-1 text-[11px]">
              <span class="text-slate-400 font-mono">Reference ID: #{{ depositSubmittedNotice()?.txId }}</span>
              <button
                type="button"
                (click)="depositSubmittedNotice.set(null)"
                class="text-xs text-cyan-300 hover:underline font-bold"
              >
                Submit another deposit &rarr;
              </button>
            </div>
          </div>

          <!-- STEP 2: SUBMIT PAYMENT CONFIRMATION FORM -->
          <form *ngIf="!depositSubmittedNotice()" (ngSubmit)="submitDepositConfirmation()" class="space-y-3.5 pt-1">
            <div class="border-t border-white/10 pt-3">
              <span class="text-[11px] font-black uppercase text-cyan-300 tracking-wider block">
                Step 2: Submit Payment Confirmation
              </span>
              <p class="text-xs text-slate-400 mt-0.5">
                After sending the funds to the official address above, enter the payment details and upload your transfer receipt for supervisor confirmation.
              </p>
            </div>

            <!-- Amount Sent Input -->
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span>Amount Transferred *</span>
                <span class="text-[10px] text-slate-400 font-mono">Min: {{ depositMinAmount() }} {{ selectedDepositAsset }}</span>
              </label>
              <div class="relative">
                <input
                  type="number"
                  [(ngModel)]="depositAmount"
                  name="depositAmount"
                  required
                  step="any"
                  placeholder="e.g. 500"
                  class="w-full pl-4 pr-16 py-2.5 rounded-xl bg-[#002625] border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-[#0BB4D2]"
                />
                <span class="absolute right-3.5 top-2.5 font-mono font-bold text-xs text-[#0BB4D2]">
                  {{ selectedDepositAsset }}
                </span>
              </div>
            </div>

            <!-- Transaction Hash / TXID (Optional) -->
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span>Transaction ID / Hash (Optional)</span>
                <span class="text-[10px] text-slate-400 font-sans">Blockchain TXID or Reference</span>
              </label>
              <input
                type="text"
                [(ngModel)]="depositTxHash"
                name="depositTxHash"
                placeholder="e.g. 0x8a7f... or transfer reference"
                class="w-full px-4 py-2 rounded-xl bg-[#002625] border border-white/15 text-white font-mono text-xs placeholder-slate-500 focus:outline-none focus:border-[#0BB4D2]"
              />
            </div>

            <!-- Upload Payment Receipt Screenshot -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span>Upload Payment Proof / Screenshot *</span>
                <span class="text-[10px] text-emerald-400 font-bold">Speeds up verification</span>
              </label>

              <!-- Upload Area -->
              <div
                class="p-4 rounded-2xl border border-dashed border-white/20 hover:border-[#0BB4D2]/60 bg-black/30 transition text-center space-y-2 relative"
                [ngClass]="receiptPreview() ? 'border-[#0BB4D2]/60 bg-[#0BB4D2]/5' : ''"
              >
                <!-- Image Preview if file chosen -->
                <div *ngIf="receiptPreview()" class="flex flex-col items-center space-y-2">
                  <div class="relative max-w-[200px] max-h-36 overflow-hidden rounded-xl border border-white/20 shadow-md">
                    <img [src]="receiptPreview()" alt="Payment Proof Preview" class="w-full h-auto object-cover" />
                  </div>
                  <div class="flex items-center space-x-2 text-xs">
                    <span class="text-emerald-300 font-bold">✓ {{ receiptFileName }}</span>
                    <button
                      type="button"
                      (click)="removeSelectedFile()"
                      class="px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-[10px] font-bold"
                    >
                      ✕ Remove
                    </button>
                  </div>
                </div>

                <!-- File Input Trigger if no file chosen -->
                <div *ngIf="!receiptPreview()" class="space-y-1">
                  <span class="text-2xl block">📸</span>
                  <div class="text-xs font-bold text-white">
                    Click to select payment receipt or screenshot
                  </div>
                  <p class="text-[11px] text-slate-400">
                    PNG, JPG, JPEG or PDF (Max 10MB)
                  </p>
                  <input
                    type="file"
                    (change)="onFileSelected($event)"
                    accept="image/*,application/pdf"
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <!-- Optional Sender Note -->
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-200">Sender Notes (Optional)</label>
              <input
                type="text"
                [(ngModel)]="depositNotes"
                name="depositNotes"
                placeholder="e.g. Sent from Binance or TrustWallet"
                class="w-full px-4 py-2 rounded-xl bg-[#002625] border border-white/15 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#0BB4D2]"
              />
            </div>

            <!-- Submit Confirmation Button -->
            <button
              type="submit"
              [disabled]="submittingDeposit() || !depositAmount || depositAmount <= 0"
              class="w-full py-3.5 rounded-2xl btn-cyan-gradient font-black text-xs shadow-md shadow-[#0BB4D2]/25 hover:brightness-110 active:scale-95 transition disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <span>{{ submittingDeposit() ? '⏳' : '🚀' }}</span>
              <span>{{ submittingDeposit() ? 'Submitting Payment Proof...' : 'I Have Paid & Submit Proof for Confirmation' }}</span>
            </button>
          </form>
        </div>

        <!-- 2. Cash Out / Withdraw -->
        <div class="glass-panel rounded-3xl p-6 border border-white/10 space-y-5 shadow-xl">
          <div class="border-b border-white/10 pb-3">
            <h2 class="text-base font-black text-white flex items-center space-x-2">
              <span>📤 Cash Out (Withdraw)</span>
            </h2>
            <p class="text-xs text-slate-400">Protected by 2-step security PIN sent to your email</p>
          </div>

          <div class="space-y-3.5 text-xs">
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="text-slate-200 font-bold">Select Coin / Currency</label>
                <select
                  [(ngModel)]="withdrawAsset"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-[#002625] border border-white/15 text-white font-mono font-bold"
                >
                  <option *ngFor="let asset of supportedAssets" [value]="asset">{{ asset }}</option>
                </select>
              </div>

              <div class="space-y-1">
                <label class="text-slate-200 font-bold">Amount to Cash Out</label>
                <input
                  type="number"
                  [(ngModel)]="withdrawAmount"
                  step="any"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-[#002625] border border-white/15 text-white font-mono font-bold"
                />
              </div>
            </div>

            <div class="space-y-1">
              <label class="text-slate-200 font-bold">Where Should We Send the Money? (Crypto Address or Bank)</label>
              <input
                type="text"
                [(ngModel)]="withdrawAddress"
                placeholder="0x... or Bank Account Details"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#002625] border border-white/15 text-white font-mono text-xs"
              />
            </div>

            <div class="p-3.5 bg-[#002625] rounded-2xl border border-white/10 text-[11px] text-slate-300 space-y-1">
              <div class="font-bold text-white flex items-center space-x-1.5">
                <span>🛡️ Security Check:</span>
              </div>
              <p>For your safety, we will generate a 6-digit confirmation PIN. Enter the PIN on the next screen to finish cashing out.</p>
            </div>

            <button
              (click)="initiateWithdrawal()"
              class="w-full py-3.5 rounded-2xl btn-cyan-gradient font-black text-xs shadow-md shadow-[#0BB4D2]/25 transition-all"
            >
              Continue &rarr; Request Security PIN
            </button>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- AUDITED ACTIVITY & HISTORY                                                -->
      <!-- ========================================================================= -->
      <div class="glass-panel rounded-3xl border border-white/10 p-6 space-y-5 shadow-xl">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 class="text-lg font-black text-white">Account Activity &amp; History</h3>
            <p class="text-xs text-slate-400">All deposits, withdrawals, trades, and robot earnings recorded on your statement</p>
          </div>
          <button
            (click)="walletService.downloadPDF()"
            class="text-xs text-[#0BB4D2] font-bold hover:underline"
          >
            Download PDF Report →
          </button>
        </div>

        <div class="overflow-x-auto no-scrollbar">
          <table class="w-full text-left text-xs font-mono">
            <thead>
              <tr class="border-b border-white/10 text-slate-400 font-bold font-sans uppercase tracking-wider">
                <th class="py-3 px-4">Date &amp; Time</th>
                <th class="py-3 px-4">Action Type</th>
                <th class="py-3 px-4">Coin</th>
                <th class="py-3 px-4">Amount</th>
                <th class="py-3 px-4">USD Value</th>
                <th class="py-3 px-4">Payment Proof</th>
                <th class="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr *ngFor="let tx of transactions()" class="hover:bg-white/5 transition-colors">
                <td class="py-3.5 px-4 text-slate-400">{{ tx.created_at | date:'mediumDate' }}</td>
                <td class="py-3.5 px-4 font-bold uppercase font-sans" [ngClass]="{
                  'text-emerald-400': tx.type === 'deposit' || tx.type === 'bot_profit',
                  'text-rose-400': tx.type === 'withdrawal',
                  'text-cyan-400': tx.type === 'trade' || tx.type === 'swap',
                  'text-indigo-400': tx.type === 'bot_allocation'
                }">
                  {{ tx.type === 'bot_profit' ? 'Robot Profit' : (tx.type === 'bot_allocation' ? 'Robot Funding' : tx.type) }}
                </td>
                <td class="py-3.5 px-4 font-bold text-white">{{ tx.asset_symbol }}</td>
                <td class="py-3.5 px-4">{{ tx.amount | number:'1.2-6' }}</td>
                <td class="py-3.5 px-4 text-slate-200 font-bold">\${{ tx.amount_usd | number:'1.2-2' }}</td>
                
                <!-- Proof / Receipt Link -->
                <td class="py-3.5 px-4 text-slate-400 font-sans">
                  <button
                    *ngIf="tx.receipt_url"
                    (click)="viewReceipt(tx.receipt_url)"
                    class="text-[10px] px-2 py-0.5 rounded-lg bg-[#0BB4D2]/20 hover:bg-[#0BB4D2]/30 text-cyan-300 font-bold inline-flex items-center space-x-1 transition"
                  >
                    <span>📎 View Receipt</span>
                  </button>
                  <span *ngIf="!tx.receipt_url" class="text-[10px] text-slate-500 font-mono">
                    {{ (tx.tx_hash || 'TX-REF').slice(0, 10) }}...
                  </span>
                </td>

                <!-- Status Badge -->
                <td class="py-3.5 px-4 text-right">
                  <span
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-sans inline-block"
                    [ngClass]="{
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30': tx.status === 'completed',
                      'bg-amber-500/20 text-amber-300 border border-amber-500/30': tx.status === 'pending',
                      'bg-rose-500/20 text-rose-300 border border-rose-500/30': tx.status === 'failed' || tx.status === 'cancelled'
                    }"
                  >
                    {{ tx.status === 'completed' ? '✓ Credited' : (tx.status === 'pending' ? '⏳ Pending Review' : '✕ Declined') }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- 6-DIGIT SECURITY PIN WITHDRAWAL CONFIRMATION MODAL                        -->
      <!-- ========================================================================= -->
      <div *ngIf="pinModalOpen()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
        <div class="glass-panel w-full max-w-md rounded-3xl p-6 border border-[#0BB4D2]/40 shadow-2xl space-y-5">
          <div class="text-center space-y-1.5">
            <span class="text-3xl">📧</span>
            <h3 class="text-lg font-black text-white">Enter 6-Digit Security PIN</h3>
            <p class="text-xs text-slate-300">
              A 6-digit confirmation code was sent to your email to verify your withdrawal request.
            </p>
            <div *ngIf="demoPinHint()" class="p-2.5 bg-[#002625] border border-[#0BB4D2]/40 rounded-xl text-cyan-300 font-mono text-xs">
              Demo Test Code: <strong>{{ demoPinHint() }}</strong>
            </div>
          </div>

          <div class="space-y-1">
            <input
              type="text"
              maxlength="6"
              [(ngModel)]="enteredPin"
              placeholder="000000"
              class="w-full py-3.5 rounded-2xl bg-[#002625] border border-white/20 text-center text-3xl font-mono font-bold tracking-widest text-[#0BB4D2] focus:outline-none focus:border-[#0BB4D2]"
            />
          </div>

          <div class="flex justify-end space-x-2 pt-2 border-t border-white/10">
            <button
              (click)="pinModalOpen.set(false)"
              class="px-4 py-2.5 rounded-xl bg-white/5 text-slate-300 font-bold text-xs hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              (click)="confirmWithdrawal()"
              class="px-5 py-2.5 rounded-xl btn-cyan-gradient font-black text-xs shadow-md"
            >
              Confirm &amp; Complete
            </button>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- PAYMENT RECEIPT PROOF PREVIEW MODAL                                       -->
      <!-- ========================================================================= -->
      <div *ngIf="previewReceiptUrl()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
        <div class="bg-[#002625] border border-[#0BB4D2]/40 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 class="text-base font-black text-white flex items-center space-x-2">
              <span>🧾 Payment Receipt Proof</span>
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
              Open in new tab ↗
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
export class WalletComponent implements OnInit {
  walletService = inject(WalletService);
  toast = inject(ToastService);
  route = inject(ActivatedRoute);

  supportedAssets = ['USDT', 'BTC', 'ETH', 'SOL', 'BNB', 'TRX', 'DOGE', 'LTC', 'MATIC', 'XRP'];
  selectedDepositAsset = 'USDT';
  depositAddress = signal<string>('');
  depositNetwork = signal<string>('Mainnet Layer 1');
  depositMemoTag = signal<string | null>(null);
  depositInstructions = signal<string | null>(null);
  depositMinAmount = signal<number>(10);
  depositCopied = signal<boolean>(false);
  qrDataUrl = signal<string>('');

  // Step 2: Payment Confirmation & Receipt state
  depositAmount = 500;
  depositTxHash = '';
  depositNotes = '';
  receiptFile: File | null = null;
  receiptFileName = '';
  receiptPreview = signal<string | null>(null);
  submittingDeposit = signal<boolean>(false);
  depositSubmittedNotice = signal<{ asset: string; amount: number; txId: number } | null>(null);

  // Withdrawal state
  withdrawAsset = 'USDT';
  withdrawAmount = 250;
  withdrawAddress = '0x71C8fb861337577648bf4A36b69D0388A152fC3b';

  // 2-step PIN modal
  pinModalOpen = signal<boolean>(false);
  pendingTxId = signal<number | null>(null);
  enteredPin = '';
  demoPinHint = signal<string | null>(null);

  transactions = signal<Transaction[]>([]);
  previewReceiptUrl = signal<string | null>(null);

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const amt = params.get('amount');
      if (amt && !isNaN(Number(amt))) {
        this.depositAmount = Number(amt);
      }
    });

    // Load active deposit methods from platform deposit wallets if available
    this.walletService.getDepositMethods().subscribe({
      next: (res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const symbols = res.data.map((m: any) => m.asset_symbol);
          this.supportedAssets = symbols;
          if (!this.supportedAssets.includes(this.selectedDepositAsset)) {
            this.selectedDepositAsset = this.supportedAssets[0];
          }
          this.onDepositAssetChange();
        } else {
          this.onDepositAssetChange();
        }
      },
      error: () => this.onDepositAssetChange()
    });

    this.loadTransactions();
  }

  onDepositAssetChange() {
    this.walletService.getDepositAddress(this.selectedDepositAsset).subscribe(async res => {
      if (res.success) {
        this.depositAddress.set(res.data.deposit_address);
        this.depositNetwork.set(res.data.network);
        this.depositMemoTag.set(res.data.memo_tag || null);
        this.depositInstructions.set(res.data.instructions || null);
        this.depositMinAmount.set(res.data.minimum_deposit || 10);
        try {
          const url = await QRCode.toDataURL(res.data.deposit_address, {
            width: 200,
            margin: 1,
            color: { dark: '#090d16', light: '#ffffff' }
          });
          this.qrDataUrl.set(url);
        } catch (e) {
          console.error('Error generating QR:', e);
        }
      }
    });
  }

  copyDepositAddress() {
    const addr = this.depositAddress();
    if (!addr) return;
    navigator.clipboard.writeText(addr);
    this.depositCopied.set(true);
    this.toast.success('Official deposit address copied to clipboard');
    setTimeout(() => this.depositCopied.set(false), 2000);
  }

  copyMemoTag() {
    const tag = this.depositMemoTag();
    if (!tag) return;
    navigator.clipboard.writeText(tag);
    this.toast.success('Memo / Tag copied to clipboard');
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      this.toast.error('File size exceeds 10MB limit');
      return;
    }

    this.receiptFile = file;
    this.receiptFileName = file.name;

    const reader = new FileReader();
    reader.onload = () => {
      this.receiptPreview.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  removeSelectedFile() {
    this.receiptFile = null;
    this.receiptFileName = '';
    this.receiptPreview.set(null);
  }

  submitDepositConfirmation() {
    const amount = Number(this.depositAmount);
    if (!amount || isNaN(amount) || amount <= 0) {
      this.toast.error('Please enter a valid deposit amount');
      return;
    }

    const min = this.depositMinAmount();
    if (min && amount < min) {
      this.toast.error(`Minimum deposit for ${this.selectedDepositAsset} is ${min}`);
      return;
    }

    this.submittingDeposit.set(true);

    const formData = new FormData();
    formData.append('asset', this.selectedDepositAsset);
    formData.append('amount', String(amount));
    formData.append('network', this.depositNetwork());
    formData.append('destination_address', this.depositAddress());
    if (this.depositTxHash) formData.append('tx_hash', this.depositTxHash);
    if (this.depositNotes) formData.append('notes', this.depositNotes);
    if (this.receiptFile) {
      formData.append('receipt', this.receiptFile);
    } else if (this.receiptPreview()) {
      formData.append('receipt_base64', this.receiptPreview()!);
    }

    this.walletService.submitDepositRequest(formData).subscribe({
      next: (res) => {
        this.submittingDeposit.set(false);
        this.toast.success(res.message);
        this.depositSubmittedNotice.set({
          asset: this.selectedDepositAsset,
          amount: amount,
          txId: res.data?.transaction_id || 0
        });
        this.removeSelectedFile();
        this.depositTxHash = '';
        this.depositNotes = '';
        this.loadTransactions();
      },
      error: (err) => {
        this.submittingDeposit.set(false);
        this.toast.error(err.error?.error || 'Deposit confirmation failed to submit');
      }
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

  initiateWithdrawal() {
    this.walletService.initiateWithdrawal({
      asset: this.withdrawAsset,
      amount: this.withdrawAmount,
      destination_address: this.withdrawAddress
    }).subscribe({
      next: (res) => {
        this.pendingTxId.set(res.data.transaction_id);
        this.demoPinHint.set(res.data.demo_security_pin);
        this.enteredPin = '';
        this.pinModalOpen.set(true);
        this.toast.info('6-Digit Security PIN generated and sent to email');
      },
      error: (err) => this.toast.error(err.error?.error || 'Could not initiate withdrawal')
    });
  }

  confirmWithdrawal() {
    const txId = this.pendingTxId();
    if (!txId || !this.enteredPin) return;

    this.walletService.confirmWithdrawal(txId, this.enteredPin).subscribe({
      next: (res) => {
        this.pinModalOpen.set(false);
        this.toast.success(res.message);
        this.loadTransactions();
      },
      error: (err) => this.toast.error(err.error?.error || 'Invalid 6-digit security PIN')
    });
  }

  loadTransactions() {
    this.walletService.getTransactions().subscribe(res => {
      if (res.success) this.transactions.set(res.data);
    });
  }
}
