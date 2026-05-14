import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserInfo,
  ForgotPasswordRequest
} from '../models/auth.model';

interface JwtPayload {
  sub:              string;
  email:            string;
  name:             string;
  role:             string | string[];
  exp:              number;    // expiry timestamp
  iat:              number;    // issued at
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = `${environment.apiUrl}/Account`;

  // ── Signals — reactive state (Angular 21 modern approach)
  private _currentUser = signal<UserInfo | null>(null);
  private _isLoggedIn  = signal<boolean>(false);

  // ── Public readable signals
  currentUser = this._currentUser.asReadonly();
  isLoggedIn  = this._isLoggedIn.asReadonly();
  isAdmin     = computed(() =>
    this._currentUser()?.roles?.includes('Admin') ?? false
  );

  constructor(
    private http:   HttpClient,
    private router: Router
  ) {
    // On service init — restore session from storage
    this.restoreSession();
  }

  // ─────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────
  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, payload)
      .pipe(
        tap(res => this.handleAuthSuccess(res))
      );
  }

  // ─────────────────────────────────────────
  // REGISTER
  // ─────────────────────────────────────────
  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, payload)
      .pipe(
        tap(res => this.handleAuthSuccess(res))
      );
  }

  // ─────────────────────────────────────────
  // FORGOT PASSWORD
  // ─────────────────────────────────────────
  forgotPassword(payload: ForgotPasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, payload);
  }

  // ─────────────────────────────────────────
  // REFRESH TOKEN
  // ─────────────────────────────────────────
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken })
      .pipe(
        tap(res => this.handleAuthSuccess(res))
      );
  }

  // ─────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────
  logout(): void {
    // Call backend to invalidate refresh token
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      this.http
        .post(`${this.apiUrl}/logout`, { refreshToken })
        .subscribe({ error: () => {} });   // ignore error — still clear locally
    }

    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  // ─────────────────────────────────────────
  // TOKEN HELPERS
  // ─────────────────────────────────────────

  getAccessToken(): string | null {
    return localStorage.getItem(environment.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(environment.refreshKey);
  }

  // Check if token exists AND is not expired
  isTokenValid(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const now     = Math.floor(Date.now() / 1000);   // current time in seconds

      // exp is Unix timestamp — compare with now
      const isExpired = decoded.exp < now;

      if (isExpired) {
        console.warn('Token expired');
        return false;
      }

      return true;
    } catch (err) {
      // Token is malformed
      console.error('Invalid token', err);
      return false;
    }
  }

  // Returns minutes until token expires
  tokenExpiresInMinutes(): number {
    const token = this.getAccessToken();
    if (!token) return 0;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const now     = Math.floor(Date.now() / 1000);
      return Math.max(0, Math.floor((decoded.exp - now) / 60));
    } catch {
      return 0;
    }
  }

  // ─────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────

  private handleAuthSuccess(res: AuthResponse): void {
    // Save tokens to localStorage
    
    localStorage.setItem(environment.tokenKey,   res.accessToken);
    localStorage.setItem(environment.refreshKey, res.refreshToken);
    // console.log(environment.tokenKey);
    // Decode token to get user info
    const user = this.decodeUserFromToken(res.accessToken);

    // Update signals
    this._currentUser.set(user ?? res.user);
    this._isLoggedIn.set(true);
  }

  private decodeUserFromToken(token: string): UserInfo | null {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return {
        id:       decoded.sub,
        fullName: decoded.name,
        email:    decoded.email,
        roles:    Array.isArray(decoded.role)
                    ? decoded.role
                    : [decoded.role]
      };
    } catch {
      return null;
    }
  }

  private restoreSession(): void {
    if (this.isTokenValid()) {
      const token = this.getAccessToken()!;
      const user  = this.decodeUserFromToken(token);
      this._currentUser.set(user);
      this._isLoggedIn.set(true);
    } else {
      this.clearSession();
    }
  }

  private clearSession(): void {
    localStorage.removeItem(environment.tokenKey);
    localStorage.removeItem(environment.refreshKey);
    this._currentUser.set(null);
    this._isLoggedIn.set(false);
  }
}