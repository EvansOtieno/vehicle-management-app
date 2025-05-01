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
    this.username = user?.username || '';
    
    if (!this.userRole) {
      this.router.navigate(['/login']);
    }
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}