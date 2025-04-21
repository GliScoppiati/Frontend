import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchBarService {
  // TODO: change the apiUrl with call to backend

  private apiBackendUrl = 'http://localhost:5000/api/cocktails?name=';
  private apiUrl = 'https://www.thecocktaildb.com/api/json/v1/1/search.php?s=';

  constructor(private http: HttpClient) {}

  searchEngine(query: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${query}`);
  }
}
