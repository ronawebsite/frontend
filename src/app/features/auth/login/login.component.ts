import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4 bg-[#070c18] font-nunito relative overflow-hidden">
      <!-- Ambient Obsidian Glow Accents -->
      <div class="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#003432]/50 blur-[130px] pointer-events-none"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#0BB4D2]/20 blur-[130px] pointer-events-none"></div>

      <div class="w-full max-w-md glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl relative z-10 space-y-6">
        
        <!-- Back to Website Link -->
        <div class="flex items-center justify-between text-xs">
          <a routerLink="/" class="text-slate-400 hover:text-[#0BB4D2] transition font-bold flex items-center space-x-1">
            <span>&larr;</span>
            <span>Back to Homepage</span>
          </a>
          <span class="text-[11px] text-cyan-300 font-mono font-bold">Secure Access</span>
        </div>

        <!-- Brand Header -->
        <div class="text-center space-y-2">
          <div class="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#003432] via-[#0284c7] to-[#0BB4D2] p-0.5 shadow-lg shadow-[#0BB4D2]/25">
            <div class="w-full h-full bg-[#002625] rounded-[14px] flex items-center justify-center font-black text-white text-xl">
              F
            </div>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Sign In to <span class="text-[#0BB4D2]">Fichain Pro</span>
          </h1>
          <p class="text-xs text-slate-400">Access your portfolio &amp; trading desk</p>
        </div>

        <!-- Dual-Login Navigation Tabs -->
        <div class="flex rounded-2xl bg-[#002625] p-1 border border-white/10 text-xs font-bold">
          <button
            (click)="activeTab.set('credentials')"
            class="flex-1 py-2 rounded-xl transition-all"
            [ngClass]="activeTab() === 'credentials' ? 'bg-[#0BB4D2] text-[#002625] font-black shadow-sm' : 'text-slate-400 hover:text-white'"
          >
            Email &amp; Password
          </button>
          <button
            (click)="activeTab.set('phrase')"
            class="flex-1 py-2 rounded-xl transition-all flex items-center justify-center space-x-1"
            [ngClass]="activeTab() === 'phrase' ? 'bg-[#0BB4D2] text-[#002625] font-black shadow-sm' : 'text-slate-400 hover:text-white'"
          >
            <span>🔑 12-Word Phrase</span>
          </button>
        </div>

        <!-- Tab 1: Standard Email / Password Form -->
        <form *ngIf="activeTab() === 'credentials'" (ngSubmit)="handleLogin()" class="space-y-4">
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-300">Email or Username</label>
            <input
              type="text"
              [(ngModel)]="email"
              name="email"
              placeholder="name@example.com"
              required
              class="w-full px-4 py-2.5 rounded-xl bg-[#002625] border border-white/15 text-white text-sm focus:outline-none focus:border-[#0BB4D2] font-mono transition-colors"
            />
          </div>

          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-xs">
              <label class="font-bold text-slate-300">Password</label>
            </div>
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              placeholder="••••••••"
              required
              class="w-full px-4 py-2.5 rounded-xl bg-[#002625] border border-white/15 text-white text-sm focus:outline-none focus:border-[#0BB4D2] font-mono transition-colors"
            />
          </div>

          <button
            type="submit"
            [disabled]="loading()"
            class="w-full py-3.5 rounded-2xl btn-cyan-gradient text-white font-black text-sm shadow-lg shadow-[#0BB4D2]/25 transition-all disabled:opacity-50"
          >
            {{ loading() ? 'Signing In...' : 'Sign In to Dashboard' }}
          </button>
        </form>

        <!-- Tab 2: 12-Word Recovery Phrase Login -->
        <form *ngIf="activeTab() === 'phrase'" (ngSubmit)="handlePhraseLogin()" class="space-y-4">
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Secret 12-Word Key</span>
              <span class="text-[10px] text-cyan-300 font-mono">Web3 Style</span>
            </label>
            <textarea
              [(ngModel)]="recoveryPhrase"
              name="recoveryPhrase"
              rows="3"
              placeholder="paste your 12 words separated by spaces..."
              required
              class="w-full px-4 py-2.5 rounded-xl bg-[#002625] border border-white/15 text-cyan-300 text-xs font-mono focus:outline-none focus:border-[#0BB4D2] transition-colors resize-none leading-relaxed"
            ></textarea>
          </div>

          <button
            type="submit"
            [disabled]="loading()"
            class="w-full py-3.5 rounded-2xl btn-cyan-gradient text-white font-black text-sm shadow-lg shadow-[#0BB4D2]/25 transition-all disabled:opacity-50"
          >
            {{ loading() ? 'Checking Key...' : 'Unlock Account with Phrase' }}
          </button>
        </form>

        <!-- Register Link -->
        <div class="text-center text-xs text-slate-400 pt-2 border-t border-white/10">
          New to Fichain Pro?
          <a routerLink="/auth/register" class="text-[#0BB4D2] font-bold hover:underline ml-1">
            Create Account
          </a>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  authService = inject(AuthService);
  toast = inject(ToastService);
  router = inject(Router);

  activeTab = signal<'credentials' | 'phrase'>('credentials');
  loading = signal<boolean>(false);

  email = '';
  password = '';
  recoveryPhrase = '';

  handleLogin() {
    this.loading.set(true);
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toast.success(`Welcome back, ${res.data.user.full_name}!`);
        if (res.data.user.role === 'admin') {
          this.router.navigate(['/admin/overview']);
        } else {
          this.router.navigate(['/portal/dashboard']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.error || 'Invalid email or password');
      }
    });
  }

  handlePhraseLogin() {
    this.loading.set(true);
    this.authService.phraseLogin(this.recoveryPhrase).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toast.success(`Secret phrase verified: ${res.data.user.full_name}`);
        this.router.navigate(['/portal/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.error || '12-Word phrase could not be verified');
      }
    });
  }
}
