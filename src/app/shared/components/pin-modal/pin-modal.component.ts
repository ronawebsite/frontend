import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pin-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div class="glass-panel w-full max-w-sm rounded-2xl p-6 border border-cyan-500/30 shadow-2xl space-y-5">
        <div class="text-center space-y-1">
          <div class="w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-400 mx-auto flex items-center justify-center text-xl">
            🔒
          </div>
          <h3 class="text-lg font-bold text-white">{{ title || 'Transaction PIN Required' }}</h3>
          <p class="text-xs text-slate-400">{{ description || 'Enter your 4-digit security PIN to authorize this sensitive action.' }}</p>
        </div>

        <!-- 4-Digit Input Display -->
        <div class="flex justify-center space-x-3">
          <div
            *ngFor="let i of [0, 1, 2, 3]"
            class="w-12 h-14 rounded-xl border flex items-center justify-center text-xl font-mono font-bold transition-all"
            [ngClass]="pin().length > i ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300 shadow-glow-cyan' : 'border-slate-800 bg-slate-900/80 text-slate-500'"
          >
            {{ pin().length > i ? '•' : '' }}
          </div>
        </div>

        <!-- Numeric PinPad -->
        <div class="grid grid-cols-3 gap-2 pt-2">
          <button
            *ngFor="let digit of ['1','2','3','4','5','6','7','8','9']"
            (click)="appendDigit(digit)"
            class="py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-white font-mono font-bold text-lg border border-slate-800 hover:border-cyan-500/40 transition-colors"
          >
            {{ digit }}
          </button>
          <button
            (click)="closeModal()"
            class="py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 font-medium text-xs border border-slate-800 hover:border-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            (click)="appendDigit('0')"
            class="py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-white font-mono font-bold text-lg border border-slate-800 hover:border-cyan-500/40 transition-colors"
          >
            0
          </button>
          <button
            (click)="deleteDigit()"
            class="py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-rose-400 font-mono font-bold text-lg border border-slate-800 hover:border-rose-500/40 transition-colors"
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  `
})
export class PinModalComponent {
  @Input() isOpen = false;
  @Input() title?: string;
  @Input() description?: string;
  @Output() confirmed = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  pin = signal<string>('');

  appendDigit(digit: string) {
    if (this.pin().length < 4) {
      this.pin.update(p => p + digit);
      if (this.pin().length === 4) {
        setTimeout(() => {
          this.confirmed.emit(this.pin());
          this.pin.set('');
        }, 150);
      }
    }
  }

  deleteDigit() {
    this.pin.update(p => p.slice(0, -1));
  }

  closeModal() {
    this.pin.set('');
    this.cancelled.emit();
  }
}
