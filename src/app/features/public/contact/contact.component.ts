import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="py-16 lg:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      
      <!-- Page Header -->
      <div class="space-y-4 text-center max-w-3xl mx-auto">
        <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#003432] border border-[#0BB4D2]/30 text-xs font-bold text-[#0BB4D2]">
          <span>✉️ Institutional Communications</span>
        </div>
        <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Connect With Our Desk
        </h1>
        <p class="text-xs sm:text-base text-slate-300 leading-relaxed">
          Whether you are evaluating Fichain Pro for academic defense, student learning, or institutional asset management, our supervisory team is at your service.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Contact Form (7 Cols) -->
        <div class="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 bg-[#002625]/80 shadow-2xl">
          <div class="space-y-1 border-b border-white/10 pb-4">
            <h2 class="text-lg font-black text-white">Send Direct Inquiry</h2>
            <p class="text-xs text-slate-300">Inquiries are routed directly to the appropriate regional supervisory desk.</p>
          </div>

          <!-- Success Alert -->
          <div *ngIf="submitted()" class="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs space-y-1 animate-slide-up">
            <div class="font-black text-sm flex items-center space-x-2">
              <span>✓</span>
              <span>Inquiry Received &bull; Case {{ ticketRef() }}</span>
            </div>
            <p class="text-slate-200">
              Thank you for reaching out. A confirmation copy has been dispatched and an institutional broker will review your inquiry shortly.
            </p>
          </div>

          <!-- The Form -->
          <form *ngIf="!submitted()" (ngSubmit)="handleSubmit()" class="space-y-4 text-xs font-sans">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="font-bold text-slate-300">Your Full Name</label>
                <input
                  type="text"
                  [(ngModel)]="formData.name"
                  name="name"
                  required
                  placeholder="e.g. Dr. Eleanor Vance"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-[#0BB4D2]"
                />
              </div>

              <div class="space-y-1.5">
                <label class="font-bold text-slate-300">Corporate or Personal Email</label>
                <input
                  type="email"
                  [(ngModel)]="formData.email"
                  name="email"
                  required
                  placeholder="e.g. vance@institution.edu"
                  class="w-full px-3.5 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-[#0BB4D2]"
                />
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="font-bold text-slate-300">Target Department</label>
              <select
                [(ngModel)]="formData.department"
                name="department"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-white focus:outline-none focus:border-[#0BB4D2]"
              >
                <option value="Senior Managed Trading Desk">Senior Managed Trading Desk (Capital Deployment)</option>
                <option value="Institutional Compliance & Legal">Institutional Compliance &amp; Legal Desk (AML/KYC)</option>
                <option value="Academic Evaluation & Research">Academic Evaluation &amp; Capstone Research</option>
                <option value="Technical Support & Dispute Escalation">Technical Support &amp; Dispute Escalation</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="font-bold text-slate-300">Subject</label>
              <input
                type="text"
                [(ngModel)]="formData.subject"
                name="subject"
                required
                placeholder="e.g. Inquiry regarding multi-asset basket allocations"
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-[#0BB4D2]"
              />
            </div>

            <div class="space-y-1.5">
              <label class="font-bold text-slate-300">Message / Inquiry Details</label>
              <textarea
                rows="4"
                [(ngModel)]="formData.message"
                name="message"
                required
                placeholder="Type your message here..."
                class="w-full px-3.5 py-2.5 rounded-xl bg-[#001c1c] border border-white/15 text-white placeholder-slate-500 leading-relaxed focus:outline-none focus:border-[#0BB4D2]"
              ></textarea>
            </div>

            <button
              type="submit"
              [disabled]="loading() || !formData.name || !formData.email || !formData.message"
              class="w-full py-3 rounded-2xl btn-cyan-gradient text-[#002625] font-black text-xs shadow-lg shadow-[#0BB4D2]/25 active:scale-98 transition disabled:opacity-50"
            >
              {{ loading() ? 'Transmitting to Desk...' : 'Transmit Inquiry to Desk' }}
            </button>
          </form>
        </div>

        <!-- Desk Details & Global Locations (5 Cols) -->
        <div class="lg:col-span-5 space-y-6">
          <!-- Existing Account Callout -->
          <div class="p-6 rounded-3xl bg-[#003432]/60 border border-cyan-500/30 space-y-3 shadow-lg">
            <div class="flex items-center space-x-2.5 text-cyan-300">
              <span class="text-xl">🤖</span>
              <h3 class="text-sm font-black text-white uppercase tracking-wider">Already an Active Investor?</h3>
            </div>
            <p class="text-xs text-slate-300 leading-relaxed">
              If you have an active account and need help with a trade, profit payout, or wish to raise a formal dispute, please use our 24/7 AI Chatbot in the bottom-right corner or access the authenticated Support Portal.
            </p>
            <div class="pt-1">
              <a routerLink="/portal/support" class="text-xs text-[#0BB4D2] hover:underline font-bold flex items-center space-x-1">
                <span>Go to Support &amp; Disputes Portal</span>
                <span>&rarr;</span>
              </a>
            </div>
          </div>

          <!-- Regional Desks -->
          <div class="p-6 rounded-3xl bg-[#002625] border border-white/10 space-y-4">
            <h3 class="text-xs font-black uppercase text-slate-400 tracking-wider">Regional Institutional Desks</h3>
            
            <div class="space-y-3 text-xs">
              <div class="pb-2 border-b border-white/5 space-y-0.5">
                <span class="font-bold text-white block">Zurich Quantitative Desk</span>
                <span class="text-slate-400">Bahnhofstrasse 45, 8001 Zürich, Switzerland</span>
              </div>
              <div class="pb-2 border-b border-white/5 space-y-0.5">
                <span class="font-bold text-white block">New York Operations Desk</span>
                <span class="text-slate-400">One Liberty Plaza, New York, NY 10006</span>
              </div>
              <div class="space-y-0.5">
                <span class="font-bold text-white block">London &amp; Singapore Hubs</span>
                <span class="text-slate-400">Cross-border multi-asset liquidity routing nodes</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  `
})
export class ContactComponent {
  formData = {
    name: '',
    email: '',
    department: 'Senior Managed Trading Desk',
    subject: '',
    message: ''
  };

  loading = signal<boolean>(false);
  submitted = signal<boolean>(false);
  ticketRef = signal<string>('');

  handleSubmit() {
    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
      this.submitted.set(true);
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      this.ticketRef.set(`INQ-${randomNum}`);
    }, 700);
  }
}
