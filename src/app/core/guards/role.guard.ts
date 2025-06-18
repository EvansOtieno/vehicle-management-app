import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { TokenService } from '../services/token/token.service';
import { UserRole } from '../models/user.model';

export const roleGuardFn = (allowedRoles: String[]) => {
  return (route: ActivatedRouteSnapshot) => {
    const tokenService = inject(TokenService);
    const router = inject(Router);
    
    const userRole = tokenService.getUserRole();
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      return router.parseUrl('/dashboard');
    }
    
    return true;
  };
};