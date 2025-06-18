import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TokenService } from '../services/token/token.service';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Skip adding token for auth requests or if we're on server
  if (req.url.includes('/auth/') || !isPlatformBrowser(platformId)) {
    return next(req);
  }

  const token = tokenService.getToken();
  
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        // Handle 401 Unauthorized
        if (error.status === 401 && isPlatformBrowser(platformId)) {
          tokenService.clearStorage();
          router.navigate(['/api/auth/login'], {
            queryParams: { returnUrl: router.routerState.snapshot.url }
          });
        }
        
        // Handle 403 Forbidden
        if (error.status === 403) {
          router.navigate(['/forbidden']);
        }
      }
      return throwError(() => error);
    })
  );
};