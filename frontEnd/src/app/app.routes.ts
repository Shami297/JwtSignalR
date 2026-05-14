import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  // ← Default: open login first
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },

  // Auth routes — no guard needed
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // Protected routes — inside main layout
  {
    path: 'app',
    canActivate: [authGuard],          // ← guards ALL children
    loadComponent: () =>
      import('./layout/main-layout/main-layout')
        .then(m => m.MainLayout),
    children: [
     {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard')
            .then(m => m.Dashboard)
      },
    //   {
    //     path: 'users',
    //     canActivate: [roleGuard('Admin')],  // ← Admin only
    //     loadChildren: () =>
    //       import('./features/users/users.routes')
    //         .then(m => m.USERS_ROUTES)
    //   },
    ]
  },

  // Unauthorized page
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./shared/components/unauthorized/unauthorized')
        .then(m => m.Unauthorized)
  },

  // 404
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found')
        .then(m => m.NotFound)
  }
];