// core/services/token.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { TOKEN_KEY, USER_KEY } from '../../utils/constants';
import { User } from '../../models/user.model';
import { BehaviorSubject, Observable } from 'rxjs';

interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
  iat: number;
  userId?: string; // Add userId if your JWT includes it
  email?: string;  // Add email if your JWT includes it
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

  getUserRole(): string | null {
    const user = this.userSubject.value;
    if (user && user.roles && user.roles.length > 0) {
      return user.roles[0];
    }
    const role = this.getRoleFromToken();
    return role ? role : 'guest'; // Default to 'guest' if no role found
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles: string[]): boolean {
    const userRole = this.getUserRole();
    return userRole ? roles.includes(userRole) : false;
  }

  // Get user ID from current user or token
  getCurrentUserId(): string | null {
    const user = this.getCurrentUser();
    if (user && user.id) {
      return user.id.toString();
    }
    
    // Fallback to getting from token
    const token = this.getToken();
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        return decoded.userId || decoded.sub;
      } catch (error) {
        console.error('Error getting user ID from token:', error);
        return null;
      }
    }
    
    return null;
  }

  private getRoleFromToken(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        return decoded.role;
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
      
      // Get existing user data to preserve additional fields
      const existingUser = this.getUser();
      
      const user: User = {
        id: decoded.userId ? parseInt(decoded.userId) : undefined,
        username: decoded.sub,
        email: decoded.email || existingUser?.email || '',
        firstName: existingUser?.firstName,
        lastName: existingUser?.lastName,
        roles: [decoded.role],
        ...existingUser // Preserve any additional user data
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

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.isValidToken() && !!this.getCurrentUser();
  }

  // Check if user is a mechanic
  isMechanic(): boolean {
    return this.hasRole('MECHANIC');
  }

  // Check if user is an admin
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  // Check if user is a car owner
  isCarOwner(): boolean {
    return this.hasRole('CAR_OWNER');
  }

  // Check if user is a part dealer
  isPartDealer(): boolean {
    return this.hasRole('PART_DEALER');
  }

  clearStorage(): void {
    this.removeToken();
    this.removeUser();
  }

  // Get token expiration date
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

  // Get time until token expires (in minutes)
  getTimeUntilExpiration(): number | null {
    const expirationDate = this.getTokenExpirationDate();
    if (!expirationDate) return null;

    const now = new Date();
    const timeUntilExpiration = expirationDate.getTime() - now.getTime();
    return Math.floor(timeUntilExpiration / (1000 * 60)); // Convert to minutes
  }

  // Check if token expires soon (within specified minutes)
  isTokenExpiringSoon(withinMinutes: number = 5): boolean {
    const timeUntilExpiration = this.getTimeUntilExpiration();
    return timeUntilExpiration !== null && timeUntilExpiration <= withinMinutes;
  }

  // Update user profile data (call this after profile updates)
  updateUserProfile(profileData: Partial<User>): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...profileData };
      this.saveUser(updatedUser);
    }
  }
}