import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SupportService, SupportTicket, SupportMessage } from '../../../services/support.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-admin-support-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6 font-nunito text-slate-100 selection:bg-purple-500 selection:text-white">
      
      <!-- ========================================================================= -->
      <!-- TOP BANNER                                                                -->
      <!-- ========================================================================= -->
      <div class="p-6 rounded-3xl bg-gradient-to-r from-[#002625] via-[#1e1435] to-[#071318] border border-purple-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="space-y-1">
          <div class="flex items-center space-x-2">
            <span class="inline-block w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <span class="text-xs font-black uppercase tracking-wider text-purple-300">Investor Communications Hub</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Client Support &amp; Trade Dispute Manager
          </h1>
          <p class="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Review disputes, reply with automated email notifications, and manage ticket statuses.
          </p>
        </div>

        <!-- Quick Counters -->
        <div class="flex items-center space-x-3 shrink-0">
          <div class="px-4 py-2.5 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-center min-w-[110px]">
            <span class="text-[10px] uppercase font-black text-rose-300 tracking-wider block">🚨 Disputes</span>
            <span class="text-lg font-black text-white font-mono">{{ getDisputeCount() }}</span>
          </div>
          <div class="px-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-center min-w-[100px]">
            <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Cases</span>
            <span class="text-lg font-black text-cyan-300 font-mono">{{ tickets().length }}</span>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- MAIN SPLIT WORKSPACE: TICKETS LIST (Left) & THREAD VIEWER (Right)         -->
      <!-- ========================================================================= -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- LEFT COLUMN: TICKETS DIRECTORY (5 Cols) -->
        <div class="lg:col-span-5 space-y-4">
          <!-- Filters -->
          <div class="p-3 bg-[#002625] rounded-2xl border border-white/10 flex items-center justify-between gap-2 text-xs">
            <div class="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                (click)="setFilter('all')"
                class="px-2.5 py-1 rounded-lg border font-bold transition"
                [ngClass]="activeFilter === 'all' ? 'bg-[#0BB4D2] text-[#002625] border-[#0BB4D2]' : 'bg-white/5 text-slate-300 border-white/10'"
              >
                All
              </button>
              <button
                type="button"
                (click)="setFilter('disputes')"
                class="px-2.5 py-1 rounded-lg border font-bold transition flex items-center space-x-1"
                [ngClass]="activeFilter === 'disputes' ? 'bg-rose-500 text-white border-rose-500' : 'bg-white/5 text-rose-300 border-white/10'"
              >
                <span>🚨 Disputes</span>
              </button>
              <button
                type="button"
                (click)="setFilter('open')"
                class="px-2.5 py-1 rounded-lg border font-bold transition"
                [ngClass]="activeFilter === 'open' ? 'bg-cyan-500 text-[#002625] border-cyan-500' : 'bg-white/5 text-slate-300 border-white/10'"
              >
                Open
              </button>
            </div>

            <button
              type="button"
              (click)="loadAllTickets()"
              class="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition"
              title="Refresh Tickets"
            >
              🔄
            </button>
          </div>

          <!-- Empty State -->
          <div *ngIf="filteredTickets().length === 0" class="p-8 text-center glass-panel rounded-3xl border border-white/10 text-slate-400 text-xs">
            No tickets matching this filter.
          </div>

          <!-- Tickets Scrollable Cards -->
          <div class="space-y-3 max-h-[640px] overflow-y-auto no-scrollbar pr-1">
            <div
              *ngFor="let t of filteredTickets()"
              (click)="selectTicket(t.id)"
              class="p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 shadow-md relative overflow-hidden"
              [ngClass]="selectedTicketId() === t.id 
                ? 'bg-[#003432] border-[#0BB4D2] ring-1 ring-[#0BB4D2]' 
                : 'bg-[#002625]/80 border-white/10 hover:border-white/20'"
            >
              <!-- Card Header -->
              <div class="flex items-start justify-between gap-2">
                <div>
                  <div class="flex items-center space-x-2">
                    <span class="font-mono font-bold text-xs text-[#0BB4D2]">{{ t.ticket_number }}</span>
                    <span
                      class="px-2 py-0.2 rounded text-[9px] font-black uppercase"
                      [ngClass]="t.is_dispute === 1 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-cyan-500/20 text-cyan-300'"
                    >
                      {{ t.is_dispute === 1 ? '🚨 DISPUTE' : t.category }}
                    </span>
                  </div>
                  <h4 class="text-xs font-bold text-white mt-1">{{ t.subject }}</h4>
                </div>

                <span
                  class="px-2 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider shrink-0"
                  [ngClass]="{
                    'bg-emerald-500/20 text-emerald-300': t.status === 'RESOLVED',
                    'bg-amber-500/20 text-amber-300': t.status === 'IN_REVIEW',
                    'bg-cyan-500/20 text-cyan-300': t.status === 'OPEN',
                    'bg-slate-700 text-slate-300': t.status === 'CLOSED'
                  }"
                >
                  {{ t.status }}
                </span>
              </div>

              <!-- Client Info Capsule -->
              <div class="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Investor: <strong class="text-white">{{ t.user_name }}</strong></span>
                <span class="font-mono">{{ t.created_at | date:'shortDate' }}</span>
              </div>

              <!-- Message Snippet -->
              <p class="text-[11px] text-slate-300 line-clamp-1 italic">
                "{{ t.last_message || 'Ticket initiated' }}"
              </p>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: INTERACTIVE TICKET THREAD & SUPERVISOR ACTION PANEL (7 Cols) -->
        <div class="lg:col-span-7 space-y-4">
          <div *ngIf="selectedTicket() as cur" class="space-y-4">
            
            <!-- Thread Header -->
            <div class="p-5 rounded-3xl bg-[#002625] border border-white/10 shadow-xl space-y-3">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div>
                  <div class="flex items-center space-x-2">
                    <span class="font-mono font-bold text-sm text-[#0BB4D2]">{{ cur.ticket_number }}</span>
                    <span
                      class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase"
                      [ngClass]="cur.is_dispute === 1 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse' : 'bg-cyan-500/20 text-cyan-300'"
                    >
                      {{ cur.is_dispute === 1 ? 'URGENT CLIENT DISPUTE' : cur.category }}
                    </span>
                  </div>
                  <h2 class="text-base font-black text-white mt-1">{{ cur.subject }}</h2>
                  <div class="text-xs text-slate-300 mt-0.5">
                    Client: <strong>{{ cur.user_name }}</strong> &bull; {{ cur.user_email }} &bull; Account: <span class="font-mono text-cyan-300">{{ cur.account_id }}</span>
                  </div>
                </div>

                <!-- Status & Priority Controls -->
                <div class="flex items-center space-x-2">
                  <select
                    [ngModel]="cur.status"
                    (ngModelChange)="updateStatus($event)"
                    class="px-3 py-1.5 rounded-xl bg-[#001c1c] border border-white/20 text-xs font-bold text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="OPEN">Status: OPEN</option>
                    <option value="IN_REVIEW">Status: IN REVIEW</option>
                    <option value="RESOLVED">Status: RESOLVED</option>
                    <option value="CLOSED">Status: CLOSED</option>
                  </select>
                </div>
              </div>

              <!-- AI Escalation Notice if applicable -->
              <div *ngIf="cur.ai_summary" class="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs space-y-1">
                <span class="text-[10px] font-black uppercase tracking-wider text-cyan-300 block">🤖 AI Chatbot Escalation Summary:</span>
                <p class="text-slate-200">{{ cur.ai_summary }}</p>
              </div>
            </div>

            <!-- Thread Messages Stream -->
            <div class="glass-panel p-5 rounded-3xl border border-white/10 bg-[#001c1c]/90 space-y-3.5 shadow-xl">
              <div class="space-y-3 max-h-[380px] overflow-y-auto no-scrollbar pr-1">
                <div
                  *ngFor="let m of ticketMessages()"
                  class="p-4 rounded-2xl space-y-1"
                  [ngClass]="{
                    'bg-[#1e1435] border border-purple-500/30 ml-4 sm:ml-8': m.sender_role === 'ADMIN',
                    'bg-[#003432] border border-cyan-500/30 mr-4 sm:mr-8': m.sender_role === 'USER',
                    'bg-gradient-to-r from-rose-950/60 to-black/60 border border-rose-500/30': m.sender_role === 'AI_ASSISTANT'
                  }"
                >
                  <div class="flex items-center justify-between text-xs pb-1 border-b border-white/10">
                    <span class="font-bold text-xs" [ngClass]="m.sender_role === 'ADMIN' ? 'text-purple-300' : 'text-cyan-300'">
                      {{ m.sender_name }} ({{ m.sender_role }})
                    </span>
                    <span class="text-[10px] text-slate-400 font-mono">{{ m.created_at | date:'short' }}</span>
                  </div>
                  <p class="text-xs sm:text-sm text-slate-100 leading-relaxed whitespace-pre-line pt-1">
                    {{ m.message }}
                  </p>
                </div>
              </div>

              <!-- Supervisor Reply Box -->
              <form (ngSubmit)="sendAdminReply()" class="pt-3 border-t border-white/10 space-y-3">
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Supervisor Reply &amp; Email Dispatch</span>
                    <span class="text-[10px] text-emerald-400 font-normal">✉️ Automatically sends email to client</span>
                  </label>
                  <textarea
                    rows="3"
                    [(ngModel)]="adminReplyText"
                    name="adminReplyText"
                    required
                    placeholder="Type official supervisor response to client..."
                    class="w-full px-4 py-2.5 rounded-2xl bg-[#002625] border border-white/15 text-white text-xs leading-relaxed focus:outline-none focus:border-purple-400"
                  ></textarea>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-[11px] text-slate-400">
                    Client receives real-time portal notification and email copy.
                  </span>

                  <button
                    type="submit"
                    [disabled]="replyLoading() || !adminReplyText.trim()"
                    class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs shadow-md shadow-purple-600/25 hover:brightness-110 active:scale-95 transition disabled:opacity-40 flex items-center space-x-1.5"
                  >
                    <span>✉️</span>
                    <span>{{ replyLoading() ? 'Dispatching...' : 'Send Supervisor Response & Email' }}</span>
                  </button>
                </div>
              </form>
            </div>

          </div>

          <!-- Empty Right Placeholder -->
          <div *ngIf="!selectedTicketId()" class="p-16 text-center glass-panel rounded-3xl border border-white/10 space-y-3 bg-[#002625]/60">
            <div class="text-4xl">📬</div>
            <h3 class="text-base font-bold text-white">Select a Ticket or Dispute</h3>
            <p class="text-xs text-slate-400 max-w-sm mx-auto">
              Choose a case from the list on the left to read full conversation history, inspect AI escalation notes, and reply with instant email dispatch.
            </p>
          </div>
        </div>

      </div>

    </div>
  `
})
export class AdminSupportManagerComponent implements OnInit {
  supportService = inject(SupportService);
  toast = inject(ToastService);

  tickets = signal<SupportTicket[]>([]);
  ticketMessages = signal<SupportMessage[]>([]);
  selectedTicketId = signal<number | null>(null);

  activeFilter: 'all' | 'disputes' | 'open' = 'all';
  adminReplyText = '';
  replyLoading = signal<boolean>(false);

  selectedTicket(): SupportTicket | null {
    const id = this.selectedTicketId();
    if (!id) return null;
    return this.tickets().find(t => t.id === id) || null;
  }

  getDisputeCount(): number {
    return this.tickets().filter(t => t.is_dispute === 1).length;
  }

  filteredTickets(): SupportTicket[] {
    const list = this.tickets();
    if (this.activeFilter === 'disputes') {
      return list.filter(t => t.is_dispute === 1);
    } else if (this.activeFilter === 'open') {
      return list.filter(t => t.status === 'OPEN' || t.status === 'IN_REVIEW');
    }
    return list;
  }

  ngOnInit(): void {
    this.loadAllTickets();
  }

  setFilter(type: 'all' | 'disputes' | 'open'): void {
    this.activeFilter = type;
  }

  loadAllTickets(): void {
    this.supportService.getAllTicketsAdmin().subscribe({
      next: (res) => {
        if (res.success) {
          this.tickets.set(res.data);
          if (res.data.length > 0 && !this.selectedTicketId()) {
            this.selectTicket(res.data[0].id);
          }
        }
      }
    });
  }

  selectTicket(id: number): void {
    this.selectedTicketId.set(id);
    this.supportService.getTicketDetails(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.ticketMessages.set(res.data.messages);
        }
      }
    });
  }

  updateStatus(newStatus: string): void {
    const id = this.selectedTicketId();
    if (!id) return;

    this.supportService.updateTicketStatusAdmin(id, { status: newStatus }).subscribe({
      next: (res) => {
        this.toast.success(res.message);
        this.loadAllTickets();
      },
      error: () => this.toast.error('Failed to update status')
    });
  }

  sendAdminReply(): void {
    const id = this.selectedTicketId();
    const text = this.adminReplyText.trim();
    if (!id || !text || this.replyLoading()) return;

    this.replyLoading.set(true);
    this.supportService.addMessage(id, text, 'IN_REVIEW').subscribe({
      next: (res) => {
        this.replyLoading.set(false);
        this.adminReplyText = '';
        this.toast.success('Response delivered and email dispatched to investor!');
        this.selectTicket(id);
        this.loadAllTickets();
      },
      error: (err) => {
        this.replyLoading.set(false);
        this.toast.error(err.error?.error || 'Failed to dispatch response');
      }
    });
  }
}
