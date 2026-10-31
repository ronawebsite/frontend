import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VirtualCard3dComponent } from '../../../shared/components/virtual-card-3d/virtual-card-3d.component';
import { PinModalComponent } from '../../../shared/components/pin-modal/pin-modal.component';
import { CardService } from '../../../services/card.service';
import { ToastService } from '../../../services/toast.service';
import { VirtualCard } from '../../../core/models/fintech.models';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CommonModule, VirtualCard3dComponent, PinModalComponent],
  template: `
    <div class="space-y-6">
      
      <!-- ========================================================================= -->
      <!-- TOP BANNER                                                                -->
      <!-- ========================================================================= -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#003432] via-[#002625] to-[#071d24] border border-white/10 shadow-xl">
        <div class="space-y-1">
          <div class="flex items-center space-x-2.5">
            <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Virtual Debit Cards
            </h1>
            <span class="px-2.5 py-0.5 text-[11px] font-extrabold rounded-full bg-[#0BB4D2]/20 text-cyan-300 border border-[#0BB4D2]/40">
              3D INTERACTIVE
            </span>
          </div>
          <p class="text-xs sm:text-sm text-cyan-100/80 max-w-2xl leading-relaxed">
            Flip in 3D, reveal card details with your PIN, or freeze anytime.
          </p>
        </div>

        <button
          (click)="requestNewCard()"
          class="px-5 py-2.5 rounded-2xl btn-cyan-gradient font-black text-xs shadow-md shadow-[#0BB4D2]/20 flex items-center space-x-2 shrink-0 transition-all"
        >
          <span>💳 Create New Card</span>
        </button>
      </div>

      <!-- ========================================================================= -->
      <!-- 3D VIRTUAL CARDS GRID                                                     -->
      <!-- ========================================================================= -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
        <div *ngFor="let card of cards()" class="glass-panel p-6 rounded-3xl border border-white/10 space-y-5 shadow-xl">
          <!-- 3D Card Visual with Interactive Flip Animation -->
          <div class="flex justify-center">
            <app-virtual-card-3d [card]="card"></app-virtual-card-3d>
          </div>

          <!-- Card Details & Controls -->
          <div class="space-y-3.5 pt-2">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-sm font-bold text-white block">{{ card.card_holder_name }}</span>
                <span class="text-xs text-slate-400 font-medium">{{ card.card_tier }}</span>
              </div>
              <span
                class="px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider"
                [ngClass]="card.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'"
              >
                {{ card.status === 'active' ? 'Active & Ready' : 'Frozen' }}
              </span>
            </div>

            <!-- Spending Limits -->
            <div class="grid grid-cols-2 gap-3 p-3.5 bg-[#002625] rounded-2xl border border-white/10 font-mono text-xs">
              <div>
                <span class="text-[10px] text-slate-400 block font-sans">Available Card Balance</span>
                <span class="font-bold text-white text-sm">\${{ card.balance | number:'1.2-2' }}</span>
              </div>
              <div>
                <span class="text-[10px] text-slate-400 block font-sans">Daily Spending Limit</span>
                <span class="font-bold text-cyan-200 text-sm">\${{ card.spending_limit | number:'1.2-2' }}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center space-x-3 pt-1 font-sans">
              <button
                (click)="openUnmaskModal(card)"
                class="flex-1 py-2.5 rounded-xl bg-[#003432] hover:bg-[#002625] text-cyan-300 border border-[#0BB4D2]/40 text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
              >
                <span>👁️ Reveal Card Details</span>
              </button>

              <button
                (click)="toggleFreeze(card.id)"
                class="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border"
                [ngClass]="card.status === 'active'
                  ? 'bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 border-rose-800/40'
                  : 'bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-300 border-emerald-800/40'"
              >
                {{ card.status === 'active' ? '❄️ Freeze Card' : '🔓 Unfreeze Card' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- SECURITY PIN CONFIRMATION MODAL                                           -->
      <!-- ========================================================================= -->
      <app-pin-modal
        [isOpen]="pinModalOpen()"
        title="View Card Number & CVV"
        description="Enter your 4-digit security PIN to reveal the card number and CVV on screen."
        (confirmed)="handlePinConfirmed($event)"
        (cancelled)="pinModalOpen.set(false)"
      ></app-pin-modal>
    </div>
  `
})
export class CardsComponent implements OnInit {
  cardService = inject(CardService);
  toast = inject(ToastService);

  cards = signal<VirtualCard[]>([]);
  pinModalOpen = signal<boolean>(false);
  selectedCardForUnmask = signal<VirtualCard | null>(null);

  ngOnInit() {
    this.loadCards();
  }

  loadCards() {
    this.cardService.getCards().subscribe(res => {
      if (res.success) this.cards.set(res.data);
    });
  }

  openUnmaskModal(card: VirtualCard) {
    this.selectedCardForUnmask.set(card);
    this.pinModalOpen.set(true);
  }

  handlePinConfirmed(pin: string) {
    const card = this.selectedCardForUnmask();
    if (!card) return;

    this.cardService.revealDetails(card.id, pin).subscribe({
      next: (res) => {
        this.pinModalOpen.set(false);
        this.toast.success('Card details revealed successfully!');
        this.cards.update(list => list.map(c => c.id === card.id ? { ...c, ...res.data } : c));
      },
      error: (err) => {
        this.toast.error(err.error?.error || 'PIN incorrect. (Hint: Default is 1234)');
      }
    });
  }

  toggleFreeze(cardId: number) {
    this.cardService.toggleFreeze(cardId).subscribe({
      next: (res) => {
        this.toast.info(res.message);
        this.loadCards();
      },
      error: (err) => this.toast.error(err.error?.error || 'Could not update card status')
    });
  }

  requestNewCard() {
    const types: ('Visa' | 'Mastercard')[] = ['Visa', 'Mastercard'];
    const chosenType = types[Math.floor(Math.random() * types.length)];
    const tier = chosenType === 'Visa' ? 'Platinum Rewards Card' : 'Obsidian Black Card';

    this.cardService.requestCard(chosenType, tier).subscribe({
      next: (res) => {
        this.toast.success(res.message);
        this.loadCards();
      },
      error: (err) => this.toast.error(err.error?.error || 'Could not issue card')
    });
  }
}
