import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-car-owner-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './car-owner-dashboard.component.html',
  styleUrls: ['./car-owner-dashboard.component.scss']
})
export class CarOwnerDashboardComponent {
  cars = [
    { id: 1, make: 'Toyota', model: 'Corolla', year: 2020, status: 'Active' },
    { id: 2, make: 'Honda', model: 'Civic', year: 2018, status: 'In Service' }
  ];
  
  appointments = [
    { id: 101, date: '2025-05-15', time: '10:00 AM', mechanic: 'John Smith', status: 'Scheduled' }
  ];
}