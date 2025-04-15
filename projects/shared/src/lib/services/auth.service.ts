import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // TODO: Add the backend URL to the environment file
  private backendUrl: string = 'http://localhost:5000/auth/api/auth';
  private loggedIn = new BehaviorSubject<boolean>(this.isLoggedIn());
  loggedIn$ = this.loggedIn.asObservable();

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.backendUrl}/login`, { email, password });
  }

  register(name: string, surname: string, birthDate: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.backendUrl}/register`, { name, surname, birthDate, email, password });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.backendUrl}/logout`, {});
  }

  refresh(refreshToken: string): Observable<any> {
    return this.http.post(`${this.backendUrl}/refresh`, { refreshToken });
  }

  getUserProfileData(): Observable<any> {
    return this.http.get(`${this.backendUrl}/profile`);
  }

  saveTokens(accessToken: string, refreshToken: string): void {
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);
  }

  getAccessToken(): string | null {
    return sessionStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return sessionStorage.getItem('refreshToken');
  }

  clearTokens(): void {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
  }

  // TODO: make it private
  isTokenExpired(token: string): boolean {
    const decoded: any = jwtDecode(token);
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  }

  isLoggedIn(): boolean {
    const accessToken = this.getAccessToken();
    return !!accessToken;
  }


}
