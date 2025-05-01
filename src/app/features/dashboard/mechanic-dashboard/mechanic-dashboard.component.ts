import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mechanic-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mechanic-dashboard.component.html',
  styleUrls: ['./mechanic-dashboard.component.scss']
})
export class MechanicDashboardComponent {
  appointments = [
    { 
      id: 201, 
      date: '2025-04-30', 
      time: '09:00 AM', 
      customer: 'Alice Johnson', 
      vehicle: 'Toyota Camry 2022', 
      service: 'Oil Change', 
      status: 'Pending' 
    },
    { 
      id: 202, 
      date: '2025-04-30', 
      time: '02:00 PM', 
      customer: 'Bob Smith', 
      vehicle: 'Honda Accord 2021', 
      service: 'Brake Inspection', 
      status: 'Confirmed' 
    }
  ];
  
  stats = {
    completed: 28,
    upcoming: 5,
    rating: 4.8
  };
}