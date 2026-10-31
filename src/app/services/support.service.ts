import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface SupportTicket {
  id: number;
  ticket_number: string;
  user_id: number;
  subject: string;
  category: 'TRADE_DISPUTE' | 'DEPOSIT_ISSUE' | 'WITHDRAWAL_STATUS' | 'ACCOUNT_SECURITY' | 'GENERAL_SUPPORT';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED';
  is_dispute: number; // 0 or 1
  related_trade_id?: number | null;
  source: 'USER_SUBMITTED' | 'AI_BOT_ESCALATED' | 'EMAIL';
  ai_summary?: string | null;
  user_name?: string;
  user_email?: string;
  account_id?: string;
  message_count?: number;
  last_message?: string;
  last_message_at?: string;
  last_sender_role?: string;
  created_at: string;
  updated_at: string;
}

export interface SupportMessage {
  id: number;
  ticket_id: number;
  sender_id?: number | null;
  sender_role: 'USER' | 'ADMIN' | 'AI_ASSISTANT';
  sender_name: string;
  sender_email?: string | null;
  message: string;
  is_email_dispatched: number;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupportService {
  private http = inject(HttpClient);

  activeTickets = signal<SupportTicket[]>([]);
  activeDisputes = signal<SupportTicket[]>([]);
  unreadDisputeAlerts = signal<number>(0);

  // User Actions
  getUserTickets(): Observable<{ success: boolean; data: SupportTicket[] }> {
    return this.http.get<{ success: boolean; data: SupportTicket[] }>(`${environment.apiUrl}/support/tickets`);
  }

  getTicketDetails(id: number): Observable<{ success: boolean; data: { ticket: SupportTicket; messages: SupportMessage[] } }> {
    return this.http.get<{ success: boolean; data: { ticket: SupportTicket; messages: SupportMessage[] } }>(`${environment.apiUrl}/support/tickets/${id}`);
  }

  createTicket(payload: {
    subject: string;
    category?: string;
    priority?: string;
    message: string;
    is_dispute?: boolean;
    related_trade_id?: number;
    source?: string;
    ai_summary?: string;
  }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/support/tickets`, payload);
  }

  addMessage(ticketId: number, message: string, newStatus?: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/support/tickets/${ticketId}/messages`, { message, new_status: newStatus });
  }

  // AI Chatbot Actions
  sendAiChatMessage(message: string, chatHistory?: any[], autoEscalate: boolean = false): Observable<{
    success: boolean;
    data: {
      reply: string;
      dispute_created?: any;
      timestamp: string;
    }
  }> {
    return this.http.post<any>(`${environment.apiUrl}/support/ai-chat`, { message, chat_history: chatHistory, auto_escalate: autoEscalate });
  }

  // Admin Actions
  getAllTicketsAdmin(filters?: {
    is_dispute?: boolean | string;
    status?: string;
    category?: string;
    priority?: string;
  }): Observable<{ success: boolean; data: SupportTicket[] }> {
    let q = '';
    if (filters) {
      const params = new URLSearchParams();
      if (filters.is_dispute !== undefined) params.set('is_dispute', String(filters.is_dispute));
      if (filters.status) params.set('status', filters.status);
      if (filters.category) params.set('category', filters.category);
      if (filters.priority) params.set('priority', filters.priority);
      const str = params.toString();
      if (str) q = `?${str}`;
    }
    return this.http.get<{ success: boolean; data: SupportTicket[] }>(`${environment.apiUrl}/support/admin/tickets${q}`);
  }

  updateTicketStatusAdmin(id: number, payload: {
    status?: string;
    priority?: string;
    admin_note?: string;
  }): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/support/admin/tickets/${id}/status`, payload);
  }
}
