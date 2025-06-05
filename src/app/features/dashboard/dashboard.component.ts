// features/dashboard/dashboard.component.ts (Simplified Navigation)
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterModule, RouterOutlet, ActivatedRoute } from '@angular/router';
import { TokenService } from '../../core/services/token.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  userRole: String | null = null;
  username = '';
  
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  
  ngOnInit(): void {
    this.userRole = this.tokenService.getUserRole();
    const user = this.tokenService.getUser();
    this.username = user?.username || user?.email || 'User';
    
    if (!this.userRole) {
      this.router.navigate(['/login']);
    }
  }
  
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

  // Simplified navigation methods using relative routing
  navigateToProfile(): void {
    this.router.navigate(['profile'], { relativeTo: this.route });
  }

  navigateToDashboard(): void {
    this.router.navigate(['home'], { relativeTo: this.route });
  }

  navigateToAppointments(): void {
    this.router.navigate(['appointments'], { relativeTo: this.route });
  }

  navigateToServices(): void {
    this.router.navigate(['services'], { relativeTo: this.route });
  }

  navigateToVehicles(): void {
    this.router.navigate(['vehicles'], { relativeTo: this.route });
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
}