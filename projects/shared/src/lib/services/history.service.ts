import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private history: string[] = [];

  constructor(private authService: AuthService) { }

  addToHistory(id: string): void {
    if (this.authService.isLoggedIn() && this.authService.getProfiling()) {
      console.log('Adding to history', id);
      this.history.push(id);
      localStorage.setItem('history', JSON.stringify(this.history));
    }
  }

  getHistory(): string[] {
    if (this.authService.isLoggedIn() && this.authService.getProfiling()) {
      const history = localStorage.getItem('history');
      if (history) {
        this.history = JSON.parse(history);
      }
    }
    return this.history;
  }
}
