import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private backendAPI: string = 'http://localhost:5000/auth/api/auth';
  private profileAPI: string = 'http://localhost:5000/userprofile/api/userprofile/';
  private loggedIn = new BehaviorSubject<boolean>(this.isLoggedIn());
  loggedIn$ = this.loggedIn.asObservable();

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.backendAPI}/login`, { email, password });
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.backendAPI}/register`, { username, email, password });
  }

  updateProfile(name: string, surname: string, birthDate: string, privacy:  boolean, profiling: boolean): Observable<any> {
    const userId = this.getUserId();
    return this.http.put(`${this.profileAPI}${userId}`, { userId, name, surname, birthDate, privacy, profiling });
  }

  logout(refreshToken: string): Observable<any> {
    console.log('logout token', refreshToken);
    return this.http.post(`${this.backendAPI}/logout`, { refreshToken });
  }

  refresh(refreshToken: string): Observable<any> {
    console.log('refresh token', refreshToken);
    return this.http.post(`${this.backendAPI}/refresh`, { refreshToken });
  }

  getUserProfileData(): Observable<any> {
    return this.http.get(`${this.backendAPI}/${this.getUserId()}`);
  }

  saveTokens(JwtToken?: string, refreshToken?: string, userId?: string): void {
    if  (userId)
      sessionStorage.setItem('userId', userId);
    if (JwtToken)
      sessionStorage.setItem('JwtToken', JwtToken);
    if (refreshToken)
      sessionStorage.setItem('refreshToken', refreshToken);
    console.log('Tokens saved to session storage', JwtToken, refreshToken, userId);
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
