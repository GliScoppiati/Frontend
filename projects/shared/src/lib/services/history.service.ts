import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { SearchInput } from './../services/search.service';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  // * API
  private cocktailAPI: string = 'http://localhost:5000/api/searchhistory';
  private getUserHistoryAPI: string = 'http://localhost:5000/api/searchhistory/mine';

  constructor(private http: HttpClient) { }

  getHistory(): any {
    return this.http.get<any>(this.getUserHistoryAPI);
  }

  addToHistory(filters: SearchInput[], action: string): any {
    return this.http.post<any>(this.cocktailAPI, {
      action: action,
      filters: filters
     });
  }


}
