import { Component, inject, signal, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SupportService } from '../../../services/support.service';
import { AuthService } from '../../../services/auth.service';

interface ChatMessage {
  sender: 'USER' | 'AI';
  text: string;
  timestamp: Date;
  dispute?: {
    ticket_id: number;
    ticket_number: string;
    subject: string;
    priority: string;
  };
}

@Component({
  selector: 'app-ai-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <!-- Floating Bottom-Right Launcher Pill -->
    <div class="fixed bottom-20 lg:bottom-6 right-5 z-40 select-none">
      <button
        *ngIf="!isOpen()"
        (click)="openChat()"
        class="group flex items-center space-x-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#003432] via-[#002625] to-[#071318] border border-[#0BB4D2]/40 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all shadow-[#0BB4D2]/20"
        title="Open AI Chatbot & Dispute Escalator"
      >
        <div class="relative">
          <div class="w-8 h-8 rounded-full bg-[#0BB4D2] text-[#002625] flex items-center justify-center font-black text-sm shadow-md">
            🤖
          </div>
          <span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
        </div>
        <div class="text-left hidden sm:block">
          <div class="text-xs font-black tracking-tight text-white flex items-center space-x-1">
            <span>AI Assistant</span>
            <span class="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold uppercase">24/7</span>
          </div>
          <div class="text-[10px] text-cyan-300 font-medium">Ask or Raise Dispute</div>
        </div>
      </button>
    </div>

    <!-- AI Chatbot Modal Dialog -->
    <div
      *ngIf="isOpen()"
      class="fixed bottom-20 lg:bottom-6 right-3 sm:right-6 w-[94vw] sm:w-[420px] h-[580px] max-h-[85vh] z-50 rounded-3xl bg-[#002625] border-2 border-[#0BB4D2]/40 shadow-2xl flex flex-col overflow-hidden animate-slide-up text-white"
    >
      <!-- Chat Header -->
      <div class="p-4 bg-gradient-to-r from-[#003432] via-[#002625] to-[#011a19] border-b border-white/10 flex items-center justify-between shrink-0 shadow-md">
        <div class="flex items-center space-x-3">
          <div class="relative">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#003432] to-[#0BB4D2] text-[#002625] flex items-center justify-center font-black text-xl shadow-md border border-[#0BB4D2]/30">
              🤖
            </div>
            <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#002625]"></span>
          </div>
          <div>
            <div class="flex items-center space-x-1.5">
              <h3 class="text-xs font-black text-white uppercase tracking-wider">AI Support Desk</h3>
              <span class="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p class="text-[11px] text-slate-300">Live Assistance &bull; 24/7</p>
          </div>
        </div>

        <div class="flex items-center space-x-1">
          <button
            (click)="closeChat()"
            class="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition text-lg leading-none"
            title="Close Assistant"
          >
            &times;
          </button>
        </div>
      </div>

      <!-- Quick Action Prompt Chips -->
      <div class="p-2.5 bg-[#001c1c] border-b border-white/5 flex items-center space-x-2 overflow-x-auto no-scrollbar shrink-0 text-xs">
        <button
          type="button"
          (click)="sendQuickPrompt('Explain my live earnings and managed trades')"
          class="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 whitespace-nowrap text-[11px] font-medium transition"
        >
          ⚡ Live Earnings
        </button>
        <button
          type="button"
          (click)="sendQuickPrompt('How do I cash out my profits?')"
          class="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 whitespace-nowrap text-[11px] font-medium transition"
        >
          📤 Cash Out
        </button>
        <button
          type="button"
          (click)="sendQuickPrompt('I want to raise a dispute regarding an unexpected dip on my tech stock allocation.')"
          class="px-2.5 py-1 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 whitespace-nowrap text-[11px] font-bold transition flex items-center space-x-1"
        >
          <span>🚨</span>
          <span>Raise Dispute</span>
        </button>
      </div>

      <!-- Chat Messages Conversation Flow -->
      <div #scrollContainer class="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs font-sans leading-relaxed">
        <div *ngFor="let m of messages()" class="flex flex-col space-y-1">
          <!-- Sender Label -->
          <span
            class="text-[10px] font-bold font-mono tracking-wider"
            [ngClass]="m.sender === 'USER' ? 'text-cyan-300 text-right mr-1' : 'text-slate-400 ml-1'"
          >
            {{ m.sender === 'USER' ? 'You' : 'Fichain Pro AI Intelligence' }} &bull; {{ m.timestamp | date:'shortTime' }}
          </span>

          <!-- Message Bubble -->
          <div
            class="p-3.5 rounded-2xl max-w-[88%] shadow-md whitespace-pre-line"
            [ngClass]="m.sender === 'USER' 
              ? 'bg-gradient-to-r from-[#0284c7] to-[#0BB4D2] text-[#002625] font-semibold self-end rounded-tr-none' 
              : 'bg-[#003432] text-slate-100 border border-white/10 self-start rounded-tl-none'"
          >
            {{ m.text }}
          </div>

          <!-- Special Dispute Escalation Card -->
          <div
            *ngIf="m.dispute"
            class="p-4 rounded-2xl bg-gradient-to-r from-rose-950/80 to-amber-950/80 border-2 border-rose-500/50 shadow-xl space-y-2 mt-1 self-start max-w-[95%]"
          >
            <div class="flex items-center space-x-2">
              <span class="text-base">🚨</span>
              <div>
                <span class="text-[10px] font-black uppercase tracking-wider text-rose-300 block">
                  Official Trade Dispute Logged
                </span>
                <span class="font-mono font-black text-white text-sm">
                  Case {{ m.dispute.ticket_number }}
                </span>
              </div>
            </div>

            <p class="text-[11px] text-slate-200">
              Your dispute has been recorded and an urgent email alert was dispatched to the senior trading desk.
            </p>

            <div class="pt-1 flex items-center space-x-2">
              <button
                type="button"
                (click)="goToDisputes()"
                class="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-xs shadow-md transition"
              >
                Track in Support Portal &rarr;
              </button>
            </div>
          </div>
        </div>

        <!-- Typing Indicator -->
        <div *ngIf="loading()" class="flex items-center space-x-2 p-3 rounded-2xl bg-[#003432] border border-white/10 text-slate-400 text-xs w-36">
          <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>AI is thinking...</span>
        </div>
      </div>

      <!-- Chat Input Field & Send Action -->
      <form (ngSubmit)="sendMessage()" class="p-3 bg-[#001c1c] border-t border-white/10 flex items-center space-x-2 shrink-0">
        <input
          type="text"
          [(ngModel)]="userInput"
          name="userInput"
          [disabled]="loading()"
          placeholder="Ask a question or say 'Raise dispute'..."
          class="flex-1 px-3.5 py-2.5 rounded-xl bg-[#002625] border border-white/15 text-white text-xs placeholder-slate-400 focus:outline-none focus:border-[#0BB4D2] transition"
        />

        <button
          type="submit"
          [disabled]="loading() || !userInput.trim()"
          class="p-2.5 rounded-xl btn-cyan-gradient text-[#002625] font-black transition disabled:opacity-40 shadow-md shadow-[#0BB4D2]/20 active:scale-95"
          title="Send message"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
          </svg>
        </button>
      </form>
    </div>
  `
})
export class AiChatbotComponent implements AfterViewChecked {
  supportService = inject(SupportService);
  authService = inject(AuthService);
  router = inject(Router);

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef;

  isOpen = signal<boolean>(false);
  loading = signal<boolean>(false);
  userInput = '';

  messages = signal<ChatMessage[]>([
    {
      sender: 'AI',
      text: `Hello! How can I assist you with your account, earnings, or trading inquiries today?`,
      timestamp: new Date()
    }
  ]);

  openChat(): void {
    this.isOpen.set(true);
  }

  closeChat(): void {
    this.isOpen.set(false);
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) {}
  }

  sendQuickPrompt(text: string): void {
    this.userInput = text;
    this.sendMessage();
  }

  sendMessage(): void {
    const text = this.userInput.trim();
    if (!text || this.loading()) return;

    this.userInput = '';
    this.messages.update(list => [...list, { sender: 'USER', text, timestamp: new Date() }]);
    this.loading.set(true);

    this.supportService.sendAiChatMessage(text).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.data) {
          const aiMsg: ChatMessage = {
            sender: 'AI',
            text: res.data.reply,
            timestamp: new Date(res.data.timestamp),
            dispute: res.data.dispute_created || undefined
          };
          this.messages.update(list => [...list, aiMsg]);
        }
      },
      error: () => {
        this.loading.set(false);
        this.messages.update(list => [
          ...list,
          {
            sender: 'AI',
            text: 'I am experiencing a slight network delay with the institutional stream. Please try again or open a support ticket directly.',
            timestamp: new Date()
          }
        ]);
      }
    });
  }

  goToDisputes(): void {
    this.closeChat();
    this.router.navigate(['/portal/support']);
  }
}
