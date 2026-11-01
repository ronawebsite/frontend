import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4 bg-[#070c18] font-nunito relative overflow-hidden">
      <!-- Glow -->
      <div class="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#003432]/50 blur-[130px] pointer-events-none"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#0BB4D2]/20 blur-[130px] pointer-events-none"></div>

      <div class="w-full max-w-lg glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl relative z-10 space-y-6">
        
        <!-- Back to Website Link -->
        <div class="flex items-center justify-between text-xs">
          <a routerLink="/" class="text-slate-400 hover:text-[#0BB4D2] transition font-bold flex items-center space-x-1">
            <span>&larr;</span>
            <span>Back to Homepage</span>
          </a>
          <span class="text-[11px] text-cyan-300 font-mono font-bold">Secure Setup</span>
        </div>

        <div class="text-center space-y-2">
          <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Create Account
          </h1>
          <p class="text-xs text-slate-300">
            Enter your credentials below to create your trading account.
          </p>
        </div>

        <form (ngSubmit)="handleRegister()" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-300">Your Full Name</label>
              <input
                type="text"
                [(ngModel)]="fullName"
                name="fullName"
                placeholder="Alex Morgan"
                required
                class="w-full px-4 py-2.5 rounded-xl bg-[#002625] border border-white/15 text-white text-sm focus:outline-none focus:border-[#0BB4D2] font-sans"
              />
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-300">Choose Username</label>
              <input
                type="text"
                [(ngModel)]="username"
                name="username"
                placeholder="alexm"
                required
                class="w-full px-4 py-2.5 rounded-xl bg-[#002625] border border-white/15 text-white text-sm focus:outline-none focus:border-[#0BB4D2] font-mono"
              />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-300">Email Address</label>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              placeholder="alex@gmail.com"
              required
              class="w-full px-4 py-2.5 rounded-xl bg-[#002625] border border-white/15 text-white text-sm focus:outline-none focus:border-[#0BB4D2] font-sans"
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-300">Password</label>
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              placeholder="••••••••"
              required
              class="w-full px-4 py-2.5 rounded-xl bg-[#002625] border border-white/15 text-white text-sm focus:outline-none focus:border-[#0BB4D2] font-mono"
            />
          </div>

          <button
            type="submit"
            [disabled]="loading()"
            class="w-full py-3.5 rounded-2xl btn-cyan-gradient text-white font-black text-sm shadow-lg shadow-[#0BB4D2]/25 transition-all disabled:opacity-50"
          >
            {{ loading() ? 'Creating Your Account...' : 'Create Account' }}
          </button>
        </form>

        <div class="text-center text-xs text-slate-400 pt-2 border-t border-white/10">
          Already have an account?
          <a routerLink="/auth/login" class="text-[#0BB4D2] font-bold hover:underline ml-1">
            Sign In Here
          </a>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  authService = inject(AuthService);
  toast = inject(ToastService);
  router = inject(Router);

  loading = signal<boolean>(false);

  fullName = '';
  username = '';
  email = '';
  password = '';
  pin = '1234';

  handleRegister() {
    this.loading.set(true);
    this.authService.register({
      full_name: this.fullName,
      username: this.username,
      email: this.email,
      password: this.password,
      pin: this.pin
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toast.success('Account created! Welcome to Fichain Pro.');
        this.router.navigate(['/portal/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.error || 'Registration failed');
      }
    });
  }
}
