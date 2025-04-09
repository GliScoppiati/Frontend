import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // TODO: Add the backend URL to the environment file
  private backendUrl: string = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.backendUrl}/login`, { email, password });
  }

  register(email: string, password: string): Observable<any> {
    return this.http.post(`${this.backendUrl}/register`, { email, password });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.backendUrl}/logout`, {});
  }

  getUserProfileData(): Observable<any> {
    return this.http.get(`${this.backendUrl}/profile`);
  }


}

// TODO: Add a method to check if the user is logged in
// TODO: Add a method to check if the user is registered

