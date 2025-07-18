import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule} from '@angular/router';
import { VehicleService } from '../../../core/services/vehicle/vehicle.service';
import { Vehicle } from '../../../core/models/vehicle.model';
import { TokenService } from '../../../core/services/token/token.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-car-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './car-owner-dashboard.component.html',
  styleUrls: ['./car-owner-dashboard.component.scss']
})
export class CarOwnerDashboardComponent implements OnInit {
  cars: Vehicle[] = [];
  isLoading = true;
  error = '';
  
  appointments = [
    { id: 101, date: '2025-05-15', time: '10:00 AM', mechanic: 'John Smith', status: 'Scheduled' }
  ];
  
  constructor(private vehicleService: VehicleService,private tokenService: TokenService,private router: Router,private route: ActivatedRoute) {}
  
  ngOnInit(): void {
    this.loadVehicles();
  }
  
  addVehicle(): void {
    this.router.navigate(['dashboard/vehicle/add']);
  }

  bookService(vehicleId: Vehicle['vin']): void {
    this.router.navigate(['dashboard/vehicle/booking', vehicleId]).then(
    (success) => {
        console.log('Navigation success:', success);
      },
      (error) => {
        console.error('Navigation error:', error);
      }
    );
    

  }

  loadVehicles(): void {
    const user = this.tokenService.getUser();

    if (user?.id) {
    this.isLoading = true;
    this.vehicleService.getUserVehicles(user.id)
      .subscribe({
        next: (vehicles) => {
          this.cars = vehicles;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading vehicles:', error);
          this.error = 'Failed to load your vehicles. Please try again later.';
          this.isLoading = false;
        }
      });
    }
  }
}