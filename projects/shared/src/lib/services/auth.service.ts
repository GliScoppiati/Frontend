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
  private profileUrl: string = 'http://localhost:5000/userprofile/api/userprofile';
  private loggedIn = new BehaviorSubject<boolean>(this.isLoggedIn());
  loggedIn$ = this.loggedIn.asObservable();

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.backendUrl}/login`, { email, password });
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.backendUrl}/register`, { username, email, password });
  }

  updateProfile(name: string, surname: string, birthDate: string, privacy:  boolean, profiling: boolean): Observable<any> {
    return this.http.put(`${this.profileUrl}${this.getUserId()}`, { name, surname, birthDate, privacy, profiling });
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

  saveTokens(JwtToken: string, refreshToken: string, userId: string): void {
    sessionStorage.setItem('userId', userId);
    sessionStorage.setItem('JwtToken', JwtToken);
    sessionStorage.setItem('refreshToken', refreshToken);
  }

  getUserId(): string | null {
    return sessionStorage.getItem('userId');
  }

  getJwtToken(): string | null {
    return sessionStorage.getItem('JwtToken');
  }

  getRefreshToken(): string | null {
    return sessionStorage.getItem('refreshToken');
  }

  clearTokens(): void {
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('JwtToken');
    sessionStorage.removeItem('refreshToken');
  }

  // TODO: make it private
  isTokenExpired(token: string): boolean {
    const decoded: any = jwtDecode(token);
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  }

  isLoggedIn(): boolean {
    const JwtToken = this.getJwtToken();
    return !!JwtToken;
  }


}
