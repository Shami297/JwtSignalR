import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service'; 

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService } from 'primeng/api';



// 3 screens inside one component
type Screen = 'login' | 'register' | 'forgot';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CheckboxModule,
    DividerModule,
    ToastModule,
    MessageModule,
    IconFieldModule,
    InputIconModule,
  ],
  templateUrl: './login.html',
  styleUrl:    './login.css',
  providers: [MessageService]
})
export class Login {

 
  // ── which screen is showing
  activeScreen: Screen = 'login';

  // ── login fields
  loginEmail:    string  = '';
  loginPassword: string  = '';
  rememberMe:    boolean = false;
  showPassword:    boolean = false;

  // ── register fields
  regName:            string = '';
  regEmail:           string = '';
  regPassword:        string = '';
  regConfirmPassword: string = '';

  // ── forgot password fields
  forgotEmail: string = '';
  forgotSent:  boolean = false;

  // ── shared state
  loading:      boolean = false;
  errorMessage: string  = '';

  constructor(
    private authService:    AuthService,
    private router:         Router,
    private messageService: MessageService, 
    private route: ActivatedRoute
  ) {}

  // ────────────────────────────────────────────
  // Navigation between screens
  // ────────────────────────────────────────────
  showScreen(screen: Screen) {
    this.activeScreen = screen;
    this.errorMessage = '';
    this.loading      = false;
    this.forgotSent   = false;
  }

  // ────────────────────────────────────────────
  // LOGIN
  // ────────────────────────────────────────────
  onLogin() {
    this.errorMessage = '';

    if (!this.loginEmail || !this.loginPassword) {
      this.errorMessage = 'Please enter your email and password.';
      return;
    }
    if (!this.loginEmail.includes('@')) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    this.loading = true;

    this.authService.login({email:this.loginEmail, password: this.loginPassword} ).subscribe({
      next: (res) => {
        this.loading = false;
        localStorage.setItem('accessToken', res.accessToken);
        this.messageService.add({
          severity: 'success',
          summary:  'Welcome back!',
          detail:   'Login successful. Redirecting...',
          life:     2000
        });
        setTimeout(() => this.router.navigate(['/dashboard']), 1500);
      },
      error: (err) => {
        this.loading      = false;
        this.errorMessage = err?.error?.message || 'Invalid email or password.';
      }
    });
  }

  // ────────────────────────────────────────────
  // REGISTER
  // ────────────────────────────────────────────
  onRegister() {
    this.errorMessage = '';

    if (!this.regName || !this.regEmail || !this.regPassword || !this.regConfirmPassword) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }
    if (!this.regEmail.includes('@')) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }
    if (this.regPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }
    if (this.regPassword !== this.regConfirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.loading = true;

    this.authService.register({
      fullName: this.regName,
      email:    this.regEmail,
      password: this.regPassword
    }).subscribe({
      next: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary:  'Account created!',
          detail:   'Please sign in with your new account.',
          life:     3000
        });
        setTimeout(() => this.showScreen('login'), 1500);
      },
      error: (err) => {
        this.loading      = false;
        this.errorMessage = err?.error?.message || 'Registration failed. Please try again.';
      }
    });
  }

  // ────────────────────────────────────────────
  // FORGOT PASSWORD
  // ────────────────────────────────────────────
  onForgotPassword() {
    this.errorMessage = '';

    if (!this.forgotEmail) {
      this.errorMessage = 'Please enter your email address.';
      return;
    }
    if (!this.forgotEmail.includes('@')) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    this.loading = true;

    this.authService.forgotPassword({email:this.forgotEmail}).subscribe({
      next: () => {
        this.loading    = false;
        this.forgotSent = true;
      },
      error: () => {
        // Show success anyway — don't reveal if email exists (security)
        this.loading    = false;
        this.forgotSent = true;
      }
    });
  }
}