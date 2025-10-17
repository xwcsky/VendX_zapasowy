import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {tap} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly API_URL = 'http://localhost:3000'; // twój backend NestJS

  // Stan logowania
  isAuthenticated = signal<boolean>(this.hasToken());

  constructor(private http: HttpClient, private router: Router) {}

  /** Sprawdza, czy istnieje token */
  private hasToken(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return !!token;
  }

  /** Zwraca token (np. do interceptora) */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /** Logowanie */
  login(user: string, password: string) {
    console.log('user: ', user, 'password: ', password);
    return this.http.post<{ access_token: string }>(
      `${this.API_URL}/auth/login`,
      { user_name: user, password }
    ).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.access_token);
        this.isAuthenticated.set(true);
      })
    );
  }

  /** Wylogowanie */
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  /** Czy użytkownik jest zalogowany */
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }
}
