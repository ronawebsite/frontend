import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<ToastMessage[]>([]);

  show(type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string) {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, type, message, title };
    this.toasts.update(current => [...current, newToast]);

    setTimeout(() => {
      this.remove(id);
    }, 4500);
  }

  success(message: string, title?: string) {
    this.show('success', message, title || 'Success');
  }

  error(message: string, title?: string) {
    this.show('error', message, title || 'Error');
  }

  info(message: string, title?: string) {
    this.show('info', message, title || 'Notice');
  }

  warning(message: string, title?: string) {
    this.show('warning', message, title || 'Attention');
  }

  remove(id: string) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
