import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VirtualCard } from '../../../core/models/fintech.models';

@Component({
  selector: 'app-virtual-card-3d',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="perspective-1000 w-full max-w-sm h-56 cursor-pointer select-none group" (click)="toggleFlip()">
      <div
        class="w-full h-full relative transition-transform duration-700 transform-style-3d rounded-2xl shadow-2xl"
        [ngClass]="{ 'rotate-y-180': isFlipped() }"
      >
        <!-- FRONT OF CARD -->
        <div
          class="absolute inset-0 w-full h-full rounded-2xl p-6 flex flex-col justify-between backface-hidden border border-white/20 overflow-hidden"
          [ngClass]="card.card_type === 'Mastercard'
            ? 'bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-950/80'
            : 'bg-gradient-to-tr from-slate-950 via-slate-900 to-cyan-950/80'"
        >
          <!-- Hologram Accent Glow -->
          <div class="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none"></div>

          <!-- Top Row: Tier & Network Logo -->
          <div class="flex items-center justify-between z-10">
            <div>
              <span class="text-[10px] font-bold tracking-widest uppercase text-cyan-400 block">
                {{ card.card_tier }}
              </span>
              <span class="text-xs font-semibold text-slate-300">FICHAIN PRO CAPITAL</span>
            </div>
            <!-- Card Brand Logo -->
            <div class="text-right">
              <span *ngIf="card.card_type === 'Visa'" class="font-extrabold italic text-2xl tracking-tighter text-white">
                VISA
              </span>
              <div *ngIf="card.card_type === 'Mastercard'" class="flex -space-x-2">
                <div class="w-6 h-6 rounded-full bg-rose-500/90"></div>
                <div class="w-6 h-6 rounded-full bg-amber-500/90"></div>
              </div>
            </div>
          </div>

          <!-- Middle: EMV Chip & Contactless -->
          <div class="flex items-center space-x-3 z-10">
            <!-- EMV Chip graphic -->
            <div class="w-10 h-8 rounded-md bg-gradient-to-tr from-amber-200 via-amber-400 to-amber-300 border border-amber-500/40 p-1 flex flex-col justify-between">
              <div class="h-0.5 bg-amber-600/40 rounded"></div>
              <div class="h-0.5 bg-amber-600/40 rounded"></div>
            </div>
            <!-- Wireless Symbol -->
            <span class="text-slate-400 text-sm">)))</span>

            <span
              *ngIf="card.status === 'frozen'"
              class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40"
            >
              FROZEN
            </span>
          </div>

          <!-- Bottom: Number, Holder & Expiry -->
          <div class="z-10">
            <div class="font-mono text-lg tracking-widest font-semibold text-white drop-shadow">
              {{ card.card_number || card.masked_number }}
            </div>
            <div class="flex items-end justify-between mt-2 text-xs">
              <div>
                <span class="text-[9px] text-slate-400 uppercase block tracking-wider">Cardholder</span>
                <span class="font-medium tracking-wide text-slate-200">{{ card.card_holder_name }}</span>
              </div>
              <div class="text-right">
                <span class="text-[9px] text-slate-400 uppercase block tracking-wider">Expires</span>
                <span class="font-mono font-medium text-slate-200">{{ card.expiry }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- BACK OF CARD -->
        <div
          class="absolute inset-0 w-full h-full rounded-2xl p-6 flex flex-col justify-between backface-hidden rotate-y-180 border border-white/20 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 overflow-hidden"
        >
          <!-- Magnetic Stripe -->
          <div class="-mx-6 -mt-2 h-10 bg-slate-950 border-y border-slate-800"></div>

          <!-- CVV Signature Strip -->
          <div class="space-y-1">
            <div class="flex items-center justify-between text-[10px] text-slate-400">
              <span>AUTHORIZED SIGNATURE</span>
              <span>SECURITY CODE</span>
            </div>
            <div class="bg-slate-200 text-slate-900 h-8 rounded px-3 flex items-center justify-end font-mono font-bold text-sm">
              <span class="text-slate-500 text-xs mr-2">CVV:</span>
              <span class="text-slate-900 font-bold tracking-widest">{{ card.cvv || card.masked_cvv }}</span>
            </div>
          </div>

          <!-- Card Disclaimers & Action Hint -->
          <div class="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Click card to flip</span>
            <span class="text-cyan-400 font-semibold font-mono">24/7 CONCIERGE</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class VirtualCard3dComponent {
  @Input({ required: true }) card!: VirtualCard;
  @Output() unmask = new EventEmitter<VirtualCard>();

  isFlipped = signal<boolean>(false);

  toggleFlip() {
    this.isFlipped.update(v => !v);
  }
}
