import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet, ActivatedRoute } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Angular Material Imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

// Services
import { AuthService } from '../../core/services/auth/auth.service';
import { TokenService } from '../../core/services/token/token.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isMobile = false;
  userRole: String | null = null;
  username = '';
  
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router,
    private route: ActivatedRoute,
    private breakpointObserver: BreakpointObserver,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Initialize user data
    this.userRole = this.tokenService.getUserRole();
    const user = this.tokenService.getUser();
    this.username = user?.username || user?.email || 'User';
    
    if (!this.userRole) {
      this.router.navigate(['/login']);
      return;
    }

    // Monitor screen size for responsive behavior
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobile = result.matches;
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Navigation methods using relative routing
  navigateToDashboard(): void {
    this.router.navigate(['home'], { relativeTo: this.route });
  }

  navigateToProfile(): void {
    this.router.navigate(['profile'], { relativeTo: this.route });
  }

  navigateToVehicles(): void {
    this.router.navigate(['vehicles'], { relativeTo: this.route });
  }

  navigateToAppointments(): void {
    this.router.navigate(['appointments'], { relativeTo: this.route });
  }

  navigateToServices(): void {
    this.router.navigate(['services'], { relativeTo: this.route });
  }

  navigateToInventory(): void {
    this.router.navigate(['inventory'], { relativeTo: this.route });
  }

  navigateToBookings(): void {
    this.router.navigate(['bookings'], { relativeTo: this.route });
  }

  navigateToAdmin(): void {
    this.router.navigate(['admin'], { relativeTo: this.route });
  }

  navigateToSettings(): void {
    this.router.navigate(['settings'], { relativeTo: this.route });
  }

  // User management methods
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Helper method to check if user has specific role
  hasRole(role: string): boolean {
    return this.userRole === role;
  }

  // Helper method to get user's full name or fallback to username
  getDisplayName(): string {
    const user = this.tokenService.getUser();
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return this.username;
  }

  // Utility method to check if current route matches navigation item
  isActiveRoute(route: string): boolean {
    return this.router.url.includes(route);
  }
}