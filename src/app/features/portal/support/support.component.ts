import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { SupportService, SupportTicket, SupportMessage } from '../../../services/support.service';
import { TradeService } from '../../../services/trade.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6 font-nunito selection:bg-[#0BB4D2] selection:text-white">
      
      <!-- ========================================================================= -->
      <!-- TOP BANNER                                                                -->
      <!-- ========================================================================= -->
      <div class="p-6 rounded-3xl bg-gradient-to-r from-[#003432] via-[#002625] to-[#071318] border border-white/10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="space-y-1">
          <div class="flex items-center space-x-2.5">
            <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Support &amp; Disputes
            </h1>
            <span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center space-x-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>LIVE DESK</span>
            </span>
          </div>
          <p class="text-xs text-cyan-200/80">
            Direct message threads &bull; Automatic email notifications
          </p>
        </div>

        <!-- Quick Action Buttons -->
        <div class="flex items-center space-x-2.5 shrink-0">
          <button
            type="button"
            (click)="activeTab = 'dispute'"
            class="px-4 py-2.5 rounded-2xl bg-rose-600/80 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-900/30 transition flex items-center space-x-1.5 active:scale-95"
          >
            <span>🚨</span>
            <span>Raise a Dispute</span>
          </button>
          <button
            type="button"
            (click)="activeTab = 'create'"
            class="px-4 py-2.5 rounded-2xl btn-cyan-gradient font-black text-xs shadow-lg shadow-[#0BB4D2]/20 transition flex items-center space-x-1.5 active:scale-95"
          >
            <span>✉️</span>
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- TICKET TABS NAVIGATION                                                    -->
      <!-- ========================================================================= -->
      <div class="flex border-b border-white/10 space-x-4 text-xs font-bold overflow-x-auto no-scrollbar">
        <button
          type="button"
          (click)="activeTab = 'list'; selectedTicketId.set(null)"
          class="pb-3 px-2 border-b-2 transition flex items-center space-x-1.5 whitespace-nowrap"
          [ngClass]="activeTab === 'list' ? 'border-[#0BB4D2] text-[#0BB4D2] font-black' : 'border-transparent text-slate-400 hover:text-white'"
        >
          <span>📑</span>
          <span>My Tickets &amp; Disputes ({{ tickets().length }})</span>
        </button>

        <button
          type="button"
          (click)="activeTab = 'dispute'"
          class="pb-3 px-2 border-b-2 transition flex items-center space-x-1.5 whitespace-nowrap"
          [ngClass]="activeTab === 'dispute' ? 'border-rose-400 text-rose-300 font-black' : 'border-transparent text-slate-400 hover:text-white'"
        >
          <span>🚨</span>
          <span>Raise Formal Trade Dispute</span>
        </button>

        <button
          type="button"
          (click)="activeTab = 'create'"
          class="pb-3 px-2 border-b-2 transition flex items-center space-x-1.5 whitespace-nowrap"
          [ngClass]="activeTab === 'create' ? 'border-cyan-400 text-cyan-300 font-black' : 'border-transparent text-slate-400 hover:text-white'"
        >
          <span>✉️</span>
          <span>General Inquiry Ticket</span>
        </button>
      </div>

      <!-- ========================================================================= -->
      <!-- TAB 1: TICKETS LIST OR THREAD VIEW                                        -->
      <!-- ========================================================================= -->
      <div *ngIf="activeTab === 'list'" class="space-y-6">

        <!-- THREAD VIEW: Displayed when a specific ticket is selected -->
        <div *ngIf="selectedTicket() as currentTicket" class="space-y-4">
          <!-- Back Button & Header -->
          <div class="p-5 rounded-3xl bg-[#002625] border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-center space-x-3">
              <button
                type="button"
                (click)="selectedTicketId.set(null)"
                class="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                title="Back to Tickets List"
              >
                &larr; Back
              </button>
              <div>
                <div class="flex items-center space-x-2">
                  <span class="font-mono font-bold text-sm text-[#0BB4D2]">{{ currentTicket.ticket_number }}</span>
                  <span
                    class="px-2 py-0.2 rounded text-[10px] font-black uppercase"
                    [ngClass]="currentTicket.is_dispute === 1 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'"
                  >
                    {{ currentTicket.is_dispute === 1 ? 'TRADE DISPUTE' : currentTicket.category }}
                  </span>
                  <span
                    class="px-2 py-0.2 rounded text-[10px] font-bold uppercase"
                    [ngClass]="{
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30': currentTicket.status === 'RESOLVED',
                      'bg-amber-500/20 text-amber-300 border border-amber-500/30': currentTicket.status === 'IN_REVIEW',
                      'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30': currentTicket.status === 'OPEN',
                      'bg-slate-700 text-slate-300': currentTicket.status === 'CLOSED'
                    }"
                  >
                    {{ currentTicket.status }}
                  </span>
                </div>
                <h2 class="text-base font-black text-white mt-1">{{ currentTicket.subject }}</h2>
              </div>
            </div>

            <div class="text-xs text-slate-400 font-mono text-right">
              <span>Opened: {{ currentTicket.created_at | date:'medium' }}</span>
              <div class="text-emerald-400 font-sans text-[11px] mt-0.5">
                ✉️ Email notifications active for both parties
              </div>
            </div>
          </div>

          <!-- Messages Stream -->
          <div class="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 bg-[#001c1c]/90 space-y-4 shadow-xl">
            <div class="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar pr-1">
              <div
                *ngFor="let msg of ticketMessages()"
                class="p-4 rounded-2xl space-y-1.5 transition-all"
                [ngClass]="{
                  'bg-[#003432] border border-cyan-500/30 ml-4 sm:ml-8': msg.sender_role === 'USER',
                  'bg-[#1e1435] border border-purple-500/30 mr-4 sm:mr-8': msg.sender_role === 'ADMIN',
                  'bg-gradient-to-r from-rose-950/60 to-black/60 border border-rose-500/30': msg.sender_role === 'AI_ASSISTANT'
                }"
              >
                <!-- Message Meta -->
                <div class="flex items-center justify-between text-xs pb-1 border-b border-white/10">
                  <div class="flex items-center space-x-2">
                    <span
                      class="px-2 py-0.2 rounded text-[9px] font-black uppercase"
                      [ngClass]="{
                        'bg-cyan-500/20 text-cyan-300': msg.sender_role === 'USER',
                        'bg-purple-500/20 text-purple-300': msg.sender_role === 'ADMIN',
                        'bg-rose-500/20 text-rose-300': msg.sender_role === 'AI_ASSISTANT'
                      }"
                    >
                      {{ msg.sender_role === 'USER' ? 'Investor' : (msg.sender_role === 'ADMIN' ? 'Senior Broker / Supervisor' : 'AI Assistant') }}
                    </span>
                    <span class="font-bold text-white text-xs">{{ msg.sender_name }}</span>
                  </div>
                  <div class="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                    <span *ngIf="msg.is_email_dispatched" class="text-emerald-400" title="Email dispatched">✓ Email Dispatched</span>
                    <span>{{ msg.created_at | date:'short' }}</span>
                  </div>
                </div>

                <!-- Message Body -->
                <p class="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-medium pt-1">
                  {{ msg.message }}
                </p>
              </div>
            </div>

            <!-- Reply Form Box -->
            <form (ngSubmit)="sendReply()" class="pt-3 border-t border-white/10 space-y-3">
              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Send Reply / Additional Details</span>
                  <span class="text-[10px] text-cyan-300 font-normal">✉️ Copies are sent via email to supervisor</span>
                </label>
                <textarea
                  rows="3"
                  [(ngModel)]="replyText"
                  name="replyText"
                  required
                  placeholder="Type your response here..."
                  class="w-full px-4 py-3 rounded-2xl bg-[#002625] border border-white/15 text-white text-xs leading-relaxed focus:outline-none focus:border-[#0BB4D2]"
                ></textarea>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-[11px] text-slate-400">
                  Supervisor desk reviews active tickets within minutes.
                </span>

                <button
                  type="submit"
                  [disabled]="replyLoading() || !replyText.trim()"
                  class="px-6 py-2.5 rounded-xl btn-cyan-gradient text-[#002625] font-black text-xs shadow-md shadow-[#0BB4D2]/25 hover:brightness-110 active:scale-95 transition disabled:opacity-40 flex items-center space-x-1.5"
                >
                  <span>✉️</span>
                  <span>{{ replyLoading() ? 'Dispatching...' : 'Send Message & Email Copy' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- TICKETS LIST (When no ticket is selected) -->
        <div *ngIf="!selectedTicketId()" class="space-y-4">
          <!-- Filter Buttons -->
          <div class="flex items-center space-x-2 text-xs">
            <button
              type="button"
              (click)="filterType = 'all'"
              class="px-3 py-1.5 rounded-xl border text-xs font-bold transition"
              [ngClass]="filterType === 'all' ? 'bg-[#0BB4D2] text-[#002625] border-[#0BB4D2]' : 'bg-white/5 text-slate-300 border-white/10'"
            >
              All ({{ tickets().length }})
            </button>
            <button
              type="button"
              (click)="filterType = 'disputes'"
              class="px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center space-x-1"
              [ngClass]="filterType === 'disputes' ? 'bg-rose-500 text-white border-rose-500' : 'bg-white/5 text-rose-300 border-white/10'"
            >
              <span>🚨</span>
              <span>Disputes Only</span>
            </button>
            <button
              type="button"
              (click)="filterType = 'open'"
              class="px-3 py-1.5 rounded-xl border text-xs font-bold transition"
              [ngClass]="filterType === 'open' ? 'bg-cyan-500 text-[#002625] border-cyan-500' : 'bg-white/5 text-slate-300 border-white/10'"
            >
              Open / In Review
            </button>
          </div>

          <!-- Empty State -->
          <div *ngIf="filteredTickets().length === 0" class="p-12 text-center glass-panel rounded-3xl border border-white/10 space-y-3 bg-[#002625]/60">
            <div class="text-3xl">💬</div>
            <h3 class="text-base font-bold text-white">No Tickets or Disputes Found</h3>
            <p class="text-xs text-slate-400 max-w-sm mx-auto">
              You currently have no support requests matching this filter. Need assistance or wish to dispute a trade? Use the buttons above.
            </p>
          </div>

          <!-- Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4" *ngIf="filteredTickets().length > 0">
            <div
              *ngFor="let t of filteredTickets()"
              (click)="selectTicket(t.id)"
              class="glass-panel p-5 rounded-3xl border border-white/10 hover:border-[#0BB4D2]/50 bg-[#002625]/80 space-y-3 cursor-pointer shadow-xl transition-all hover:scale-[1.01] active:scale-99"
            >
              <div class="flex items-start justify-between gap-2">
                <div>
                  <div class="flex items-center space-x-2">
                    <span class="font-mono font-bold text-xs text-[#0BB4D2]">{{ t.ticket_number }}</span>
                    <span
                      class="px-2 py-0.2 rounded text-[9px] font-black uppercase"
                      [ngClass]="t.is_dispute === 1 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'"
                    >
                      {{ t.is_dispute === 1 ? 'TRADE DISPUTE' : t.category }}
                    </span>
                  </div>
                  <h3 class="text-sm font-black text-white mt-1">{{ t.subject }}</h3>
                </div>

                <span
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0"
                  [ngClass]="{
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30': t.status === 'RESOLVED',
                    'bg-amber-500/20 text-amber-300 border border-amber-500/30': t.status === 'IN_REVIEW',
                    'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30': t.status === 'OPEN',
                    'bg-slate-700 text-slate-300': t.status === 'CLOSED'
                  }"
                >
                  {{ t.status }}
                </span>
              </div>

              <!-- Message Preview -->
              <p class="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {{ t.last_message || 'Ticket initiated by client.' }}
              </p>

              <!-- Footer Strip -->
              <div class="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <span class="flex items-center space-x-1">
                  <span>💬 {{ t.message_count || 1 }} message(s)</span>
                  <span>&bull;</span>
                  <span class="text-emerald-400">Email Dispatched</span>
                </span>

                <span class="text-cyan-300 font-bold hover:underline flex items-center space-x-1">
                  <span>Open Thread</span>
                  <span>&rarr;</span>
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- ========================================================================= -->
      <!-- TAB 2: RAISE FORMAL TRADE DISPUTE                                         -->
      <!-- ========================================================================= -->
      <div *ngIf="activeTab === 'dispute'" class="glass-panel p-6 sm:p-7 rounded-3xl border border-rose-500/30 bg-[#002625]/80 space-y-6 shadow-xl">
        <div class="border-b border-white/10 pb-4 space-y-1">
          <div class="flex items-center space-x-2">
            <span class="text-xl">🚨</span>
            <h2 class="text-lg font-black text-white">Raise Formal Trade Dispute</h2>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
              URGENT SUPERVISOR REVIEW
            </span>
          </div>
          <p class="text-xs text-slate-300">
            Submit a dispute regarding a trade or balance. Senior desk is notified immediately.
          </p>
        </div>

        <form (ngSubmit)="submitDispute()" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Dispute Subject -->
            <div class="space-y-1.5 md:col-span-2">
              <label class="text-xs font-bold text-slate-300">Dispute Subject</label>
              <input
                type="text"
                [(ngModel)]="disputeSubject"
                name="disputeSubject"
                required
                placeholder="e.g. Discrepancy on BTC/USDT Trade Profit or NVDA Entry Spread"
                class="w-full px-4 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-white text-xs font-bold focus:outline-none focus:border-rose-400"
              />
            </div>

            <!-- Related Trade Dropdown -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-300">Select Related Managed Trade (Optional)</label>
              <select
                [(ngModel)]="disputeRelatedTradeId"
                name="disputeRelatedTradeId"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-white text-xs focus:outline-none focus:border-rose-400"
              >
                <option [ngValue]="null">General Account / No specific trade</option>
                <option *ngFor="let t of tradeService.managedTrades()" [ngValue]="t.id">
                  Trade #{{ t.id }} - {{ t.pair }} (Profit: \${{ t.current_profit }})
                </option>
              </select>
            </div>

            <!-- Urgency Level -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-300">Dispute Priority</label>
              <select
                [(ngModel)]="disputePriority"
                name="disputePriority"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-rose-300 font-bold text-xs focus:outline-none focus:border-rose-400"
              >
                <option value="URGENT">🔴 URGENT - Immediate Supervisor Attention</option>
                <option value="HIGH">🟡 HIGH - Review within 2 Hours</option>
                <option value="MEDIUM">🟢 MEDIUM - Standard Review</option>
              </select>
            </div>
          </div>

          <!-- Dispute Description Message -->
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-300">Detailed Description of Dispute</label>
            <textarea
              rows="4"
              [(ngModel)]="disputeMessage"
              name="disputeMessage"
              required
              placeholder="Please describe why you are disputing this trade outcome or balance figure. Include any expected profit or agreed terms..."
              class="w-full px-4 py-3 rounded-2xl bg-[#001c1c] border border-white/15 text-white text-xs leading-relaxed focus:outline-none focus:border-rose-400"
            ></textarea>
          </div>

          <!-- Submit Action -->
          <div class="flex items-center justify-between pt-2">
            <span class="text-xs text-slate-400">
              An official case number will be generated immediately.
            </span>

            <button
              type="submit"
              [disabled]="formLoading() || !disputeSubject.trim() || !disputeMessage.trim()"
              class="px-8 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-black text-xs shadow-lg shadow-rose-900/30 hover:brightness-110 active:scale-95 transition disabled:opacity-40 flex items-center space-x-2"
            >
              <span>🚨</span>
              <span>{{ formLoading() ? 'Escalating...' : 'Submit Official Dispute to Supervisor' }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- ========================================================================= -->
      <!-- TAB 3: GENERAL SUPPORT INQUIRY FORM                                       -->
      <!-- ========================================================================= -->
      <div *ngIf="activeTab === 'create'" class="glass-panel p-6 sm:p-7 rounded-3xl border border-white/10 bg-[#002625]/80 space-y-6 shadow-xl">
        <div class="border-b border-white/10 pb-4 space-y-1">
          <div class="flex items-center space-x-2">
            <span class="text-xl">✉️</span>
            <h2 class="text-lg font-black text-white">Open General Support Ticket</h2>
          </div>
          <p class="text-xs text-slate-300">
            Have a question about funding, withdrawals, virtual cards, or account statements? Open a support ticket and our team will assist you promptly.
          </p>
        </div>

        <form (ngSubmit)="submitTicket()" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-1.5 md:col-span-2">
              <label class="text-xs font-bold text-slate-300">Inquiry Subject</label>
              <input
                type="text"
                [(ngModel)]="ticketSubject"
                name="ticketSubject"
                required
                placeholder="e.g. Question about 2-Step Email Withdrawal PIN"
                class="w-full px-4 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-white text-xs font-bold focus:outline-none focus:border-[#0BB4D2]"
              />
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-300">Inquiry Category</label>
              <select
                [(ngModel)]="ticketCategory"
                name="ticketCategory"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-white text-xs focus:outline-none focus:border-[#0BB4D2]"
              >
                <option value="GENERAL_SUPPORT">General Support &amp; Questions</option>
                <option value="DEPOSIT_ISSUE">Deposit &amp; Funding Sandbox</option>
                <option value="WITHDRAWAL_STATUS">Withdrawal &amp; Cash Out</option>
                <option value="ACCOUNT_SECURITY">Account Security &amp; 2FA PIN</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-300">Priority</label>
              <select
                [(ngModel)]="ticketPriority"
                name="ticketPriority"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-white text-xs focus:outline-none focus:border-[#0BB4D2]"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-300">Your Message</label>
            <textarea
              rows="4"
              [(ngModel)]="ticketMessage"
              name="ticketMessage"
              required
              placeholder="Provide as much detail as possible..."
              class="w-full px-4 py-3 rounded-2xl bg-[#001c1c] border border-white/15 text-white text-xs leading-relaxed focus:outline-none focus:border-[#0BB4D2]"
            ></textarea>
          </div>

          <div class="flex items-center justify-end pt-2">
            <button
              type="submit"
              [disabled]="formLoading() || !ticketSubject.trim() || !ticketMessage.trim()"
              class="px-8 py-3 rounded-2xl btn-cyan-gradient text-[#002625] font-black text-xs shadow-md shadow-[#0BB4D2]/25 hover:brightness-110 active:scale-95 transition disabled:opacity-40 flex items-center space-x-1.5"
            >
              <span>✉️</span>
              <span>{{ formLoading() ? 'Opening Ticket...' : 'Open Support Ticket & Send Email' }}</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  `
})
export class SupportComponent implements OnInit {
  supportService = inject(SupportService);
  tradeService = inject(TradeService);
  toast = inject(ToastService);
  route = inject(ActivatedRoute);

  tickets = signal<SupportTicket[]>([]);
  ticketMessages = signal<SupportMessage[]>([]);
  selectedTicketId = signal<number | null>(null);

  activeTab: 'list' | 'dispute' | 'create' = 'list';
  filterType: 'all' | 'disputes' | 'open' = 'all';

  // Reply State
  replyText = '';
  replyLoading = signal<boolean>(false);

  // Dispute Form
  disputeSubject = '';
  disputeRelatedTradeId: number | null = null;
  disputePriority: 'URGENT' | 'HIGH' | 'MEDIUM' = 'URGENT';
  disputeMessage = '';

  // General Ticket Form
  ticketSubject = '';
  ticketCategory = 'GENERAL_SUPPORT';
  ticketPriority = 'MEDIUM';
  ticketMessage = '';
  formLoading = signal<boolean>(false);

  selectedTicket(): SupportTicket | null {
    const id = this.selectedTicketId();
    if (!id) return null;
    return this.tickets().find(t => t.id === id) || null;
  }

  filteredTickets(): SupportTicket[] {
    const list = this.tickets();
    if (this.filterType === 'disputes') {
      return list.filter(t => t.is_dispute === 1);
    } else if (this.filterType === 'open') {
      return list.filter(t => t.status === 'OPEN' || t.status === 'IN_REVIEW');
    }
    return list;
  }

  ngOnInit(): void {
    this.loadTickets();

    this.route.queryParamMap.subscribe(params => {
      const ticketId = params.get('ticket_id');
      if (ticketId && !isNaN(Number(ticketId))) {
        this.selectTicket(Number(ticketId));
      }
      if (params.get('tab') === 'dispute') {
        this.activeTab = 'dispute';
      }
    });
  }

  loadTickets(): void {
    this.supportService.getUserTickets().subscribe({
      next: (res) => {
        if (res.success) {
          this.tickets.set(res.data);
        }
      }
    });
  }

  selectTicket(id: number): void {
    this.selectedTicketId.set(id);
    this.activeTab = 'list';
    this.supportService.getTicketDetails(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.ticketMessages.set(res.data.messages);
        }
      }
    });
  }

  sendReply(): void {
    const id = this.selectedTicketId();
    const text = this.replyText.trim();
    if (!id || !text || this.replyLoading()) return;

    this.replyLoading.set(true);
    this.supportService.addMessage(id, text).subscribe({
      next: (res) => {
        this.replyLoading.set(false);
        this.replyText = '';
        this.toast.success('Message sent! Email copy dispatched to supervisor.');
        this.selectTicket(id);
        this.loadTickets();
      },
      error: (err) => {
        this.replyLoading.set(false);
        this.toast.error(err.error?.error || 'Failed to deliver message');
      }
    });
  }

  submitDispute(): void {
    if (!this.disputeSubject.trim() || !this.disputeMessage.trim()) return;

    this.formLoading.set(true);
    this.supportService.createTicket({
      subject: this.disputeSubject,
      category: 'TRADE_DISPUTE',
      priority: this.disputePriority,
      message: this.disputeMessage,
      is_dispute: true,
      related_trade_id: this.disputeRelatedTradeId || undefined
    }).subscribe({
      next: (res) => {
        this.formLoading.set(false);
        this.toast.success(`Dispute ${res.data.ticket_number} created and escalated to supervisor!`);
        this.disputeSubject = '';
        this.disputeMessage = '';
        this.loadTickets();
        this.selectTicket(res.data.ticket_id);
      },
      error: (err) => {
        this.formLoading.set(false);
        this.toast.error(err.error?.error || 'Failed to submit dispute');
      }
    });
  }

  submitTicket(): void {
    if (!this.ticketSubject.trim() || !this.ticketMessage.trim()) return;

    this.formLoading.set(true);
    this.supportService.createTicket({
      subject: this.ticketSubject,
      category: this.ticketCategory,
      priority: this.ticketPriority,
      message: this.ticketMessage,
      is_dispute: false
    }).subscribe({
      next: (res) => {
        this.formLoading.set(false);
        this.toast.success(`Support ticket ${res.data.ticket_number} created! Email confirmation sent.`);
        this.ticketSubject = '';
        this.ticketMessage = '';
        this.loadTickets();
        this.selectTicket(res.data.ticket_id);
      },
      error: (err) => {
        this.formLoading.set(false);
        this.toast.error(err.error?.error || 'Failed to open ticket');
      }
    });
  }
}
