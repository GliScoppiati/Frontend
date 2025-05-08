import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private backendAPI: string = 'http://localhost:5000/auth/api/auth/';
  private profileAPI: string = 'http://localhost:5000/userprofile/api/userprofile/';
  private submissionsAPI: string = 'http://localhost:5000/submission/submissions/my';

  private loggedIn = new BehaviorSubject<boolean>(this.isLoggedIn());
  loggedIn$ = this.loggedIn.asObservable();

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.backendAPI}login`, { email, password });
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.backendAPI}register`, { username, email, password });
  }

  updateProfile(firstName: string, lastName: string, birthDate: string, alcoholAllowed: boolean, consentGdpr:  boolean, consentProfiling: boolean): Observable<any> {
    const userId = this.getUserId();
    return this.http.put(`${this.profileAPI}${userId}`,
      {
        userId: userId,
        firstName: firstName,
        lastName: lastName,
        birthDate: birthDate,
        alcoholAllowed: alcoholAllowed,
        consentGdpr: consentGdpr,
        consentProfiling: consentProfiling
      });
  }

  deleteProfile(): Observable<any> {
    const userId = this.getUserId();
    return this.http.delete(`${this.profileAPI}${userId}`);
  }

  logout(refreshToken: string): Observable<any> {
    console.log('logout token', refreshToken);
    return this.http.post(`${this.backendAPI}logout`, { refreshToken });
  }

  refresh(refreshToken: string): Observable<any> {
    console.log('refresh token', refreshToken);
    return this.http.post(`${this.backendAPI}refresh`, { refreshToken });
  }

  getUserProfileData(): Observable<any> {
    return this.http.get(`${this.profileAPI}${this.getUserId()}`);
  }

  getSubmissions(): Observable<any> {
    return this.http.get(`${this.submissionsAPI}`);
  }

  // TODO: wait for API to use
  addToFavorites(cocktailId: string): Observable<any> {
    const userId = this.getUserId();
    return this.http.post(`${this.profileAPI}${userId}/favorites`, { cocktailId });
  }

  removeFromFavorites(cocktailId: string): Observable<any> {
    const userId = this.getUserId();
    return this.http.delete(`${this.profileAPI}${userId}/favorites/${cocktailId}`);
  }

  // TODO: update with the real API
  getFavorites(): Observable<any> {
    const userId = this.getUserId();
    return this.http.get(`${this.profileAPI}${userId}/favorites`);
  }

  saveTokens(JwtToken?: string, refreshToken?: string, userId?: string): void {
    if  (userId)
      sessionStorage.setItem('userId', userId);
    if (JwtToken)
      sessionStorage.setItem('JwtToken', JwtToken);
    if (refreshToken)
      sessionStorage.setItem('refreshToken', refreshToken);
  }

  getUserId(): string | null {
    return sessionStorage.getItem('userId');
  }

  getProfiling(): boolean {
    const userId = this.getUserId();
    this.http.get(`${this.profileAPI}${userId}`).subscribe((response: any ) => {
      const consentProfiling = response.consentProfiling;
      return consentProfiling;
    });
    return false;
  }

  getAlcoholAllowed(): boolean {
    const userId = this.getUserId();
    this.http.get(`${this.profileAPI}${userId}`).subscribe((response: any ) => {
      const alcoholAllowed = response.alcoholAllowed;
      return alcoholAllowed;
    });
    return false;
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

  private checkToken(token: string): boolean {
    const decoded: any = jwtDecode(token);
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  }

  isTokenExpired(token: string): boolean {
    return this.checkToken(token);
  }

  isLoggedIn(): boolean {
    const JwtToken = this.getJwtToken();
    return !!JwtToken;
  }


}
