// features/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { TokenService } from '../../core/services/token.service';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { CarOwnerDashboardComponent } from './car-owner-dashboard/car-owner-dashboard.component';
import { MechanicDashboardComponent } from './mechanic-dashboard/mechanic-dashboard.component';
import { PartDealerDashboardComponent } from './part-dealer-dashboard/part-dealer-dashboard.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AdminDashboardComponent,
    CarOwnerDashboardComponent,
    MechanicDashboardComponent,
    PartDealerDashboardComponent
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
    private router: Router
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

  // Navigation methods
  navigateToProfile(): void {
  let route = '';

  switch (this.userRole) {
    case 'ROLE_MECHANIC':
      route = '/mechanic/profile';
      break;
    case 'ROLE_CAR_OWNER':
      route = '/car-owner/profile';
      break;
    case 'ROLE_ADMIN':
      route = '/admin/profile';
      break;
    case 'ROLE_PART_DEALER':
      route = '/part-dealer/profile';
      break;
    default:
      console.error('Unknown user role:', this.userRole);
      return;
  }

  console.log('Navigating to profile...', this.userRole);
  this.router.navigate([route]).then(
    success => console.log('Navigation success:', success),
    error => console.error('Navigation error:', error)
  );
}

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToAppointments(): void {
    this.router.navigate(['/appointments']);
  }

  navigateToServices(): void {
    this.router.navigate(['/services']);
  }

  navigateToVehicles(): void {
    this.router.navigate(['/vehicles']);
  }

  navigateToInventory(): void {
    this.router.navigate(['/inventory']);
  }

  navigateToBookings(): void {
    this.router.navigate(['/bookings']);
  }

  navigateToAdmin(): void {
    this.router.navigate(['/admin']);
  }

  navigateToSettings(): void {
    this.router.navigate(['/settings']);
  }
}