// features/dashboard/dashboard-home/dashboard-home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TokenService } from '../../../core/services/token/token.service';
import { AdminDashboardComponent } from '../admin-dashboard/admin-dashboard.component';
import { CarOwnerDashboardComponent } from '../car-owner-dashboard/car-owner-dashboard.component';
import { MechanicDashboardComponent } from '../mechanic-dashboard/mechanic-dashboard.component';
import { PartDealerDashboardComponent } from '../part-dealer-dashboard/part-dealer-dashboard.component';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule,
    AdminDashboardComponent,
    CarOwnerDashboardComponent,
    MechanicDashboardComponent,
    PartDealerDashboardComponent
  ],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss']
})
export class DashboardHomeComponent implements OnInit {
  userRole: string | null = null;

  constructor(private tokenService: TokenService) {}

  ngOnInit(): void {
    this.userRole = this.tokenService.getUserRole();
  }
}