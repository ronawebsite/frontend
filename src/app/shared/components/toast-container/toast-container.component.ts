import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 max-w-md w-full pointer-events-none">
      <div
        *ngFor="let toast of toastService.toasts()"
        class="pointer-events-auto flex items-start p-4 rounded-xl shadow-2xl border transition-all duration-300 transform translate-y-0"
        [ngClass]="{
          'bg-slate-900/95 border-emerald-500/40 text-emerald-300': toast.type === 'success',
          'bg-slate-900/95 border-rose-500/40 text-rose-300': toast.type === 'error',
          'bg-slate-900/95 border-cyan-500/40 text-cyan-300': toast.type === 'info',
          'bg-slate-900/95 border-amber-500/40 text-amber-300': toast.type === 'warning'
        }"
      >
        <div class="mr-3 mt-0.5">
          <span *ngIf="toast.type === 'success'" class="text-xl">✓</span>
          <span *ngIf="toast.type === 'error'" class="text-xl">✕</span>
          <span *ngIf="toast.type === 'info'" class="text-xl">ℹ</span>
          <span *ngIf="toast.type === 'warning'" class="text-xl">⚠</span>
        </div>
        <div class="flex-1">
          <h4 *ngIf="toast.title" class="font-semibold text-sm text-white mb-0.5">{{ toast.title }}</h4>
          <p class="text-xs text-slate-300 leading-relaxed">{{ toast.message }}</p>
        </div>
        <button
          (click)="toastService.remove(toast.id)"
          class="ml-3 text-slate-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  `
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}
