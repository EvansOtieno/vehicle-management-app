import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
import { API_ENDPOINTS } from '../utils/constants';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';
import { TokenService } from './token.service';
import { User, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserRoleSubject = new BehaviorSubject<String | null>(null);
  
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  currentUserRole$ = this.currentUserRoleSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {
    this.checkAuthStatus();
  }
  
  checkAuthStatus(): void {
    const isTokenValid = !this.tokenService.isTokenExpired();
    this.isAuthenticatedSubject.next(isTokenValid);
    
    if (isTokenValid) {
      const role = this.tokenService.getUserRole();
      this.currentUserRoleSubject.next(role);
    } else {
      this.currentUserRoleSubject.next(null);
      // Clear storage if token is expired
      this.tokenService.clearStorage();
    }
  }
  
  login(loginRequest: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(API_ENDPOINTS.LOGIN, loginRequest)
      .pipe(
        tap(response => {
          this.tokenService.saveToken(response.token);
          
          const user: User = {
            username: response.username,
            email: response.email,
            id: response.userId, 
            roles: response.roles, // Assuming the first role is the primary one
          };
          
          this.tokenService.saveUser(user);
          this.isAuthenticatedSubject.next(true);
          this.currentUserRoleSubject.next(user.roles[0] ?? null);
        })
      );
  }
  
  register(registerRequest: RegisterRequest): Observable<any> {
    return this.http.post(API_ENDPOINTS.REGISTER, registerRequest);
  }
  
  logout(): void {
    this.tokenService.clearStorage();
    this.isAuthenticatedSubject.next(false);
    this.currentUserRoleSubject.next(null);
  }
  
  getUserInfo(): Observable<User> {
    return this.http.get<User>(API_ENDPOINTS.USER_INFO);
  }
}