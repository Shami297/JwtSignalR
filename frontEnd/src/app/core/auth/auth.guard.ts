import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  // Token exists and not expired — allow
  if (authService.isTokenValid()) {
    return true;
  }

  // Token expired or missing — redirect to login
  console.warn('Access denied — redirecting to login');
  return router.createUrlTree(
    ['/auth/login'],
    { queryParams: { returnUrl: state.url } }   // remember where they were going
  );
};

// Role guard — usage: canActivate: [roleGuard('Admin')]
export const roleGuard = (requiredRole: string): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router      = inject(Router);

    if (!authService.isTokenValid()) {
      return router.createUrlTree(['/auth/login']);
    }

    const user = authService.currentUser();
    if (user?.roles?.includes(requiredRole)) {
      return true;
    }

    // Logged in but wrong role
    return router.createUrlTree(['/unauthorized']);
  };
};