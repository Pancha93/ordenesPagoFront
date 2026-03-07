import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

/**
 * Guard que verifica si el usuario tiene rol de ADMIN.
 * Si no es admin, redirige al dashboard.
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasRole(UserRole.ADMIN)) {
    return true;
  }

  // Redirigir al dashboard si no es admin
  router.navigate(['/dashboard']);
  return false;
};
