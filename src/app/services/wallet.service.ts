import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { PortfolioSummary, Transaction } from '../core/models/fintech.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private http = inject(HttpClient);

  getPortfolio(): Observable<{ success: boolean; data: PortfolioSummary }> {
    return this.http.get<{ success: boolean; data: PortfolioSummary }>(`${environment.apiUrl}/wallet/portfolio`);
  }

  getDepositAddress(asset: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/wallet/deposit-address/${asset}`);
  }

  getDepositMethods(): Observable<{ success: boolean; data: any[] }> {
    return this.http.get<{ success: boolean; data: any[] }>(`${environment.apiUrl}/wallet/deposit-methods`);
  }

  sandboxDeposit(asset: string, amount: number): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/wallet/deposit-sandbox`, { asset, amount });
  }

  submitDepositRequest(data: FormData | { asset: string; amount: number; tx_hash?: string; network?: string; notes?: string; destination_address?: string; receipt_base64?: string }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/wallet/deposit-request`, data);
  }

  initiateWithdrawal(withdrawal: { asset: string; amount: number; destination_address: string }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/wallet/withdraw/initiate`, withdrawal);
  }

  confirmWithdrawal(transaction_id: number, pin: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/wallet/withdraw/confirm`, { transaction_id, pin });
  }

  getTransactions(): Observable<{ success: boolean; data: Transaction[] }> {
    return this.http.get<{ success: boolean; data: Transaction[] }>(`${environment.apiUrl}/wallet/transactions`);
  }

  downloadCSV() {
    window.open(`${environment.apiUrl}/wallet/statement/csv`, '_blank');
  }

  downloadPDF() {
    window.open(`${environment.apiUrl}/wallet/statement/pdf`, '_blank');
  }
}
