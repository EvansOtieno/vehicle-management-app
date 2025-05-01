import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { TOKEN_KEY, USER_KEY } from '../utils/constants';
import { User } from '../models/user.model';
import { BehaviorSubject, Observable } from 'rxjs';

interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
  iat: number;
  // Add any other claims you expect in your JWT
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private userSubject: BehaviorSubject<User | null>;
  public user$: Observable<User | null>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Initialize with current user from storage
    this.userSubject = new BehaviorSubject<User | null>(this.getUser());
    this.user$ = this.userSubject.asObservable();
  }

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  saveToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem(TOKEN_KEY, token);
      // Update user data when token is saved
      this.updateUserFromToken();
    }
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem(TOKEN_KEY) : null;
  }

  removeToken(): void {
    if (this.isBrowser) {
      localStorage.removeItem(TOKEN_KEY);
      this.userSubject.next(null);
    }
  }

  saveUser(user: User): void {
    if (this.isBrowser) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      this.userSubject.next(user);
    }
  }

  getUser(): User | null {
    if (this.isBrowser) {
      const userStr = localStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  removeUser(): void {
    if (this.isBrowser) {
      localStorage.removeItem(USER_KEY);
      this.userSubject.next(null);
    }
  }

  getUserRole(): String {
    const user = this.userSubject.value;
    if (user) {
      return user.roles[0];
    }
    const role = this.getRoleFromToken();
    return role ? role : 'guest'; // Default to 'guest' if no role found
  }

  private getRoleFromToken(): String | null {
    const token = this.getToken();
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        return decoded.role as String;
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    }
    return null;
  }

  private updateUserFromToken(): void {
    const token = this.getToken();
    if (!token) {
      this.removeUser();
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const user: User = {
        username: decoded.sub,
        roles: [decoded.role],
        email: this.getUser()?.email || '', 
        ...(this.getUser() || {})
      };
      this.saveUser(user);
    } catch (error) {
      console.error('Error updating user from token:', error);
      this.removeUser();
    }
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  }

  isValidToken(): boolean {
    return !!this.getToken() && !this.isTokenExpired();
  }

  clearStorage(): void {
    this.removeToken();
    this.removeUser();
  }

  // Optional: Token refresh functionality
  getTokenExpirationDate(): Date | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return new Date(decoded.exp * 1000);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
}