import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import {ConfigurationService} from '../common/services/configuration.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly API_URL = ConfigurationService.getApiUrl();

  private tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem(this.TOKEN_KEY));
  token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  // zapis tokena i aktualizacja subject
  setToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.tokenSubject.next(token);
  }

  getToken(): string | null {
    return this.tokenSubject.getValue();
  }

  login(user: string, password: string): Observable<{ access_token: string; user: any }> {
    return this.http.post<{ access_token: string; user: any }>(
      `${this.API_URL}/auth/login`,
      { user_name: user, password },
      { withCredentials: true } // <-- dodajemy tutaj
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.tokenSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
