import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { VirtualCard } from '../core/models/fintech.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private http = inject(HttpClient);

  getCards(): Observable<{ success: boolean; data: VirtualCard[] }> {
    return this.http.get<{ success: boolean; data: VirtualCard[] }>(`${environment.apiUrl}/cards`);
  }

  revealDetails(id: number, pin: string): Observable<{ success: boolean; data: VirtualCard }> {
    return this.http.post<{ success: boolean; data: VirtualCard }>(`${environment.apiUrl}/cards/${id}/reveal`, { pin });
  }

  toggleFreeze(id: number): Observable<any> {
    return this.http.patch<any>(`${environment.apiUrl}/cards/${id}/freeze`, {});
  }

  requestCard(card_type: 'Visa' | 'Mastercard', tier: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/cards/request`, { card_type, tier });
  }
}
