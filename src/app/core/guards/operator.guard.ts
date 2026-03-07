import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

/**
 * Guard que verifica si el usuario tiene rol de OPERATOR.
 * Si no es operator, redirige al dashboard.
 */
export const operatorGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasRole(UserRole.OPERATOR)) {
    return true;
  }

  // Redirigir al dashboard si no es operator
  router.navigate(['/dashboard']);
  return false;
};
