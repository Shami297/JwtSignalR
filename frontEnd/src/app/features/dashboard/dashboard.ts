import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <div class="page-header">
      <h1>Dashboard</h1>
      <p>Welcome back, {{ authService.currentUser()?.fullName }}!</p>
    </div>

    <div class="stats-grid">
      <p-card header="Total Jobs"       subheader="Active listings">
        <span class="stat-number">24</span>
      </p-card>
      <p-card header="Applicants"       subheader="This month">
        <span class="stat-number">148</span>
      </p-card>
      <p-card header="Interviews"       subheader="Scheduled">
        <span class="stat-number">12</span>
      </p-card>
      <p-card header="Hired"            subheader="This quarter">
        <span class="stat-number">7</span>
      </p-card>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 24px; }
    .page-header h1 { font-size: 22px; font-weight: 500; margin: 0 0 4px; }
    .page-header p  { font-size: 13px; color: #6b7280; margin: 0; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
    }
    .stat-number { font-size: 32px; font-weight: 500; color: #0C447C; }
  `]
})
export class Dashboard {
  constructor(public authService: AuthService) {}
}