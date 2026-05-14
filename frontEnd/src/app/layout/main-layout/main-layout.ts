import { Component, computed, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterModule,
  RouterOutlet,
  RouterLink,
  NavigationEnd
} from '@angular/router';
import { filter } from 'rxjs/operators';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MenuItem, MessageService } from 'primeng/api';

import { AuthService } from '../../core/auth/auth.service';

interface NavItem {
  label:  string;
  icon:   string;
  route:  string;
  roles?: string[];
  badge?: string;
}

@Component({
  selector:    'app-main-layout',
  standalone:  true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    ButtonModule,
    AvatarModule,
    BadgeModule,
    TooltipModule,
    MenuModule,
    DividerModule,
    ToastModule,
  ],
  providers:   [MessageService],
  templateUrl: './main-layout.html',
  styleUrl:    './main-layout.css'
})
export class MainLayout {

  // ── inject services
  private authService    = inject(AuthService);
  private router         = inject(Router);
  private messageService = inject(MessageService);

  // ── sidebar state
  sidebarCollapsed  = false;
  mobileSidebarOpen = false;
  currentRoute      = '';

  // ── user state
  currentUser  = this.authService.currentUser;
  isAdmin      = this.authService.isAdmin;

  // ── user initials
  userInitials = computed(() => {
    const name = this.currentUser()?.fullName ?? 'User';
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  });

  // ── nav items
  navItems: NavItem[] = [
    { label: 'Dashboard',  icon: 'pi pi-home',      route: '/app/dashboard'  },
    { label: 'Jobs',       icon: 'pi pi-briefcase', route: '/app/jobs'       },
    { label: 'Applicants', icon: 'pi pi-users',     route: '/app/applicants' },
    { label: 'Interviews', icon: 'pi pi-calendar',  route: '/app/interviews' },
    { label: 'Reports',    icon: 'pi pi-chart-bar', route: '/app/reports'    },
    { label: 'Settings',   icon: 'pi pi-cog',       route: '/app/settings'   },
    {
      label: 'Users',
      icon:  'pi pi-shield',
      route: '/app/users',
      roles: ['Admin'],
      badge: 'Admin'
    },
  ];

  // ── profile dropdown menu
  profileMenuItems: MenuItem[] = [
    {
      label:   'My Profile',
      icon:    'pi pi-user',
      command: () => this.router.navigate(['/app/profile'])
    },
    {
      label:   'Settings',
      icon:    'pi pi-cog',
      command: () => this.router.navigate(['/app/settings'])
    },
    { separator: true },
    {
      label:   'Sign out',
      icon:    'pi pi-sign-out',
      command: () => this.onLogout()
    }
  ];

  constructor() {
    // track active route for nav highlighting
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.currentRoute = e.urlAfterRedirects;
      });
  }

  // ── check active route
  isActive(route: string): boolean {
    return this.currentRoute.startsWith(route);
  }

  // ── check if user can see nav item
  canSeeItem(item: NavItem): boolean {
    if (!item.roles) return true;
    const user = this.currentUser();
    return item.roles.some(r => user?.roles?.includes(r)) ?? false;
  }

  // ── navigate and close mobile sidebar
  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.mobileSidebarOpen = false;
  }

  // ── toggle desktop sidebar
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  onMenuToggle(): void {
  if (window.innerWidth <= 768) {
    // mobile — toggle overlay sidebar
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
  } else {
    // desktop — collapse/expand sidebar
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}
  // ── toggle mobile sidebar
  toggleMobileSidebar(): void {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
  }

  // ── close mobile sidebar on nav click
  onNavClick(): void {
    this.mobileSidebarOpen = false;
  }

  // ── logout
  onLogout(): void {
    this.authService.logout();
  }

  // ── close mobile sidebar on escape key
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.mobileSidebarOpen = false;
  }
}