import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-kyc',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 max-w-4xl mx-auto">
      
      <!-- ========================================================================= -->
      <!-- TOP BANNER                                                                -->
      <!-- ========================================================================= -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#003432] via-[#002625] to-[#071d24] border border-white/10 shadow-xl">
        <div class="space-y-1">
          <div class="flex items-center space-x-2.5">
            <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Identity Verification (KYC)
            </h1>
            <span
              class="px-2.5 py-0.5 text-[11px] font-extrabold uppercase rounded-full"
              [ngClass]="{
                'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40': authService.currentUser()?.kyc_status === 'approved',
                'bg-amber-500/20 text-amber-300 border border-amber-500/40': authService.currentUser()?.kyc_status === 'pending',
                'bg-slate-800 text-slate-400 border border-slate-700': authService.currentUser()?.kyc_status === 'unverified'
              }"
            >
              {{ authService.currentUser()?.kyc_status === 'approved' ? 'Verified Account' : (authService.currentUser()?.kyc_status === 'pending' ? 'Pending Review' : 'Verification Needed') }}
            </span>
          </div>
          <p class="text-xs sm:text-sm text-cyan-100/80 max-w-2xl leading-relaxed">
            Verify your account to unlock higher card limits and fast withdrawals.
          </p>
        </div>
      </div>

      <!-- Verification Benefits Card -->
      <div class="p-5 rounded-3xl bg-[#002625] border border-white/10 shadow-lg space-y-2">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl bg-[#003432] text-[#0BB4D2] flex items-center justify-center text-xl shrink-0 border border-[#0BB4D2]/30">
            🛡️
          </div>
          <div>
            <h3 class="text-sm font-black text-white">Verification Benefits</h3>
            <p class="text-xs text-slate-300">
              Verified accounts unlock higher virtual card limits and priority withdrawal processing.
            </p>
          </div>
        </div>
      </div>

      <!-- ID Document Submission Form -->
      <div class="p-6 rounded-3xl glass-panel border border-white/10 space-y-6 shadow-xl">
        <h3 class="text-lg font-black text-white border-b border-white/10 pb-3">
          Upload Your ID Document
        </h3>

        <form (ngSubmit)="submitKYC()" class="space-y-5">
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-200">What kind of ID are you providing?</label>
            <select
              [(ngModel)]="documentType"
              name="documentType"
              class="w-full px-4 py-2.5 rounded-xl bg-[#002625] border border-white/15 text-white font-sans text-sm focus:outline-none focus:border-[#0BB4D2]"
            >
              <option value="National Passport">Passport</option>
              <option value="Drivers License">Driver's License</option>
              <option value="National ID Card">National ID Card / Student ID</option>
            </select>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Front ID Upload -->
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-300">Front of ID</label>
              <div
                class="border-2 border-dashed border-white/20 hover:border-[#0BB4D2] rounded-2xl p-4 text-center cursor-pointer transition-colors bg-[#002625] relative h-48 flex flex-col items-center justify-center overflow-hidden"
                (click)="frontFileInput.click()"
              >
                <img *ngIf="frontPreview()" [src]="frontPreview()" class="absolute inset-0 w-full h-full object-cover" />
                <div *ngIf="!frontPreview()" class="space-y-1 text-slate-400">
                  <span class="text-3xl block">📄</span>
                  <span class="text-xs font-bold block text-slate-200">Tap to Upload Front Image</span>
                  <span class="text-[10px] text-slate-400">PNG, JPG up to 10MB</span>
                </div>
              </div>
              <input #frontFileInput type="file" (change)="onFileSelect($event, 'front')" class="hidden" accept="image/*" />
            </div>

            <!-- Back ID Upload -->
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-300">Back of ID (Optional)</label>
              <div
                class="border-2 border-dashed border-white/20 hover:border-[#0BB4D2] rounded-2xl p-4 text-center cursor-pointer transition-colors bg-[#002625] relative h-48 flex flex-col items-center justify-center overflow-hidden"
                (click)="backFileInput.click()"
              >
                <img *ngIf="backPreview()" [src]="backPreview()" class="absolute inset-0 w-full h-full object-cover" />
                <div *ngIf="!backPreview()" class="space-y-1 text-slate-400">
                  <span class="text-3xl block">📑</span>
                  <span class="text-xs font-bold block text-slate-200">Tap to Upload Back Image</span>
                  <span class="text-[10px] text-slate-400">PNG, JPG up to 10MB</span>
                </div>
              </div>
              <input #backFileInput type="file" (change)="onFileSelect($event, 'back')" class="hidden" accept="image/*" />
            </div>
          </div>

          <button
            type="submit"
            [disabled]="loading() || !frontPreview()"
            class="w-full py-3.5 rounded-2xl btn-cyan-gradient text-white font-black text-sm shadow-lg shadow-[#0BB4D2]/25 transition-all disabled:opacity-50"
          >
            {{ loading() ? 'Submitting ID...' : 'Submit ID for Verification' }}
          </button>
        </form>
      </div>

    </div>
  `
})
export class KycComponent {
  authService = inject(AuthService);
  toast = inject(ToastService);
  http = inject(HttpClient);

  documentType = 'National Passport';
  frontPreview = signal<string | null>(null);
  backPreview = signal<string | null>(null);
  loading = signal<boolean>(false);

  onFileSelect(event: any, side: 'front' | 'back') {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (side === 'front') this.frontPreview.set(e.target.result);
        else this.backPreview.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  submitKYC() {
    this.loading.set(true);
    this.http.post<any>(`${environment.apiUrl}/user/kyc`, {
      document_type: this.documentType,
      front_image: this.frontPreview(),
      back_image: this.backPreview()
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toast.success(res.message);
        this.authService.fetchMe().subscribe();
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.error || 'Could not submit KYC documents');
      }
    });
  }
}
