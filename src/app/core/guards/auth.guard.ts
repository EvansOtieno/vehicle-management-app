import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../services/token/token.service';

export const authGuardFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  
  if (!tokenService.isTokenExpired()) {
    return true;
  }
  
  // Redirect to login page
  return router.parseUrl('/login');
};